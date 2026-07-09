import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Palette, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompanySettings, useCompanySettingsMutation } from '@/hooks/use-company-settings';
import { optimizeImageFile } from '@/lib/optimize-image-for-web';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';

export function AppearancePanel() {
  const { data, isLoading, isError } = useCompanySettings();
  const saveSettings = useCompanySettingsMutation();
  const [form, setForm] = useState<Pick<CompanySettings, 'logoUrl' | 'primaryColor' | 'tagline'>>({
    logoUrl: DEFAULT_COMPANY_SETTINGS.logoUrl,
    primaryColor: DEFAULT_COMPANY_SETTINGS.primaryColor,
    tagline: DEFAULT_COMPANY_SETTINGS.tagline,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        tagline: data.tagline,
      });
    }
  }, [data]);

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const logoUrl = await optimizeImageFile(file, 'logo');
      setForm((prev) => ({ ...prev, logoUrl }));
    } catch {
      setError('No se pudo optimizar el logo.');
    }
    event.target.value = '';
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const base = data ?? DEFAULT_COMPANY_SETTINGS;
      await saveSettings.mutateAsync({ ...base, ...form });
      setMessage('Apariencia guardada correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la apariencia.');
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Cargando apariencia…</p>;
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="max-w-xl space-y-3">
      {isError && (
        <p role="alert" className="text-sm text-amber-700">
          No se pudo cargar la configuración del servidor. Se muestran valores por defecto.
        </p>
      )}

      <section className="rounded-lg border bg-card p-3">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="size-5 text-[hsl(var(--admin-accent))]" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Marca y colores</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appearance-tagline">Eslogan</Label>
            <Input
              id="appearance-tagline"
              value={form.tagline}
              onChange={(event) => setForm((prev) => ({ ...prev, tagline: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appearance-logo">Logo (URL o archivo)</Label>
            <Input
              id="appearance-logo"
              value={form.logoUrl.startsWith('data:') ? '' : form.logoUrl}
              placeholder="/logo.png"
              onChange={(event) => setForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
            />
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoUpload}
              className="cursor-pointer"
            />
            {form.logoUrl && (
              <img
                src={form.logoUrl}
                alt="Vista previa del logo"
                className="mt-2 h-14 w-auto rounded border bg-white object-contain p-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="appearance-primary">Color principal</Label>
            <div className="flex gap-2">
              <Input
                id="appearance-primary"
                type="color"
                value={form.primaryColor}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, primaryColor: event.target.value }))
                }
                className="h-10 w-16 cursor-pointer p-1"
              />
              <Input
                value={form.primaryColor}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, primaryColor: event.target.value }))
                }
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
        </div>
      </section>

      {message && (
        <p role="status" className="text-sm text-green-700">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={saveSettings.isPending} className="gap-2">
        <Save className="size-4" aria-hidden="true" />
        {saveSettings.isPending ? 'Guardando…' : 'Guardar apariencia'}
      </Button>
    </form>
  );
}
