import { Link, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';

import { ProductCard } from '@/components/product-card';
import { BrandStrip } from '@/components/brand-strip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { findBrandBySlug, printerBrands, productMatchesBrand } from '@/data/brands';
import { useProducts } from '@/hooks/use-products';
import { resolvePriceRole, type PriceRole } from '@/lib/roles';
import { PRICE_ROLE_LABELS } from '@/types/product';

function ProductSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardHeader>
        <div className="mb-3 aspect-video animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

export function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const marcaSlug = searchParams.get('marca');
  const activeBrand = findBrandBySlug(marcaSlug);
  const { role } = useAuth();
  const priceRole: PriceRole = resolvePriceRole(role);

  const { data: products, isLoading, isError } = useProducts();

  const filteredProducts = products?.filter((product) =>
    productMatchesBrand(product.brand, marcaSlug),
  );

  const clearBrandFilter = () => {
    setSearchParams((params) => {
      params.delete('marca');
      return params;
    });
  };

  return (
    <div className="container flex flex-col gap-6 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tienda</h1>
          <p className="text-muted-foreground">
            {activeBrand
              ? `Productos de la marca ${activeBrand.name}.`
              : 'Explora nuestro catálogo completo.'}
          </p>
          <Badge variant="outline" className="mt-2 w-fit">
            Precios {PRICE_ROLE_LABELS[priceRole]}
          </Badge>
        </div>

        {activeBrand && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearBrandFilter}
            className="w-fit gap-2"
          >
            <img
              src={activeBrand.logo}
              alt=""
              className="h-4 w-auto max-w-[4rem] object-contain"
            />
            {activeBrand.name}
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Quitar filtro de marca</span>
          </Button>
        )}
      </header>

      <BrandStrip
        brands={printerBrands}
        showHeading={false}
        variant="filter"
        activeBrandSlug={marcaSlug}
      />

      {isError && (
        <p role="alert" className="text-destructive">
          No se pudieron cargar los productos. Inténtalo de nuevo más tarde.
        </p>
      )}

      {!isLoading && filteredProducts?.length === 0 && (
        <div className="rounded-lg border bg-muted/30 px-6 py-10 text-center">
          <p className="font-medium text-foreground">
            No hay productos para esta marca.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba con otra marca o explora todo el catálogo.
          </p>
          {marcaSlug && (
            <Button asChild variant="link" className="mt-3 text-[#DC2626]">
              <Link to="/tienda">Ver todos los productos</Link>
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)
          : filteredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </div>
  );
}
