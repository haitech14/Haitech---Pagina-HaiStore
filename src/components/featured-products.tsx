import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { featuredProducts, type FeaturedProduct } from '@/data/featured-products';
import { productPath } from '@/lib/product-path';
import { cn, formatPenFromUsd, formatUsd } from '@/lib/utils';

function DualPrice({ usd, className }: { usd: number; className?: string }) {
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-1.5', className)}>
      <span>{formatUsd(usd)}</span>
      <span aria-hidden="true" className="text-muted-foreground">
        ·
      </span>
      <span>{formatPenFromUsd(usd)}</span>
    </span>
  );
}

function Rating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Valoración ${rating} de 5, ${reviews} reseñas`}
    >
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              'size-3.5',
              index < rating ? 'fill-red-500 text-red-500' : 'fill-muted text-muted',
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">({reviews})</span>
    </div>
  );
}

function FeaturedCard({ product }: { product: FeaturedProduct }) {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      description: null,
      price: product.price,
      currency: 'USD',
      image_url: product.image,
      stock: 10,
      category: product.category,
      created_at: new Date().toISOString(),
    });
  };

  const detailHref = productPath(product.id);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-shadow hover:shadow-md">
      <Link
        to={detailHref}
        className="relative block bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset"
      >
        <div className="flex aspect-square items-center justify-center p-4">
          {!imageError ? (
            <img
              src={product.image}
              alt=""
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-4xl font-bold text-muted-foreground/40" aria-hidden="true">
              {product.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.discount != null && (
            <span className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="rounded-md bg-foreground px-2 py-0.5 text-xs font-bold text-background">
              Nuevo
            </span>
          )}
        </div>

        <span className="sr-only">Ver ficha de {product.name}</span>
      </Link>

      <button
        type="button"
        aria-label={`Añadir ${product.name} a favoritos`}
        className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full border border-border/80 bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <Heart className="size-4" aria-hidden="true" />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          to={detailHref}
          className="flex flex-1 flex-col gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.category}
          </p>
          <h3 className="text-sm font-bold leading-tight transition-colors group-hover:text-red-600 sm:text-base">
            {product.name}
          </h3>
          <Rating rating={product.rating} reviews={product.reviews} />

          <div className="mt-1 space-y-0.5">
            <p className="text-base font-bold text-foreground sm:text-lg">
              <DualPrice usd={product.price} />
            </p>
            {product.oldPrice != null && (
              <p className="text-sm text-muted-foreground line-through">
                <DualPrice usd={product.oldPrice} />
              </p>
            )}
          </div>
        </Link>

        <Button
          onClick={handleAdd}
          className="mt-auto w-full bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500"
        >
          <ShoppingCart aria-hidden="true" />
          Añadir al carrito
        </Button>
      </div>
    </article>
  );
}

export function FeaturedProducts() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section aria-labelledby="ofertas-titulo">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 id="ofertas-titulo" className="text-2xl font-bold tracking-tight sm:text-3xl">
          Mejores ofertas de la semana
        </h2>
        <Link
          to="/tienda"
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Ver todos los productos
          <ChevronRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Productos anteriores"
          className="absolute -left-1 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:border-red-600/50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:flex lg:-left-3"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        <div className="overflow-hidden sm:mx-11 lg:mx-12" ref={emblaRef}>
          <ul className="flex gap-4">
            {featuredProducts.map((product) => (
              <li
                key={product.id}
                className="min-w-0 flex-[0_0_72%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_20%]"
              >
                <FeaturedCard product={product} />
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={scrollNext}
          aria-label="Más productos"
          className="absolute -right-1 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:border-red-600/50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:flex lg:-right-3"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
