import { ProductCardPill } from '@/components/product/product-card-pill';
import type { ProductEquipmentConditionLabel } from '@/lib/product-hero-meta';

const PRIMARY_ESTADO_LABELS = new Set([
  'Nueva',
  'Seminueva',
  'Remanufacturada',
  'Original',
  'Compatible',
  'Remanufacturado',
  'Recarga',
]);

function isPrimaryEstadoLabel(label: string): label is ProductEquipmentConditionLabel | 'Original' | 'Compatible' | 'Remanufacturado' | 'Recarga' {
  return PRIMARY_ESTADO_LABELS.has(label);
}

interface ProductCardEstadoBadgeProps {
  label: string;
  size?: 'card' | 'default';
  className?: string;
}

/** Badge primario navy en tarjetas (condición de equipo o Original/Compatible). */
export function ProductCardEstadoBadge({
  label,
  size = 'card',
  className,
}: ProductCardEstadoBadgeProps) {
  const trimmed = label.trim();
  if (!trimmed) return null;

  const pillSize = size === 'card' ? 'card' : 'image';
  const classNameProp = className != null ? { className } : {};

  if (isPrimaryEstadoLabel(trimmed)) {
    return (
      <ProductCardPill
        label={trimmed}
        variant="primary"
        size={pillSize}
        {...classNameProp}
      />
    );
  }

  return (
    <ProductCardPill label={trimmed} variant="secondary" size={pillSize} {...classNameProp} />
  );
}
