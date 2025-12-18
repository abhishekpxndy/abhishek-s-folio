import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  server: {
    port: 4000,
    open: false,
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    assetsInlineLimit: 0, // Prevents small assets from being inlined as base64
  },
  optimizeDeps: {
    include: ['tslib', 'framer-motion']
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.mp4', '**/*.webm', '**/*.mov'],
});
