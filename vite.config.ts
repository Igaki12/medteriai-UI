import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/medteriai-UI/",
  plugins: [react()],
  build: {
    outDir: "docs",
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true
      }
    }
  }
});
