import { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';

import type { EquipmentRentalEstimate } from '@/lib/rental-calculator';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import { buildProformaPayloadFromProductQuote } from '@/lib/build-proforma-payload';
import { contactToQuoteClient } from '@/lib/quote-client-from-contact';
import {
  buildEquipmentRentalQuoteLines,
  buildEquipmentRentalQuotePdf,
} from '@/lib/generate-rental-quote-pdf';
import { preloadQuotePdfAssets } from '@/lib/generate-product-quote-pdf';
import { formatPen, RENTAL_TERM_RENEWAL_NOTE } from '@/lib/rental-calculator';
import { isCompleteWhatsAppContact, type WhatsAppContact } from '@/lib/whatsapp-contact';
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
  const { contact, saveContact } = useWhatsAppContact();
  const [name, setName] = useState('');
  const [companyOrRuc, setCompanyOrRuc] = useState('');
  const [city, setCity] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(contact?.name?.trim() ?? '');
    setCompanyOrRuc(contact?.companyOrRuc?.trim() ?? '');
    setCity(contact?.city?.trim() ?? '');
    setSubmitError(null);
    preloadQuotePdfAssets([product.image_url]);
  }, [open, contact?.name, contact?.companyOrRuc, contact?.city, product.image_url]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const nextContact: WhatsAppContact = {
      name: name.trim(),
      companyOrRuc: companyOrRuc.trim(),
      city: city.trim(),
    };

    if (!isCompleteWhatsAppContact(nextContact)) {
      setSubmitError('Completa nombre, RUC/empresa y ciudad.');
      return;
    }

    setIsSubmitting(true);

    const values = contactToQuoteClient(nextContact);
    const rentalProduct = {
      name: displayTitle,
      sku,
      brand: brandLabel,
      imageUrl: product.image_url,
    };

    try {
      await saveContact(nextContact);
      const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
      const generated = await buildEquipmentRentalQuotePdf(values, estimate, rentalProduct, company);

      const url = URL.createObjectURL(generated.blob);
      onGenerated({
        url,
        filename: generated.filename,
        blob: generated.blob,
        quoteNumber: generated.quoteNumber,
      });

      onOpenChange(false);

      const quoteLines = buildEquipmentRentalQuoteLines(estimate, rentalProduct);

      void registerProductQuote
        .mutateAsync({
          ...buildProformaPayloadFromProductQuote(
            generated.quoteNumber,
            {
              razonSocial: values.razonSocial,
              ruc: values.ruc,
              atencion: values.atencion,
              celular: values.celular === '—' ? '000000000' : values.celular,
              ciudad: values.ciudad,
            },
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
      <DialogContent className="max-h-[92vh] max-w-sm overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar propuesta de alquiler</DialogTitle>
          <DialogDescription>
            Completa tus datos para generar el PDF. Plazo: {estimate.termMonths} meses ·{' '}
            {estimate.equipmentQuantity} equipo
            {estimate.equipmentQuantity > 1 ? 's' : ''} ·{' '}
            {estimate.monthlyPages.toLocaleString('es-PE')} pág./mes. Total mensual estimado S/{' '}
            {formatPen(estimate.estimatedMonthlyPen)}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="rental-quote-name">Nombre</Label>
            <Input
              id="rental-quote-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rental-quote-company">RUC/Empresa</Label>
            <Input
              id="rental-quote-company"
              value={companyOrRuc}
              onChange={(event) => setCompanyOrRuc(event.target.value)}
              autoComplete="organization"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rental-quote-city">Ciudad</Label>
            <Input
              id="rental-quote-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              autoComplete="address-level2"
              required
            />
          </div>

          {submitError ? (
            <p role="alert" className="text-xs text-red-600">
              {submitError}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600"
          >
            <FileDown className="size-4" aria-hidden="true" />
            {isSubmitting ? 'Generando PDF…' : 'Generar propuesta PDF'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
