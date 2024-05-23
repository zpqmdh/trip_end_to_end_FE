import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueDevTools from "vite-plugin-vue-devtools";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), VueDevTools()],
  // server: {
  //   // proxy: {
  //   //   "/chat": {
  //   //     target: "http://localhost:5000",
  //   //     changeOrigin: true,
  //   //     rewrite: (path) => path.replace(/^\/chat/, "/flask-api"),
  //   //   },
  //   // },
  // },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
});
