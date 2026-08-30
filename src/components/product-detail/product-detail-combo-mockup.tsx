import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';

import { DualPrice } from '@/components/product/product-dual-price';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/context/cart-context';
import { cn, formatPenFromUsd, penToUsd } from '@/lib/utils';
import type { ProductComboItem } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailComboMockupProps {
  mainProduct: Product;
  items: ProductComboItem[];
  catalogProducts?: Product[];
  mainUnitUsd: number;
  className?: string;
}

function comboItemUsd(item: ProductComboItem): number {
  return item.priceUsd ?? penToUsd(item.pricePen);
}

export function ProductDetailComboMockup({
  mainProduct,
  items,
  catalogProducts = [],
  mainUnitUsd,
  className,
}: ProductDetailComboMockupProps) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.defaultSelected])),
  );

  const itemsKey = useMemo(
    () => items.map((item) => `${item.id}:${item.defaultSelected}`).join('|'),
    [items],
  );

  useEffect(() => {
    setSelected(Object.fromEntries(items.map((item) => [item.id, item.defaultSelected])));
  }, [itemsKey, items]);

  const handleAddItem = useCallback(
    (item: ProductComboItem, openDrawer = true) => {
      const realProduct = item.productId
        ? catalogProducts.find((row) => row.id === item.productId)
        : undefined;

      if (realProduct) {
        addItem(realProduct, { openDrawer });
        return;
      }

      addItem(
        {
          id: `${mainProduct.id}-${item.id}`,
          name: item.name,
          description: `Complemento para ${mainProduct.name}`,
          price: item.priceUsd ?? Math.round(item.pricePen / 3.7),
          currency: 'USD',
          image_url: item.image,
          stock: 10,
          category: mainProduct.category ?? 'Accesorios',
          created_at: new Date().toISOString(),
        },
        { openDrawer },
      );
    },
    [addItem, catalogProducts, mainProduct],
  );

  const { selectedExtrasUsd, savingsUsd } = useMemo(() => {
    const picked = items.filter((item) => selected[item.id]);
    const extrasUsd = picked.reduce((acc, item) => acc + comboItemUsd(item), 0);
    const savingsUsd = picked.length > 0 ? extrasUsd * 0.12 : 0;
    return { selectedExtrasUsd: extrasUsd, savingsUsd };
  }, [items, selected]);

  const comboTotalUsd = mainUnitUsd + selectedExtrasUsd;

  const handleAddSelected = () => {
    addItem(mainProduct, { openDrawer: false });
    const picked = items.filter((item) => selected[item.id]);
    picked.forEach((item, index) => {
      handleAddItem(item, index === picked.length - 1);
    });
  };

  if (items.length === 0) return null;

  return (
    <section className={cn('w-full', className)} aria-labelledby="combo-mockup-title">
      <h2 id="combo-mockup-title" className="text-base font-bold text-[#0f1f3d] sm:text-lg">
        Llévalo en combo
      </h2>

      <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-stretch xl:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <article className="relative flex w-full min-w-[9rem] max-w-[11rem] flex-col rounded-lg border border-red-600/40 bg-white p-2.5 ring-1 ring-red-600/15 sm:w-auto">
            <span className="absolute left-2 top-2 z-10 rounded bg-red-600 px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-white">
              Principal
            </span>
            <div className="mt-4 flex aspect-[4/3] items-center justify-center rounded-md bg-neutral-50 p-2">
              {mainProduct.image_url ? (
                <img
                  src={mainProduct.image_url}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-[0.6875rem] font-semibold leading-snug text-[#0f1f3d]">
              {mainProduct.name}
            </p>
            <p className="mt-1 text-xs font-bold text-[#0f1f3d]">
              <DualPrice usd={mainUnitUsd} />
            </p>
          </article>

          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 sm:gap-3">
              <Plus className="hidden size-4 shrink-0 text-neutral-300 sm:block" aria-hidden="true" />
              <label
                htmlFor={`combo-mockup-${item.id}`}
                className={cn(
                  'flex w-full min-w-[9rem] max-w-[11rem] cursor-pointer flex-col rounded-lg border bg-white p-2.5 transition-colors sm:w-auto',
                  selected[item.id]
                    ? 'border-red-600/40 ring-1 ring-red-600/15'
                    : 'border-neutral-200 hover:border-neutral-300',
                )}
              >
                <Checkbox
                  id={`combo-mockup-${item.id}`}
                  checked={Boolean(selected[item.id])}
                  onCheckedChange={(checked) =>
                    setSelected((prev) => ({ ...prev, [item.id]: checked === true }))
                  }
                  className="size-3.5 border-border data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600"
                  aria-label={`Incluir ${item.name}`}
                />
                <div className="mt-2 flex aspect-[4/3] items-center justify-center rounded-md bg-neutral-50 p-2">
                  <img src={item.image} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
                </div>
                <p className="mt-2 line-clamp-2 text-[0.6875rem] font-semibold leading-snug text-[#0f1f3d]">
                  {item.name}
                </p>
                <p className="mt-1 text-xs font-bold text-[#0f1f3d]">
                  <DualPrice usd={comboItemUsd(item)} />
                </p>
              </label>
              {index < items.length - 1 ? (
                <Plus className="size-4 shrink-0 text-neutral-300 sm:hidden" aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>

        <aside className="flex shrink-0 flex-col justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:min-w-[220px] xl:max-w-[260px]">
          <p className="text-xs font-medium text-neutral-500">Total del combo</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-red-600 sm:text-2xl">
            {formatPenFromUsd(comboTotalUsd)}
          </p>
          {savingsUsd > 0.5 ? (
            <span className="mt-2 inline-flex w-fit rounded border border-red-600/30 bg-white px-2 py-0.5 text-[0.6875rem] font-bold text-red-600">
              Ahorra hasta {formatPenFromUsd(savingsUsd)}
            </span>
          ) : null}
          <Button
            type="button"
            onClick={handleAddSelected}
            className="mt-4 h-10 w-full gap-1.5 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
          >
            <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
            Añadir seleccionados
          </Button>
        </aside>
      </div>
    </section>
  );
}
