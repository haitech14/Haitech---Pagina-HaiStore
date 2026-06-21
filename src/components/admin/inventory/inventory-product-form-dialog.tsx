import type { ChangeEvent, ClipboardEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  CircleDollarSign,
  ClipboardList,
  ListTree,
  Package,
  Tags,
  Users,
} from 'lucide-react';

import { InventoryAttributesFieldset } from '@/components/admin/inventory/inventory-attributes-fieldset';
import { InventoryFormSection } from '@/components/admin/inventory/inventory-form-section';
import { InventoryInventorySection } from '@/components/admin/inventory/inventory-inventory-section';
import {
  InventoryPhotoPreview,
  InventoryPhotoUploadBox,
} from '@/components/admin/inventory/inventory-photo-upload-box';
import { InventoryPricesGrid } from '@/components/admin/inventory/inventory-prices-grid';
import { InventorySelectField } from '@/components/admin/inventory/inventory-select-field';
import { InventorySuppliersFieldset } from '@/components/admin/inventory/inventory-suppliers-fieldset';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAdminInventory, useInventoryMutations } from '@/hooks/use-products';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { useWarehouses } from '@/hooks/use-warehouses';
import { buildBrandSelectOptions } from '@/lib/inventory-brand-options';
import {
  buildCategorySelectGroups,
  collectOrphanCategoryLabels,
} from '@/lib/inventory-category-options';
import { DEFAULT_WAREHOUSES } from '@/lib/inventory-stock';
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

export type InventoryProductFormFocusSection =
  | 'title'
  | 'image'
  | 'attributes'
  | 'category';

interface InventoryProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: InventoryProduct | null;
  /** Tras crear un producto (no en edición). */
  onCreated?: (product: InventoryProduct) => void;
  /** Desplaza el foco a una sección al abrir (edición rápida desde tabla). */
  focusSection?: InventoryProductFormFocusSection | null;
}

const FOCUS_SECTION_TARGETS: Record<
  InventoryProductFormFocusSection,
  { id: string; focusInput?: boolean }
> = {
  title: { id: 'inv-name', focusInput: true },
  image: { id: 'inv-photos-section' },
  attributes: { id: 'inv-attributes-fieldset' },
  category: { id: 'inv-category' },
};

export function InventoryProductFormDialog({
  open,
  onOpenChange,
  initial,
  onCreated,
  focusSection = null,
}: InventoryProductFormDialogProps) {
  const isEdit = Boolean(initial?.id);
  const { createProduct, updateProduct } = useInventoryMutations();
  const { data: warehouses = DEFAULT_WAREHOUSES } = useWarehouses();
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const { data: inventoryProducts = [] } = useAdminInventory();
  const [form, setForm] = useState<InventoryProduct>(initial ?? createEmptyInventoryProduct());
  const [error, setError] = useState<string | null>(null);

  const categoryGroups = useMemo(() => {
    const orphans = collectOrphanCategoryLabels(categoryTree, [form.category ?? '']);
    return buildCategorySelectGroups(categoryTree, orphans);
  }, [categoryTree, form.category]);

  const brandOptions = useMemo(
    () => buildBrandSelectOptions(inventoryProducts, form.brand),
    [inventoryProducts, form.brand],
  );

  useEffect(() => {
    if (open) {
      const base = initial ?? createEmptyInventoryProduct();
      setForm(normalizeInventoryProduct(base, warehouses));
      setError(null);
    }
  }, [open, initial, warehouses]);

  useEffect(() => {
    if (!open || !focusSection) return;

    const target = FOCUS_SECTION_TARGETS[focusSection];
    const timer = window.setTimeout(() => {
      const element = document.getElementById(target.id);
      if (!element) return;
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-red-500', 'ring-offset-2');
      window.setTimeout(() => {
        element.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2');
      }, 1800);
      if (target.focusInput) {
        const input = element instanceof HTMLInputElement ? element : element.querySelector('input');
        if (input instanceof HTMLInputElement) input.focus();
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [open, focusSection, initial?.id]);

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
      const gallery = url ? [url, ...prev.gallery.filter((item) => item !== url)] : prev.gallery;
      return { ...prev, image_url: url, gallery };
    });
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

  const handleMainImageFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    try {
      setMainImage(await readImageFile(file));
      setError(null);
    } catch {
      setError('No se pudo cargar la imagen principal.');
    }
  };

  const handleGalleryFiles = async (files: FileList) => {
    if (!files.length) return;
    try {
      await appendImages([...files]);
      setError(null);
    } catch {
      setError('No se pudieron cargar las imágenes de la galería.');
    }
  };

  const handlePhotosPaste = async (event: ClipboardEvent<HTMLDivElement>) => {
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
        const saved = await createProduct.mutateAsync(
          await prepareInventoryPayloadForApi(form, { isCreate: true }),
        );
        onCreated?.(saved);
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el producto';
      setError(
        message.includes('Sesión') || message.includes('permisos')
          ? `${message} Si el servidor estaba guardando, espera unos segundos e intenta de nuevo sin cerrar sesión.`
          : message,
      );
    }
  };

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[72rem]">
        <DialogHeader className="shrink-0 space-y-1 border-b border-border/60 bg-card px-6 py-5 pr-14 text-left">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Completa los datos principales, fotos, stock y precios.
          </DialogDescription>
        </DialogHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div
            className="min-h-0 flex-1 overflow-y-auto bg-muted/35 px-6 py-5"
            onPaste={(event) => void handlePhotosPaste(event)}
          >
            <div className="grid gap-4 md:grid-cols-2 md:items-start">
              <div className="space-y-4">
                <InventoryFormSection title="Información básica" icon={ClipboardList}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="inv-code">Código</Label>
                      <Input
                        id="inv-code"
                        className="h-10 bg-background"
                        value={form.code}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          updateField('code', event.target.value.toUpperCase())
                        }
                        placeholder="Ej. SKU-001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inv-name">Nombre</Label>
                      <Input
                        id="inv-name"
                        className="h-10 bg-background"
                        value={form.name}
                        onChange={(event) => updateField('name', event.target.value)}
                        placeholder="Nombre del producto"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inv-description">Descripción</Label>
                      <Textarea
                        id="inv-description"
                        className="min-h-[6.5rem] resize-y bg-background"
                        value={form.description ?? ''}
                        onChange={(event) => updateField('description', event.target.value)}
                        placeholder="Describe las características del producto..."
                        rows={4}
                      />
                    </div>
                  </div>
                </InventoryFormSection>

              <InventoryFormSection title="Clasificación" icon={Tags}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InventorySelectField
                    id="inv-category"
                    label="Categoría"
                    placeholder="Elegir categoría..."
                    value={form.category ?? ''}
                    onChange={(value) => updateField('category', value || null)}
                    groups={categoryGroups}
                  />
                  <InventorySelectField
                    id="inv-brand"
                    label="Marca"
                    placeholder="Elegir marca..."
                    value={form.brand ?? ''}
                    onChange={(value) => updateField('brand', value || null)}
                    options={brandOptions}
                  />
                </div>
              </InventoryFormSection>

              <InventoryFormSection
                id="inv-photos-section"
                title="Fotos del producto"
                icon={Camera}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <InventoryPhotoUploadBox
                    label="Foto principal"
                    uploadLabel="Subir imagen"
                    hint="JPG, PNG o WebP. Máx. 5MB"
                    onFiles={(files) => void handleMainImageFiles(files)}
                    preview={
                      form.image_url ? (
                        <InventoryPhotoPreview
                          src={form.image_url}
                          alt="Vista previa de la foto principal"
                          onRemove={() => setMainImage(null)}
                        />
                      ) : null
                    }
                  />
                  <InventoryPhotoUploadBox
                    label="Galería"
                    uploadLabel="Subir imágenes"
                    hint="Múltiples archivos. Máx. 20MB"
                    multiple
                    onFiles={(files) => void handleGalleryFiles(files)}
                    preview={
                      form.gallery.length > 0 ? (
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {form.gallery.map((url) => (
                            <li key={url}>
                              <InventoryPhotoPreview
                                src={url}
                                alt=""
                                size="thumb"
                                onRemove={() => removeGalleryUrl(url)}
                              />
                            </li>
                          ))}
                        </ul>
                      ) : null
                    }
                  />
                </div>
              </InventoryFormSection>
            </div>

            <div className="space-y-4">
              <InventoryFormSection title="Inventario" icon={Package}>
                <InventoryInventorySection
                  form={form}
                  warehouses={warehouses}
                  onChange={(stockFields) =>
                    setForm((current) => ({ ...current, ...stockFields }))
                  }
                />
              </InventoryFormSection>

              <InventoryFormSection
                title="Proveedores"
                icon={Users}
                description="Asocia uno o más proveedores con tu precio de compra."
              >
                <InventorySuppliersFieldset
                  embedded
                  suppliers={form.suppliers ?? []}
                  onChange={handleSuppliersChange}
                />
              </InventoryFormSection>

              <InventoryFormSection
                title="Atributos"
                icon={ListTree}
                description="Especificaciones del producto (color, velocidad, tamaño, etc.)."
              >
                <InventoryAttributesFieldset
                  embedded
                  attributes={form.attributes ?? []}
                  onChange={(attributes: ProductAttribute[]) =>
                    updateField('attributes', attributes)
                  }
                />
              </InventoryFormSection>

              <InventoryFormSection
                title="Precios"
                icon={CircleDollarSign}
                description="Los valores se redondean a enteros terminados en 9 (ej. 2.188 → 2.199)."
              >
                <InventoryPricesGrid
                  purchasePriceUsd={form.purchase_price_usd}
                  onPurchaseChange={(value) =>
                    updateField('purchase_price_usd', Number(value) || 0)
                  }
                  prices={form.prices}
                  onPriceChange={updatePrice}
                  purchaseFromSuppliers={supplierCount > 0}
                />
              </InventoryFormSection>
            </div>
            </div>
          </div>

          {error ? (
            <p role="alert" className="mx-6 mb-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter className="shrink-0 gap-2 border-t border-border/60 bg-card px-6 py-4 sm:justify-end">
            <Button type="button" variant="outline" className="h-10 px-5" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-10 min-w-[9.5rem] bg-red-600 px-5 text-white hover:bg-red-500"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
