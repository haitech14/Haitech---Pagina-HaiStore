/** Registra service worker en producción para caché de catálogo y assets. */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        if (registration.active) {
          registration.active.postMessage({ type: 'PRECACHE_CATALOG' });
        }
      })
      .catch(() => {
        /* sin SW en entornos sin HTTPS */
      });
  });
}
