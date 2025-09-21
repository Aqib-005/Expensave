import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy"; // ✅ you missed this

export default defineConfig({
  server: {
    proxy: {
      "/api": "https://expensave-a8zd.onrender.com",
    },
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "public/_redirects", // ✅ copy redirects
          dest: ".", // to dist root
        },
      ],
    }),
  ],
  base: "/", // ✅ no /Expensave anymore since you’re on Render
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  publicDir: "public",
});
