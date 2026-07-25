import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  EMPTY_PRODUCT_QUOTE_FORM,
  isCompleteProductQuoteForm,
  type ProductQuoteFormValues,
} from '@/lib/generate-product-quote-from-contact';
import { useQuoteProfile } from '@/hooks/use-quote-profile';

export function AccountQuoteProfilePanel() {
  const { profile, isLoading, saveQuoteProfile, isSaving } = useQuoteProfile();
  const [form, setForm] = useState<ProductQuoteFormValues>(EMPTY_PRODUCT_QUOTE_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const updateField = <K extends keyof ProductQuoteFormValues>(key: K, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isCompleteProductQuoteForm(form)) {
      setError('Completa RUC, razón social, nombre, celular, dirección y ciudad.');
      return;
    }

    try {
      await saveQuoteProfile(form);
      toast.success('Datos de cotización guardados en tu perfil.');
    } catch {
      setError('No se pudieron guardar los datos. Inténtalo nuevamente.');
      toast.error('No se pudieron guardar los datos.');
    }
  };

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <Loader2 className="size-4 animate-spin text-red-600" aria-hidden="true" />
        Cargando datos de cotización…
      </p>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4" noValidate>
      <p className="text-sm text-muted-foreground">
        Estos datos se usarán automáticamente al generar cotizaciones PDF.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2 sm:max-w-xs">
          <Label htmlFor="profile-ruc">RUC</Label>
          <Input
            id="profile-ruc"
            value={form.ruc}
            onChange={(event) => updateField('ruc', event.target.value)}
            inputMode="numeric"
            autoComplete="off"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="profile-razon-social">Razón Social</Label>
          <Input
            id="profile-razon-social"
            value={form.razonSocial}
            onChange={(event) => updateField('razonSocial', event.target.value)}
            autoComplete="organization"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-atencion">Nombre (Atención)</Label>
          <Input
            id="profile-atencion"
            value={form.atencion}
            onChange={(event) => updateField('atencion', event.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-celular">Celular</Label>
          <Input
            id="profile-celular"
            value={form.celular}
            onChange={(event) => updateField('celular', event.target.value)}
            autoComplete="tel"
            inputMode="tel"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="profile-direccion">Dirección</Label>
          <Input
            id="profile-direccion"
            value={form.direccion}
            onChange={(event) => updateField('direccion', event.target.value)}
            autoComplete="street-address"
            required
          />
        </div>
        <div className="space-y-2 sm:max-w-xs">
          <Label htmlFor="profile-ciudad">Ciudad</Label>
          <Input
            id="profile-ciudad"
            value={form.ciudad}
            onChange={(event) => updateField('ciudad', event.target.value)}
            autoComplete="address-level2"
            required
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSaving}
        className="w-fit gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600"
      >
        {isSaving ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="size-4" aria-hidden="true" />
        )}
        {isSaving ? 'Guardando…' : 'Guardar datos de cotización'}
      </Button>
    </form>
  );
}
