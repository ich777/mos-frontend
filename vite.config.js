import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
      },
    }),
    // Module Federation host application
    federation({
      name: 'mos-host',
      // Plugins are loaded dynamically, no static remotes needed
      remotes: {},
      // Shared dependencies with plugins
      shared: ['vue', 'vue-router', 'vuetify'],
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 80,
    proxy: {
      '^/api/(?!v1/socket\\.io)': {
        target: 'http://192.168.1.2',
        changeOrigin: true,
      },
      '/api/v1/socket.io': {
        target: 'http://192.168.1.2:3000',
        changeOrigin: true,
        ws: true,
      },
      '/ws': {
        target: 'ws://192.168.1.2:3000',
        ws: true,
      },
      '/api/v1/notify': {
        target: 'http://192.168.1.2',
        changeOrigin: true,
        ws: true,
      },
      '/_plugins': {
        target: 'http://192.168.1.2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_plugins/, '/plugins'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
