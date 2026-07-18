import 'dotenv/config';

import app from './app.js';
import { listLanIpv4Addresses } from '../shared/dev-lan.js';
import { prewarmStorefrontCatalog } from './lib/storefront-warmup.js';

const PORT = process.env.ADMIN_PORT ?? 3080;

async function startServer() {
  try {
    await prewarmStorefrontCatalog();
    console.log('[api] Catálogo de la home precargado');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[api] No se pudo precargar catálogo de la home:', message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[api] HaiStore admin en http://localhost:${PORT} (escucha 0.0.0.0:${PORT})`);
    for (const ip of listLanIpv4Addresses()) {
      console.log(`[api] Red/IP: http://${ip}:${PORT}`);
    }
    void fetch(
      `http://127.0.0.1:${PORT}/api/products/home-bundle?featuredLimit=5&sectionsLimit=10&category=multifuncionales`,
    ).catch(() => {});
  });
}

startServer().catch((error) => {
  console.error('[api] Error al iniciar el servidor:', error);
  process.exit(1);
});
