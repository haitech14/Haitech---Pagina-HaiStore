import '@/lib/install-random-uuid-polyfill';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import '@/fonts';
import '@/index.css';
import { registerServiceWorker } from '@/lib/register-service-worker';

registerServiceWorker();

/**
 * /tienda y /categoria: bajar el chunk de store cuanto antes.
 * El índice 1.3MB lo calienta useProducts tras pintar el provisional
 * (no desde boot, para no competir con LCP).
 */
const bootPath = typeof window !== 'undefined' ? window.location.pathname : '';
const isStorePath = bootPath === '/tienda' || bootPath.startsWith('/tienda/');
const isCategoryPath = bootPath.startsWith('/categoria/');

if (isStorePath || isCategoryPath) {
  void import('@/pages/store');
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No se encontró el elemento #root');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
