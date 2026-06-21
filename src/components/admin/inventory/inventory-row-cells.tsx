import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { formatInventoryProductName } from '@/lib/inventory-product-name';
import { isBundleProduct, TONER_PACK_LABEL } from '@/lib/product-bundle';
import { formatProductDisplayCode } from '@/lib/product-display-code';

import { InventoryInlinePriceEdit } from '@/components/admin/inventory/inventory-inline-price-edit';
import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  getUsdToPenPurchaseRate,
  getUsdToPenSaleRate,
  normalizeUsdToPenRate,
} from '@/lib/exchange-rate';
import {
  appendGalleryImagesToProduct,
  appendGalleryVideosToProduct,
  appendYoutubeToProduct,
  prepareInventoryPayloadForApi,
} from '@/lib/inventory-product';

import { InventoryAttributesCell } from '@/components/admin/inventory/inventory-attributes-cell';
import { InventoryPurchasePriceDisplay } from '@/components/admin/inventory/inventory-purchase-price-display';
import { InventorySalePrice } from '@/components/admin/inventory/inventory-sale-price';
import { InventoryStockBadge } from '@/components/admin/inventory/inventory-stock-badge';
import { InventoryImagePreviewDialog } from '@/components/admin/inventory/inventory-image-preview-dialog';
import { InventoryInlineField } from '@/components/admin/inventory/inventory-inline-field';
import { InventoryMediaCell } from '@/components/admin/inventory/inventory-media-cells';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  categoryInventoryLabel,
  listRootCategories,
  listSubcategories,
  resolveProductCategoryPlacement,
} from '@/lib/inventory-product-category';
import {
  type InventoryReorderableColumnId,
} from '@/lib/inventory-table-columns';
import { normalizeAttributes, getProductAttributeValue, upsertProductAttribute } from '@/lib/inventory-attributes';
import { stockFromTotal } from '@/lib/inventory-stock';
import {
  PRICE_ROLE_LABELS,
  isPriceRole,
  type InventoryProduct,
  type InventoryWarehouse,
  type PriceRole,
  type ProductAttribute,
} from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

interface InventoryRowCellsProps {
  product: InventoryProduct;
  columnId: InventoryReorderableColumnId;
  categoryTree: StoreCategoryTreeNode[];
  warehouses: InventoryWarehouse[];
  onPatch: (patch: Partial<InventoryProduct>) => Promise<void>;
}

const NO_SUB = '__none__';

export function InventoryRowCells({
  product,
  columnId,
  categoryTree,
  warehouses,
  onPatch,
}: InventoryRowCellsProps) {
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [addingGallery, setAddingGallery] = useState(false);
  const { data: company } = useCompanySettings();

  const saleExchangeRate = normalizeUsdToPenRate(
    company?.usdToPenExchangeRate ?? getUsdToPenSaleRate(),
  );
  const purchaseExchangeRate = normalizeUsdToPenRate(
    company?.usdToPenPurchaseExchangeRate ??
      company?.usdToPenExchangeRate ??
      getUsdToPenPurchaseRate(),
  );

  const placement = useMemo(
    () => resolveProductCategoryPlacement(categoryTree, product.category),
    [categoryTree, product.category],
  );

  const fieldKey = (suffix: string) => `${product.id}:${suffix}`;

  const close = () => setActiveFieldId(null);

  const saveText = async (key: keyof InventoryProduct, value: string) => {
    const trimmed = value.trim();
    if (key === 'name' && !trimmed) return;
    await onPatch({ [key]: trimmed || null } as Partial<InventoryProduct>);
    close();
  };

  const saveStock = async (value: string) => {
    const stockPatch = stockFromTotal(Number(value) || 0, warehouses);
    await onPatch({
      stock: stockPatch.stock,
      stock_by_warehouse: stockPatch.stock_by_warehouse,
    });
    close();
  };

  const saveGramajeAttribute = async (value: string) => {
    await onPatch({
      attributes: upsertProductAttribute(product.attributes, 'Gramaje', value),
    });
    close();
  };

  const savePriceUsd = async (role: PriceRole, usd: number) => {
    const currentUsd = product.prices[role] ?? 0;
    if (Math.abs(currentUsd - usd) < 0.0001) return;

    try {
      await onPatch({
        prices: { ...product.prices, [role]: usd },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo guardar el precio del producto',
      );
      throw error;
    }
  };

  const savePurchaseUsd = async (usd: number) => {
    const currentUsd = product.purchase_price_usd ?? 0;
    if (Math.abs(currentUsd - usd) < 0.0001) return;

    const suppliers = product.suppliers ?? [];
    const syncedSuppliers =
      suppliers.length > 0
        ? suppliers.map((supplier, index) =>
            index === 0 ? { ...supplier, purchase_price_usd: usd } : supplier,
          )
        : suppliers;

    try {
      await onPatch({
        purchase_price_usd: usd,
        ...(syncedSuppliers.length > 0 ? { suppliers: syncedSuppliers } : {}),
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo guardar el precio de compra',
      );
      throw error;
    }
  };

  const saveParentCategory = async (parentId: string) => {
    const parent = listRootCategories(categoryTree).find((node) => node.id === parentId);
    if (!parent) return;
    await onPatch({ category: categoryInventoryLabel(parent) });
    close();
  };

  const saveSubcategory = async (subId: string) => {
    if (subId === NO_SUB) {
      if (placement.parent) {
        await onPatch({ category: categoryInventoryLabel(placement.parent) });
      }
      close();
      return;
    }
    const sub = listSubcategories(categoryTree, placement.parent?.id ?? null).find(
      (node) => node.id === subId,
    );
    if (!sub) return;
    await onPatch({ category: categoryInventoryLabel(sub) });
    close();
  };

  if (columnId === 'media') {
    const saveMedia = async (media: Pick<InventoryProduct, 'image_url' | 'gallery'>) => {
      const payload = await prepareInventoryPayloadForApi({ ...product, ...media });
      await onPatch({ image_url: payload.image_url, gallery: payload.gallery });
    };

    const persistUploadedFiles = async (files: FileList, limit?: number) => {
      const selected = limit ? [files[0]].filter((file): file is File => Boolean(file)) : [...files];
      if (selected.length === 0) return;

      setAddingGallery(true);
      try {
        const media = await appendGalleryImagesToProduct(product, selected);
        await saveMedia(media);
        toast.success(selected.length === 1 ? 'Imagen guardada' : 'Imágenes guardadas');
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'No se pudo guardar la imagen del producto',
        );
        throw error;
      } finally {
        setAddingGallery(false);
      }
    };

    const persistUploadedVideos = async (files: FileList) => {
      const selected = [...files];
      if (selected.length === 0) return;

      setAddingGallery(true);
      try {
        const media = await appendGalleryVideosToProduct(product, selected);
        await saveMedia(media);
        toast.success(selected.length === 1 ? 'Vídeo guardado' : 'Vídeos guardados');
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'No se pudo guardar el vídeo del producto',
        );
        throw error;
      } finally {
        setAddingGallery(false);
      }
    };

    const persistYoutubeUrl = async (youtubeInput: string) => {
      setAddingGallery(true);
      try {
        const media = appendYoutubeToProduct(product, youtubeInput);
        await saveMedia(media);
        toast.success('Vídeo de YouTube agregado');
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'No se pudo agregar el vídeo de YouTube',
        );
        throw error;
      } finally {
        setAddingGallery(false);
      }
    };

    const handleUploadMain = (files: FileList) => persistUploadedFiles(files, 1);
    const handleAddGallery = (files: FileList) => persistUploadedFiles(files);

    return (
      <>
        <InventoryMediaCell
          product={product}
          onPreview={() => setPreviewOpen(true)}
          onUploadMain={handleUploadMain}
          onAddGallery={handleAddGallery}
          onAddVideo={persistUploadedVideos}
          onAddYoutube={persistYoutubeUrl}
          isAddingGallery={addingGallery}
        />
        <InventoryImagePreviewDialog
          product={product}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          onSaveMedia={saveMedia}
        />
      </>
    );
  }

  if (columnId === 'code') {
    return (
      <InventoryInlineField
        fieldId={fieldKey('code')}
        activeFieldId={activeFieldId}
        onActivate={() => setActiveFieldId(fieldKey('code'))}
        onClose={close}
        display={
          <code className="block truncate rounded bg-muted px-1 py-0.5 text-[0.7rem] font-semibold tabular-nums">
            {formatProductDisplayCode(product.code, { brand: product.brand }) ?? product.code}
          </code>
        }
        edit={
          <Input
            className="h-9 text-xs"
            defaultValue={product.code}
            autoFocus
            onBlur={(event) => void saveText('code', event.target.value)}
          />
        }
      />
    );
  }

  if (columnId === 'product') {
    const bundleProduct = isBundleProduct(product);
    const displayCode =
      formatProductDisplayCode(product.code, { brand: product.brand }) ?? product.code?.trim();
    return (
      <InventoryInlineField
        fieldId={fieldKey('name')}
        activeFieldId={activeFieldId}
        onActivate={() => setActiveFieldId(fieldKey('name'))}
        onClose={close}
        display={
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="line-clamp-2 font-semibold leading-snug">
                {formatInventoryProductName(product.name)}
              </p>
              {bundleProduct ? (
                <Badge variant="secondary" className="shrink-0 text-[0.65rem]">
                  {TONER_PACK_LABEL}
                </Badge>
              ) : null}
            </div>
            {displayCode ? (
              <p className="mt-0.5 font-mono text-[0.65rem] text-muted-foreground">{displayCode}</p>
            ) : null}
          </div>
        }
        edit={
          <div className="space-y-1">
            <Input
              className="h-9"
              defaultValue={product.name}
              aria-label="Título del producto"
              autoFocus
              onBlur={(event) => void saveText('name', event.target.value)}
            />
          </div>
        }
      />
    );
  }

  if (columnId === 'brand') {
    return (
      <InventoryInlineField
        fieldId={fieldKey('brand')}
        activeFieldId={activeFieldId}
        onActivate={() => setActiveFieldId(fieldKey('brand'))}
        onClose={close}
        display={
          <p className="line-clamp-2 text-sm text-foreground">{product.brand?.trim() || '—'}</p>
        }
        edit={
          <Input
            className="h-9 text-xs"
            defaultValue={product.brand ?? ''}
            aria-label="Marca"
            autoFocus
            onBlur={(event) => void saveText('brand', event.target.value)}
          />
        }
      />
    );
  }

  if (columnId === 'gramaje') {
    const gramaje = getProductAttributeValue(product.attributes, 'Gramaje');
    return (
      <InventoryInlineField
        fieldId={fieldKey('gramaje')}
        activeFieldId={activeFieldId}
        onActivate={() => setActiveFieldId(fieldKey('gramaje'))}
        onClose={close}
        display={<p className="line-clamp-2 text-sm">{gramaje || '—'}</p>}
        edit={
          <Input
            className="h-9 text-xs"
            defaultValue={gramaje}
            aria-label="Gramaje"
            autoFocus
            onBlur={(event) => void saveGramajeAttribute(event.target.value)}
          />
        }
      />
    );
  }

  if (columnId === 'description') {
    return (
      <InventoryInlineField
        fieldId={fieldKey('description')}
        activeFieldId={activeFieldId}
        onActivate={() => setActiveFieldId(fieldKey('description'))}
        onClose={close}
        display={
          <p className="line-clamp-3 text-xs leading-snug text-muted-foreground">
            {product.description?.trim() || '—'}
          </p>
        }
        edit={
          <Input
            className="h-9 text-xs"
            defaultValue={product.description ?? ''}
            aria-label="Descripción"
            autoFocus
            onBlur={(event) => void saveText('description', event.target.value)}
          />
        }
      />
    );
  }

  if (columnId === 'installation') {
    const installation = getProductAttributeValue(product.attributes, 'Instalación');
    return (
      <p className="line-clamp-4 whitespace-pre-line text-xs leading-snug text-muted-foreground">
        {installation || '—'}
      </p>
    );
  }

  if (columnId === 'attributes') {
    return (
      <InventoryAttributesCell
        attributes={product.attributes ?? []}
        onSave={async (attributes: ProductAttribute[]) => {
          await onPatch({ attributes: normalizeAttributes(attributes) });
        }}
      />
    );
  }

  if (columnId === 'category') {
    const roots = listRootCategories(categoryTree);
    const subs = listSubcategories(categoryTree, placement.parent?.id ?? null);

    return (
      <InventoryInlineField
        fieldId={fieldKey('category')}
        activeFieldId={activeFieldId}
        onActivate={() => setActiveFieldId(fieldKey('category'))}
        onClose={close}
        display={
          placement.parent || placement.sub || placement.raw ? (
            <div className="flex flex-wrap items-center gap-1">
              {placement.parent ? (
                <Badge
                  variant="secondary"
                  className="rounded-md bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground shadow-none"
                >
                  {placement.parent.name}
                </Badge>
              ) : placement.raw ? (
                <Badge
                  variant="outline"
                  className="rounded-md bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground shadow-none"
                >
                  {placement.raw}
                </Badge>
              ) : null}
              {placement.sub ? (
                <Badge
                  variant="outline"
                  className="rounded-md bg-muted px-2 py-0.5 text-[0.65rem] font-normal text-muted-foreground shadow-none"
                >
                  {placement.sub.name}
                </Badge>
              ) : null}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        }
        edit={
          <div className="space-y-2 min-w-[10rem]">
            <Select
              defaultValue={placement.parent?.id ?? ''}
              onValueChange={(value) => void saveParentCategory(value)}
            >
              <SelectTrigger className="h-9 w-full" aria-label="Categoría">
                <SelectValue placeholder="Elegir categoría" />
              </SelectTrigger>
              <SelectContent>
                {roots.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              defaultValue={placement.sub?.id ?? NO_SUB}
              onValueChange={(value) => void saveSubcategory(value)}
              disabled={!placement.parent || subs.length === 0}
            >
              <SelectTrigger className="h-9 w-full" aria-label="Subcategoría">
                <SelectValue placeholder="Subcategoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SUB}>Sin subcategoría</SelectItem>
                {subs.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
    );
  }

  if (columnId === 'stock') {
    if (isBundleProduct(product)) {
      return (
        <div className="flex justify-center" title="Stock derivado de los 4 tóner del pack">
          <InventoryStockBadge product={product} warehouses={warehouses} />
        </div>
      );
    }

    return (
      <InventoryInlineField
        fieldId={fieldKey('stock')}
        activeFieldId={activeFieldId}
        onActivate={() => setActiveFieldId(fieldKey('stock'))}
        onClose={close}
        display={
          <div className="flex justify-center">
            <InventoryStockBadge product={product} warehouses={warehouses} />
          </div>
        }
        edit={
          <Input
            type="number"
            min={0}
            step={1}
            className="h-9 w-20"
            defaultValue={product.stock}
            autoFocus
            onBlur={(event) => void saveStock(event.target.value)}
          />
        }
      />
    );
  }

  if (columnId === 'purchase') {
    return (
      <InventoryInlineField
        fieldId={fieldKey('purchase')}
        activeFieldId={activeFieldId}
        onActivate={() => setActiveFieldId(fieldKey('purchase'))}
        onClose={close}
        align="end"
        display={
          <InventoryPurchasePriceDisplay
            product={product}
            exchangeRate={purchaseExchangeRate}
          />
        }
        edit={
          <InventoryInlinePriceEdit
            usd={product.purchase_price_usd}
            exchangeRate={purchaseExchangeRate}
            ariaLabel="Precio de compra"
            onSave={savePurchaseUsd}
            onClose={close}
          />
        }
      />
    );
  }

  if (columnId.startsWith('price_')) {
    const roleSuffix = columnId.slice('price_'.length);
    if (!isPriceRole(roleSuffix)) return null;
    const role = roleSuffix as PriceRole;
    const bundleProduct = isBundleProduct(product);
    if (bundleProduct) {
      return (
        <div className="flex justify-end" title="Precio sumado de los 4 tóner del pack">
          <InventorySalePrice
            saleUsd={product.prices[role]}
            purchaseUsd={product.purchase_price_usd}
            priceRole={role}
            embedded
          />
        </div>
      );
    }

    return (
      <InventoryInlineField
        fieldId={fieldKey(columnId)}
        activeFieldId={activeFieldId}
        onActivate={() => setActiveFieldId(fieldKey(columnId))}
        onClose={close}
        align="end"
        display={
          <InventorySalePrice
            saleUsd={product.prices[role]}
            purchaseUsd={product.purchase_price_usd}
            priceRole={role}
            embedded
          />
        }
        edit={
          <InventoryInlinePriceEdit
            usd={product.prices[role]}
            exchangeRate={saleExchangeRate}
            ariaLabel={PRICE_ROLE_LABELS[role]}
            onSave={(usd) => savePriceUsd(role, usd)}
            onClose={close}
          />
        }
      />
    );
  }

  return null;
}
