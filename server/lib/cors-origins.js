/** Orígenes permitidos para CORS (desarrollo + Vercel + dominio personalizado). */
export function getCorsOrigins() {
  const origins = new Set(
    (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  origins.add('http://localhost:5173');
  origins.add('http://localhost:5180');
  origins.add('http://127.0.0.1:5173');
  origins.add('http://127.0.0.1:5180');
  origins.add('https://haistore.vercel.app');
  origins.add('https://haitech.pe');
  origins.add('https://www.haitech.pe');

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }

  if (process.env.VERCEL_BRANCH_URL) {
    origins.add(`https://${process.env.VERCEL_BRANCH_URL}`);
  }

  return [...origins];
}

/** localhost, link-local y redes privadas (Vite u otro puerto local). */
export const lanOriginPattern =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|169\.254\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

export function isCorsOriginAllowed(origin, allowedOrigins) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (lanOriginPattern.test(origin)) return true;
  if (process.env.VERCEL && /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) {
    return true;
  }
  return false;
}
