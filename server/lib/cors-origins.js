import { listDevWebOrigins } from '../../shared/dev-lan.js';

/** Orígenes permitidos para CORS (desarrollo + Vercel + dominio personalizado). */
export function getCorsOrigins() {
  const webPort = Number(process.env.VITE_DEV_PORT ?? 5173);
  const origins = new Set(
    (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  origins.add('http://localhost:5173');
  origins.add('http://127.0.0.1:5173');
  origins.add('https://haistore.vercel.app');
  origins.add('https://haitech.pe');
  origins.add('https://www.haitech.pe');

  // Incluye la IP LAN actual para que el storefront cargue por IP sin editar .env.
  for (const origin of listDevWebOrigins(webPort)) {
    origins.add(origin);
  }

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }

  if (process.env.VERCEL_BRANCH_URL) {
    origins.add(`https://${process.env.VERCEL_BRANCH_URL}`);
  }

  return [...origins];
}

/**
 * localhost, 127.0.0.1, redes privadas RFC1918, Tailscale/CGNAT (100.64/10)
 * y link-local, en puertos Vite 5170–5179.
 */
export const lanOriginPattern =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}|169\.254\.\d{1,3}\.\d{1,3}):517\d+$/;

export function isCorsOriginAllowed(origin, allowedOrigins) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (lanOriginPattern.test(origin)) return true;
  if (process.env.VERCEL && /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) {
    return true;
  }
  return false;
}
