import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { DualPrice } from '@/components/product/product-dual-price';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { productPath } from '@/lib/product-path';
import { cn, penToUsd, uniqueById } from '@/lib/utils';
import type { ProductComboItem } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface RelatedProductsProps {
  items: ProductComboItem[];
  mainProduct: Product;
  catalogProducts?: Product[];
  className?: string;
}

function comboItemUsd(item: ProductComboItem): number {
  if (item.priceUsd != null && item.priceUsd > 0) return item.priceUsd;
  return penToUsd(item.pricePen);
}

export function RelatedProducts({
  items,
  mainProduct,
  catalogProducts = [],
  className,
}: RelatedProductsProps) {
  const { addItem } = useCart();

  const uniqueItems = uniqueById(items);
  if (uniqueItems.length === 0) return null;

  const handleAdd = (item: ProductComboItem) => {
    const realProduct = item.productId
      ? catalogProducts.find((row) => row.id === item.productId)
      : undefined;
    if (realProduct) {
      addItem(realProduct, { openDrawer: true });
      return;
    }
    addItem(
      {
        id: `${mainProduct.id}-${item.id}`,
        name: item.name,
        description: `Complemento para ${mainProduct.name}`,
        price: comboItemUsd(item),
        currency: 'USD',
        image_url: item.image,
        stock: 10,
        category: 'Tóner y Suministros',
        created_at: new Date().toISOString(),
      },
      { openDrawer: true },
    );
  };

  return (
    <section
      className={cn('-mx-4 mt-10 bg-neutral-50 px-4 py-8 sm:-mx-6 sm:mt-12 sm:px-6 sm:py-10 lg:mx-0 lg:rounded-3xl', className)}
      aria-labelledby="complementa-compra-titulo"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-8 w-1 shrink-0 rounded-full bg-[#E31B23]" aria-hidden="true" />
          <div>
            <h2 id="complementa-compra-titulo" className="text-xl font-bold text-neutral-900 sm:text-2xl">
              Complementa tu compra
            </h2>
            <p className="mt-1 max-w-xl text-sm text-neutral-500">
              Accesorios opcionales para maximizar el rendimiento de tu {mainProduct.name.replace(/^impresora\s+/i, '')}.
            </p>
          </div>
        </div>
        <Link
          to="/tienda/accesorios"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#E31B23] transition-colors hover:text-[#c41820]"
        >
          Ver todos los accesorios
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <ul className="mt-6 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-5">
        {uniqueItems.map((item) => {
          const unitUsd = comboItemUsd(item);
          const href = item.productId
            ? productPath({
                id: item.productId,
                name: item.name,
              })
            : undefined;
          const catalogMatch = item.productId
            ? catalogProducts.find((row) => row.id === item.productId)
            : undefined;
          const description =
            catalogMatch?.description?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ||
            'Complemento compatible con tu equipo.';

          return (
            <li key={item.id} className="w-[16.5rem] shrink-0 sm:w-auto">
              <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
                {href ? (
                  <Link
                    to={href}
                    className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31B23]"
                  >
                    {item.image ? (
                      <img src={item.image} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-3xl font-bold text-neutral-200">{item.name.charAt(0)}</span>
                    )}
                  </Link>
                ) : (
                  <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-neutral-50">
                    {item.image ? (
                      <img src={item.image} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-3xl font-bold text-neutral-200">{item.name.charAt(0)}</span>
                    )}
                  </div>
                )}
                <h3 className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-neutral-900">
                  {href ? (
                    <Link to={href} className="hover:text-[#E31B23] focus-visible:outline-none">
                      {item.name}
                    </Link>
                  ) : (
                    item.name
                  )}
                </h3>
                <p className="mt-1 line-clamp-2 min-h-[2.25rem] text-xs leading-relaxed text-neutral-500">
                  {description}
                </p>
                <p className="mt-3 text-base font-bold tabular-nums text-neutral-900">
                  <DualPrice usd={unitUsd} className="text-base font-bold text-neutral-900" />
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAdd(item)}
                  className="mt-3 h-10 w-full gap-1.5 rounded-full border-[#E31B23] text-sm font-semibold text-[#E31B23] hover:bg-[#E31B23] hover:text-white"
                >
                  <ShoppingCart className="size-4" aria-hidden="true" />
                  Agregar
                </Button>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
