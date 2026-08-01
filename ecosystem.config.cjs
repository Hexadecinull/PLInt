// PM2 process definitions for self-hosting PLInt.
// Start both processes with: pm2 start ecosystem.config.cjs
// See docs/DEPLOY.md for the full setup walkthrough.
//
// Loads .env here because PM2 does not read it automatically, and
// nothing else in this project did either until now. Node's built-in
// loadEnvFile (no extra dependency) is fine with a missing file, but
// wrap it anyway in case an older Node runs this by accident.
try {
  process.loadEnvFile(require("node:path").join(__dirname, ".env"));
} catch {
  // No .env present, fine, the fallbacks below cover it.
}

module.exports = {
  apps: [
    {
      name: "plint",
      script: ".output/server/index.mjs",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || "3006",
        HOST: process.env.HOST || "127.0.0.1",
      },
      max_memory_restart: "400M",
      // Keeps a decade-old laptop from choking if something runs away.
      node_args: "--max-old-space-size=384",
      out_file: "logs/plint.out.log",
      error_file: "logs/plint.err.log",
      merge_logs: true,
      time: true,
    },
    {
      name: "plint-webhook",
      script: "scripts/deploy/webhook-server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        WEBHOOK_PORT: process.env.WEBHOOK_PORT || "9005",
        GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET || "",
        DEPLOY_BRANCH: process.env.DEPLOY_BRANCH || "main",
      },
      max_memory_restart: "100M",
      out_file: "logs/webhook.out.log",
      error_file: "logs/webhook.err.log",
      merge_logs: true,
      time: true,
    },
  ],
};
