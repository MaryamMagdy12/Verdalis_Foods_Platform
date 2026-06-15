import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const apiTarget = process.env.VITE_DEV_API_TARGET || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
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
          if (id.includes("html5-qrcode")) return "scanner";
          if (id.includes("react-router") || id.includes("react-dom") || id.includes("/react/")) return "vendor";
        },
      },
    },
  },
});
