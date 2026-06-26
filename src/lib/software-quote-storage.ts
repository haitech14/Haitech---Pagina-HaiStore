import type { SoftwareQuoteLine } from '@/types/software-catalog';

const STORAGE_KEY = 'haistore_software_quote_v1';

export function readStoredSoftwareQuote(): SoftwareQuoteLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SoftwareQuoteLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line) =>
        line &&
        typeof line.lineId === 'string' &&
        typeof line.softwareSlug === 'string' &&
        Number.isFinite(line.quantity) &&
        line.quantity > 0 &&
        Number.isFinite(line.unitPricePen),
    );
  } catch {
    return [];
  }
}

export function writeStoredSoftwareQuote(lines: SoftwareQuoteLine[]): void {
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

export function clearStoredSoftwareQuote(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function buildSoftwareQuoteLineId(
  softwareSlug: string,
  planId: string,
  durationId: string,
): string {
  return `${softwareSlug}::${planId}::${durationId}`;
}
