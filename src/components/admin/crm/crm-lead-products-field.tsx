import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Package, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { InventoryProductFormDialog } from '@/components/admin/inventory/inventory-product-form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAdminProductsQuery } from '@/hooks/use-admin-dashboard';
import { parseLeadCurrency } from '@/lib/crm-lead-form';
import {
  catalogUnitPriceForLead,
  computeLeadLinesTotal,
  createLeadLineFromProduct,
  recalcLeadLinePrices,
  syncLeadValueFromLines,
} from '@/lib/crm-lead-products';
import { createEmptyInventoryProduct } from '@/lib/inventory-product';
import { formatTpvMoney } from '@/lib/tpv-pricing';
import type { CrmLeadLineItem } from '@/types/crm-lead-form';
import type { CrmLeadCurrency } from '@/types/crm-pipeline';
import type { InventoryProduct, UserRole } from '@/types/product';
import { cn } from '@/lib/utils';

interface CrmLeadProductsFieldProps {
  lineItems: CrmLeadLineItem[];
  customerRole: UserRole;
  currency: string;
  onChange: (lineItems: CrmLeadLineItem[], sync: { valueAmount: string; productName: string }) => void;
}

export function CrmLeadProductsField({
  lineItems,
  customerRole,
  currency,
  onChange,
}: CrmLeadProductsFieldProps) {
  const leadCurrency = parseLeadCurrency(currency) as CrmLeadCurrency;
  const { data: products = [], isLoading } = useAdminProductsQuery();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<InventoryProduct | null>(null);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    if (!q) return sorted;
    return sorted.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand?.toLowerCase().includes(q) ?? false) ||
        (p.category?.toLowerCase().includes(q) ?? false) ||
        p.code.toLowerCase().includes(q),
    );
  }, [products, query]);

  const trimmedQuery = query.trim();
  const canOfferCreate = trimmedQuery.length >= 2;

  const linesTotal = useMemo(() => computeLeadLinesTotal(lineItems), [lineItems]);
  const pricingKeyRef = useRef({ currency, customerRole });

  const applyLines = (next: CrmLeadLineItem[]) => {
    onChange(next, syncLeadValueFromLines(next));
  };

  const addProduct = (product: InventoryProduct) => {
    const exists = lineItems.some((l) => l.productId === product.id);
    const next = exists
      ? lineItems
      : [...lineItems, createLeadLineFromProduct(product, customerRole, leadCurrency)];
    applyLines(next);
    setPickerOpen(false);
    setQuery('');
  };

  const openCreateProduct = (name?: string) => {
    const draft = createEmptyInventoryProduct();
    if (name?.trim()) {
      draft.name = name.trim();
    }
    setCreateDraft(draft);
    setCreateOpen(true);
    setPickerOpen(false);
  };

  const handleProductCreated = (product: InventoryProduct) => {
    addProduct(product);
    toast.success(`«${product.name}» agregado al lead`);
    setCreateOpen(false);
    setCreateDraft(null);
  };

  const updateLine = (id: string, patch: Partial<CrmLeadLineItem>) => {
    applyLines(lineItems.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removeLine = (id: string) => {
    applyLines(lineItems.filter((l) => l.id !== id));
  };

  useEffect(() => {
    if (lineItems.length === 0 || products.length === 0) return;
    const prev = pricingKeyRef.current;
    if (prev.currency === currency && prev.customerRole === customerRole) return;
    pricingKeyRef.current = { currency, customerRole };
    applyLines(recalcLeadLinePrices(lineItems, products, customerRole, leadCurrency));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo moneda / rol
  }, [currency, customerRole, products.length]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-xs font-medium text-foreground">Productos del inventario</Label>
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              disabled={isLoading}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Añadir producto
              <ChevronDown className="size-3 opacity-60" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[min(100vw-2rem,22rem)] p-0"
            align="end"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <div className="space-y-2 border-b p-3">
              <p className="text-xs font-medium text-foreground">Buscar en inventario</p>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre, marca o SKU…"
                className="h-9 text-xs"
                aria-label="Buscar producto del inventario"
              />
              <p className="text-[0.65rem] text-muted-foreground">
                Precio según tipo de cliente y moneda del lead.
              </p>
            </div>
            <ul
              className="max-h-48 overflow-y-auto p-1"
              role="listbox"
              aria-label="Productos del inventario"
            >
              {isLoading ? (
                <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                  Cargando inventario…
                </li>
              ) : filteredProducts.length === 0 ? (
                <li className="px-3 py-3 text-center text-xs text-muted-foreground">
                  {canOfferCreate
                    ? 'No hay coincidencias en el registro.'
                    : 'Escribe al menos 2 caracteres para buscar o crear.'}
                </li>
              ) : (
                filteredProducts.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      role="option"
                      className="flex w-full flex-col rounded-md px-2 py-2 text-left text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => addProduct(product)}
                    >
                      <span className="font-medium text-foreground">{product.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        Lista:{' '}
                        {formatTpvMoney(
                          catalogUnitPriceForLead(product, customerRole, leadCurrency),
                          leadCurrency,
                        )}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="space-y-1 border-t p-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 w-full justify-start gap-2 text-xs"
                onClick={() => openCreateProduct()}
              >
                <Plus className="size-3.5 shrink-0" aria-hidden="true" />
                Crear producto nuevo en inventario
              </Button>
              {canOfferCreate ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-full justify-start gap-2 text-xs"
                  onClick={() => openCreateProduct(trimmedQuery)}
                >
                  <Plus className="size-3.5 shrink-0" aria-hidden="true" />
                  Crear «{trimmedQuery}» y añadir al lead
                </Button>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {lineItems.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          <Package className="mx-auto mb-1 size-5 opacity-50" aria-hidden="true" />
          Añade productos del inventario, créalos si no existen, o escribe el valor manualmente
          abajo.
        </p>
      ) : (
        <ul className="space-y-2" aria-label="Líneas de producto del lead">
          {lineItems.map((line) => {
            const qty = Math.max(1, Math.floor(line.quantity) || 1);
            const unit = Number.parseFloat(line.unitPrice.replace(',', '.')) || 0;
            const subtotal = qty * unit;
            return (
              <li
                key={line.id}
                className="rounded-md border border-border/80 bg-muted/20 p-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 text-xs font-medium leading-snug text-foreground">
                    {line.productName}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Quitar ${line.productName}`}
                    onClick={() => removeLine(line.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div>
                    <Label
                      htmlFor={`crm-line-qty-${line.id}`}
                      className="text-[0.65rem] text-muted-foreground"
                    >
                      Cant.
                    </Label>
                    <Input
                      id={`crm-line-qty-${line.id}`}
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.id, {
                          quantity: Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                        })
                      }
                      className="mt-0.5 h-9 text-xs tabular-nums"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor={`crm-line-price-${line.id}`}
                      className="text-[0.65rem] text-muted-foreground"
                    >
                      Precio unit.
                    </Label>
                    <Input
                      id={`crm-line-price-${line.id}`}
                      type="text"
                      inputMode="decimal"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(line.id, { unitPrice: e.target.value })}
                      className="mt-0.5 h-9 text-xs tabular-nums"
                    />
                  </div>
                  <div className="col-span-2 flex items-end sm:col-span-1">
                    <p className="text-xs tabular-nums text-muted-foreground">
                      Subtotal:{' '}
                      <span className="font-semibold text-foreground">
                        {formatTpvMoney(subtotal, leadCurrency)}
                      </span>
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {lineItems.length > 0 ? (
        <p
          className={cn('text-xs font-medium tabular-nums text-foreground')}
          role="status"
          aria-live="polite"
        >
          Total productos: {formatTpvMoney(linesTotal, leadCurrency)}
          <span className="font-normal text-muted-foreground">
            {' '}
            (actualiza el valor del negocio)
          </span>
        </p>
      ) : null}

      <InventoryProductFormDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setCreateDraft(null);
        }}
        initial={createDraft}
        onCreated={handleProductCreated}
      />
    </div>
  );
}
