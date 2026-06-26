import { formatProductDisplayCode } from '@/lib/product-display-code';

/** Código legible en PDFs, alineado con tarjetas de catálogo. */
export function normalizePdfProductCode(
  raw: string | null | undefined,
  brand?: string | null,
): string {
  const trimmed = raw?.trim();
  if (!trimmed) return '—';

  if (trimmed.startsWith('service:')) {
    return trimmed.slice('service:'.length).toUpperCase();
  }

  const formatted = formatProductDisplayCode(trimmed, { brand });
  return formatted || trimmed;
}

/** Borde derecho de la columna IMPORTE (alineación única para filas y totales). */
export function pdfTableAmountColumnRight(tableX: number, tableW: number, pad = 2): number {
  return tableX + tableW - pad;
}
