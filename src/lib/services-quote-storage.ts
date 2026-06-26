import type { ServicesQuoteLine } from '@/types/services-catalog';

const STORAGE_KEY = 'haistore_services_quote_v1';

export function readStoredServicesQuote(): ServicesQuoteLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ServicesQuoteLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line) =>
        line &&
        typeof line.lineId === 'string' &&
        typeof line.serviceSlug === 'string' &&
        Number.isFinite(line.quantity) &&
        line.quantity > 0 &&
        Number.isFinite(line.unitPricePen),
    );
  } catch {
    return [];
  }
}

export function writeStoredServicesQuote(lines: ServicesQuoteLine[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (lines.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // localStorage lleno o bloqueado
  }
}

export function clearStoredServicesQuote(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function buildServicesQuoteLineId(
  serviceSlug: string,
  planId: string,
  durationId: string,
): string {
  return `${serviceSlug}::${planId}::${durationId}`;
}
