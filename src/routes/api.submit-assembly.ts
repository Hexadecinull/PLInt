import { createFileRoute } from "@tanstack/react-router";
import { appendFile, readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { ASSEMBLY } from "@/lib/languages";

// Submissions are appended to a plain text file at the project root.
// Nothing in this app reads it back over HTTP — it's meant to be read
// from the server's own terminal (`cat assembly-submissions.txt`),
// see docs/DEPLOY.md.
const FILE_PATH = path.resolve(process.cwd(), "assembly-submissions.txt");

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

async function isDuplicate(name: string): Promise<boolean> {
  const target = normalize(name);
  if (ASSEMBLY.some((l) => normalize(l.name) === target)) return true;
  if (!existsSync(FILE_PATH)) return false;
  const contents = await readFile(FILE_PATH, "utf8").catch(() => "");
  return contents
    .split("\n")
    .map((line) => normalize(line.split("\t").slice(1).join("\t")))
    .includes(target);
}

export const Route = createFileRoute("/api/submit-assembly")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { name?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ status: "error", message: "Invalid JSON body." }, { status: 400 });
        }

        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name || name.length > 200) {
          return Response.json({ status: "error", message: "Name is required." }, { status: 400 });
        }

        if (await isDuplicate(name)) {
          return Response.json({ status: "duplicate" });
        }

        await mkdir(path.dirname(FILE_PATH), { recursive: true });
        await appendFile(FILE_PATH, `${new Date().toISOString()}\t${name}\n`, "utf8");
        return Response.json({ status: "ok" });
      },
    },
  },
});
