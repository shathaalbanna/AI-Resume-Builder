import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/cv": {
        target: "https://smart-store.devamer.online",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});