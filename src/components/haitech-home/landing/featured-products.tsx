import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  HAITECH_LANDING_COLORS,
  type FeaturedLandingProduct,
} from '@/data/haitech-home-landing-section';
import { cn } from '@/lib/utils';

function formatPen(price: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(price);
}

export function FeaturedProductCard({
  product,
  onAddToCart,
}: {
  product: FeaturedLandingProduct;
  onAddToCart: (product: FeaturedLandingProduct) => void;
}) {
  return (
    <article
      className={cn(
        'flex h-full min-w-[250px] flex-col rounded-lg border bg-white p-3.5',
      )}
      style={{ borderColor: '#ededed' }}
    >
      <div className="relative mb-2 min-h-[1.25rem]">
        {product.badge ? (
          <span
            className="inline-block rounded-[3px] px-[7px] py-1 text-[9px] font-bold uppercase leading-none text-white"
            style={{ backgroundColor: HAITECH_LANDING_COLORS.primary }}
          >
            {product.badge}
          </span>
        ) : null}
      </div>

      <div className="mb-3 flex h-[120px] items-center justify-center">
        <img
          src={product.image}
          alt={`${product.name} ${product.description}`}
          width={160}
          height={120}
          className="max-h-[120px] w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>

      <h3
        className="text-[13px] font-bold leading-snug"
        style={{ color: HAITECH_LANDING_COLORS.textPrimary }}
      >
        {product.name}
      </h3>
      <p
        className="mt-0.5 text-[12px] leading-snug"
        style={{ color: HAITECH_LANDING_COLORS.textSecondary }}
      >
        {product.description}
      </p>

      <p
        className="mt-3 text-[15px] font-bold tabular-nums"
        style={{ color: HAITECH_LANDING_COLORS.textPrimary }}
      >
        {formatPen(product.pricePEN)}
      </p>

      <button
        type="button"
        onClick={() => onAddToCart(product)}
        className={cn(
          'mt-auto flex h-[34px] w-full items-center justify-center gap-1.5 rounded px-2',
          'text-[10px] font-bold uppercase tracking-wide text-white',
          'transition-colors hover:bg-[#be0010]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e30613] focus-visible:ring-offset-2',
        )}
        style={{ backgroundColor: HAITECH_LANDING_COLORS.primary }}
      >
        Agregar al carrito
        <ShoppingCart className="size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
      </button>
    </article>
  );
}

export function FeaturedProducts({
  products,
  allProductsHref,
  onAddToCart,
  className,
}: {
  products: FeaturedLandingProduct[];
  allProductsHref: string;
  onAddToCart: (product: FeaturedLandingProduct) => void;
  className?: string;
}) {
  return (
    <section className={cn('w-full bg-white', className)} aria-labelledby="featured-products-heading">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2
          id="featured-products-heading"
          className="text-[15px] font-bold uppercase tracking-[0.03em] sm:text-[16px]"
          style={{ color: HAITECH_LANDING_COLORS.textPrimary }}
        >
          Productos destacados
        </h2>
        <Link
          to={allProductsHref}
          className="shrink-0 text-[12px] font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e30613] focus-visible:ring-offset-2"
          style={{ color: HAITECH_LANDING_COLORS.primary }}
        >
          Ver todos los productos →
        </Link>
      </div>

      <ul
        className={cn(
          'flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0 xl:grid-cols-5',
        )}
      >
        {products.map((product) => (
          <li key={product.id} className="min-w-[250px] snap-start md:min-w-0">
            <FeaturedProductCard product={product} onAddToCart={onAddToCart} />
          </li>
        ))}
      </ul>
    </section>
  );
}
