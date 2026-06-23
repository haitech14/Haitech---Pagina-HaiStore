import { useCallback, useState } from 'react';
import { FileText } from 'lucide-react';

import { AttachmentPdfViewer } from '@/components/product-detail/attachment-pdf-viewer';
import { ProductQuoteDialog } from '@/components/product-detail/product-quote-dialog';
import {
  ProductQuotePdfViewer,
  type QuotePdfPreview,
} from '@/components/product-detail/product-quote-pdf-viewer';
import {
  downloadProductAttachment,
  isPdfAttachment,
} from '@/lib/inventory-attachments';
import type { ProductHeroSpecBullet, ProductResourceLink } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailResourcesProps {
  links: ProductResourceLink[];
  product: Product;
  displayTitle: string;
  sku: string;
  brandLabel: string;
  categoryLabel?: string;
  heroSpecBullets?: ProductHeroSpecBullet[];
}

function ResourceButton({
  link,
  onQuoteClick,
  onTechnicalSheetClick,
}: {
  link: ProductResourceLink;
  onQuoteClick: () => void;
  onTechnicalSheetClick: () => void;
}) {
  const className =
    'flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600';

  if (link.action === 'quote') {
    return (
      <button type="button" onClick={onQuoteClick} className={className}>
        <FileText className="size-4 shrink-0 text-red-600" aria-hidden="true" />
        {link.label}
      </button>
    );
  }

  if (link.action === 'technical_sheet') {
    return (
      <button type="button" onClick={onTechnicalSheetClick} className={className}>
        <FileText className="size-4 shrink-0 text-red-600" aria-hidden="true" />
        {link.label}
      </button>
    );
  }

  return (
    <a href={link.href ?? '#'} className={className}>
      <FileText className="size-4 shrink-0 text-red-600" aria-hidden="true" />
      {link.label}
    </a>
  );
}

export function ProductDetailResources({
  links,
  product,
  displayTitle,
  sku,
  brandLabel,
  categoryLabel,
  heroSpecBullets,
}: ProductDetailResourcesProps) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<QuotePdfPreview | null>(null);
  const [technicalSheetOpen, setTechnicalSheetOpen] = useState(false);

  const handlePreviewClose = useCallback((open: boolean) => {
    if (!open) {
      setPdfPreview((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return null;
      });
    }
  }, []);

  const quoteLink = links.find((link) => link.action === 'quote');
  const fichaLink = links.find((link) => link.action === 'technical_sheet');
  const manualLink = links.find((link) => link.label === 'Manual de Usuario');
  const driverLink = links.find((link) => link.label === 'Driver');
  const fichaFileName = fichaLink?.fileName ?? 'ficha-tecnica.pdf';
  const fichaCanPreview = Boolean(
    fichaLink?.href &&
      isPdfAttachment(fichaLink.href, fichaLink.mimeType, fichaFileName),
  );

  const handleTechnicalSheetClick = () => {
    if (!fichaLink?.href) return;
    if (fichaCanPreview) {
      setTechnicalSheetOpen(true);
      return;
    }
    downloadProductAttachment(fichaLink.href, fichaFileName);
  };

  if (links.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {quoteLink && (
          <ResourceButton
            link={quoteLink}
            onQuoteClick={() => setQuoteOpen(true)}
            onTechnicalSheetClick={handleTechnicalSheetClick}
          />
        )}
        {fichaLink && (
          <ResourceButton
            link={fichaLink}
            onQuoteClick={() => setQuoteOpen(true)}
            onTechnicalSheetClick={handleTechnicalSheetClick}
          />
        )}
        {manualLink && (
          <ResourceButton
            link={manualLink}
            onQuoteClick={() => setQuoteOpen(true)}
            onTechnicalSheetClick={handleTechnicalSheetClick}
          />
        )}
        {driverLink && (
          <ResourceButton
            link={driverLink}
            onQuoteClick={() => setQuoteOpen(true)}
            onTechnicalSheetClick={handleTechnicalSheetClick}
          />
        )}
      </div>

      <ProductQuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        product={product}
        displayTitle={displayTitle}
        sku={sku}
        brandLabel={brandLabel}
        {...(categoryLabel ? { categoryLabel } : {})}
        {...(heroSpecBullets ? { heroSpecBullets } : {})}
        onGenerated={setPdfPreview}
      />

      <ProductQuotePdfViewer preview={pdfPreview} onOpenChange={handlePreviewClose} />

      {fichaLink?.href && fichaCanPreview ? (
        <AttachmentPdfViewer
          open={technicalSheetOpen}
          onOpenChange={setTechnicalSheetOpen}
          url={fichaLink.href}
          filename={fichaFileName}
        />
      ) : null}
    </>
  );
}
