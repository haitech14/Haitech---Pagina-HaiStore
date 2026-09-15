import { Headphones, Settings2, ShieldCheck, Store, Truck } from 'lucide-react';

import { STOREFRONT_PURCHASE_TRUST_ITEMS } from '@/data/storefront-trust';
import { cn } from '@/lib/utils';

interface ProductDetailPurchaseCardTrustProps {
  className?: string;
  variant?: 'default' | 'laptop' | 'premium';
  /** Texto e iconos claros sobre fondo marca. */
  onBrand?: boolean;
}

const TRUST_ICONS = {
  garantia: ShieldCheck,
  soporte: Headphones,
  entrega: Truck,
} as const;

const LAPTOP_TRUST_ITEMS = [
  { id: 'envio', icon: Truck, label: 'Envío a domicilio' },
  { id: 'retiro', icon: Store, label: 'Retiro en tienda' },
  { id: 'seguro', icon: ShieldCheck, label: 'Compra segura' },
  { id: 'soporte', icon: Headphones, label: 'Soporte técnico' },
] as const;

const PREMIUM_TRUST_ITEMS = [
  {
    id: 'envio',
    icon: Truck,
    title: 'Envío a todo el país',
    subtitle: 'Recibe en 1-5 días hábiles',
  },
  {
    id: 'instalacion',
    icon: Settings2,
    title: 'Instalación y configuración (opcional)',
    subtitle: 'Por nuestro equipo especializado',
  },
  {
    id: 'garantia',
    icon: ShieldCheck,
    title: 'Garantía estándar de 1 año',
    subtitle: 'Con opción de extensión',
  },
] as const;

export function ProductDetailPurchaseCardTrust({
  className,
  variant = 'default',
  onBrand = false,
}: ProductDetailPurchaseCardTrustProps) {
  if (variant === 'premium') {
    return (
      <ul
        className={cn(
          'space-y-2 border-t pt-3',
          onBrand ? 'border-white/25' : 'border-neutral-100',
          className,
        )}
        aria-label="Beneficios de compra"
      >
        {PREMIUM_TRUST_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex items-start gap-2.5">
              <Icon
                className={cn(
                  'mt-0.5 size-4 shrink-0',
                  onBrand ? 'text-white/85' : 'text-neutral-400',
                )}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span
                  className={cn(
                    'block text-xs font-semibold leading-snug',
                    onBrand ? 'text-white' : 'text-neutral-800',
                  )}
                >
                  {item.title}
                </span>
                <span
                  className={cn(
                    'block text-[11px] leading-snug',
                    onBrand ? 'text-white/75' : 'text-neutral-500',
                  )}
                >
                  {item.subtitle}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  if (variant === 'laptop') {
    return (
      <ul
        className={cn(
          'grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-center sm:grid-cols-4',
          className,
        )}
        aria-label="Beneficios de compra"
      >
        {LAPTOP_TRUST_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex min-w-0 flex-col items-center gap-1 rounded-lg bg-neutral-50/80 px-1 py-2">
              <Icon
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="text-pretty text-[0.625rem] font-medium leading-tight text-muted-foreground sm:text-[0.6875rem]">
                {item.label}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul
      className={cn(
        'grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center',
        className,
      )}
      aria-label="Beneficios de compra"
    >
      {STOREFRONT_PURCHASE_TRUST_ITEMS.map((item) => {
        const Icon = TRUST_ICONS[item.id as keyof typeof TRUST_ICONS] ?? ShieldCheck;
        return (
          <li key={item.id} className="flex min-w-0 flex-col items-center gap-1">
            <Icon
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className="text-pretty text-[0.625rem] font-medium leading-tight text-muted-foreground sm:text-[0.6875rem]">
              {item.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
