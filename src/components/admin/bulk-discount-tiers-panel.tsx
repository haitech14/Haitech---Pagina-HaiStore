import { useEffect, useState } from 'react';
import { Percent, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompanySettings, useCompanySettingsMutation } from '@/hooks/use-company-settings';
import {
  formatBulkDiscountLabel,
  normalizeBulkDiscountTiers,
} from '@/lib/bulk-discount-tiers';
import type { BulkDiscountTier } from '@/types/product-detail';
import type { CompanySettings } from '@/types/company-settings';

function createEmptyTier(): BulkDiscountTier {
  return {
    range: '',
    discountPercent: 5,
    discount: formatBulkDiscountLabel(5),
  };
}

export function BulkDiscountTiersPanel() {
  const { data: settings, isLoading } = useCompanySettings();
  const saveSettings = useCompanySettingsMutation();
  const [tiers, setTiers] = useState<BulkDiscountTier[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (settings) {
      setTiers(settings.bulkDiscountTiers);
      setDirty(false);
    }
  }, [settings]);

  const updateTier = (index: number, patch: Partial<BulkDiscountTier>) => {
    setTiers((current) =>
      current.map((tier, tierIndex) => {
        if (tierIndex !== index) return tier;

        const nextPercent =
          patch.discountPercent !== undefined
            ? Math.min(100, Math.max(1, Number(patch.discountPercent) || 1))
            : tier.discountPercent;
        const nextRange = patch.range !== undefined ? patch.range : tier.range;

        return {
          range: nextRange,
          discountPercent: nextPercent,
          discount: formatBulkDiscountLabel(nextPercent),
        };
      }),
    );
    setDirty(true);
  };

  const addTier = () => {
    setTiers((current) => [...current, createEmptyTier()]);
    setDirty(true);
  };

  const removeTier = (index: number) => {
    setTiers((current) => current.filter((_, tierIndex) => tierIndex !== index));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!settings) return;

    const normalized = normalizeBulkDiscountTiers(tiers);
    if (normalized.length === 0) {
      toast.error('Agrega al menos un tramo válido con cantidad y descuento.');
      return;
    }

    const payload: CompanySettings = {
      ...settings,
      bulkDiscountTiers: normalized,
    };

    try {
      await saveSettings.mutateAsync(payload);
      setTiers(normalized);
      setDirty(false);
      toast.success('Descuentos por volumen guardados.');
    } catch {
      toast.error('No se pudieron guardar los descuentos.');
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando descuentos…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Percent className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
        <div>
          <h3 className="text-base font-semibold">Descuentos por volumen</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Define los tramos que se muestran en la ficha de producto (tabla desplegable sobre el
            precio). Usa cantidades mínimas como <strong>2</strong>, <strong>3</strong>,{' '}
            <strong>5</strong> o <strong>10+</strong>. El precio por unidad se calcula según el
            precio público y nunca baja del precio técnico del producto.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Cantidad</th>
              <th className="px-4 py-3 text-left font-medium">Descuento (%)</th>
              <th className="px-4 py-3 text-left font-medium">Etiqueta</th>
              <th className="px-4 py-3 text-right font-medium">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => (
              <tr key={`${tier.range}-${index}`} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <Label htmlFor={`bulk-range-${index}`} className="sr-only">
                    Rango de cantidad
                  </Label>
                  <Input
                    id={`bulk-range-${index}`}
                    value={tier.range}
                    placeholder="Ej. 2 o 10+"
                    className="min-w-[7rem]"
                    onChange={(event) => updateTier(index, { range: event.target.value })}
                  />
                </td>
                <td className="px-4 py-3">
                  <Label htmlFor={`bulk-percent-${index}`} className="sr-only">
                    Porcentaje de descuento
                  </Label>
                  <Input
                    id={`bulk-percent-${index}`}
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    className="w-24"
                    value={tier.discountPercent}
                    onChange={(event) =>
                      updateTier(index, { discountPercent: Number(event.target.value) })
                    }
                  />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{tier.discount}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Eliminar tramo ${tier.range || index + 1}`}
                    disabled={tiers.length <= 1}
                    onClick={() => removeTier(index)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addTier}>
          <Plus className="size-4" aria-hidden="true" />
          Agregar tramo
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={!dirty || saveSettings.isPending}
          onClick={() => void handleSave()}
        >
          <Save className="size-4" aria-hidden="true" />
          {saveSettings.isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
}
