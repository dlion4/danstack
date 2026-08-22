import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { unpluginRouterGeneratorFactory } from "@tanstack/router-plugin";
// import { nitro } from "nitro/vite";

// const tanstackRouter = Object.assign(
// 	unpluginRouterGeneratorFactory({
// 		autoCodeSplitting: true,
// 		codeSplittingOptions: {
// 			defaultBehavior: "bundle-and-cache",
// 		},
// 	}).vite,
// 	{ name: "@tanstack/router-plugin" },
// );
const tanstackRouter = Object.assign(
  unpluginRouterGeneratorFactory({
    autoCodeSplitting: true,
    codeSplittingOptions: {
      // FIX: Replace "bundle-and-cache" with the required array configuration
      defaultBehavior: [
        ['component'], 
        ['pendingComponent'], 
        ['errorComponent', 'notFoundComponent']
      ],
    },
  }).vite,
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
    // nitro(),
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
    target: "es2020",
    cssMinify: "lightningcss",
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (!id.includes("node_modules")) return undefined;
          // Core framework — always cached together
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react/jsx")) {
            return "react-core";
          }
          // TanStack ecosystem
          if (id.includes("@tanstack/react-router") || id.includes("@tanstack/react-router-devtools")) {
            return "tanstack-router";
          }
          if (id.includes("@tanstack/react-query")) {
            return "tanstack-query";
          }
          if (id.includes("@tanstack/react-table")) {
            return "tanstack-table";
          }
          // Bootstrap (heavy, shared across card/utility/business dashboards)
          if (id.includes("bootstrap") && !id.includes("bootstrap-icons")) {
            return "bootstrap";
          }
          // Icon fonts
          if (id.includes("bootstrap-icons") || id.includes("lucide")) {
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
  },
});
