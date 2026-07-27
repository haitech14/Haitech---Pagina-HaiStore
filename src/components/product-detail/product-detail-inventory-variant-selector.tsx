import { Link } from 'react-router-dom';

import {
  findVariantOption,
  uniqueVariantLabels,
  uniqueVoltageLabels,
  type ProductInventoryVariantOption,
} from '@/lib/product-inventory-variants';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductDetailInventoryVariantSelectorProps {
  product: Product;
  options: ProductInventoryVariantOption[];
  className?: string;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductDetailInventoryVariantSelector({
  product,
  options,
  className,
}: ProductDetailInventoryVariantSelectorProps) {
  if (options.length <= 1) return null;

  const current = options.find((option) => option.id === product.id) ?? options[0];
  const variantLabels = uniqueVariantLabels(options);
  const voltageLabels = uniqueVoltageLabels(options);
  const showVariantAxis = variantLabels.length > 1;
  const showVoltageAxis = voltageLabels.length > 1;

  const renderOptionButton = (option: ProductInventoryVariantOption) => {
    const isActive = option.id === product.id;
    const disabled = option.stock <= 0 && !isActive;
    const label = showVariantAxis && showVoltageAxis
      ? `${option.variantLabel} · ${option.voltage}`
      : showVoltageAxis
        ? option.voltage
        : option.variantLabel;

    return (
      <Link
        key={option.id}
        to={productPath({ id: option.id, slug: option.slug ?? null, name: option.name })}
        replace
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex min-h-11 flex-col justify-center rounded-lg border px-3 py-2 text-left transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
          isActive
            ? 'border-red-600 bg-red-50/80'
            : disabled
              ? 'pointer-events-none border-border/70 bg-muted/20 opacity-60'
              : 'border-border bg-background hover:border-red-300 hover:bg-muted/30',
        )}
      >
        <span className="text-[0.8125rem] font-semibold leading-snug text-foreground">{label}</span>
        <span className="mt-0.5 text-[0.6875rem] leading-snug text-muted-foreground">
          {formatUsd(option.priceUsd)}
          {option.stock > 0 ? ` · Stock ${option.stock}` : ' · Sin stock'}
        </span>
      </Link>
    );
  };

  if (showVariantAxis && showVoltageAxis) {
    return (
      <fieldset className={cn('space-y-4', className)}>
        <legend className="text-sm font-semibold text-[#0f1f3d]">Variantes del equipo</legend>
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground">Tipo de preparado</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {variantLabels.map((variantLabel) => {
              const option =
                findVariantOption(options, variantLabel, current.voltage) ??
                options.find((row) => row.variantLabel === variantLabel);
              if (!option) return null;
              return renderOptionButton(option);
            })}
          </div>
        </div>
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground">Voltaje (110V = 120V)</p>
          <div className="grid grid-cols-2 gap-2">
            {voltageLabels.map((voltage) => {
              const option =
                findVariantOption(options, current.variantLabel, voltage) ??
                options.find((row) => row.voltage === voltage);
              if (!option) return null;
              return renderOptionButton(option);
            })}
          </div>
        </div>
      </fieldset>
    );
  }

  return (
    <fieldset className={cn('space-y-2.5', className)}>
      <legend className="text-sm font-semibold text-[#0f1f3d]">Variantes del equipo</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => renderOptionButton(option))}
      </div>
    </fieldset>
  );
}
