import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: 80, // oder dein gewünschter Port
    proxy: {
      "/api": "http://192.168.1.194",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});