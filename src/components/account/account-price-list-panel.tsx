import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListOrdered, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/auth-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useProducts } from '@/hooks/use-products';
import { formatDisplayPriceFromUsd } from '@/lib/display-price';
import { productPath } from '@/lib/product-path';
import { PRICE_ROLE_LABELS, resolvePriceRole, USER_ROLE_LABELS } from '@/lib/roles';

export function AccountPriceListPanel() {
  const { role } = useAuth();
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const { data: products = [], isLoading } = useProducts();
  const [query, setQuery] = useState('');

  const priceRole = resolvePriceRole(role);
  const roleLabel = USER_ROLE_LABELS[role] ?? PRICE_ROLE_LABELS[priceRole];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    if (!q) return sorted;
    return sorted.filter((product) => {
      const haystack = [product.name, product.code, product.category, product.brand]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [products, query]);

  return (
    <div className="space-y-4">
      <header className="rounded-xl border bg-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <ListOrdered className="size-5 text-red-600" aria-hidden="true" />
          Lista de Precios
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Precios vigentes según tu perfil comercial ({roleLabel}). Los importes siguen la moneda
          seleccionada en la tienda.
        </p>
      </header>

      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <label htmlFor="account-price-list-search" className="sr-only">
          Buscar en la lista de precios
        </label>
        <div className="relative mb-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="account-price-list-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, código o categoría…"
            className="min-h-11 pl-9"
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground" role="status">
            Cargando lista de precios…
          </p>
        ) : null}

        {!isLoading && filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {query.trim()
              ? 'No hay productos que coincidan con tu búsqueda.'
              : 'Aún no hay productos disponibles en tu lista.'}
          </p>
        ) : null}

        {!isLoading && filtered.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[6rem]">Código</TableHead>
                  <TableHead className="min-w-[12rem]">Producto</TableHead>
                  <TableHead className="min-w-[8rem] text-right">Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product.code ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={productPath(product)}
                        className="font-medium text-foreground underline-offset-2 hover:text-red-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-foreground">
                      {formatDisplayPriceFromUsd(product.price, displayCurrency, dualPriceOrder)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        <Link
          to="/tienda"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          Ir a la tienda
        </Link>
      </div>
    </div>
  );
}
