import { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';

import { HaitechClientForm } from '@/components/admin/shared/haitech-client-form';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { buildProformaPayloadFromProductQuote } from '@/lib/build-proforma-payload';
import {
  buildRentalQuoteLines,
  buildRentalQuotePdf,
} from '@/lib/generate-rental-quote-pdf';
import { preloadQuotePdfAssets } from '@/lib/generate-product-quote-pdf';
import { formatPen, RENTAL_TERM_RENEWAL_NOTE, type RentalCalculatorBreakdown } from '@/lib/rental-calculator';
import {
  EMPTY_HAITECH_CLIENT,
  haitechClientSchema,
} from '@/lib/haitech-client-schema';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { Product } from '@/types/product';

interface ProductRentalQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  displayTitle: string;
  sku: string;
  brandLabel: string;
  breakdown: RentalCalculatorBreakdown;
  onGenerated: (preview: QuotePdfPreview) => void;
}

export function ProductRentalQuoteDialog({
  open,
  onOpenChange,
  product,
  displayTitle,
  sku,
  brandLabel,
  breakdown,
  onGenerated,
}: ProductRentalQuoteDialogProps) {
  const { data: companySettings } = useCompanySettings();
  const { registerProductQuote } = useProformaMutations();
  const [client, setClient] = useState(EMPTY_HAITECH_CLIENT);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    preloadQuotePdfAssets([product.image_url]);
  }, [open, product.image_url]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const parsed = haitechClientSchema.safeParse(client);
    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      setIsSubmitting(false);
      return;
    }

    const values = {
      razonSocial: parsed.data.nombre,
      ruc: parsed.data.rucDni,
      atencion: parsed.data.nombreContacto,
      celular: parsed.data.telefono,
      direccion: parsed.data.direccion,
      ciudad: parsed.data.ciudad,
    };

    try {
      const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
      const generated = await buildRentalQuotePdf(
        values,
        breakdown,
        {
          name: displayTitle,
          sku,
          brand: brandLabel,
          imageUrl: product.image_url,
        },
        company,
      );

      const url = URL.createObjectURL(generated.blob);
      onGenerated({
        url,
        filename: generated.filename,
        blob: generated.blob,
        quoteNumber: generated.quoteNumber,
      });

      setClient(EMPTY_HAITECH_CLIENT);
      onOpenChange(false);

      const quoteLines = buildRentalQuoteLines(breakdown, {
        name: displayTitle,
        sku,
        brand: brandLabel,
        imageUrl: product.image_url,
      });

      void registerProductQuote
        .mutateAsync({
          ...buildProformaPayloadFromProductQuote(
            generated.quoteNumber,
            values,
            quoteLines.map((line, index) => ({
              id: index === 0 ? product.id : `${product.id}::${line.sku}`,
              name: line.name,
              sku: line.sku,
              brand: line.brand,
              pricePen: line.pricePen,
              quantity: line.quantity ?? 1,
              imageUrl: line.imageUrl ?? null,
            })),
            company.quoteValidityDays,
          ),
          notes: `Cotización plan mantenimiento o suministros · Plazo ${breakdown.termMonths} meses · ${RENTAL_TERM_RENEWAL_NOTE} · Total plan estimado S/ ${formatPen(breakdown.contractTotalPen)}`,
        })
        .catch(() => {
          toast.warning(
            'PDF generado, pero no se pudo registrar la cotización en el panel de ventas.',
          );
        });
    } catch (error) {
      console.error('[ProductRentalQuoteDialog] PDF generation failed', error);
      setSubmitError('No se pudo generar la cotización. Inténtelo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generar cotización del plan</DialogTitle>
          <DialogDescription>
            Complete los datos del cliente para generar el PDF. Plazo del plan:{' '}
            {breakdown.termMonths} meses. {RENTAL_TERM_RENEWAL_NOTE} Total mensual estimado S/{' '}
            {formatPen(breakdown.monthlySubtotalPen)}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4" noValidate>
          <HaitechClientForm value={client} onChange={setClient} idPrefix="rental-quote" />

          {submitError ? (
            <p role="alert" className="text-xs text-red-600">
              {submitError}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600"
          >
            <FileDown className="size-4" aria-hidden="true" />
            {isSubmitting ? 'Generando PDF…' : 'Generar cotización PDF'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
