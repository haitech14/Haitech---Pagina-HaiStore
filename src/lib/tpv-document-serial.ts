import type { TpvDocumentType } from '@/types/tpv';
import { TPV_DOCUMENT_META } from '@/types/tpv';

const STORAGE_KEY = 'haistore-tpv-document-serials';

type SerialMap = Partial<Record<TpvDocumentType, number>>;

function readSerials(): SerialMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SerialMap) : {};
  } catch {
    return {};
  }
}

function writeSerials(map: SerialMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** Número correlativo por tipo (persistido en el navegador). */
export function nextTpvDocumentNumber(type: TpvDocumentType): string {
  const meta = TPV_DOCUMENT_META[type];
  const map = readSerials();
  const next = (map[type] ?? 1);
  map[type] = next + 1;
  writeSerials(map);
  return `${meta.seriesPrefix}-${String(next).padStart(8, '0')}`;
}

export function peekTpvDocumentNumber(type: TpvDocumentType): string {
  const meta = TPV_DOCUMENT_META[type];
  const map = readSerials();
  const next = map[type] ?? 1;
  return `${meta.seriesPrefix}-${String(next).padStart(8, '0')}`;
}
