import { uuidV4Fallback } from '@/lib/random-id';

/** Parchea crypto.randomUUID en contextos no seguros (HTTP por IP) o navegadores viejos. */
function installRandomUuidPolyfill(): void {
  if (typeof globalThis.crypto === 'undefined') return;
  if (typeof globalThis.crypto.randomUUID === 'function') return;

  try {
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      value: uuidV4Fallback,
      writable: true,
      configurable: true,
    });
  } catch {
    /* entorno restringido */
  }
}

installRandomUuidPolyfill();
