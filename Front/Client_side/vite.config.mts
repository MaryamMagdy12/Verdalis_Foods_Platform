import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

const apiTarget = process.env.VITE_DEV_API_TARGET || "http://localhost:8000";

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 100 },
      jpeg: { quality: 95 },
      jpg: { quality: 95 },
      webp: { lossless: true },
      svg: {},
    }),
  ],
  server: {
    port: 5174,
    proxy: {
      "/api": { target: apiTarget, changeOrigin: true },
      "/sanctum": { target: apiTarget, changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("leaflet")) return "maps";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("lenis")) return "motion";
          if (id.includes("react-router") || id.includes("react-dom") || id.includes("/react/")) return "vendor";
        },
      },
    },
  },
});
