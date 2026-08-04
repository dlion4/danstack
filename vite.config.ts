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
  plugins: [
    tanstackRouter,   // must come first
    tanstackStart(),
    react(),
    tailwindcss(),
    devtools(),
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
