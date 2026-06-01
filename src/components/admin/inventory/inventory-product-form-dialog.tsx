import type { ChangeEvent, ClipboardEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InventoryAttributesFieldset } from '@/components/admin/inventory/inventory-attributes-fieldset';
import { InventoryMultiSelectField } from '@/components/admin/inventory/inventory-multi-select-field';
import { InventoryStockFieldset } from '@/components/admin/inventory/inventory-stock-fieldset';
import { InventorySuppliersFieldset } from '@/components/admin/inventory/inventory-suppliers-fieldset';
import { InventoryRolePricesFieldset } from '@/components/admin/inventory/inventory-role-prices-fieldset';
import { useAdminInventory, useInventoryMutations } from '@/hooks/use-products';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { useWarehouses } from '@/hooks/use-warehouses';
import { buildBrandSelectOptions } from '@/lib/inventory-brand-options';
import { buildCategorySelectOptions } from '@/lib/inventory-category-options';
import { DEFAULT_WAREHOUSES } from '@/lib/inventory-stock';
import { joinInventoryTagList, parseInventoryTagList } from '@/lib/inventory-tags';
import { resolvePurchasePriceUsd } from '@/lib/inventory-suppliers';
import {
  createEmptyInventoryProduct,
  getImageFilesFromClipboard,
  normalizeInventoryProduct,
  prepareInventoryPayloadForApi,
  readImageFile,
} from '@/lib/inventory-product';
import type {
  InventoryProduct,
  InventorySupplier,
  ProductAttribute,
  ProductRolePrices,
} from '@/types/product';

interface InventoryProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: InventoryProduct | null;
}

export function InventoryProductFormDialog({
  open,
  onOpenChange,
  initial,
}: InventoryProductFormDialogProps) {
  const isEdit = Boolean(initial?.id);
  const { createProduct, updateProduct } = useInventoryMutations();
  const { data: warehouses = DEFAULT_WAREHOUSES } = useWarehouses();
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const { data: inventoryProducts = [] } = useAdminInventory();
  const [form, setForm] = useState<InventoryProduct>(initial ?? createEmptyInventoryProduct());
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => buildCategorySelectOptions(categoryTree, [form.category ?? '']),
    [categoryTree, form.category],
  );

  const brandOptions = useMemo(
    () => buildBrandSelectOptions(inventoryProducts, form.brand),
    [inventoryProducts, form.brand],
  );

  const selectedCategories = useMemo(
    () => parseInventoryTagList(form.category),
    [form.category],
  );

  const selectedBrands = useMemo(() => parseInventoryTagList(form.brand), [form.brand]);

  useEffect(() => {
    if (open) {
      const base = initial ?? createEmptyInventoryProduct();
      setForm(normalizeInventoryProduct(base, warehouses));
      setError(null);
    }
  }, [open, initial, warehouses]);

  const handleSuppliersChange = (suppliers: InventorySupplier[]) => {
    setForm((prev) => ({
      ...prev,
      suppliers,
      purchase_price_usd: resolvePurchasePriceUsd(suppliers, prev.purchase_price_usd),
    }));
  };

  const supplierCount = form.suppliers?.length ?? 0;

  const updateField = <K extends keyof InventoryProduct>(key: K, value: InventoryProduct[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updatePrice = (key: keyof ProductRolePrices, value: string) => {
    setForm((prev) => ({
      ...prev,
      prices: { ...prev.prices, [key]: Number(value) || 0 },
    }));
  };

  const setMainImage = (url: string | null) => {
    setForm((prev) => {
      const gallery = url
        ? [url, ...prev.gallery.filter((item) => item !== url)]
        : prev.gallery;
      return { ...prev, image_url: url, gallery };
    });
  };

  const handleMainImageFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setMainImage(await readImageFile(file));
    } catch {
      setError('No se pudo cargar la imagen principal.');
    }
    event.target.value = '';
  };

  const handleGalleryFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    try {
      await appendImages([...files]);
    } catch {
      setError('No se pudieron cargar las imágenes de la galería.');
    }
    event.target.value = '';
  };

  const appendImages = async (files: File[]) => {
    if (files.length === 0) return;
    const urls = await Promise.all(files.map((file) => readImageFile(file)));
    setForm((prev) => {
      const newUrls = urls.filter((url) => !prev.gallery.includes(url));
      const image_url = prev.image_url ?? newUrls[0] ?? null;
      const gallery = [
        ...(image_url ? [image_url] : []),
        ...prev.gallery.filter((item) => item !== image_url),
        ...newUrls.filter((url) => url !== image_url),
      ];
      return { ...prev, image_url, gallery };
    });
  };

  const handlePhotosPaste = async (event: ClipboardEvent<HTMLFieldSetElement>) => {
    const files = getImageFilesFromClipboard(event.clipboardData);
    if (files.length === 0) return;
    event.preventDefault();
    try {
      await appendImages(files);
      setError(null);
    } catch {
      setError('No se pudo pegar la imagen desde el portapapeles.');
    }
  };

  const removeGalleryUrl = (url: string) => {
    setForm((prev) => {
      const gallery = prev.gallery.filter((item) => item !== url);
      const image_url = prev.image_url === url ? (gallery[0] ?? null) : prev.image_url;
      return { ...prev, gallery, image_url };
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (isEdit && initial) {
        await updateProduct.mutateAsync({
          id: initial.id,
          payload: await prepareInventoryPayloadForApi(form),
        });
      } else {
        await createProduct.mutateAsync(
          await prepareInventoryPayloadForApi(form, { isCreate: true }),
        );
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto');
    }
  };

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          <DialogDescription>
            Código, imágenes, stock y precios en USD (los soles se calculan automáticamente en la
            tabla).
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inv-code">Código</Label>
              <Input
                id="inv-code"
                value={form.code}
                onChange={(event) => updateField('code', event.target.value.toUpperCase())}
                placeholder="SKU-001"
                required
              />
            </div>
            <InventoryStockFieldset
              form={form}
              warehouses={warehouses}
              onChange={(stockFields) =>
                setForm((current) => ({ ...current, ...stockFields }))
              }
            />
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="inv-name">Nombre</Label>
              <Input
                id="inv-name"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="inv-description">Descripción</Label>
              <Input
                id="inv-description"
                value={form.description ?? ''}
                onChange={(event) => updateField('description', event.target.value)}
              />
            </div>
            <InventoryMultiSelectField
              id="inv-category"
              label="Categoría"
              placeholder="Elegir categorías…"
              searchPlaceholder="Buscar categoría…"
              options={categoryOptions}
              selected={selectedCategories}
              onChange={(values) => updateField('category', joinInventoryTagList(values) || null)}
            />
            <InventoryMultiSelectField
              id="inv-brand"
              label="Marca"
              placeholder="Elegir marcas…"
              searchPlaceholder="Buscar marca…"
              options={brandOptions}
              selected={selectedBrands}
              onChange={(values) => updateField('brand', joinInventoryTagList(values) || null)}
            />
          </div>

          <fieldset
            className="rounded-lg border p-4 outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            tabIndex={0}
            onPaste={(event) => void handlePhotosPaste(event)}
            aria-label="Foto y galería del producto"
          >
            <legend className="px-1 text-sm font-medium">Foto y galería</legend>
            <p className="mt-2 text-xs text-muted-foreground">
              Haz clic aquí y pega imágenes con Ctrl+V (o Cmd+V). Se optimizan a WebP (~1200px).
            </p>

            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="inv-image-file">Foto principal</Label>
                <Input
                  id="inv-image-file"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={(event) => void handleMainImageFile(event)}
                />
                {form.image_url ? (
                  <div className="relative w-fit">
                    <img
                      src={form.image_url}
                      alt="Vista previa de la foto principal"
                      className="max-h-32 w-auto max-w-full rounded-md border object-contain"
                    />
                    <button
                      type="button"
                      className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Quitar foto principal"
                      onClick={() => setMainImage(null)}
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Sin foto principal</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="inv-gallery-files">Galería</Label>
                <Input
                  id="inv-gallery-files"
                  type="file"
                  accept="image/*"
                  multiple
                  className="cursor-pointer"
                  onChange={(event) => void handleGalleryFiles(event)}
                />
                {form.gallery.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {form.gallery.map((url) => (
                      <li key={url} className="relative">
                        <img
                          src={url}
                          alt=""
                          className="size-16 rounded-md border object-cover"
                        />
                        <button
                          type="button"
                          className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Quitar imagen de la galería"
                          onClick={() => removeGalleryUrl(url)}
                        >
                          <X className="size-3.5" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">Sin imágenes en la galería</p>
                )}
              </div>
            </div>
          </fieldset>

          <InventorySuppliersFieldset
            suppliers={form.suppliers ?? []}
            onChange={handleSuppliersChange}
          />

          <InventoryAttributesFieldset
            attributes={form.attributes ?? []}
            onChange={(attributes: ProductAttribute[]) => updateField('attributes', attributes)}
          />

          <InventoryRolePricesFieldset
            purchasePriceUsd={form.purchase_price_usd}
            onPurchaseChange={(value) =>
              updateField('purchase_price_usd', Number(value) || 0)
            }
            prices={form.prices}
            onPriceChange={updatePrice}
            purchaseFromSuppliers={supplierCount > 0}
          />

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-500" disabled={isSaving}>
              {isSaving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
