import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { unpluginRouterGeneratorFactory } from "@tanstack/router-plugin";

const tanstackRouter = Object.assign(
	unpluginRouterGeneratorFactory({}).vite,
	{ name: "@tanstack/router-plugin" },
);

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Silence Bootstrap 5.x Sass deprecation warnings (from node_modules).
        // Bootstrap 5 doesn't support the modern @use/@forward module system;
        // these will go away when Bootstrap 6 ships.
        silenceDeprecations: [
          'import',          // @import rules
          'if-function',     // Sass if() syntax
          'global-builtin',  // mix(), unit(), etc.
          'color-functions', // red(), green(), blue()
        ],
      },
    },
  },
  server: {
    // Allow the Arena preview proxy host (and any *.e2b.app subdomain).
    allowedHosts: [".e2b.app", "localhost", "127.0.0.1"],
  },
  plugins: [
    tanstackRouter,   // must come first
    tanstackStart(),
    react(),
    tailwindcss(),
    devtools({
      ssr: false,
    }),
  ],
  resolve: {
    tsconfigPaths: true, // Vite 8 supports this natively
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@tanstack")) return "tanstack";
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "react";
          }
          return undefined;
        },
      },
    },
  },
});
