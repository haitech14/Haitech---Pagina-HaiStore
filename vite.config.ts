import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import os from 'node:os';
import path from 'node:path';

const devPort = Number(process.env.VITE_DEV_PORT ?? 5173);

function buildAllowedHosts(): true | string[] {
  const fromEnv = (process.env.VITE_ALLOWED_HOSTS ?? '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean);

  if (fromEnv.length > 0) return fromEnv;
  // Por defecto: localhost + IP de la red (móvil, otra PC). VITE_LAN=0 solo restringe a local.
  if (process.env.VITE_LAN !== '0') return true;

  const hostname = os.hostname().toLowerCase();
  return ['localhost', '127.0.0.1', hostname, `${hostname}.local`];
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Optimización de imágenes en build con Sharp.
    ViteImageOptimizer({
      includePublic: true,
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
      'exceljs',
      'lucide-react',
    ],
  },
  server: {
    // Escucha en todas las interfaces: localhost + IP de red.
    host: '0.0.0.0',
    port: devPort,
    // Evita que Vite salte a 5174/5175 en silencio si el puerto está ocupado.
    strictPort: true,
    // Permite Host: IP, hostname o Tailscale sin 403 (VITE_LAN=0 lo restringe).
    allowedHosts: buildAllowedHosts(),
    // Proxy del API admin local (server/) durante el desarrollo.
    // El cliente usa el mismo origen (localhost o IP); no fijar server.origin.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3080',
        changeOrigin: true,
        // Subidas grandes (vídeo/adjuntos en data URL) pueden superar 30s.
        timeout: 600_000,
        proxyTimeout: 600_000,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: devPort,
    strictPort: false,
    allowedHosts: buildAllowedHosts(),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-ui';
          }
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          if (id.includes('node_modules/jspdf')) {
            return 'jspdf';
          }
          if (id.includes('node_modules/embla-carousel')) {
            return 'embla';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          if (id.includes('node_modules/sonner')) {
            return 'sonner';
          }
        },
      },
    },
  },
});
