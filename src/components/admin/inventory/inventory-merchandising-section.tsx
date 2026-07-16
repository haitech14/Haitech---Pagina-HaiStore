import { useMemo, useState } from 'react';
import { ChevronDown, Info, RefreshCw, ShoppingBag } from 'lucide-react';

import { InventoryFormSection } from '@/components/admin/inventory/inventory-form-section';
import { InventoryOptionalMerchandisingProducts } from '@/components/admin/inventory/inventory-optional-merchandising-products';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  isTonerMerchandisingProduct,
  normalizeMerchandisingOptionalProducts,
  resolveTonerSupplyTypeFromProduct,
  suggestCrossSellProductIds,
} from '@/lib/product-merchandising';
import { normalizeStorefrontUi, resolveStorefrontUi } from '@/lib/product-storefront-detail';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';
import {
  DEFAULT_STOREFRONT_UI,
  type StoredStorefrontUi,
} from '@/types/product-storefront';

type MerchandisingPatch = Pick<
  InventoryProduct,
  | 'cross_sell_product_ids'
  | 'upsell_product_ids'
  | 'cross_sell_optional_products'
  | 'upsell_optional_products'
  | 'storefront_ui'
>;

interface InventoryMerchandisingSectionProps {
  form: InventoryProduct;
  products: InventoryProduct[];
  onChange: (patch: MerchandisingPatch) => void;
  /** Render fields only (no outer card) for the numbered mockup section. */
  embedded?: boolean;
  /** Two-column selectors + short note; optional products stay behind «Más opciones». */
  compact?: boolean;
}

interface ProductMultiSelectFieldProps {
  label: string;
  description: string;
  selectedIds: string[];
  products: InventoryProduct[];
  excludeProductId?: string;
  hideSelectedList?: boolean;
  onChange: (ids: string[]) => void;
}

function ProductMultiSelectField({
  label,
  description,
  selectedIds,
  products,
  excludeProductId,
  hideSelectedList = false,
  onChange,
}: ProductMultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  const [query, setQuery] = useState('');

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product.name])),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sorted = [...products]
      .filter((product) => product.id !== excludeProductId)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
    if (!normalizedQuery) return sorted;
    return sorted.filter((product) => {
      const haystack = `${product.name} ${product.code ?? ''} ${product.id}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [excludeProductId, products, query]);

  const triggerLabel = useMemo(() => {
    if (selectedIds.length === 0) return 'Seleccionar productos';
    if (selectedIds.length === 1) {
      return productById.get(selectedIds[0]!) ?? '1 producto';
    }
    return `${selectedIds.length} productos seleccionados`;
  }, [productById, selectedIds]);

  const toggleId = (id: string, checked: boolean) => {
    setDraftIds((current) =>
      checked ? (current.includes(id) ? current : [...current, id]) : current.filter((entry) => entry !== id),
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraftIds(selectedIds);
      setQuery('');
    }
    setOpen(next);
  };

  const handleApply = () => {
    onChange(draftIds);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-between gap-2 text-left font-normal"
            aria-label={label}
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,24rem)] p-0" align="start">
          <div className="space-y-2 border-b p-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, código o ID…"
              className="h-9 text-sm"
              aria-label={`Buscar productos para ${label}`}
            />
          </div>
          <ul className="max-h-56 overflow-y-auto p-2" role="listbox" aria-label={label}>
            {filteredProducts.length === 0 ? (
              <li className="px-2 py-4 text-center text-xs text-muted-foreground">
                No hay productos que coincidan.
              </li>
            ) : (
              filteredProducts.map((product) => {
                const checked = draftIds.includes(product.id);
                return (
                  <li key={product.id}>
                    <label
                      className={cn(
                        'flex min-h-11 cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-xs hover:bg-muted/60',
                        checked && 'bg-muted/40',
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => toggleId(product.id, value === true)}
                        aria-label={product.name}
                        className="mt-0.5"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block font-medium text-foreground">{product.name}</span>
                        <span className="mt-0.5 block text-[0.6875rem] text-muted-foreground">
                          {product.code || product.id}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>
          <div className="flex justify-end gap-2 border-t p-2">
            <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" size="sm" className="h-9" onClick={handleApply}>
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {!hideSelectedList && selectedIds.length > 0 ? (
        <ul className="space-y-1 rounded-md border border-border/60 bg-muted/20 p-2">
          {selectedIds.map((id) => (
            <li key={id} className="text-xs text-muted-foreground">
              {productById.get(id) ?? id}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function TonerTabPreview({
  form,
  products,
  originalTabLabel,
  compatibleTabLabel,
}: {
  form: InventoryProduct;
  products: InventoryProduct[];
  originalTabLabel: string;
  compatibleTabLabel: string;
}) {
  const grouped = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    const original: InventoryProduct[] = [];
    const compatible: InventoryProduct[] = [];
    const other: InventoryProduct[] = [];

    for (const id of form.cross_sell_product_ids ?? []) {
      const product = byId.get(id);
      if (!product) continue;
      const asCatalog = { ...product, price: product.prices.public };
      if (!isTonerMerchandisingProduct(asCatalog)) {
        other.push(product);
        continue;
      }
      if (resolveTonerSupplyTypeFromProduct(asCatalog) === 'compatible') {
        compatible.push(product);
      } else {
        original.push(product);
      }
    }

    return { original, compatible, other };
  }, [form.cross_sell_product_ids, products]);

  if (
    grouped.original.length === 0 &&
    grouped.compatible.length === 0 &&
    grouped.other.length === 0
  ) {
    return (
      <p className="rounded-md border border-dashed border-border/70 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
        Sin productos en venta cruzada. Usa el selector o «Sincronizar» para llenar las pestañas
        Original / Compatible de la ficha.
      </p>
    );
  }

  const renderGroup = (title: string, items: InventoryProduct[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
          {title} ({items.length})
        </p>
        <ul className="space-y-0.5">
          {items.map((product) => (
            <li key={product.id} className="truncate text-xs text-foreground">
              {product.name}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="grid gap-3 rounded-md border border-border/60 bg-muted/15 p-3 sm:grid-cols-2">
      {renderGroup(originalTabLabel, grouped.original)}
      {renderGroup(compatibleTabLabel, grouped.compatible)}
      {grouped.other.length > 0 ? (
        <div className="space-y-1 sm:col-span-2">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Otros relacionados ({grouped.other.length})
          </p>
          <ul className="space-y-0.5">
            {grouped.other.map((product) => (
              <li key={product.id} className="truncate text-xs text-muted-foreground">
                {product.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function InventoryMerchandisingSection({
  form,
  products,
  onChange,
  embedded = false,
  compact = false,
}: InventoryMerchandisingSectionProps) {
  const suggestedCrossSellIds = useMemo(
    () => suggestCrossSellProductIds(form, products),
    [form, products],
  );
  const [showOptional, setShowOptional] = useState(false);
  const resolvedUi = useMemo(() => resolveStorefrontUi(form.storefront_ui), [form.storefront_ui]);

  const crossSellOptional = form.cross_sell_optional_products ?? [];
  const upsellOptional = form.upsell_optional_products ?? [];

  const patchAll = (patch: Partial<MerchandisingPatch>) => {
    onChange({
      cross_sell_product_ids: form.cross_sell_product_ids ?? [],
      upsell_product_ids: form.upsell_product_ids ?? [],
      cross_sell_optional_products: crossSellOptional,
      upsell_optional_products: upsellOptional,
      ...(form.storefront_ui != null ? { storefront_ui: form.storefront_ui } : {}),
      ...patch,
    });
  };

  const patchStorefrontUi = (patch: Partial<StoredStorefrontUi>) => {
    const merged: StoredStorefrontUi = {
      ...(form.storefront_ui ?? {}),
      ...patch,
    };
    patchAll({ storefront_ui: normalizeStorefrontUi(merged) ?? null });
  };

  const handleSyncCrossSell = () => {
    if (suggestedCrossSellIds.length === 0) return;
    patchAll({ cross_sell_product_ids: suggestedCrossSellIds });
  };

  const selectors = (
    <div className={cn(compact ? 'grid gap-4 sm:grid-cols-2' : 'space-y-5')}>
      <div className="space-y-2">
        <ProductMultiSelectField
          label="Tóner del hero (Original / Compatible)"
          description={
            compact
              ? 'Alimenta las pestañas Toner de la ficha. La pestaña se infiere del nombre (compatible vs original).'
              : 'Tóner en el selector del hero (pestañas Original / Compatible). Otros consumibles van a «Configura tu equipo».'
          }
          selectedIds={form.cross_sell_product_ids ?? []}
          products={products}
          hideSelectedList
          {...(form.id ? { excludeProductId: form.id } : {})}
          onChange={(cross_sell_product_ids) => patchAll({ cross_sell_product_ids })}
        />
        <TonerTabPreview
          form={form}
          products={products}
          originalTabLabel={resolvedUi.tonerOriginalTabLabel}
          compatibleTabLabel={resolvedUi.tonerCompatibleTabLabel}
        />
      </div>

      <ProductMultiSelectField
        label="Upselling"
        description={
          compact
            ? 'Complementos para «Configura tu equipo».'
            : 'Tarjetas en el carrusel «Configura tu equipo»; al seleccionarlas se suman al total del equipo.'
        }
        selectedIds={form.upsell_product_ids ?? []}
        products={products}
        {...(form.id ? { excludeProductId: form.id } : {})}
        onChange={(upsell_product_ids) => patchAll({ upsell_product_ids })}
      />
    </div>
  );

  const syncRow = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        disabled={suggestedCrossSellIds.length === 0}
        onClick={handleSyncCrossSell}
      >
        <RefreshCw className="size-3.5" aria-hidden="true" />
        Sincronizar desde consumibles del modelo
      </Button>
      {suggestedCrossSellIds.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Sugerencia: {suggestedCrossSellIds.length} producto
          {suggestedCrossSellIds.length === 1 ? '' : 's'} detectados.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          No se detectaron consumibles de tóner para este modelo.
        </p>
      )}
    </div>
  );

  const storefrontUiBlock = (
    <div className="space-y-4 rounded-md border border-border/70 bg-muted/10 p-3">
      <div>
        <p className="text-sm font-medium text-foreground">Bloque Toner y acciones de copiar</p>
        <p className="text-xs text-muted-foreground">
          Textos de la ficha y visibilidad de «Copiar imagen» / «Copiar texto».
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="storefront-ui-section-title">Título sección</Label>
          <Input
            id="storefront-ui-section-title"
            value={form.storefront_ui?.tonerSectionTitle ?? ''}
            placeholder={DEFAULT_STOREFRONT_UI.tonerSectionTitle}
            onChange={(event) =>
              patchStorefrontUi({ tonerSectionTitle: event.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="storefront-ui-original-tab">Pestaña original</Label>
          <Input
            id="storefront-ui-original-tab"
            value={form.storefront_ui?.tonerOriginalTabLabel ?? ''}
            placeholder={DEFAULT_STOREFRONT_UI.tonerOriginalTabLabel}
            onChange={(event) =>
              patchStorefrontUi({ tonerOriginalTabLabel: event.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="storefront-ui-compatible-tab">Pestaña compatible</Label>
          <Input
            id="storefront-ui-compatible-tab"
            value={form.storefront_ui?.tonerCompatibleTabLabel ?? ''}
            placeholder={DEFAULT_STOREFRONT_UI.tonerCompatibleTabLabel}
            onChange={(event) =>
              patchStorefrontUi({ tonerCompatibleTabLabel: event.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="storefront-ui-original-card">Título tarjeta original</Label>
          <Input
            id="storefront-ui-original-card"
            value={form.storefront_ui?.tonerOriginalCardTitle ?? ''}
            placeholder={DEFAULT_STOREFRONT_UI.tonerOriginalCardTitle}
            onChange={(event) =>
              patchStorefrontUi({ tonerOriginalCardTitle: event.target.value })
            }
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="storefront-ui-compatible-card">Título tarjeta compatible</Label>
          <Input
            id="storefront-ui-compatible-card"
            value={form.storefront_ui?.tonerCompatibleCardTitle ?? ''}
            placeholder={DEFAULT_STOREFRONT_UI.tonerCompatibleCardTitle}
            onChange={(event) =>
              patchStorefrontUi({ tonerCompatibleCardTitle: event.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-2 border-t border-border/60 pt-3">
        <p className="text-xs font-medium text-foreground">Acciones de copiar</p>
        <label className="flex items-start gap-2 text-xs">
          <Checkbox
            checked={resolvedUi.showGalleryCopyImage}
            onCheckedChange={(value) =>
              patchStorefrontUi({ showGalleryCopyImage: value === true })
            }
            className="mt-0.5"
            aria-label="Mostrar Copiar imagen en foto principal"
          />
          <span>Mostrar «Copiar imagen» en la foto principal</span>
        </label>
        <label className="flex items-start gap-2 text-xs">
          <Checkbox
            checked={resolvedUi.showGalleryCopyText}
            onCheckedChange={(value) =>
              patchStorefrontUi({ showGalleryCopyText: value === true })
            }
            className="mt-0.5"
            aria-label="Mostrar Copiar texto en foto principal"
          />
          <span>Mostrar «Copiar texto» en la foto principal</span>
        </label>
        <label className="flex items-start gap-2 text-xs">
          <Checkbox
            checked={resolvedUi.showTonerCopyActions}
            onCheckedChange={(value) =>
              patchStorefrontUi({ showTonerCopyActions: value === true })
            }
            className="mt-0.5"
            aria-label="Mostrar copiar en miniaturas de tóner"
          />
          <span>Mostrar copiar imagen / texto en miniaturas del listado Toner</span>
        </label>
      </div>
    </div>
  );

  const optionalBlock = (
    <div className="space-y-4">
      <InventoryOptionalMerchandisingProducts
        label="Productos opcionales — venta cruzada"
        description="Accesorios o servicios sin ficha en inventario."
        items={crossSellOptional}
        onChange={(cross_sell_optional_products) =>
          patchAll({
            cross_sell_optional_products: normalizeMerchandisingOptionalProducts(
              cross_sell_optional_products,
            ),
          })
        }
      />
      <InventoryOptionalMerchandisingProducts
        label="Productos opcionales — upselling"
        description="Complementos personalizados que no necesitan existir en el inventario."
        items={upsellOptional}
        onChange={(upsell_optional_products) =>
          patchAll({
            upsell_optional_products: normalizeMerchandisingOptionalProducts(
              upsell_optional_products,
            ),
          })
        }
      />
    </div>
  );

  const note = (
    <p className="flex items-start gap-2 rounded-md border border-sky-200/80 bg-sky-50 px-3 py-2 text-xs text-sky-900">
      <Info className="mt-0.5 size-3.5 shrink-0 text-sky-600" aria-hidden="true" />
      Los tóners de venta cruzada alimentan las pestañas Original / Compatible del hero; el resto
      aparece en «Configura tu equipo».
    </p>
  );

  const content = compact ? (
    <div className="space-y-4">
      {selectors}
      {syncRow}
      {storefrontUiBlock}
      <div className="flex justify-start">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground"
          onClick={() => setShowOptional((value) => !value)}
        >
          {showOptional ? 'Ocultar opciones avanzadas' : 'Más opciones (productos sin inventario)'}
        </Button>
      </div>
      {showOptional ? optionalBlock : null}
      {note}
    </div>
  ) : (
    <div className="space-y-5">
      {selectors}
      {storefrontUiBlock}
      {optionalBlock}
      {syncRow}
      {note}
    </div>
  );

  if (embedded) return content;

  return (
    <InventoryFormSection
      title="Ventas cruzadas y upselling"
      icon={ShoppingBag}
      description="Sugerencias en la ficha del equipo: tóner en el selector del hero; repuestos y accesorios en «Configura tu equipo»."
    >
      {content}
    </InventoryFormSection>
  );
}
