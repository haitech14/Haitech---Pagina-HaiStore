import '@/lib/install-random-uuid-polyfill';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import '@/fonts.css';
import '@/index.css';
import { registerServiceWorker } from '@/lib/register-service-worker';

registerServiceWorker();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No se encontró el elemento #root');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
