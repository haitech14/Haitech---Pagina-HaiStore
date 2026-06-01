import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Building2, Coins, Link2, Palette, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompanySettings, useCompanySettingsMutation } from '@/hooks/use-company-settings';
import type { AdminSettingsSectionId } from '@/lib/admin-routes';
import { normalizeUsdToPenRate } from '@/lib/exchange-rate';
import { optimizeImageFile } from '@/lib/optimize-image-for-web';
import { formatPenFromUsdPrecise, formatUsd } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';

interface SettingsPanelProps {
  section: AdminSettingsSectionId;
}

export function SettingsPanel({ section }: SettingsPanelProps) {
  const { data, isLoading, isError } = useCompanySettings();
  const saveSettings = useCompanySettingsMutation();
  const [form, setForm] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  useEffect(() => {
    setMessage(null);
    setError(null);
  }, [section]);

  const updateField = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      updateField('logoUrl', await optimizeImageFile(file, 'logo'));
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
      await saveSettings.mutateAsync({
        ...form,
        usdToPenExchangeRate: normalizeUsdToPenRate(form.usdToPenExchangeRate),
        usdToPenPurchaseExchangeRate: normalizeUsdToPenRate(
          form.usdToPenPurchaseExchangeRate ?? form.usdToPenExchangeRate,
        ),
      });
      setMessage('Configuración guardada correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la configuración.');
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Cargando configuración…</p>;
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-6">
      {isError && (
        <p role="alert" className="text-sm text-amber-700">
          No se pudo cargar la configuración del servidor. Se muestran valores por defecto.
        </p>
      )}

      {section === 'general' && (
        <>
          <section className="max-w-3xl rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="size-4 shrink-0 text-red-600" aria-hidden="true" />
              <h3 className="text-base font-semibold">Datos de la empresa</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Nombre comercial</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(event) => updateField('companyName', event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-1 lg:col-span-3">
                <Label htmlFor="legalName">Razón social</Label>
                <Input
                  id="legalName"
                  value={form.legalName}
                  onChange={(event) => updateField('legalName', event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
                <Label htmlFor="businessDescription">Descripción del negocio</Label>
                <textarea
                  id="businessDescription"
                  value={form.businessDescription}
                  onChange={(event) => updateField('businessDescription', event.target.value)}
                  rows={2}
                  className="flex min-h-[3.25rem] w-full resize-y rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ruc">RUC</Label>
                <Input
                  id="ruc"
                  value={form.ruc}
                  onChange={(event) => updateField('ruc', event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Sitio web</Label>
                <Input
                  id="website"
                  value={form.website}
                  onChange={(event) => updateField('website', event.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(event) => updateField('address', event.target.value)}
                />
              </div>
              <div className="space-y-1.5 lg:col-span-1">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="max-w-3xl rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <Coins className="size-4 shrink-0 text-red-600" aria-hidden="true" />
              <h3 className="text-base font-semibold">Precios y tipo de cambio</h3>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Tipo de cambio para convertir precios en dólares a soles en la tienda, inventario, TPV
              y cotizaciones.
            </p>
            <div className="grid gap-4 sm:max-w-md sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="usdToPenExchangeRate">Venta (USD → PEN)</Label>
                <Input
                  id="usdToPenExchangeRate"
                  type="number"
                  min={0.01}
                  step={0.01}
                  inputMode="decimal"
                  value={form.usdToPenExchangeRate}
                  onChange={(event) =>
                    updateField('usdToPenExchangeRate', Number(event.target.value) || 3.7)
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Tienda y precios al cliente: {formatUsd(100)} ={' '}
                  {formatPenFromUsdPrecise(100, form.usdToPenExchangeRate)}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usdToPenPurchaseExchangeRate">Compra (USD → PEN)</Label>
                <Input
                  id="usdToPenPurchaseExchangeRate"
                  type="number"
                  min={0.01}
                  step={0.01}
                  inputMode="decimal"
                  value={form.usdToPenPurchaseExchangeRate}
                  onChange={(event) =>
                    updateField(
                      'usdToPenPurchaseExchangeRate',
                      Number(event.target.value) || form.usdToPenExchangeRate,
                    )
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Costos e inventario: {formatUsd(100)} ={' '}
                  {formatPenFromUsdPrecise(
                    100,
                    form.usdToPenPurchaseExchangeRate,
                  )}
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {section === 'pdf' && (
        <section className="rounded-xl border p-5">
          <h3 className="mb-4 text-lg font-semibold">Proforma / Cotización PDF</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Numeración, textos legales y cuentas que aparecen en cotizaciones y documentos del TPV.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quoteDocumentLabel">Etiqueta del documento</Label>
              <Input
                id="quoteDocumentLabel"
                value={form.quoteDocumentLabel}
                onChange={(event) => updateField('quoteDocumentLabel', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteNumberPrefix">Prefijo de cotización</Label>
              <Input
                id="quoteNumberPrefix"
                value={form.quoteNumberPrefix}
                onChange={(event) => updateField('quoteNumberPrefix', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteNextNumber">Próximo número</Label>
              <Input
                id="quoteNextNumber"
                type="number"
                min={1}
                value={form.quoteNextNumber}
                onChange={(event) =>
                  updateField('quoteNextNumber', Number(event.target.value) || 1)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currencyLabel">Moneda</Label>
              <Input
                id="currencyLabel"
                value={form.currencyLabel}
                onChange={(event) => updateField('currencyLabel', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultClientType">Tipo de cliente por defecto</Label>
              <Input
                id="defaultClientType"
                value={form.defaultClientType}
                onChange={(event) => updateField('defaultClientType', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteValidityDays">Validez (días)</Label>
              <Input
                id="quoteValidityDays"
                type="number"
                min={1}
                value={form.quoteValidityDays}
                onChange={(event) =>
                  updateField('quoteValidityDays', Number(event.target.value) || 3)
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bankAccountsText">Cuentas bancarias (una por línea)</Label>
              <textarea
                id="bankAccountsText"
                value={form.bankAccountsText}
                onChange={(event) => updateField('bankAccountsText', event.target.value)}
                rows={4}
                className="flex min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="quoteTermsText">Términos y condiciones (una por línea)</Label>
              <textarea
                id="quoteTermsText"
                value={form.quoteTermsText}
                onChange={(event) => updateField('quoteTermsText', event.target.value)}
                rows={4}
                className="flex min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="quoteFooterText">Mensaje legal del pie</Label>
              <Input
                id="quoteFooterText"
                value={form.quoteFooterText}
                onChange={(event) => updateField('quoteFooterText', event.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      {section === 'apariencia' && (
        <section className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Palette className="size-5 text-[hsl(var(--admin-accent))]" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Marca y colores</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Logo y color principal usados en la tienda y documentos PDF.
          </p>

          <div className="grid max-w-xl gap-4">
            <div className="space-y-2">
              <Label htmlFor="tagline">Eslogan</Label>
              <Input
                id="tagline"
                value={form.tagline}
                onChange={(event) => updateField('tagline', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo (URL o archivo)</Label>
              <Input
                id="logoUrl"
                value={form.logoUrl.startsWith('data:') ? '' : form.logoUrl}
                placeholder="/logo.png"
                onChange={(event) => updateField('logoUrl', event.target.value)}
              />
              <Input
                id="logoFile"
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
              <Label htmlFor="primaryColor">Color principal</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={form.primaryColor}
                  onChange={(event) => updateField('primaryColor', event.target.value)}
                  className="h-10 w-16 cursor-pointer p-1"
                />
                <Input
                  value={form.primaryColor}
                  onChange={(event) => updateField('primaryColor', event.target.value)}
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {section === 'integraciones' && (
        <section className="rounded-xl border p-5">
          <div className="mb-4 flex items-center gap-2">
            <Link2 className="size-5 text-[hsl(var(--admin-accent))]" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Integraciones y enlaces</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Servicios externos conectados a HaiStore. El QR de soporte se imprime en cotizaciones
            PDF.
          </p>

          <div className="grid max-w-xl gap-4">
            <div className="space-y-2">
              <Label htmlFor="supportUrl">URL de soporte (QR en PDF)</Label>
              <Input
                id="supportUrl"
                type="url"
                value={form.supportUrl}
                onChange={(event) => updateField('supportUrl', event.target.value)}
              />
            </div>
            <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Supabase y API admin</p>
              <p className="mt-1">
                La conexión a base de datos y el servidor admin se configuran con variables de
                entorno (<code className="text-xs">SUPABASE_URL</code>,{' '}
                <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code>) en el despliegue.
              </p>
            </div>
            <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">WooCommerce / tienda externa</p>
              <p className="mt-1">
                Sincroniza el inventario desde el módulo Inventario con «Sincronizar con tienda» cuando
                el catálogo maestro esté listo.
              </p>
            </div>
          </div>
        </section>
      )}

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

      <div className="flex justify-end border-t pt-4">
        <Button
          type="submit"
          disabled={saveSettings.isPending}
          className="gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600"
        >
          <Save className="size-4" aria-hidden="true" />
          {saveSettings.isPending ? 'Guardando…' : 'Guardar configuración'}
        </Button>
      </div>
    </form>
  );
}
