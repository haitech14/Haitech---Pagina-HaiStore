import { randomId } from '@/lib/random-id';
import {
  formatUploadBytes,
  MAX_PRODUCT_ATTACHMENT_UPLOAD_BYTES,
} from '@/lib/product-media-upload-limits';
import {
  PRODUCT_ATTACHMENT_KINDS,
  type InventoryProduct,
  type ProductAttachment,
  type ProductAttachmentKind,
} from '@/types/product';

export { PRODUCT_ATTACHMENT_KINDS };

export const PRODUCT_ATTACHMENT_LABELS: Record<ProductAttachmentKind, string> = {
  technical_sheet: 'Ficha técnica',
  manual: 'Manual de usuario',
  printer_driver: 'Driver',
  firmware: 'Firmware',
  brochure: 'Brochure',
  other: 'Otro',
};

function toProductAttachment(row: Partial<ProductAttachment>): ProductAttachment | null {
  const url = typeof row.url === 'string' ? row.url.trim() : '';
  if (!url) return null;

  const kind = PRODUCT_ATTACHMENT_KINDS.includes(row.kind as ProductAttachmentKind)
    ? (row.kind as ProductAttachmentKind)
    : 'other';
  const label =
    typeof row.label === 'string' && row.label.trim()
      ? row.label.trim()
      : PRODUCT_ATTACHMENT_LABELS[kind];

  const attachment: ProductAttachment = {
    id:
      typeof row.id === 'string' && row.id.trim().length > 0
        ? row.id.trim()
        : randomId(),
    kind,
    label,
    url,
  };

  if (typeof row.file_name === 'string' && row.file_name.trim()) {
    attachment.file_name = row.file_name.trim();
  }
  if (typeof row.mime_type === 'string' && row.mime_type.trim()) {
    attachment.mime_type = row.mime_type.trim();
  }

  return attachment;
}

export function normalizeAttachments(value: unknown): ProductAttachment[] {
  if (!Array.isArray(value)) return [];

  const attachments: ProductAttachment[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const parsed = toProductAttachment(entry as Partial<ProductAttachment>);
    if (parsed) attachments.push(parsed);
  }
  return attachments;
}

const PUBLIC_ATTACHMENT_KINDS: ProductAttachmentKind[] = [
  'technical_sheet',
  'manual',
  'printer_driver',
  'firmware',
  'brochure',
];

export function findAttachmentByKind(
  product: { attachments?: ProductAttachment[] | null },
  kind: ProductAttachmentKind,
): ProductAttachment | undefined {
  return normalizeAttachments(product.attachments).find((attachment) => attachment.kind === kind);
}

export function findTechnicalSheetAttachment(
  product: { attachments?: ProductAttachment[] | null },
): ProductAttachment | undefined {
  return findAttachmentByKind(product, 'technical_sheet');
}

export function isPdfAttachment(
  url: string,
  mimeType?: string | null,
  fileName?: string | null,
): boolean {
  if (mimeType?.toLowerCase().includes('pdf')) return true;
  if (fileName?.toLowerCase().endsWith('.pdf')) return true;
  if (url.toLowerCase().startsWith('data:application/pdf')) return true;
  try {
    const path = new URL(url, 'https://local.invalid').pathname.toLowerCase();
    if (path.endsWith('.pdf')) return true;
  } catch {
    if (url.toLowerCase().includes('.pdf')) return true;
  }
  return false;
}

export function downloadProductAttachment(url: string, fileName: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function publicProductAttachments(
  product: { attachments?: ProductAttachment[] | null },
): ProductAttachment[] {
  return normalizeAttachments(product.attachments).filter((attachment) =>
    PUBLIC_ATTACHMENT_KINDS.includes(attachment.kind),
  );
}

export function guessAttachmentKind(fileName: string): ProductAttachmentKind {
  const lower = fileName.toLowerCase();
  if (lower.includes('ficha') || lower.includes('datasheet') || lower.includes('spec')) {
    return 'technical_sheet';
  }
  if (lower.includes('manual')) return 'manual';
  if (lower.includes('driver') || lower.includes('controlador')) return 'printer_driver';
  if (lower.includes('firmware') || lower.includes('fw')) return 'firmware';
  if (lower.includes('brochure') || lower.includes('folleto')) return 'brochure';
  return 'other';
}

export function readAttachmentFile(
  file: File,
  kind: ProductAttachmentKind,
): Promise<ProductAttachment> {
  if (file.size > MAX_PRODUCT_ATTACHMENT_UPLOAD_BYTES) {
    return Promise.reject(
      new Error(`El archivo no debe superar ${formatUploadBytes(MAX_PRODUCT_ATTACHMENT_UPLOAD_BYTES)}.`),
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? '');
      if (!url) {
        reject(new Error('No se pudo leer el archivo.'));
        return;
      }
      const attachment: ProductAttachment = {
        id: randomId(),
        kind,
        label: PRODUCT_ATTACHMENT_LABELS[kind],
        file_name: file.name,
        url,
      };
      if (file.type) {
        attachment.mime_type = file.type;
      }
      resolve(attachment);
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

export function upsertProductAttachment(
  attachments: ProductAttachment[] | null | undefined,
  attachment: ProductAttachment,
): ProductAttachment[] {
  const normalized = normalizeAttachments(attachments);
  return [...normalized.filter((row) => row.kind !== attachment.kind), attachment];
}

export function withAttachments(product: InventoryProduct): InventoryProduct {
  return {
    ...product,
    attachments: normalizeAttachments(product.attachments),
  };
}
