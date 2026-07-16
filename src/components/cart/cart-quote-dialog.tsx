import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

import {
  ProductQuotePdfViewer,
  type QuotePdfPreview,
} from '@/components/product-detail/product-quote-pdf-viewer';
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
import { cartItemsToTpvLines } from '@/lib/cart-to-tpv-lines';
import { buildProformaPayloadFromProductQuote } from '@/lib/build-proforma-payload';
import { contactToQuoteClient } from '@/lib/generate-product-quote-from-contact';
import { nextTpvDocumentNumber } from '@/lib/tpv-document-serial';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import { isCompleteWhatsAppContact, type WhatsAppContact } from '@/lib/whatsapp-contact';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { CartItem } from '@/types/product';
import type { TpvCustomer } from '@/types/tpv';

interface CartQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
}

export function CartQuoteDialog({ open, onOpenChange, items }: CartQuoteDialogProps) {
  const { data: companySettings } = useCompanySettings();
  const { registerProductQuote } = useProformaMutations();
  const { contact, saveContact } = useWhatsAppContact();
  const [name, setName] = useState('');
  const [companyOrRuc, setCompanyOrRuc] = useState('');
  const [city, setCity] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<QuotePdfPreview | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(contact?.name?.trim() ?? '');
    setCompanyOrRuc(contact?.companyOrRuc?.trim() ?? '');
    setCity(contact?.city?.trim() ?? '');
    setSubmitError(null);
  }, [open, contact?.name, contact?.companyOrRuc, contact?.city]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSubmitError(null);
    }
    onOpenChange(next);
  };

  const handlePdfPreviewClose = (next: boolean) => {
    if (!next && pdfPreview?.url) {
      URL.revokeObjectURL(pdfPreview.url);
      setPdfPreview(null);
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (items.length === 0) {
      setSubmitError('El carrito está vacío.');
      return;
    }

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

    const quoteClient = contactToQuoteClient(nextContact);
    const customer: TpvCustomer = {
      razonSocial: quoteClient.razonSocial,
      documento: quoteClient.ruc,
      atencion: quoteClient.atencion,
      celular: quoteClient.celular === '—' ? '000000000' : quoteClient.celular,
      direccion: quoteClient.ciudad || 'Lima',
      ciudad: quoteClient.ciudad || 'Lima',
      priceList: 'public',
      currency: 'PEN',
      storeCustomerId: null,
    };

    const lines = cartItemsToTpvLines(items);
    const values = {
      razonSocial: quoteClient.razonSocial,
      ruc: quoteClient.ruc,
      atencion: quoteClient.atencion,
      celular: customer.celular,
      ciudad: quoteClient.ciudad,
    };

    try {
      await saveContact(nextContact);
      const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
      const documentNumber = nextTpvDocumentNumber('proforma');
      const { buildTpvDocumentPdf } = await import('@/lib/generate-tpv-document-pdf');
      const generated = await buildTpvDocumentPdf(
        'proforma',
        documentNumber,
        customer,
        lines,
        company,
      );
      const pdfBlob =
        generated.blob.type === 'application/pdf'
          ? generated.blob
          : new Blob([generated.blob], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);

      setPdfPreview({
        url,
        blob: pdfBlob,
        filename: generated.filename,
        quoteNumber: documentNumber,
      });
      handleOpenChange(false);

      void registerProductQuote
        .mutateAsync(
          buildProformaPayloadFromProductQuote(
            documentNumber,
            values,
            lines.map((line) => ({
              id: line.productId,
              name: line.name,
              sku: line.sku,
              brand: line.brand,
              pricePen: line.unitPricePen,
              quantity: line.quantity,
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
    } catch {
      setSubmitError('No se pudo generar la cotización. Inténtelo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[min(96vh,720px)] overflow-y-auto sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-red-600" aria-hidden="true" />
              Generar cotización
            </DialogTitle>
            <DialogDescription>
              Completa tus datos para emitir un PDF con los {items.length}{' '}
              {items.length === 1 ? 'producto' : 'productos'} del carrito.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="cart-quote-name">Nombre</Label>
              <Input
                id="cart-quote-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cart-quote-company">RUC/Empresa</Label>
              <Input
                id="cart-quote-company"
                value={companyOrRuc}
                onChange={(event) => setCompanyOrRuc(event.target.value)}
                autoComplete="organization"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cart-quote-city">Ciudad</Label>
              <Input
                id="cart-quote-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                autoComplete="address-level2"
                required
              />
            </div>

            {submitError ? (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="min-h-11 bg-red-600 hover:bg-red-500"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? 'Generando PDF…' : 'Generar cotización PDF'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ProductQuotePdfViewer preview={pdfPreview} onOpenChange={handlePdfPreviewClose} autoDownload />
    </>
  );
}
