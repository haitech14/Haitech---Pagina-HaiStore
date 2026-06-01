import {
  PRODUCT_ATTACHMENT_KINDS,
  type InventoryProduct,
  type ProductAttachment,
  type ProductAttachmentKind,
} from '@/types/product';

export { PRODUCT_ATTACHMENT_KINDS };

export const PRODUCT_ATTACHMENT_LABELS: Record<ProductAttachmentKind, string> = {
  technical_sheet: 'Ficha técnica',
  manual: 'Manual',
  brochure: 'Brochure',
  other: 'Otro',
};

const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

export function normalizeAttachments(value: unknown): ProductAttachment[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const row = entry as Partial<ProductAttachment>;
      const url = typeof row.url === 'string' ? row.url.trim() : '';
      if (!url) return null;

      const kind = PRODUCT_ATTACHMENT_KINDS.includes(row.kind as ProductAttachmentKind)
        ? (row.kind as ProductAttachmentKind)
        : 'other';
      const label =
        typeof row.label === 'string' && row.label.trim()
          ? row.label.trim()
          : PRODUCT_ATTACHMENT_LABELS[kind];

      return {
        id:
          typeof row.id === 'string' && row.id.trim().length > 0
            ? row.id.trim()
            : crypto.randomUUID(),
        kind,
        label,
        url,
        file_name: typeof row.file_name === 'string' ? row.file_name : undefined,
        mime_type: typeof row.mime_type === 'string' ? row.mime_type : undefined,
      };
    })
    .filter((row): row is ProductAttachment => row != null);
}

export function guessAttachmentKind(fileName: string): ProductAttachmentKind {
  const lower = fileName.toLowerCase();
  if (lower.includes('ficha') || lower.includes('datasheet') || lower.includes('spec')) {
    return 'technical_sheet';
  }
  if (lower.includes('manual')) return 'manual';
  if (lower.includes('brochure') || lower.includes('folleto')) return 'brochure';
  return 'other';
}

export function readAttachmentFile(
  file: File,
  kind: ProductAttachmentKind,
): Promise<ProductAttachment> {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return Promise.reject(new Error('El archivo no debe superar 4 MB.'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? '');
      if (!url) {
        reject(new Error('No se pudo leer el archivo.'));
        return;
      }
      resolve({
        id: crypto.randomUUID(),
        kind,
        label: PRODUCT_ATTACHMENT_LABELS[kind],
        file_name: file.name,
        mime_type: file.type || undefined,
        url,
      });
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

export function withAttachments(product: InventoryProduct): InventoryProduct {
  return {
    ...product,
    attachments: normalizeAttachments(product.attachments),
  };
}
