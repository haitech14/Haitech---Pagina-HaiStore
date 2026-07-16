import { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';

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
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import {
  generateProductQuoteFromContact,
  type ProductQuoteContext,
} from '@/lib/generate-product-quote-from-contact';
import { isCompleteWhatsAppContact, type WhatsAppContact } from '@/lib/whatsapp-contact';
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
  const { contact, saveContact } = useWhatsAppContact();
  const [name, setName] = useState('');
  const [companyOrRuc, setCompanyOrRuc] = useState('');
  const [city, setCity] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paidOptionsCount =
    equipmentConfiguration?.options.filter((option) => option.pricePen > 0).length ?? 0;

  useEffect(() => {
    if (!open) return;
    setName(contact?.name?.trim() ?? '');
    setCompanyOrRuc(contact?.companyOrRuc?.trim() ?? '');
    setCity(contact?.city?.trim() ?? '');
    setSubmitError(null);
    void import('@/lib/generate-product-quote-pdf').then(({ preloadQuotePdfAssets }) =>
      preloadQuotePdfAssets([product.image_url]),
    );
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
    try {
      await saveContact(nextContact);

      const context: ProductQuoteContext = {
        product,
        displayTitle,
        sku,
        brandLabel,
        ...(categoryLabel ? { categoryLabel } : {}),
        ...(heroSpecBullets ? { heroSpecBullets } : {}),
        ...(heroLead ? { heroLead } : {}),
        ...(heroDescription ? { heroDescription } : {}),
        ...(equipmentConfiguration ? { equipmentConfiguration } : {}),
      };

      const preview = await generateProductQuoteFromContact(
        nextContact,
        context,
        companySettings ?? DEFAULT_COMPANY_SETTINGS,
        (payload) => registerProductQuote.mutateAsync(payload),
      );

      onGenerated(preview);
      onOpenChange(false);
    } catch (error) {
      console.error('[ProductQuoteDialog] PDF generation failed', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No se pudo generar la cotización. Inténtelo nuevamente.',
      );
      toast.error('No se pudo generar la cotización.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-sm overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generar cotización</DialogTitle>
          <DialogDescription>
            Completa tus datos para generar el PDF.
            {paidOptionsCount > 0
              ? ` Incluye ${paidOptionsCount} accesorio${paidOptionsCount === 1 ? '' : 's'} de configuración.`
              : null}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="quote-light-name">Nombre</Label>
            <Input
              id="quote-light-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-light-company">RUC/Empresa</Label>
            <Input
              id="quote-light-company"
              value={companyOrRuc}
              onChange={(event) => setCompanyOrRuc(event.target.value)}
              autoComplete="organization"
              placeholder="Ej. 20123456789 o Mi Empresa SAC"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-light-city">Ciudad</Label>
            <Input
              id="quote-light-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              autoComplete="address-level2"
              placeholder="Ej. Lima"
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
            {isSubmitting ? 'Generando PDF…' : 'Generar cotización PDF'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
