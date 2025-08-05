// @ts-ignore - Ignore Vite module resolution issues
import { defineConfig } from 'vite';
// @ts-ignore - Ignore plugin-react module resolution issues
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      // Explicitly disable native modules to avoid rollup issues
      context: 'globalThis'
    }
  },
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 3000,
    host: true
  }
});
