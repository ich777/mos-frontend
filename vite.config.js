import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: 80,
    proxy: {
      "^/api/(?!v1/socket\\.io)": {
        target: "http://192.168.1.2",
        changeOrigin: true,
      },
      "/api/v1/socket.io": {
        target: "http://192.168.1.2:3000",
        changeOrigin: true,
        ws: true,
      },
      "/ws": {
        target: "ws://192.168.1.2:3000",
        ws: true,
      }
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }  
});