import { useCallback, useState, type MouseEvent } from 'react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';

import { WhatsAppContactDialog } from '@/components/whatsapp-contact-dialog';
import {
  ProductQuotePdfViewer,
  type QuotePdfPreview,
} from '@/components/product-detail/product-quote-pdf-viewer';
import { Button } from '@/components/ui/button';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import {
  generateProductQuoteFromContact,
  type ProductQuoteContext,
} from '@/lib/generate-product-quote-from-contact';
import { openProductWhatsAppChat, type ProductWhatsAppLineItem } from '@/lib/product-whatsapp-message';
import { productPath } from '@/lib/product-path';
import { buildAbsoluteUrl } from '@/lib/site-url';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';
import { cn } from '@/lib/utils';

interface ProductWhatsAppButtonProps {
  product: ProductWhatsAppLineItem;
  className?: string;
  /** Evita activar el enlace padre de la tarjeta. */
  stopPropagation?: boolean;
  /** Muestra texto junto al icono (p. ej. «Comprar por WhatsApp»). */
  label?: string;
  quantity?: number;
  /** Estilo del botón cuando hay etiqueta. */
  accent?: 'solid' | 'outline';
  /** Contexto para generar cotización PDF (ficha de producto). */
  quoteContext?: ProductQuoteContext;
  /** Callback al generar cotización (p. ej. abrir visor PDF en la ficha). */
  onQuoteGenerated?: (preview: QuotePdfPreview) => void;
}

export function ProductWhatsAppButton({
  product,
  className,
  stopPropagation = true,
  label,
  quantity,
  accent = 'solid',
  quoteContext,
  onQuoteGenerated,
}: ProductWhatsAppButtonProps) {
  const { contact, saveContact, isSaving } = useWhatsAppContact();
  const { data: companySettings } = useCompanySettings();
  const { registerProductQuote } = useProformaMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quotePdfPreview, setQuotePdfPreview] = useState<QuotePdfPreview | null>(null);

  const detailPath = product.id ? productPath(product.id) : null;
  const resolvedProductUrl =
    product.productUrl ?? (detailPath ? buildAbsoluteUrl(detailPath) : null);
  const lineItem: ProductWhatsAppLineItem = {
    ...product,
    ...(resolvedProductUrl ? { productUrl: resolvedProductUrl } : {}),
    ...(quantity != null && quantity > 0 ? { quantity } : {}),
  };

  const handleQuotePdfPreviewClose = useCallback((open: boolean) => {
    if (!open) {
      setQuotePdfPreview((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return null;
      });
    }
  }, []);

  const handleSubmit = async (
    nextContact: WhatsAppContact,
    options: { generateQuote: boolean },
  ) => {
    setIsProcessing(true);
    try {
      await saveContact(nextContact);

      let quoteNumber: string | undefined;

      if (options.generateQuote) {
        if (!quoteContext && !product.id) {
          throw new Error('No se pudo generar la cotización para este producto.');
        }

        const context: ProductQuoteContext =
          quoteContext ??
          ({
            product: {
              id: product.id!,
              name: product.name,
              description: null,
              price: product.priceUsd,
              currency: 'USD',
              image_url: null,
              stock: 1,
              category: product.category ?? null,
              brand: product.brand ?? null,
              created_at: new Date().toISOString(),
            },
            displayTitle: product.name,
            sku: product.id!,
            brandLabel: product.brand ?? '',
            ...(lineItem.quantity != null && lineItem.quantity > 0
              ? { quantity: lineItem.quantity }
              : {}),
          } satisfies ProductQuoteContext);

        const preview = await generateProductQuoteFromContact(
          nextContact,
          context,
          companySettings ?? DEFAULT_COMPANY_SETTINGS,
          (payload) => registerProductQuote.mutateAsync(payload),
        );

        quoteNumber = preview.quoteNumber;
        onQuoteGenerated?.(preview);
        if (!onQuoteGenerated) {
          setQuotePdfPreview(preview);
        }
      }

      const opened = openProductWhatsAppChat(lineItem, nextContact, undefined, {
        generateQuote: options.generateQuote,
        ...(quoteNumber ? { quoteNumber } : {}),
      });

      if (!opened) {
        throw new Error('No se pudo abrir WhatsApp. Verifica el número de contacto.');
      }
    } catch (error) {
      if (options.generateQuote) {
        const { toast } = await import('sonner');
        toast.error(
          error instanceof Error ? error.message : 'No se pudo generar la cotización.',
        );
      }
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }
    setDialogOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant={label ? 'default' : 'outline'}
        size={label ? 'default' : 'icon'}
        className={cn(
          label
            ? accent === 'outline'
              ? 'min-h-11 gap-2 border border-[#25D366] bg-white px-3 text-sm font-bold uppercase tracking-wide text-[#25D366] hover:border-[#25D366] hover:bg-[#25D366] hover:text-white focus-visible:ring-[#25D366] focus-visible:ring-offset-2'
              : 'min-h-9 gap-1.5 bg-[#25D366] px-2 text-xs font-semibold text-white hover:bg-[#20bd5a] focus-visible:ring-[#25D366] focus-visible:ring-offset-2'
            : 'size-10 min-h-11 shrink-0 rounded-lg border border-[#25D366] bg-white text-[#25D366] hover:border-[#25D366] hover:bg-[#25D366] hover:text-white focus-visible:ring-[#25D366] focus-visible:ring-offset-2',
          className,
        )}
        aria-label={
          label
            ? `${label} — ${product.name}`
            : `Consultar ${product.name} por WhatsApp`
        }
        onClick={handleClick}
      >
        <Icon path={mdiWhatsapp} size={0.95} aria-hidden="true" />
        {label ? <span className="truncate">{label}</span> : null}
      </Button>

      <WhatsAppContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={contact ?? undefined}
        isSubmitting={isSaving || isProcessing}
        onSubmit={handleSubmit}
      />

      {!onQuoteGenerated ? (
        <ProductQuotePdfViewer
          preview={quotePdfPreview}
          onOpenChange={handleQuotePdfPreviewClose}
          autoDownload
        />
      ) : null}
    </>
  );
}
