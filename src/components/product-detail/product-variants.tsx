import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

import { DualPrice } from '@/components/product/product-dual-price';
import { useAuth } from '@/context/auth-context';
import {
  NUEVO_EQUIPMENT_VARIANT_IDS,
  resolveNuevoMesaBundleSurchargeUsd,
  type NuevoEquipmentVariantId,
} from '@/lib/nuevo-equipment-variants';
import {
  SEMINUEVA_PREPARATION_LABELS,
  SEMINUEVA_PREPARATION_OPTIONS,
  resolvePreparationPriceRoleForViewer,
  resolvePreparationRolePriceUsd,
  type SeminuevaPreparationType,
} from '@/lib/seminueva-preparation';
import { cn } from '@/lib/utils';
import type { EquipmentConfigStep, ProductComboItem } from '@/types/product-detail';
import type { Product } from '@/types/product';

const NUEVO_VARIANT_COPY: Record<
  NuevoEquipmentVariantId,
  { title: string; subtitle: string; features: string[] }
> = {
  'solo-equipo': {
    title: 'Estándar',
    subtitle: 'Equipo base listo para operar',
    features: ['Equipo base', 'ADF de documentos', 'Configuración de fábrica'],
  },
  'mesa-2-caseteras-mueble': {
    title: 'Con accesorios',
    subtitle: 'Bandeja adicional y mueble',
    features: ['Equipo base', '2 caseteras adicionales', 'Mueble / gabinete'],
  },
};

interface ProductVariantsProps {
  product: Product;
  imageUrl?: string | null;
  showNuevo?: boolean;
  nuevoVariant?: NuevoEquipmentVariantId;
  onNuevoVariantChange?: (value: NuevoEquipmentVariantId) => void;
  equipmentSteps?: EquipmentConfigStep[];
  comboItems?: ProductComboItem[];
  showPreparation?: boolean;
  preparationType?: SeminuevaPreparationType;
  onPreparationTypeChange?: (value: SeminuevaPreparationType) => void;
  className?: string;
}

function VariantCard({
  name,
  title,
  subtitle,
  features,
  imageUrl,
  selected,
  inputId,
  children,
}: {
  name: string;
  title: string;
  subtitle?: ReactNode;
  features: string[];
  imageUrl?: string | null;
  selected: boolean;
  inputId: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={inputId}
      className={cn(
        'group relative flex cursor-pointer gap-4 rounded-2xl border bg-white p-4 transition-all duration-200',
        'hover:shadow-md focus-within:ring-2 focus-within:ring-[#E31B23]/40 focus-within:ring-offset-2',
        selected ? 'border-[#E31B23] shadow-sm' : 'border-neutral-200 hover:border-neutral-300',
      )}
    >
      {children}
      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50 sm:size-28">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-2xl font-bold text-neutral-200">{name.charAt(0)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-neutral-900 sm:text-base">{name}</p>
        <p className="text-sm font-medium text-neutral-600">{title}</p>
        {subtitle ? <div className="mt-0.5 text-xs text-neutral-500">{subtitle}</div> : null}
        <ul className="mt-2 space-y-1">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-1.5 text-xs text-neutral-600 sm:text-sm">
              <Check
                className={cn('size-3.5 shrink-0', selected ? 'text-[#E31B23]' : 'text-neutral-400')}
                strokeWidth={2.5}
                aria-hidden="true"
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <span
        className={cn(
          'mt-1 size-5 shrink-0 rounded-full border-2',
          selected ? 'border-[#E31B23] bg-[#E31B23]' : 'border-neutral-300 bg-white',
        )}
        aria-hidden="true"
      >
        {selected ? (
          <span className="flex size-full items-center justify-center">
            <span className="size-1.5 rounded-full bg-white" />
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function ProductVariants({
  product,
  imageUrl,
  showNuevo = false,
  nuevoVariant = 'solo-equipo',
  onNuevoVariantChange,
  equipmentSteps = [],
  comboItems = [],
  showPreparation = false,
  preparationType = 'acondicionado',
  onPreparationTypeChange,
  className,
}: ProductVariantsProps) {
  const { role, viewAsRoles } = useAuth();
  const priceRole = resolvePreparationPriceRoleForViewer(role, viewAsRoles);
  const shortName = product.name.replace(/^impresora\s+multifuncional\s+/i, '').trim() || product.name;

  if (!showNuevo && !showPreparation) return null;

  return (
    <section className={cn('mt-10 sm:mt-12', className)} aria-labelledby="variantes-producto-titulo">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-8 w-1 shrink-0 rounded-full bg-[#E31B23]" aria-hidden="true" />
        <div>
          <h2 id="variantes-producto-titulo" className="text-xl font-bold text-neutral-900 sm:text-2xl">
            Variantes del producto
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Elige la configuración que mejor se adapte a tus necesidades.
          </p>
        </div>
      </div>

      {showNuevo && onNuevoVariantChange ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {NUEVO_EQUIPMENT_VARIANT_IDS.map((option) => {
            const copy = NUEVO_VARIANT_COPY[option];
            const id = `product-variant-${option}`;
            const selected = nuevoVariant === option;
            const surcharge =
              option === 'mesa-2-caseteras-mueble'
                ? resolveNuevoMesaBundleSurchargeUsd(equipmentSteps, comboItems)
                : 0;
            return (
              <VariantCard
                key={option}
                name={shortName}
                title={copy.title}
                subtitle={
                  surcharge > 0
                    ? `${copy.subtitle} · +USD ${surcharge.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                    : copy.subtitle
                }
                features={copy.features}
                imageUrl={imageUrl}
                selected={selected}
                inputId={id}
              >
                <input
                  id={id}
                  type="radio"
                  name="product-nuevo-variant"
                  value={option}
                  checked={selected}
                  onChange={() => onNuevoVariantChange(option)}
                  className="sr-only"
                />
              </VariantCard>
            );
          })}
        </div>
      ) : null}

      {showPreparation && onPreparationTypeChange ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SEMINUEVA_PREPARATION_OPTIONS.map((option) => {
            const id = `product-prep-${option}`;
            const selected = preparationType === option;
            const optionUsd = resolvePreparationRolePriceUsd(option, product, priceRole);
            return (
              <VariantCard
                key={option}
                name={shortName}
                title={SEMINUEVA_PREPARATION_LABELS[option]}
                subtitle={<DualPrice usd={optionUsd} className="text-xs font-semibold text-neutral-500" />}
                features={
                  option === 'acondicionado'
                    ? ['Equipo acondicionado', 'Listo para operar', 'Garantía Haitech']
                    : option === 'semirepotenciado'
                      ? ['Repotenciado', 'Piezas clave renovadas', 'Mayor vida útil']
                      : ['Remanufacturado', 'Reacondicionado a fondo', 'Como equipo nuevo']
                }
                imageUrl={imageUrl}
                selected={selected}
                inputId={id}
              >
                <input
                  id={id}
                  type="radio"
                  name="product-preparation-variant"
                  value={option}
                  checked={selected}
                  onChange={() => onPreparationTypeChange(option)}
                  className="sr-only"
                />
              </VariantCard>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
