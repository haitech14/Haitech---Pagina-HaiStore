import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileDown } from 'lucide-react';

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
import { useAuth } from '@/context/auth-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { buildProformaPayloadFromProductQuote } from '@/lib/build-proforma-payload';
import { buildProductQuotePdf } from '@/lib/generate-product-quote-pdf';
import { usdToPen } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { Product } from '@/types/product';

const quoteSchema = z.object({
  razonSocial: z.string().min(2, 'Indique la razón social.'),
  ruc: z
    .string()
    .min(8, 'El RUC debe tener al menos 8 caracteres.')
    .max(11, 'El RUC no puede superar 11 caracteres.'),
  atencion: z.string().min(2, 'Indique a quién va dirigida la atención.'),
  celular: z.string().min(9, 'Introduce un celular válido.'),
  ciudad: z.string().min(2, 'Indique la ciudad.'),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

interface ProductQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  displayTitle: string;
  sku: string;
  brandLabel: string;
  onGenerated: (preview: QuotePdfPreview) => void;
}

export function ProductQuoteDialog({
  open,
  onOpenChange,
  product,
  displayTitle,
  sku,
  brandLabel,
  onGenerated,
}: ProductQuoteDialogProps) {
  const { isAdmin } = useAuth();
  const { data: companySettings } = useCompanySettings();
  const { createProforma } = useProformaMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      razonSocial: '',
      ruc: '',
      atencion: '',
      celular: '',
      ciudad: '',
    },
  });

  const onSubmit = async (values: QuoteFormValues) => {
    setSubmitError(null);

    try {
      const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
      const generated = await buildProductQuotePdf(values, {
        name: displayTitle,
        sku,
        brand: brandLabel,
        pricePen: usdToPen(product.price),
        quantity: 1,
        imageUrl: product.image_url,
      }, company);

      const url = URL.createObjectURL(generated.blob);
      onGenerated({
        url,
        filename: generated.filename,
        blob: generated.blob,
        quoteNumber: generated.quoteNumber,
      });

      if (isAdmin) {
        try {
          await createProforma.mutateAsync(
            buildProformaPayloadFromProductQuote(
              generated.quoteNumber,
              values,
              {
                id: product.id,
                name: displayTitle,
                sku,
                brand: brandLabel,
                pricePen: usdToPen(product.price),
                imageUrl: product.image_url,
              },
              company.quoteValidityDays,
            ),
          );
        } catch {
          setSubmitError(
            'PDF generado, pero no se pudo registrar la proforma en el panel de ventas.',
          );
          return;
        }
      }

      reset();
      onOpenChange(false);
    } catch {
      setSubmitError('No se pudo generar la cotización. Inténtelo nuevamente.');
    }
  };

  const fields: { id: keyof QuoteFormValues; label: string; type?: string; autoComplete?: string }[] =
    [
      { id: 'razonSocial', label: 'Razón Social', autoComplete: 'organization' },
      { id: 'ruc', label: 'RUC', autoComplete: 'off' },
      { id: 'atencion', label: 'Atención', autoComplete: 'name' },
      { id: 'celular', label: 'Celular', type: 'tel', autoComplete: 'tel' },
      { id: 'ciudad', label: 'Ciudad', autoComplete: 'address-level2' },
    ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Descargar cotización</DialogTitle>
          <DialogDescription>
            Complete los datos del cliente para generar el PDF de cotización del producto.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => void handleSubmit(onSubmit)(event)}
          className="flex flex-col gap-4"
          noValidate
        >
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                type={field.type ?? 'text'}
                autoComplete={field.autoComplete}
                aria-invalid={!!errors[field.id]}
                aria-describedby={errors[field.id] ? `${field.id}-error` : undefined}
                {...register(field.id)}
              />
              {errors[field.id] && (
                <p id={`${field.id}-error`} role="alert" className="text-xs text-red-600">
                  {errors[field.id]?.message}
                </p>
              )}
            </div>
          ))}

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
