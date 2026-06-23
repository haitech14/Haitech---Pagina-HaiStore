import type { ChangeEvent, ClipboardEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  CircleDollarSign,
  ClipboardList,
  ListTree,
  Users,
} from 'lucide-react';

import { MediaAlbumPickerDialog } from '@/components/admin/media-album/media-album-picker-dialog';
import { InventoryAttributesFieldset } from '@/components/admin/inventory/inventory-attributes-fieldset';
import { InventoryFormSection } from '@/components/admin/inventory/inventory-form-section';
import { InventoryInventorySection } from '@/components/admin/inventory/inventory-inventory-section';
import {
  InventoryPhotoPreview,
  InventoryPhotoUploadBox,
} from '@/components/admin/inventory/inventory-photo-upload-box';
import { InventoryProductResourceFields } from '@/components/admin/inventory/inventory-product-resource-fields';
import { InventoryPricesGrid } from '@/components/admin/inventory/inventory-prices-grid';
import { InventoryVolumeRolePricesSection } from '@/components/admin/inventory/inventory-volume-role-prices-section';
import { InventorySelectField } from '@/components/admin/inventory/inventory-select-field';
import { InventoryStorefrontDetailSection } from '@/components/admin/inventory/inventory-storefront-detail-section';
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
import { uploadFileToMediaAlbum } from '@/hooks/use-media-album';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { useWarehouses } from '@/hooks/use-warehouses';
import { buildBrandSelectOptions } from '@/lib/inventory-brand-options';
import {
  buildCategorySelectGroups,
  collectOrphanCategoryLabels,
} from '@/lib/inventory-category-options';
import { DEFAULT_WAREHOUSES } from '@/lib/inventory-stock';
import { normalizeProductGalleryFields } from '@/lib/product-gallery';
import { resolvePurchasePriceUsd } from '@/lib/inventory-suppliers';
import {
  createEmptyInventoryProduct,
  getImageFilesFromClipboard,
  normalizeInventoryProduct,
  prepareInventoryPayloadForApi,
  readImageFile,
  removeProductMediaUrl,
} from '@/lib/inventory-product';
import { isImageMediaUrl } from '@/lib/product-media';
import type {
  InventoryProduct,
  InventorySupplier,
  ProductAttribute,
  ProductRolePrices,
  ProductVolumeRolePriceTier,
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
  const [albumPicker, setAlbumPicker] = useState<'main' | 'gallery' | null>(null);

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

  const updateVolumeRolePrices = (tiers: ProductVolumeRolePriceTier[]) => {
    updateField('volume_role_prices', tiers);
  };

  const setMainImage = (url: string | null) => {
    setForm((prev) => ({
      ...prev,
      ...normalizeProductGalleryFields(url, prev.gallery),
    }));
  };

  const appendGalleryUrls = (urls: string[]) => {
    if (urls.length === 0) return;
    setForm((prev) => {
      const current = normalizeProductGalleryFields(prev.image_url, prev.gallery);
      const newUrls = urls.filter((url) => url !== current.image_url && !current.gallery.includes(url));
      return {
        ...prev,
        ...normalizeProductGalleryFields(current.image_url, [...current.gallery, ...newUrls]),
      };
    });
  };

  const uploadFilesToAlbum = async (files: File[]) => {
    const items = await Promise.all(
      files.map((file) => uploadFileToMediaAlbum(file, readImageFile)),
    );
    return items.map((item) => item.url);
  };

  const appendImages = async (files: File[]) => {
    if (files.length === 0) return;
    appendGalleryUrls(await uploadFilesToAlbum(files));
  };

  const handleMainImageFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    try {
      const urls = await uploadFilesToAlbum([file]);
      setMainImage(urls[0] ?? null);
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
    setForm((prev) => ({ ...prev, ...removeProductMediaUrl(prev, url) }));
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
    <>
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
                <InventoryFormSection title="Información del producto" icon={ClipboardList}>
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
                    <InventoryInventorySection
                      form={form}
                      warehouses={warehouses}
                      onChange={(stockFields) =>
                        setForm((current) => ({ ...current, ...stockFields }))
                      }
                    />
                  </div>
                </InventoryFormSection>

              <InventoryFormSection
                id="inv-photos-section"
                title="Fotos y recursos"
                icon={Camera}
              >
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InventoryPhotoUploadBox
                      label="Foto principal"
                      uploadLabel="Subir imagen"
                      hint="JPG, PNG o WebP. Se optimiza y guarda en el álbum."
                      onFiles={(files) => void handleMainImageFiles(files)}
                      onPickFromAlbum={() => setAlbumPicker('main')}
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
                      hint="Múltiples archivos. No repite la foto principal."
                      multiple
                      onFiles={(files) => void handleGalleryFiles(files)}
                      onPickFromAlbum={() => setAlbumPicker('gallery')}
                      preview={
                        form.gallery.filter((url) => isImageMediaUrl(url)).length > 0 ? (
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {form.gallery
                              .filter((url) => isImageMediaUrl(url))
                              .map((url) => (
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
                  <InventoryProductResourceFields
                    form={form}
                    onAttachmentsChange={(attachments) => updateField('attachments', attachments)}
                    onVideoChange={(media) =>
                      setForm((prev) => ({ ...prev, ...media }))
                    }
                    onError={setError}
                  />
                </div>
              </InventoryFormSection>
            </div>

            <div className="space-y-4">
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

              <InventoryStorefrontDetailSection
                form={form}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
              />

              <InventoryFormSection
                title="Precios"
                icon={CircleDollarSign}
                description="Los precios de venta en soles se redondean a la centésima más cercana terminada en 9 (ej. 10.04 → 10.09). El precio de compra usa el tipo de cambio exacto."
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
                <InventoryVolumeRolePricesSection
                  tiers={form.volume_role_prices ?? []}
                  basePrices={form.prices}
                  onChange={updateVolumeRolePrices}
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

    <MediaAlbumPickerDialog
      open={albumPicker !== null}
      onOpenChange={(next) => {
        if (!next) setAlbumPicker(null);
      }}
      mode={albumPicker === 'main' ? 'single' : 'multiple'}
      excludeUrls={
        albumPicker === 'gallery' && form.image_url ? [form.image_url] : []
      }
      title={albumPicker === 'main' ? 'Foto principal desde el álbum' : 'Galería desde el álbum'}
      description={
        albumPicker === 'gallery'
          ? 'Las imágenes elegidas se añaden a la galería sin repetir la foto principal.'
          : 'Elige una imagen optimizada del álbum interno.'
      }
      onConfirm={(items) => {
        if (albumPicker === 'main') {
          const url = items[0]?.url;
          if (url && isImageMediaUrl(url)) {
            setMainImage(url);
          }
        } else {
          appendGalleryUrls(items.map((item) => item.url));
        }
        setAlbumPicker(null);
        setError(null);
      }}
    />
    </>
  );
}
