import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig(({ command }) => ({
  css: {
    preprocessorOptions: {
      scss: {
        // Silence Bootstrap 5.x Sass deprecation warnings (from node_modules).
        silenceDeprecations: [
          "import",
          "if-function",
          "global-builtin",
          "color-functions",
        ],
      },
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: [".e2b.app", "localhost", "127.0.0.1"],
  },
  plugins: [
    // TanStack Start must come first — it owns the router + SSR pipeline
    tanstackStart({
      router: {
        autoCodeSplitting: true,
        codeSplittingOptions: {
          defaultBehavior: [
            ["component"],
            ["pendingComponent"],
            ["errorComponent", "notFoundComponent"],
          ],
        },
      },
    }),
    // React plugin MUST come after TanStack Start
    react(),
    // Tailwind CSS
    tailwindcss(),
  ],
  resolve: {
    // Vite 8 native tsconfig path resolution
    tsconfigPaths: true,
  },
  build: {
    chunkSizeWarningLimit: 2000,
    target: "es2020",
    // Manual chunks only for production — keeps dev fast
    ...(command === "build"
      ? {
          rollupOptions: {
            output: {
              manualChunks(id: string) {
                if (!id.includes("node_modules")) return undefined;

                // React core — always cached together
                if (
                  id.includes("node_modules/react/") ||
                  id.includes("node_modules/react-dom/") ||
                  id.includes("node_modules/react/jsx")
                ) {
                  return "react-core";
                }
                // TanStack ecosystem
                if (
                  id.includes("@tanstack/react-router") ||
                  id.includes("@tanstack/react-router-devtools")
                ) {
                  return "tanstack-router";
                }
                if (id.includes("@tanstack/react-query")) {
                  return "tanstack-query";
                }
                if (id.includes("@tanstack/react-table")) {
                  return "tanstack-table";
                }
                // Bootstrap (heavy, shared across dashboards)
                if (
                  id.includes("bootstrap") &&
                  !id.includes("bootstrap-icons")
                ) {
                  return "bootstrap";
                }
                // Icon fonts
                if (
                  id.includes("bootstrap-icons") ||
                  id.includes("lucide")
                ) {
                  return "icons";
                }
                // Chart libraries (heavy)
                if (id.includes("recharts") || id.includes("d3-")) {
                  return "charts";
                }
                return undefined;
              },
            },
          },
        }
      : {}),
  },
}));
