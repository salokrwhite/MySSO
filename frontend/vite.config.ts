import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: "assets/languages-[name].[hash].chunk.js"
      }
    }
  },
  server: {
    port: 5173
  }
});
