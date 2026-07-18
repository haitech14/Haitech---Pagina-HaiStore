import '@/lib/install-random-uuid-polyfill';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import '@/fonts';
import '@/index.css';
import { registerServiceWorker } from '@/lib/register-service-worker';

registerServiceWorker();

/** En /tienda y categorías: bajar chunk + índice cuanto antes (antes de React). */
const bootPath = typeof window !== 'undefined' ? window.location.pathname : '';
if (
  bootPath === '/tienda' ||
  bootPath.startsWith('/tienda/') ||
  bootPath.startsWith('/categoria/')
) {
  void import('@/pages/store');
  void import('@/lib/defer-catalog-index').then((m) => {
    m.preloadCatalogIndexNow();
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No se encontró el elemento #root');
}

try {
  rootElement.setAttribute('data-haistore-mounted', '1');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  const message = error instanceof Error ? error.message : 'Error al iniciar la aplicación';
  rootElement.innerHTML =
    `<div style="min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;font-family:Montserrat,system-ui,sans-serif;background:#fff;color:#0f172a;padding:1.5rem;text-align:center">` +
    `<h1 style="margin:0;font-size:1.25rem">No se pudo cargar HaiStore</h1>` +
    `<p style="margin:0;max-width:28rem;font-size:0.875rem;color:#475569">${message}</p>` +
    `<button type="button" onclick="location.reload()" style="min-height:2.75rem;padding:0 1rem;border:0;border-radius:0.375rem;background:#0f172a;color:#fff;font-size:0.875rem;cursor:pointer">Recargar</button>` +
    `</div>`;
  console.error('[app] error al montar:', error);
}
