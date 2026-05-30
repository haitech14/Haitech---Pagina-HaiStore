import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Optimización de imágenes en build con Sharp.
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 70 },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Pre-empaqueta estas dependencias al arrancar para evitar re-optimizaciones
  // a mitad de sesión (que pueden provocar recargas y errores transitorios de hooks).
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      '@radix-ui/react-slot',
      '@radix-ui/react-label',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-checkbox',
      'embla-carousel-react',
      'lucide-react',
    ],
  },
  server: {
    host: true,
    port: 5173,
    // Proxy del API admin local (server/) durante el desarrollo.
    proxy: {
      '/api': {
        target: 'http://localhost:3080',
        changeOrigin: true,
      },
    },
  },
});
