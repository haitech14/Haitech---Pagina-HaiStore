import { uuidV4Fallback } from '@/lib/random-id';

/**
 * En HTTP por IP (p. ej. http://192.168.x.x:5173) el navegador no es secure context.
 * Algunos browsers exponen crypto.randomUUID pero lanzan al llamarlo → pantalla en blanco
 * si Supabase u otra lib lo usa al arrancar. Parcheamos en contexto inseguro o si falla.
 */
function randomUuidThrows(): boolean {
  if (typeof globalThis.crypto?.randomUUID !== 'function') return true;
  try {
    globalThis.crypto.randomUUID();
    return false;
  } catch {
    return true;
  }
}

function installRandomUuidPolyfill(): void {
  if (typeof globalThis.crypto === 'undefined') return;

  const insecure =
    typeof globalThis.isSecureContext === 'boolean' ? !globalThis.isSecureContext : false;

  if (!insecure && !randomUuidThrows()) return;

  const polyfill = uuidV4Fallback as () => `${string}-${string}-${string}-${string}-${string}`;

  try {
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      value: polyfill,
      writable: true,
      configurable: true,
    });
  } catch {
    try {
      (globalThis.crypto as Crypto & { randomUUID: () => string }).randomUUID = polyfill;
    } catch {
      /* entorno restringido */
    }
  }
}

installRandomUuidPolyfill();
