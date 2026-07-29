#!/usr/bin/env node
// Minimal GitHub webhook receiver for auto-deploy. No dependencies, so
// it's cheap to run permanently under PM2. See docs/DEPLOY.md.
"use strict";

const http = require("node:http");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const PORT = Number(process.env.WEBHOOK_PORT || 9000);
const SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";
const BRANCH = process.env.DEPLOY_BRANCH || "main";
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const UPDATE_SCRIPT = path.join(REPO_ROOT, "scripts", "deploy", "update.sh");

if (!SECRET || SECRET === "change-me") {
  console.error(
    "GITHUB_WEBHOOK_SECRET is not set (or still the placeholder). " +
      "Set a real secret in .env before exposing this endpoint - see docs/DEPLOY.md."
  );
}

let deploying = false;

function verifySignature(rawBody, signatureHeader) {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", SECRET).update(rawBody).digest("hex");
  const given = signatureHeader.slice("sha256=".length);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(given, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function runUpdate() {
  if (deploying) {
    console.log("Deploy already in progress, skipping this trigger.");
    return;
  }
  deploying = true;
  console.log("Starting deploy...");
  const child = spawn("bash", [UPDATE_SCRIPT], { cwd: REPO_ROOT, stdio: "inherit" });
  child.on("close", (code) => {
    deploying = false;
    console.log(`Deploy finished with exit code ${code}`);
  });
  child.on("error", (err) => {
    deploying = false;
    console.error("Failed to start deploy script:", err);
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/webhook") {
    res.writeHead(404).end("Not found");
    return;
  }

  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const rawBody = Buffer.concat(chunks);

    if (!SECRET || !verifySignature(rawBody, req.headers["x-hub-signature-256"])) {
      res.writeHead(401).end("Invalid signature");
      return;
    }

    const event = req.headers["x-github-event"];
    if (event === "ping") {
      res.writeHead(200).end("pong");
      return;
    }
    if (event !== "push") {
      res.writeHead(200).end("Ignored (not a push event)");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      res.writeHead(400).end("Invalid JSON payload");
      return;
    }

    const ref = payload.ref || "";
    if (ref !== `refs/heads/${BRANCH}`) {
      res.writeHead(200).end(`Ignored (push to ${ref}, watching ${BRANCH})`);
      return;
    }

    res.writeHead(202).end("Deploy triggered");
    runUpdate();
  });
});

fs.mkdirSync(path.join(REPO_ROOT, "logs"), { recursive: true });
server.listen(PORT, "127.0.0.1", () => {
  console.log(`Webhook listener on 127.0.0.1:${PORT}/webhook (branch: ${BRANCH})`);
});
