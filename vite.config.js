import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: 80,
    proxy: {
      "/api": "http://192.168.1.29",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});