import { createFileRoute } from "@tanstack/react-router";
import { executeOnServer } from "@/lib/server/registry";

interface ExecuteBody {
  languageId?: unknown;
  language?: unknown;
  code?: unknown;
}

export const Route = createFileRoute("/api/execute")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: ExecuteBody;
        try {
          body = await request.json();
        } catch {
          return Response.json({ stdout: "", stderr: "Invalid JSON body.", ok: false, diagnostics: [], durationMs: 0 }, { status: 400 });
        }

        const code = typeof body.code === "string" ? body.code : "";
        const serverId =
          typeof body.language === "string" && body.language
            ? body.language
            : typeof body.languageId === "string"
            ? body.languageId
            : "";

        if (!serverId) {
          return Response.json(
            { stdout: "", stderr: "Missing language/languageId in request body.", ok: false, diagnostics: [], durationMs: 0 },
            { status: 400 }
          );
        }
        if (code.length > 200_000) {
          return Response.json(
            { stdout: "", stderr: "Source is too large (200KB limit).", ok: false, diagnostics: [], durationMs: 0 },
            { status: 413 }
          );
        }

        const start = Date.now();
        try {
          const result = await executeOnServer(serverId, code);
          return Response.json({
            stdout: result.stdout,
            stderr: result.stderr,
            ok: result.ok,
            diagnostics: [],
            durationMs: Date.now() - start,
          });
        } catch (e) {
          return Response.json({
            stdout: "",
            stderr: `Execution failed: ${e instanceof Error ? e.message : String(e)}`,
            ok: false,
            diagnostics: [],
            durationMs: Date.now() - start,
          });
        }
      },
    },
  },
});
