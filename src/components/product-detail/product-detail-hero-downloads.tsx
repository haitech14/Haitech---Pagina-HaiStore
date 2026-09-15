import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

import { AttachmentPdfViewer } from '@/components/product-detail/attachment-pdf-viewer';
import { resolveTrustWarrantyLabel } from '@/lib/build-product-detail';
import {
  downloadProductAttachment,
  findAttachmentByKind,
  isPdfAttachment,
} from '@/lib/inventory-attachments';
import type { Product, ProductAttachmentKind } from '@/types/product';
import { cn } from '@/lib/utils';

interface ProductDetailHeroDownloadsProps {
  product: Product;
  onTechnicalSheetFallback?: () => void;
  showWarranty?: boolean;
  showDownloads?: boolean;
  className?: string;
}

interface DownloadItem {
  kind: ProductAttachmentKind;
  label: string;
  fileName: string;
}

const DOWNLOAD_ITEMS: DownloadItem[] = [
  { kind: 'technical_sheet', label: 'Ficha Técnica (PDF)', fileName: 'ficha-tecnica.pdf' },
  { kind: 'printer_driver', label: 'Driver', fileName: 'driver.pdf' },
  { kind: 'manual', label: 'Manual de Usuario', fileName: 'manual-de-usuario.pdf' },
];

function PdfFileIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path
        d="M8.2 16.2V11h1.55c.95 0 1.55.5 1.55 1.3 0 .78-.55 1.28-1.4 1.28H9.4v2.62H8.2Zm1.2-3.55h.3c.38 0 .62-.2.62-.52s-.24-.5-.62-.5h-.3v1.02ZM12.35 16.2V11h1.35c1.35 0 2.2.82 2.2 2.1s-.85 2.1-2.2 2.1h-.55v1Zm1.2-2.08h.28c.62 0 1-.4 1-1.02s-.38-1.02-1-1.02h-.28v2.04ZM17.05 16.2 18.5 11h1.25l-1.95 5.2h-1.25L15.6 11h1.28l1.17 5.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ProductDetailHeroDownloads({
  product,
  onTechnicalSheetFallback,
  showWarranty = true,
  showDownloads = true,
  className,
}: ProductDetailHeroDownloadsProps) {
  const warrantyLabel = resolveTrustWarrantyLabel(undefined, product);
  const [pdfPreview, setPdfPreview] = useState<{
    url: string;
    filename: string;
    title: string;
  } | null>(null);

  const downloadsList = showDownloads ? (
    <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
      {DOWNLOAD_ITEMS.map((item) => {
        const attachment = findAttachmentByKind(product, item.kind);
        const href = attachment?.url?.trim();
        const fileName = attachment?.file_name?.trim() || item.fileName;
        const canFallback = item.kind === 'technical_sheet' && Boolean(onTechnicalSheetFallback);
        const canOpen = Boolean(href) || canFallback;
        const openAsPdf = Boolean(href) && isPdfAttachment(href, attachment?.mime_type, fileName);

        const handleClick = () => {
          if (href && openAsPdf) {
            setPdfPreview({ url: href, filename: fileName, title: item.label });
            return;
          }
          if (href) {
            void downloadProductAttachment(href, fileName);
            return;
          }
          if (canFallback) onTechnicalSheetFallback?.();
        };

        return (
          <li key={item.kind}>
            <button
              type="button"
              onClick={handleClick}
              disabled={!canOpen}
              title={canOpen ? item.label : `${item.label} no disponible`}
              className={cn(
                'inline-flex items-center gap-1.5 text-left text-xs font-semibold text-[#E31B23] transition-colors',
                'hover:text-[#c41820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31B23] focus-visible:ring-offset-2',
                'disabled:cursor-default disabled:opacity-100 disabled:hover:text-[#E31B23]',
              )}
            >
              <PdfFileIcon className="size-5 shrink-0" />
              {item.label}
            </button>
          </li>
        );
      })}
    </ul>
  ) : null;

  const warrantyRow = showWarranty ? (
    <p className="flex items-start gap-2 text-[13px] leading-snug text-[#0f1f3d]">
      <ShieldCheck
        className="mt-0.5 size-3.5 shrink-0 text-red-600"
        strokeWidth={2}
        aria-hidden="true"
      />
      <span>{warrantyLabel}</span>
    </p>
  ) : null;

  if (!warrantyRow && !downloadsList) return null;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {warrantyRow}
      {downloadsList}

      {pdfPreview ? (
        <AttachmentPdfViewer
          open
          url={pdfPreview.url}
          filename={pdfPreview.filename}
          title={pdfPreview.title}
          onOpenChange={(open) => {
            if (!open) setPdfPreview(null);
          }}
        />
      ) : null}
    </div>
  );
}
