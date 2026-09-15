import { ShieldCheck } from 'lucide-react';

import { ProductDetailHeroCollapsibleSection } from '@/components/product-detail/product-detail-hero-collapsible-section';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { formatDisplayPriceFromPen, formatPenUsdParenthetical } from '@/lib/display-price';
import { cn } from '@/lib/utils';
import {
  HERO_WARRANTY_BASE_OPTION_ID,
  type ConfigureHeroWarrantyUpgrade,
} from '@/lib/product-configure-hero-options';
import type { DisplayCurrency, DualPriceOrder } from '@/types/display-currency';

interface ProductDetailHeroWarrantySelectorProps {
  baseLabel: string;
  upgrades: ConfigureHeroWarrantyUpgrade[];
  selectedOptionId: string;
  onSelectOption: (optionId: string) => void;
  className?: string;
  embedded?: boolean;
  /** Oculta el título «Garantía» cuando ya lo muestra un acordeón padre. */
  hideTitle?: boolean;
  /** Prefijo para ids/name (móvil y desktop pueden montarse a la vez). */
  idPrefix?: string;
}

function formatUpgradePrice(
  upgrade: ConfigureHeroWarrantyUpgrade,
  displayCurrency: DisplayCurrency,
  dualPriceOrder: DualPriceOrder,
): string | null {
  if (upgrade.priceUsd != null && upgrade.priceUsd > 0) {
    return `+ ${formatPenUsdParenthetical(upgrade.priceUsd)}`;
  }
  if (upgrade.pricePen > 0) {
    return `+ ${formatDisplayPriceFromPen(upgrade.pricePen, displayCurrency, dualPriceOrder)}`;
  }
  return null;
}

export function ProductDetailHeroWarrantySelector({
  baseLabel,
  upgrades,
  selectedOptionId,
  onSelectOption,
  className,
  embedded = false,
  hideTitle = false,
  idPrefix = '',
}: ProductDetailHeroWarrantySelectorProps) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  if (upgrades.length === 0) return null;

  const baseInputId = `${idPrefix}hero-warranty-${HERO_WARRANTY_BASE_OPTION_ID}`;
  const radioName = `${idPrefix}hero-warranty-option`;
  const baseSelected = selectedOptionId === HERO_WARRANTY_BASE_OPTION_ID;

  const fieldset = (
    <fieldset>
      <legend className="sr-only">Garantía</legend>
      <ul className="space-y-1.5" role="radiogroup" aria-label="Garantía">
        <li>
          <label
            htmlFor={baseInputId}
            className={cn(
              'flex cursor-pointer items-start gap-2 rounded-md border px-2 py-2 transition-colors focus-within:ring-2 focus-within:ring-red-600 focus-within:ring-offset-2',
              baseSelected
                ? 'border-red-600/40 bg-white'
                : 'border-border/60 bg-white hover:bg-muted/20',
            )}
          >
            <input
              type="radio"
              id={baseInputId}
              name={radioName}
              value={HERO_WARRANTY_BASE_OPTION_ID}
              checked={baseSelected}
              onChange={() => onSelectOption(HERO_WARRANTY_BASE_OPTION_ID)}
              className="mt-0.5 size-3.5 shrink-0 accent-red-600"
            />
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              <span className="text-[0.6875rem] font-medium leading-snug text-[#0f1f3d] sm:text-xs">
                {baseLabel}
              </span>
              <span className="rounded-full bg-emerald-600 px-1.5 py-px text-[0.5625rem] font-bold uppercase tracking-wide text-white">
                Incluido
              </span>
            </span>
          </label>
        </li>

        {upgrades.map((upgrade) => {
          const selected = selectedOptionId === upgrade.optionId;
          const priceLabel = formatUpgradePrice(upgrade, displayCurrency, dualPriceOrder);
          const inputId = `${idPrefix}hero-warranty-${upgrade.optionId}`;

          return (
            <li key={upgrade.optionId}>
              <label
                htmlFor={inputId}
                className={cn(
                  'flex cursor-pointer items-start gap-2 rounded-md border px-2 py-2 transition-colors focus-within:ring-2 focus-within:ring-red-600 focus-within:ring-offset-2',
                  selected
                    ? 'border-red-600/40 bg-white'
                    : 'border-border/60 bg-white hover:bg-muted/20',
                )}
              >
                <input
                  type="radio"
                  id={inputId}
                  name={radioName}
                  value={upgrade.optionId}
                  checked={selected}
                  onChange={() => onSelectOption(upgrade.optionId)}
                  className="mt-0.5 size-3.5 shrink-0 accent-red-600"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[0.6875rem] font-medium leading-snug text-[#0f1f3d] sm:text-xs">
                    {upgrade.label}
                  </span>
                  {priceLabel ? (
                    <span className="text-[0.625rem] font-semibold text-red-600 sm:text-[0.6875rem]">
                      {priceLabel}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );

  if (embedded) {
    return (
      <div className={className}>
        {hideTitle ? null : (
          <p className="mb-1.5 text-[0.6875rem] font-semibold text-[#0f1f3d] sm:text-xs">Garantía</p>
        )}
        {fieldset}
      </div>
    );
  }

  return (
    <ProductDetailHeroCollapsibleSection
      title="Garantía Extendida"
      icon={ShieldCheck}
      badge="Opcional"
      panelAriaLabel="Opciones de garantía"
      className={className}
    >
      {fieldset}
    </ProductDetailHeroCollapsibleSection>
  );
}
