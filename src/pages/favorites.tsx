import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

import { ProductShowcaseCard } from '@/components/product-showcase-card';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/context/wishlist-context';
import { useProducts } from '@/hooks/use-products';
import type { FeaturedProduct } from '@/data/featured-products';
import type { WishlistItem } from '@/lib/wishlist-product';

function wishlistToFeatured(item: WishlistItem, livePrice?: number): FeaturedProduct {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    brand: item.brand,
    price: livePrice ?? item.price,
    image: item.image ?? '',
    rating: 5,
    reviews: 0,
  };
}

export function FavoritesPage() {
  const { items, clear, totalItems } = useWishlist();
  const { data: storeProducts } = useProducts();

  const products = useMemo(() => {
    const priceById = new Map(storeProducts?.map((product) => [product.id, product.price]) ?? []);
    return items.map((item) => wishlistToFeatured(item, priceById.get(item.id)));
  }, [items, storeProducts]);

  return (
    <div className="container py-8 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-3 block h-1 w-10 rounded-full bg-red-600" aria-hidden="true" />
          <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Favoritos
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {totalItems === 0
              ? 'Guarda productos con el icono de corazón en las tarjetas del catálogo.'
              : `${totalItems} producto${totalItems === 1 ? '' : 's'} guardado${totalItems === 1 ? '' : 's'}.`}
          </p>
        </div>
        {totalItems > 0 ? (
          <Button type="button" variant="outline" onClick={clear}>
            Vaciar lista
          </Button>
        ) : null}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Heart className="size-12 text-red-600/40" strokeWidth={1.5} aria-hidden="true" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Aún no tienes favoritos. Explora la tienda y pulsa el corazón en cualquier producto.
          </p>
          <Button asChild className="bg-red-600 hover:bg-red-500">
            <Link to="/tienda">Ir a la tienda</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <ProductShowcaseCard product={product} brandTone="accent" variant="featured" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
