import { ProductCardPill } from '@/components/product/product-card-pill';
import type { ProductEquipmentConditionLabel } from '@/lib/product-hero-meta';
import { cn } from '@/lib/utils';

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

  if (isPrimaryEstadoLabel(trimmed)) {
    return (
      <ProductCardPill
        label={trimmed}
        variant="primary"
        size={size === 'card' ? 'card' : 'image'}
        className={className}
      />
    );
  }

  return (
    <ProductCardPill label={trimmed} variant="secondary" size={size === 'card' ? 'card' : 'image'} className={className} />
  );
}
