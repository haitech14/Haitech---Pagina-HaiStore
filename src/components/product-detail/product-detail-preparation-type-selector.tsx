import { DualPrice } from '@/components/product/product-dual-price';
import { useAuth } from '@/context/auth-context';
import {
  SEMINUEVA_PREPARATION_LABELS,
  SEMINUEVA_PREPARATION_OPTIONS,
  resolvePreparationPriceRoleForViewer,
  resolvePreparationRolePriceUsd,
  type SeminuevaPreparationType,
} from '@/lib/seminueva-preparation';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductDetailPreparationTypeSelectorProps {
  product: Product;
  value: SeminuevaPreparationType;
  onChange: (value: SeminuevaPreparationType) => void;
  className?: string;
}

export function ProductDetailPreparationTypeSelector({
  product,
  value,
  onChange,
  className,
}: ProductDetailPreparationTypeSelectorProps) {
  const { role, viewAsRoles } = useAuth();
  const priceRole = resolvePreparationPriceRoleForViewer(role, viewAsRoles);

  return (
    <fieldset className={cn('space-y-2.5', className)}>
      <legend className="text-sm font-semibold text-[#0f1f3d]">Variantes:</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {SEMINUEVA_PREPARATION_OPTIONS.map((option) => {
          const id = `preparation-type-${option}`;
          const isActive = value === option;
          const optionUsd = resolvePreparationRolePriceUsd(option, product, priceRole);
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
                name="preparation-type"
                value={option}
                checked={isActive}
                onChange={() => onChange(option)}
                className="mt-1 size-4 shrink-0 accent-red-600"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.8125rem] font-semibold leading-snug text-foreground">
                  {SEMINUEVA_PREPARATION_LABELS[option]}
                </span>
                <DualPrice
                  usd={optionUsd}
                  className="mt-0.5 text-[0.6875rem] font-semibold leading-snug text-muted-foreground"
                />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
