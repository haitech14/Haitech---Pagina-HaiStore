import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|Loading chunk \d+ failed|Importing a module script failed|error loading dynamically imported module/i;

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return CHUNK_ERROR_PATTERN.test(error.message);
}

/**
 * Carga diferida con reintentos tras despliegues en Vercel (HTML en caché + chunks nuevos).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  pageName: string,
): LazyExoticComponent<T> {
  return lazy(async () => {
    const maxAttempts = 3;

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

        if (attempt === maxAttempts - 1) {
          const reloadKey = 'haistore_chunk_reload';
          const reloaded = sessionStorage.getItem(reloadKey);
          if (!reloaded) {
            sessionStorage.setItem(reloadKey, '1');
            window.location.reload();
            // No colgar Suspense: la recarga aborta este hilo.
            throw error instanceof Error
              ? error
              : new Error(`Recargando ${pageName} tras error de chunk`);
          }
          sessionStorage.removeItem(reloadKey);
        }
      }
    }

    throw new Error(`No se pudo cargar ${pageName}`);
  });
}
