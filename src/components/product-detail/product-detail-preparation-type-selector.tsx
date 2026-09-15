import { useAuth } from '@/context/auth-context';
import {
  CONSULTAR_PRECIO_LABEL,
  formatPenUsdParenthetical,
  isPriceOnRequest,
} from '@/lib/display-price';
import {
  SEMINUEVA_PREPARATION_LABELS,
  SEMINUEVA_PREPARATION_OPTIONS,
  resolvePreparationPriceRoleForViewer,
  resolvePreparationRolePriceUsd,
  type SeminuevaPreparationType,
} from '@/lib/seminueva-preparation';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const PREPARATION_FEATURES: Record<SeminuevaPreparationType, string> = {
  acondicionado: 'Equipo acondicionado, listo para operar',
  semirepotenciado: 'Piezas clave renovadas · mayor vida útil',
  remanufacturado: 'Reacondicionado a fondo · como equipo nuevo',
};

interface ProductDetailPreparationTypeSelectorProps {
  product: Product;
  value: SeminuevaPreparationType;
  onChange: (value: SeminuevaPreparationType) => void;
  className?: string;
  /** Carrusel compacto en hero (3 cards en fila). */
  compact?: boolean;
  /** Número de paso visible (p. ej. 1). */
  stepNumber?: number;
}

export function ProductDetailPreparationTypeSelector({
  product,
  value,
  onChange,
  className,
  compact = false,
  stepNumber,
}: ProductDetailPreparationTypeSelectorProps) {
  const { role, viewAsRoles } = useAuth();
  const priceRole = resolvePreparationPriceRoleForViewer(role, viewAsRoles);

  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="sr-only">
        {stepNumber != null ? `Paso ${stepNumber}. ` : null}
        Variante de preparación
      </legend>
      <div className="mb-2 flex items-center gap-2">
        {stepNumber != null ? (
          <span
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0f1f3d] text-[0.625rem] font-bold tabular-nums text-white sm:text-[0.6875rem]"
            aria-hidden="true"
          >
            {stepNumber}
          </span>
        ) : null}
        <p className="text-[0.6875rem] leading-snug text-neutral-500 sm:text-xs">
          Elige la variante de preparación del equipo
        </p>
      </div>
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Variante de preparación"
      >
        {SEMINUEVA_PREPARATION_OPTIONS.map((option) => {
          const id = `preparation-type-${option}`;
          const isActive = value === option;
          const optionUsd = resolvePreparationRolePriceUsd(option, product, priceRole);
          const priceLabel = isPriceOnRequest(optionUsd)
            ? CONSULTAR_PRECIO_LABEL
            : formatPenUsdParenthetical(optionUsd);
          return (
            <label
              key={option}
              htmlFor={id}
              className={cn(
                'flex min-w-0 cursor-pointer flex-col items-center justify-center rounded-xl border bg-white text-center transition-shadow',
                'hover:shadow-sm focus-within:ring-2 focus-within:ring-[#E31B23] focus-within:ring-offset-1',
                compact ? 'px-2.5 py-3 sm:px-3 sm:py-3.5' : 'px-3 py-3.5',
                isActive
                  ? 'border-[#E31B23] ring-1 ring-[#E31B23]'
                  : 'border-neutral-200 hover:border-neutral-300',
              )}
            >
              <input
                id={id}
                type="radio"
                name="preparation-type"
                value={option}
                checked={isActive}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              <span
                className={cn(
                  'block w-full font-bold leading-snug text-neutral-900',
                  compact ? 'text-[0.8125rem] sm:text-sm' : 'text-sm',
                )}
              >
                {SEMINUEVA_PREPARATION_LABELS[option]}
              </span>
              <span className="mt-1 block w-full text-[10px] leading-snug text-neutral-500 sm:text-[11px]">
                {PREPARATION_FEATURES[option]}
              </span>
              <span
                className={cn(
                  'mt-1.5 block w-full font-semibold tabular-nums leading-snug text-neutral-700',
                  compact ? 'text-[0.6875rem] sm:text-xs' : 'text-xs',
                )}
              >
                {priceLabel}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
