import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|Loading chunk \d+ failed|Importing a module script failed|error loading dynamically imported module/i;

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return CHUNK_ERROR_PATTERN.test(error.message);
}

async function loadWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  pageName: string,
  options: { reloadOnFinalChunkError?: boolean } = {},
): Promise<{ default: T }> {
  const maxAttempts = 3;
  const { reloadOnFinalChunkError = true } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await factory();
    } catch (error) {
      if (!isChunkLoadError(error) || attempt === maxAttempts) {
        throw error instanceof Error
          ? error
          : new Error(`No se pudo cargar ${pageName}`);
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 350 * attempt);
      });

      if (reloadOnFinalChunkError && attempt === maxAttempts - 1) {
        const reloadKey = 'haistore_chunk_reload';
        const reloaded = sessionStorage.getItem(reloadKey);
        if (!reloaded) {
          sessionStorage.setItem(reloadKey, '1');
          window.location.reload();
          throw error instanceof Error
            ? error
            : new Error(`Recargando ${pageName} tras error de chunk`);
        }
        sessionStorage.removeItem(reloadKey);
      }
    }
  }

  throw new Error(`No se pudo cargar ${pageName}`);
}

/**
 * Carga diferida con reintentos tras despliegues en Vercel (HTML en caché + chunks nuevos).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  pageName: string,
): LazyExoticComponent<T> {
  return lazy(() => loadWithRetry(factory, pageName));
}

/**
 * Widgets opcionales (Haibot, WhatsApp, footer): si el chunk falla en Vite/HMR,
 * no tumba la ruta — renderiza null.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyOptional<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  widgetName: string,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await loadWithRetry(factory, widgetName, { reloadOnFinalChunkError: false });
    } catch (error) {
      console.warn(`[app] widget opcional no cargó (${widgetName}):`, error);
      const Empty = (() => null) as unknown as T;
      return { default: Empty };
    }
  });
}
