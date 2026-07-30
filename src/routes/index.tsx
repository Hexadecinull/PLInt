import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Terminal, ArrowRight, GitBranch } from "lucide-react";
import { ALL_LANGUAGES, LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PLInt - Online Programming Language Interpreter Hub" },
      {
        name: "description",
        content:
          "Run 125+ programming languages online - Python, JavaScript, TypeScript, Java, C#, F#, Rust, Go, Ruby, Swift, Julia, Elixir, Nim, HTML, Scala, Clojure, Erlang, Assembly and more. No accounts, no installs. Open source (AGPL-3.0).",
      },
      { property: "og:title", content: "PLInt - Online Interpreter Hub" },
      {
        property: "og:description",
        content:
          "One tab. 60+ languages. Full syntax highlighting, live errors, saved files, instant execution.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const enter = (e: React.MouseEvent) => {
    e.preventDefault();
    if (leaving) return;
    setLeaving(true);
    // Match --dur-slow so the fade-out completes before the /app fade-in starts.
    setTimeout(() => navigate({ to: "/app" }), 260);
  };

  return (
    <div
      className={
        "relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground " +
        (leaving ? "animate-page-out" : "animate-page-in")
      }
    >
      {/* subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--primary) 25%, transparent) 0%, transparent 70%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between border-b border-border/60 bg-background/50 px-4 py-3 backdrop-blur sm:px-8">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="grid h-7 w-7 place-items-center rounded border border-border bg-surface-2 text-primary">
            <Terminal className="h-3.5 w-3.5" />
          </span>
          <span className="tracking-tight">
            <span className="text-muted-foreground">PL</span>
            <span className="text-foreground">Int</span>
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <a
            href="https://www.gnu.org/licenses/gpl-3.0.html"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            AGPL-3.0
          </a>
          <a
            href="https://github.com/Hexadecinull/PLInt"
            target="_blank"
            rel="noreferrer"
            aria-label="Source"
            className="hover:text-foreground"
          >
            <GitBranch className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-14 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/70 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-terminal-green animate-blink" />
          {ALL_LANGUAGES.length} languages · one browser tab
        </div>

        <h1 className="max-w-3xl text-balance font-mono text-4xl font-medium tracking-tight sm:text-6xl">
          Run any language,
          <span className="block brand-gradient-text">without installing one.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-balance font-mono text-sm leading-relaxed text-muted-foreground sm:text-base">
          PLInt is a fully online interpreter hub for {LANGUAGES.length}+ programming
          languages - from Python and TypeScript to Rust, Haskell, Julia and Nix.
          Full syntax highlighting, live errors, saved files. No accounts. No installs.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/app"
            onClick={enter}
            className="group inline-flex items-center gap-2 rounded-md border border-primary/60 bg-primary/15 px-5 py-2.5 font-mono text-sm text-primary shadow-[var(--shadow-glow)] hover:bg-primary/25"
          >
            Launch PLInt
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#languages"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-2/70 px-5 py-2.5 font-mono text-sm text-muted-foreground hover:text-foreground"
          >
            View languages
          </a>
        </div>

        <div id="languages" className="mt-16 w-full max-w-4xl">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            - Supported languages
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {LANGUAGES.map((l) => (
              <span
                key={l.id}
                className="rounded border border-border bg-surface-2/60 px-2.5 py-1 font-mono text-[11px] text-foreground/80"
              >
                {l.name}
                <span className="ml-1.5 text-muted-foreground/60">{l.ext}</span>
              </span>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/60 px-4 py-3 text-center font-mono text-[10px] text-muted-foreground sm:px-8">
        © {new Date().getFullYear()} PLInt · Free & open source ·{" "}
        <a
          className="text-primary hover:underline"
          href="https://www.gnu.org/licenses/gpl-3.0.html"
          target="_blank"
          rel="noreferrer"
        >
          AGPL-3.0 License
        </a>
      </footer>
    </div>
  );
}
