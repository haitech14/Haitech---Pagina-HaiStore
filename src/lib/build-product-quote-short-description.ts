import {
  isPrinterEquipment,
  resolveTrustWarrantyLabel,
} from '@/lib/build-product-detail';
import { resolveProductCardSpecRows } from '@/lib/product-card-short-description';
import type { Product } from '@/types/product';

function splitDescriptionLines(description: string | null | undefined): string[] {
  return (description ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function hasWarrantyLine(lines: string[]): boolean {
  return lines.some((line) => /garant/i.test(line));
}

/**
 * Descripción corta para la fila DESCRIPCIÓN de la cotización PDF.
 * En equipos: specs completas (funciones, velocidad, formato, producción) + garantía.
 */
export function buildProductQuoteShortDescription(product: Product): string | null {
  if (!isPrinterEquipment(product)) {
    const plain = product.description?.trim();
    return plain || null;
  }

  const lines: string[] = [];
  const seen = new Set<string>();

  const pushLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    lines.push(trimmed);
  };

  for (const row of resolveProductCardSpecRows(product)) {
    if (row.id === 'funciones') {
      pushLine(row.value);
      continue;
    }
    pushLine(`${row.label} ${row.value}`);
  }

  for (const line of splitDescriptionLines(product.description)) {
    // Evita duplicar lo ya cubierto por specs de tarjeta.
    if (/^(funciones|velocidad|formato|producci[oó]n)\b/i.test(line)) {
      const alreadyCovered = lines.some(
        (existing) =>
          existing.toLowerCase().includes(line.toLowerCase()) ||
          line.toLowerCase().includes(existing.toLowerCase()),
      );
      if (alreadyCovered) continue;
    }
    pushLine(line);
  }

  if (!hasWarrantyLine(lines)) {
    pushLine(resolveTrustWarrantyLabel(undefined, product));
  }

  return lines.length > 0 ? lines.join('\n') : null;
}
