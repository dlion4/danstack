import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    viteReact(),
    tailwindcss(),
    devtools(),
    tanstackStart(),
    tsconfigPaths(),
  ],
  build: {
    // raise the warning threshold (default is 500 kB)
    chunkSizeWarningLimit: 1000,
    // explicitly enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          tanstack: ["@tanstack/react-router", "@tanstack/react-query"],
        },
      },
    },
  },
});
