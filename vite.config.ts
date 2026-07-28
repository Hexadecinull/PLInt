import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

// Self-hosted build config. This replaced the Lovable-managed
// `@lovable.dev/vite-tanstack-config` wrapper, which defaulted the Nitro
// build target to Cloudflare Workers. PLInt is meant to run as a plain
// Node process behind PM2, so the preset below is explicitly "node-server".
//
// Build output lands in `.output/server/index.mjs` — that's the entry
// point PM2 runs in production (see ecosystem.config.cjs).
export default defineConfig({
  plugins: [
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "./src/server.ts" },
    }),
    nitro({ preset: "node-server" }),
    // React's Vite plugin must come after TanStack Start's.
    viteReact(),
  ],
});
