import { useEffect, useState } from 'react';
import { FileDown, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

import { SunatRucField } from '@/components/forms/sunat-ruc-field';
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
import {
  formatSolutionPen,
  formatSolutionTermLabel,
  type SolutionConfiguratorState,
  type SolutionQuoteBreakdown,
} from '@/data/rental-solution-configurator';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useQuoteProfile } from '@/hooks/use-quote-profile';
import { useApplySunatRuc } from '@/hooks/use-sunat-ruc-lookup';
import { buildProformaPayloadFromProductQuote } from '@/lib/build-proforma-payload';
import {
  EMPTY_PRODUCT_QUOTE_FORM,
  isCompleteProductQuoteForm,
  quoteFormToQuoteClient,
  whatsAppContactFromProductQuoteForm,
  type ProductQuoteFormValues,
} from '@/lib/generate-product-quote-from-contact';
import { preloadQuotePdfAssets } from '@/lib/generate-product-quote-pdf';
import {
  buildSolutionQuoteWhatsAppMessage,
  buildSolutionRentalQuoteLines,
  buildSolutionRentalQuotePdf,
  solutionQuoteProductFromState,
} from '@/lib/generate-solution-rental-quote-pdf';
import { submitWebLead } from '@/lib/submit-web-lead';
import { applySunatToQuoteForm } from '@/lib/sunat-ruc';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';

interface SolutionQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: SolutionConfiguratorState;
  quote: SolutionQuoteBreakdown;
  onGenerated: (preview: QuotePdfPreview) => void;
}

export function SolutionQuoteDialog({
  open,
  onOpenChange,
  state,
  quote,
  onGenerated,
}: SolutionQuoteDialogProps) {
  const { data: companySettings } = useCompanySettings();
  const { registerProductQuote } = useProformaMutations();
  const { profile, saveQuoteProfile, isSaving: isSavingProfile } = useQuoteProfile();
  const [form, setForm] = useState<ProductQuoteFormValues>(EMPTY_PRODUCT_QUOTE_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = solutionQuoteProductFromState(state);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...EMPTY_PRODUCT_QUOTE_FORM,
      ...profile,
      ciudad:
        profile.ciudad?.trim() ||
        [state.city.trim() || 'Lima', state.district.trim()].filter(Boolean).join(', '),
    });
    setSubmitError(null);
    void preloadQuotePdfAssets(product.imageUrl ? [product.imageUrl] : []);
  }, [open, profile, product.imageUrl, state.city, state.district]);

  const sunat = useApplySunatRuc(form.ruc, (data) => {
    setForm((current) => applySunatToQuoteForm(current, data));
  });

  const updateField = <K extends keyof ProductQuoteFormValues>(key: K, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const generateQuote = async (): Promise<QuotePdfPreview | null> => {
    if (!isCompleteProductQuoteForm(form)) {
      setSubmitError('Completa RUC, razón social, nombre, celular, dirección y ciudad.');
      return null;
    }

    try {
      await saveQuoteProfile(form);
    } catch (saveError) {
      console.warn('[SolutionQuoteDialog] Perfil no sincronizado; se genera el PDF igual', saveError);
    }

    const client = quoteFormToQuoteClient(form);
    const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
    const generated = await buildSolutionRentalQuotePdf(client, state, quote, product, company);
    const url = URL.createObjectURL(generated.blob);
    const preview: QuotePdfPreview = {
      url,
      filename: generated.filename,
      blob: generated.blob,
      quoteNumber: generated.quoteNumber,
    };

    const quoteLines = buildSolutionRentalQuoteLines(state, quote, product);

    void registerProductQuote
      .mutateAsync({
        ...buildProformaPayloadFromProductQuote(
          generated.quoteNumber,
          client,
          quoteLines.map((line, index) => ({
            id: index === 0 ? `rental-${product.sku}` : `rental-${product.sku}::${line.sku}`,
            name: line.name,
            sku: line.sku,
            brand: line.brand,
            pricePen: line.pricePen,
            quantity: line.quantity ?? 1,
            imageUrl: line.imageUrl ?? null,
          })),
          company.quoteValidityDays,
        ),
        notes: `Cotización alquiler landing · ${conditionAndPlanNote(state, quote)}`,
      })
      .catch(() => {
        toast.warning('PDF generado, pero no se pudo registrar la cotización en el panel.');
      });

    const waContact = whatsAppContactFromProductQuoteForm(form);
    void submitWebLead({
      contact: {
        name: waContact.name,
        companyOrRuc: waContact.companyOrRuc,
        city: form.ciudad.trim(),
        phone: form.celular.trim(),
        direccion: form.direccion.trim(),
      },
      channel: 'quote-pdf',
      message: `Proforma alquiler ${generated.quoteNumber} · ${formatSolutionPen(quote.totalMonthly)}/mes`,
      productName: product.name,
      productId: product.sku,
      createProforma: false,
    });

    return preview;
  };

  const onSubmitPdf = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const preview = await generateQuote();
      if (!preview) return;
      onGenerated(preview);
      onOpenChange(false);
    } catch (error) {
      console.error('[SolutionQuoteDialog] PDF generation failed', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No se pudo generar la proforma. Inténtelo nuevamente.',
      );
      toast.error('No se pudo generar la proforma.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onWhatsApp = async () => {
    setSubmitError(null);
    if (!isCompleteProductQuoteForm(form)) {
      setSubmitError('Completa RUC, razón social, nombre, celular, dirección y ciudad.');
      return;
    }
    setIsSubmitting(true);
    try {
      const preview = await generateQuote();
      const client = quoteFormToQuoteClient(form);
      const message = buildSolutionQuoteWhatsAppMessage({
        client,
        state,
        quote,
        ...(preview?.quoteNumber ? { quoteNumber: preview.quoteNumber } : {}),
      });
      if (preview) onGenerated(preview);
      onOpenChange(false);
      window.open(buildHaitechWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('[SolutionQuoteDialog] WhatsApp + PDF failed', error);
      setSubmitError('No se pudo generar la proforma. Inténtelo nuevamente.');
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
            Completa tus datos para generar la proforma PDF. Cuota estimada:{' '}
            <strong>{formatSolutionPen(quote.totalMonthly)} / mes</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void onSubmitPdf(event)} className="grid gap-4" noValidate>
          <SunatRucField
            id="solution-quote-ruc"
            className="space-y-2"
            value={form.ruc}
            onValueChange={(ruc) => updateField('ruc', ruc)}
            isFetching={sunat.isFetching}
            isSuccess={sunat.isSuccess}
            errorMessage={sunat.error instanceof Error ? sunat.error.message : null}
            required
          />
          <div className="space-y-2">
            <Label htmlFor="solution-quote-razon-social">Razón Social</Label>
            <Input
              id="solution-quote-razon-social"
              value={form.razonSocial}
              onChange={(event) => updateField('razonSocial', event.target.value)}
              autoComplete="organization"
              placeholder="Ej. Mi Empresa SAC"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solution-quote-atencion">Nombre (Atención)</Label>
            <Input
              id="solution-quote-atencion"
              value={form.atencion}
              onChange={(event) => updateField('atencion', event.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solution-quote-direccion">Dirección</Label>
            <Input
              id="solution-quote-direccion"
              value={form.direccion}
              onChange={(event) => updateField('direccion', event.target.value)}
              autoComplete="street-address"
              placeholder="Ej. Av. Petit Thouars 123"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solution-quote-ciudad">Ciudad</Label>
            <Input
              id="solution-quote-ciudad"
              value={form.ciudad}
              onChange={(event) => updateField('ciudad', event.target.value)}
              autoComplete="address-level2"
              placeholder="Ej. Lima"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solution-quote-celular">Celular</Label>
            <Input
              id="solution-quote-celular"
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

          <div className="grid gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || isSavingProfile}
              className="gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600"
            >
              <FileDown className="size-4" aria-hidden="true" />
              {isSubmitting ? 'Generando PDF…' : 'Generar proforma PDF'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || isSavingProfile}
              className="gap-2"
              onClick={() => void onWhatsApp()}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Generar PDF y enviar por WhatsApp
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function conditionAndPlanNote(
  state: SolutionConfiguratorState,
  quote: SolutionQuoteBreakdown,
): string {
  return `${state.condition} · ${formatSolutionTermLabel(state.termMonths)} · ${state.quantity} equipo(s) · ${formatSolutionPen(quote.totalMonthly)}/mes`;
}
