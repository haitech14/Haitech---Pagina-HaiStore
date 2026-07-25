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
import { useQuoteProfile } from '@/hooks/use-quote-profile';
import {
  EMPTY_PRODUCT_QUOTE_FORM,
  generateProductQuoteFromForm,
  isCompleteProductQuoteForm,
  type ProductQuoteContext,
  type ProductQuoteFormValues,
} from '@/lib/generate-product-quote-from-contact';
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

const EMPTY_FORM = EMPTY_PRODUCT_QUOTE_FORM;

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
  const { profile, saveQuoteProfile, isSaving: isSavingProfile } = useQuoteProfile();
  const [form, setForm] = useState<ProductQuoteFormValues>(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paidOptionsCount =
    equipmentConfiguration?.options.filter((option) => option.pricePen > 0).length ?? 0;

  useEffect(() => {
    if (!open) return;
    setForm(profile);
    setSubmitError(null);
    void import('@/lib/generate-product-quote-pdf').then(({ preloadQuotePdfAssets }) =>
      preloadQuotePdfAssets([product.image_url]),
    );
  }, [open, profile, product.image_url]);

  const updateField = <K extends keyof ProductQuoteFormValues>(key: K, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (!isCompleteProductQuoteForm(form)) {
      setSubmitError('Completa RUC, razón social, nombre, celular, dirección y ciudad.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveQuoteProfile(form);

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

      const preview = await generateProductQuoteFromForm(
        form,
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
            <Label htmlFor="quote-ruc">RUC</Label>
            <Input
              id="quote-ruc"
              value={form.ruc}
              onChange={(event) => updateField('ruc', event.target.value)}
              autoComplete="off"
              inputMode="numeric"
              placeholder="Ej. 20123456789"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-razon-social">Razón Social</Label>
            <Input
              id="quote-razon-social"
              value={form.razonSocial}
              onChange={(event) => updateField('razonSocial', event.target.value)}
              autoComplete="organization"
              placeholder="Ej. Mi Empresa SAC"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-atencion">Nombre (Atención)</Label>
            <Input
              id="quote-atencion"
              value={form.atencion}
              onChange={(event) => updateField('atencion', event.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-direccion">Dirección</Label>
            <Input
              id="quote-direccion"
              value={form.direccion}
              onChange={(event) => updateField('direccion', event.target.value)}
              autoComplete="street-address"
              placeholder="Ej. Av. Petit Thouars 123"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-ciudad">Ciudad</Label>
            <Input
              id="quote-ciudad"
              value={form.ciudad}
              onChange={(event) => updateField('ciudad', event.target.value)}
              autoComplete="address-level2"
              placeholder="Ej. Lima"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-celular">Celular</Label>
            <Input
              id="quote-celular"
              value={form.celular}
              onChange={(event) => updateField('celular', event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              placeholder="Ej. 999 888 777"
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
            disabled={isSubmitting || isSavingProfile}
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
