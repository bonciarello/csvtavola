import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 4599
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 4599
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
});
