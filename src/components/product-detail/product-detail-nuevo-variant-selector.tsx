import {
  NUEVO_EQUIPMENT_VARIANT_IDS,
  NUEVO_EQUIPMENT_VARIANT_LABELS,
  resolveNuevoMesaBundleSurchargeUsd,
  type NuevoEquipmentVariantId,
} from '@/lib/nuevo-equipment-variants';
import { cn } from '@/lib/utils';
import type { EquipmentConfigStep, ProductComboItem } from '@/types/product-detail';

interface ProductDetailNuevoVariantSelectorProps {
  value: NuevoEquipmentVariantId;
  onChange: (value: NuevoEquipmentVariantId) => void;
  equipmentSteps: EquipmentConfigStep[];
  comboItems?: ProductComboItem[];
  className?: string;
}

function resolveVariantHint(
  option: NuevoEquipmentVariantId,
  equipmentSteps: EquipmentConfigStep[],
  comboItems?: ProductComboItem[],
): string {
  if (option === 'solo-equipo') {
    return 'Equipo sin accesorios extra';
  }
  const surchargeUsd = resolveNuevoMesaBundleSurchargeUsd(equipmentSteps, comboItems);
  if (surchargeUsd > 0) {
    return `2 caseteras y 1 mueble · +USD ${surchargeUsd.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
  return 'Incluye 2 caseteras y 1 mueble';
}

export function ProductDetailNuevoVariantSelector({
  value,
  onChange,
  equipmentSteps,
  comboItems = [],
  className,
}: ProductDetailNuevoVariantSelectorProps) {
  return (
    <fieldset className={cn('space-y-2.5', className)}>
      <legend className="text-sm font-semibold text-[#0f1f3d]">Variantes:</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {NUEVO_EQUIPMENT_VARIANT_IDS.map((option) => {
          const id = `nuevo-equipment-variant-${option}`;
          const isActive = value === option;
          return (
            <label
              key={option}
              htmlFor={id}
              className={cn(
                'flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                'focus-within:ring-2 focus-within:ring-red-600 focus-within:ring-offset-2',
                isActive
                  ? 'border-red-600 bg-red-50/80'
                  : 'border-border bg-background hover:border-red-300 hover:bg-muted/30',
              )}
            >
              <input
                id={id}
                type="radio"
                name="nuevo-equipment-variant"
                value={option}
                checked={isActive}
                onChange={() => onChange(option)}
                className="mt-1 size-4 shrink-0 accent-red-600"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.8125rem] font-semibold leading-snug text-foreground">
                  {NUEVO_EQUIPMENT_VARIANT_LABELS[option]}
                </span>
                <span className="mt-0.5 block text-[0.6875rem] leading-snug text-muted-foreground">
                  {resolveVariantHint(option, equipmentSteps, comboItems)}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
