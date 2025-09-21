import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    proxy: {
      "/api": "https://expensave-a8zd.onrender.com",
    },
  },
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});
