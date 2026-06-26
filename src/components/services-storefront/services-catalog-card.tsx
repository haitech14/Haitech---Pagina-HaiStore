import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShoppingCart, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  getServiceCardPriceLabel,
  serviceDetailPath,
} from '@/data/services-catalog';
import { useServicePurchase } from '@/hooks/use-service-purchase';
import { buildDefaultServiceCartInput } from '@/lib/service-to-cart';
import type { ServiceCatalogItem } from '@/types/services-catalog';
import { cn } from '@/lib/utils';

interface ServicesCatalogCardProps {
  item: ServiceCatalogItem;
}

function BadgeLabel({ badge }: { badge: ServiceCatalogItem['badge'] }) {
  if (!badge) return null;
  const labels = {
    disponible: 'Disponible',
    popular: 'Popular',
    reserva: 'Bajo reserva',
  };
  const styles = {
    disponible: 'bg-emerald-100 text-emerald-700',
    popular: 'bg-red-100 text-red-700',
    reserva: 'bg-amber-100 text-amber-800',
  };
  return (
    <span
      className={cn(
        'absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold',
        styles[badge],
      )}
    >
      {labels[badge]}
    </span>
  );
}

export function ServicesCatalogCard({ item }: ServicesCatalogCardProps) {
  const priceLabel = getServiceCardPriceLabel(item);
  const { addServiceToCart } = useServicePurchase();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    addServiceToCart(buildDefaultServiceCartInput(item));
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-shadow hover:border-red-600/30 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-muted/30">
        <BadgeLabel badge={item.badge} />
        <img
          src={item.images[0]}
          alt={item.imageAlt}
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold leading-snug text-foreground sm:text-base">
            <Link
              to={serviceDetailPath(item.slug)}
              className="hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              {item.title}
            </Link>
          </h3>
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="font-semibold text-foreground">{item.rating.toFixed(1)}</span>
          <span>({item.reviewCount})</span>
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {item.shortDescription}
        </p>

        <p className="mt-3 text-sm font-bold text-neutral-950">{priceLabel}</p>

        <ul className="mt-3 space-y-1.5">
          {item.features.slice(0, 3).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row">
          <Button
            asChild
            variant="outline"
            className="min-h-10 flex-1 border-border text-xs font-semibold sm:text-sm"
          >
            <Link to={serviceDetailPath(item.slug)}>Ver detalle</Link>
          </Button>
          <Button
            type="button"
            aria-live="polite"
            aria-label={
              justAdded
                ? `${item.title} agregado al carrito`
                : `Añadir ${item.title} al carrito`
            }
            className={cn(
              'min-h-10 flex-1 gap-1.5 text-xs font-semibold sm:text-sm',
              justAdded
                ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                : 'bg-red-600 text-white hover:bg-red-500',
            )}
            onClick={handleAddToCart}
          >
            {justAdded ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                ¡Agregado!
              </>
            ) : (
              <>
                <ShoppingCart className="size-4" aria-hidden="true" />
                Añadir al carrito
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
