import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function normalizeAssetBase(value?: string) {
  if (!value) {
    return "/";
  }
  const trimmedValue = value.replace(/\/+$/, "");
  const baseValue = trimmedValue.endsWith("/assets")
    ? trimmedValue.slice(0, -"/assets".length) || "/"
    : trimmedValue;
  return `${baseValue.replace(/\/+$/, "")}/`;
}

export default defineConfig(({ command }) => ({
  base: command === "build" ? normalizeAssetBase(process.env.ASSET_CDN_BASE) : "/",
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
}));
