/** Persistencia local de HaiPoints (billetera del cliente). */

const STORAGE_KEY = 'haistore_haipoints_v1';

type HaiPointsStore = Record<string, number>;

function readStore(): HaiPointsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as HaiPointsStore;
  } catch {
    return {};
  }
}

function writeStore(store: HaiPointsStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota / privado */
  }
}

function accountKey(user: { id?: string; email: string }): string {
  const id = user.id?.trim();
  if (id) return `id:${id}`;
  return `email:${user.email.trim().toLowerCase()}`;
}

/** Saldo de HaiPoints del usuario (0 si no hay registro). */
export function getHaiPointsBalance(user: { id?: string; email: string } | null | undefined): number {
  if (!user?.email) return 0;
  const value = readStore()[accountKey(user)];
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function setHaiPointsBalance(
  user: { id?: string; email: string },
  balance: number,
): number {
  const next = Math.max(0, Math.floor(Number(balance) || 0));
  const store = readStore();
  store[accountKey(user)] = next;
  writeStore(store);
  return next;
}

/** Formato corto para UI (p. ej. 1 250). */
export function formatHaiPoints(balance: number): string {
  return Math.max(0, Math.floor(balance)).toLocaleString('es-PE');
}
