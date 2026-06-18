import { useEffect, useMemo, useState } from 'react';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';

import { HaitechClientForm } from '@/components/admin/shared/haitech-client-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { buildProformaPayloadFromProductQuote } from '@/lib/build-proforma-payload';
import { buildProductQuoteLines } from '@/lib/equipment-config-selection';
import {
  buildProductQuotePdf,
  buildQuoteTechnicalSheetFromProduct,
  preloadQuotePdfAssets,
} from '@/lib/generate-product-quote-pdf';
import {
  haitechClientSchema,
  EMPTY_HAITECH_CLIENT,
} from '@/lib/haitech-client-schema';
import { usdToPen } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { CartConfigurationLine, Product } from '@/types/product';
import type { ProductHeroSpecBullet } from '@/types/product-detail';

interface ProductQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  displayTitle: string;
  sku: string;
  brandLabel: string;
  categoryLabel?: string;
  heroSpecBullets?: ProductHeroSpecBullet[];
  heroLead?: string;
  heroDescription?: string;
  equipmentConfiguration?: CartConfigurationLine | undefined;
  onGenerated: (preview: QuotePdfPreview) => void;
}

export function ProductQuoteDialog({
  open,
  onOpenChange,
  product,
  displayTitle,
  sku,
  brandLabel,
  categoryLabel,
  heroSpecBullets,
  heroLead,
  heroDescription,
  equipmentConfiguration,
  onGenerated,
}: ProductQuoteDialogProps) {
  const { data: companySettings } = useCompanySettings();
  const { registerProductQuote } = useProformaMutations();
  const [client, setClient] = useState(EMPTY_HAITECH_CLIENT);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quoteLines = useMemo(
    () =>
      buildProductQuoteLines(
        {
          name: displayTitle,
          sku,
          brand: brandLabel,
          pricePen: usdToPen(product.price),
          quantity: 1,
          imageUrl: product.image_url,
        },
        equipmentConfiguration,
      ),
    [brandLabel, displayTitle, equipmentConfiguration, product.image_url, product.price, sku],
  );

  const paidOptionsCount = equipmentConfiguration?.options.filter((option) => option.pricePen > 0).length ?? 0;

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

    try {
      const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
      let technicalSheet = null;
      try {
        technicalSheet = buildQuoteTechnicalSheetFromProduct(product, {
          displayTitle,
          categoryLabel: categoryLabel ?? product.category ?? 'Equipo',
          ...(heroSpecBullets ? { heroSpecBullets } : {}),
          ...(heroLead ? { heroLead } : {}),
          ...(heroDescription ? { heroDescription } : {}),
        });
      } catch (sheetError) {
        console.warn('[ProductQuoteDialog] technical sheet skipped', sheetError);
      }
      const generated = await buildProductQuotePdf(values, quoteLines, company, { technicalSheet });

      const url = URL.createObjectURL(generated.blob);
      onGenerated({
        url,
        filename: generated.filename,
        blob: generated.blob,
        quoteNumber: generated.quoteNumber,
      });

      setClient(EMPTY_HAITECH_CLIENT);
      onOpenChange(false);

      void registerProductQuote
        .mutateAsync(
          buildProformaPayloadFromProductQuote(
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
        )
        .catch(() => {
          toast.warning(
            'PDF generado, pero no se pudo registrar la cotización en el panel de ventas.',
          );
        });
    } catch (error) {
      console.error('[ProductQuoteDialog] PDF generation failed', error);
      setSubmitError('No se pudo generar la cotización. Inténtelo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Descargar cotización</DialogTitle>
          <DialogDescription>
            Complete los datos del cliente (mismo formulario que HaiSupport) para generar el PDF.
            {paidOptionsCount > 0
              ? ` Incluye ${paidOptionsCount} accesorio${paidOptionsCount === 1 ? '' : 's'} de configuración.`
              : null}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4" noValidate>
          <HaitechClientForm value={client} onChange={setClient} idPrefix="quote" />

          {submitError && (
            <p role="alert" className="text-xs text-red-600">
              {submitError}
            </p>
          )}

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
