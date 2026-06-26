import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

import { ProductCardImage } from '@/components/product/product-card-image';
import { CartQuoteDialog } from '@/components/cart/cart-quote-dialog';
import { formatOrderQuantityHint, ON_REQUEST_STOCK_BADGE_CLASS } from '@/components/cart/add-to-cart-button';
import { DualPrice } from '@/components/product-showcase-card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCart, cartLineUnitUsd } from '@/context/cart-context';
import { getPaidEquipmentOptions } from '@/lib/equipment-config-selection';
import { SEMINUEVA_PREPARATION_LABELS } from '@/lib/seminueva-preparation';
import { resolveCartItemDetailPath } from '@/lib/service-to-cart';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { cn, formatUsd } from '@/lib/utils';

export function ShoppingCartDrawer() {
  const {
    items,
    totalItems,
    totalPrice,
    isOpen,
    highlightProductId,
    setCartOpen,
    updateQuantity,
    removeItem,
    clear,
  } = useCart();
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col gap-0 p-0 sm:max-w-md"
        aria-describedby={undefined}
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="size-5 text-red-600" aria-hidden="true" />
            Carrito de compras
            {totalItems > 0 ? (
              <span className="text-sm font-normal text-muted-foreground">
                ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
              </span>
            ) : null}
          </SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <ShoppingBag className="size-12 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
              <Button asChild variant="outline" className="min-h-11" onClick={() => setCartOpen(false)}>
                <Link to="/tienda">Explorar productos</Link>
              </Button>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto px-4 py-3" aria-label="Productos en el carrito">
              {items.map((item) => {
                const { product, quantity, lineId, configuration, preparationType } = item;
                const imageUrl = resolveProductImageUrl(product);
                const isHighlighted = highlightProductId === product.id;
                const lineUnitUsd = cartLineUnitUsd(item);
                const paidOptions = getPaidEquipmentOptions(configuration?.options ?? []);
                const orderHint = formatOrderQuantityHint(product, quantity);
                const detailPath = resolveCartItemDetailPath(product);

                return (
                  <li
                    key={lineId}
                    className={cn(
                      'mb-3 rounded-lg border border-border p-3 transition-colors duration-500 motion-reduce:transition-none',
                      isHighlighted && 'cart-line-highlight border-red-300 bg-red-50/80',
                    )}
                  >
                    <div className="flex gap-3">
                      <Link
                        to={detailPath}
                        onClick={() => setCartOpen(false)}
                        className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted/60 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {imageUrl ? (
                          <ProductCardImage
                            src={imageUrl}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground" aria-hidden="true">
                            {product.name.charAt(0)}
                          </span>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          to={detailPath}
                          onClick={() => setCartOpen(false)}
                          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1 text-sm font-bold">
                          <DualPrice usd={lineUnitUsd * quantity} />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatUsd(lineUnitUsd)} c/u
                        </p>

                        {orderHint ? (
                          <p className={cn('mt-1 text-xs', ON_REQUEST_STOCK_BADGE_CLASS)}>
                            {orderHint}
                          </p>
                        ) : null}

                        {paidOptions.length > 0 ? (
                          <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                            {paidOptions.map((option) => (
                              <li key={option.optionId}>
                                + {option.optionName}{' '}
                                <span className="font-semibold text-[#0f1f3d]">
                                  (S/ {option.pricePen.toLocaleString('es-PE')})
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : null}

                        {preparationType === 'semirepotenciada' ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Preparado:{' '}
                            <span className="font-semibold text-[#0f1f3d]">
                              {SEMINUEVA_PREPARATION_LABELS.semirepotenciada}
                            </span>
                          </p>
                        ) : null}

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center rounded-md border border-border">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 shrink-0 rounded-none"
                              aria-label={`Quitar una unidad de ${product.name}`}
                              onClick={() => updateQuantity(lineId, quantity - 1)}
                            >
                              <Minus className="size-4" aria-hidden="true" />
                            </Button>
                            <span
                              className="min-w-8 text-center text-sm font-semibold tabular-nums"
                              aria-label={
                                orderHint ? `Cantidad: ${quantity} (${orderHint})` : `Cantidad: ${quantity}`
                              }
                              title={orderHint ?? undefined}
                            >
                              {quantity}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 shrink-0 rounded-none"
                              aria-label={`Añadir una unidad de ${product.name}`}
                              onClick={() => updateQuantity(lineId, quantity + 1)}
                            >
                              <Plus className="size-4" aria-hidden="true" />
                            </Button>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                            aria-label={`Eliminar ${product.name} del carrito`}
                            onClick={() => removeItem(lineId)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {items.length > 0 ? (
            <div className="border-t border-border bg-background px-5 py-4">
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold">
                  <DualPrice usd={totalPrice} />
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild className="min-h-11 w-full bg-red-600 hover:bg-red-500">
                  <Link to="/checkout" onClick={() => setCartOpen(false)}>
                    Ir al checkout
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setQuoteOpen(true)}
                >
                  <FileText className="size-4 shrink-0" aria-hidden="true" />
                  Generar cotización
                </Button>
                <Button asChild variant="outline" className="min-h-11 w-full">
                  <Link to="/tienda" onClick={() => setCartOpen(false)}>
                    Seguir comprando
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 text-sm text-muted-foreground"
                  onClick={clear}
                >
                  Vaciar carrito
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>

      <CartQuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} items={items} />
    </Sheet>
  );
}
