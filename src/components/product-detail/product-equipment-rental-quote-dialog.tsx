import { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';

import { HaitechClientForm } from '@/components/admin/shared/haitech-client-form';
import type { EquipmentRentalEstimate } from '@/components/product-detail/product-detail-rental-configurator';
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
  buildEquipmentRentalQuoteLines,
  buildEquipmentRentalQuotePdf,
} from '@/lib/generate-rental-quote-pdf';
import { preloadQuotePdfAssets } from '@/lib/generate-product-quote-pdf';
import { formatPen, RENTAL_TERM_RENEWAL_NOTE } from '@/lib/rental-calculator';
import {
  EMPTY_HAITECH_CLIENT,
  haitechClientSchema,
} from '@/lib/haitech-client-schema';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { Product } from '@/types/product';

interface ProductEquipmentRentalQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  displayTitle: string;
  sku: string;
  brandLabel: string;
  estimate: EquipmentRentalEstimate;
  onGenerated: (preview: QuotePdfPreview) => void;
}

export function ProductEquipmentRentalQuoteDialog({
  open,
  onOpenChange,
  product,
  displayTitle,
  sku,
  brandLabel,
  estimate,
  onGenerated,
}: ProductEquipmentRentalQuoteDialogProps) {
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
      ciudad: parsed.data.ciudad,
    };

    const rentalProduct = {
      name: displayTitle,
      sku,
      brand: brandLabel,
      imageUrl: product.image_url,
    };

    try {
      const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
      const generated = await buildEquipmentRentalQuotePdf(values, estimate, rentalProduct, company);

      const url = URL.createObjectURL(generated.blob);
      onGenerated({
        url,
        filename: generated.filename,
        blob: generated.blob,
        quoteNumber: generated.quoteNumber,
      });

      setClient(EMPTY_HAITECH_CLIENT);
      onOpenChange(false);

      const quoteLines = buildEquipmentRentalQuoteLines(estimate, rentalProduct);

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
          notes: `Cotización alquiler de equipo · ${estimate.equipmentQuantity} equipo${estimate.equipmentQuantity > 1 ? 's' : ''} · ${estimate.monthlyPages.toLocaleString('es-PE')} pág./mes · Plazo ${estimate.termMonths} meses · ${RENTAL_TERM_RENEWAL_NOTE} · Total mensual estimado S/ ${formatPen(estimate.estimatedMonthlyPen)}`,
        })
        .catch(() => {
          toast.warning(
            'PDF generado, pero no se pudo registrar la cotización en el panel de ventas.',
          );
        });
    } catch (error) {
      console.error('[ProductEquipmentRentalQuoteDialog] PDF generation failed', error);
      setSubmitError('No se pudo generar la cotización. Inténtelo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cotizar alquiler de equipo</DialogTitle>
          <DialogDescription>
            Complete los datos del cliente para generar el PDF con la configuración actual. Plazo:{' '}
            {estimate.termMonths} meses · {estimate.equipmentQuantity} equipo
            {estimate.equipmentQuantity > 1 ? 's' : ''} ·{' '}
            {estimate.monthlyPages.toLocaleString('es-PE')} pág./mes. Total mensual estimado S/{' '}
            {formatPen(estimate.estimatedMonthlyPen)}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4" noValidate>
          <HaitechClientForm value={client} onChange={setClient} idPrefix="equipment-rental-quote" />

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
