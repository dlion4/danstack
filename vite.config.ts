import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { tanstackRouter } from "@tanstack/router-plugin";

export default defineConfig({
  plugins: [
    tanstackRouter(),   // must come first
    react(),            // JSX transform after router
    tailwindcss(),
    devtools(),
    tanstackStart(),
  ],
  resolve: {
    tsconfigPaths: true, // Vite 8 supports this natively
  },
  build: {
    chunkSizeWarningLimit: 1000,
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
