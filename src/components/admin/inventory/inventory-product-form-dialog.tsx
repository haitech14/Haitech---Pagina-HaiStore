import type { ChangeEvent, ClipboardEvent, FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  CircleDollarSign,
  ClipboardList,
  Copy,
  Eye,
  Link2,
  ListTree,
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
import {
  InventoryProductFormTabs,
  type InventoryProductFormTabId,
} from '@/components/admin/inventory/inventory-product-form-tabs';
import { InventoryPricesGrid } from '@/components/admin/inventory/inventory-prices-grid';
import { InventoryPreparationPricesSection } from '@/components/admin/inventory/inventory-preparation-prices-section';
import { InventoryVolumeRolePricesSection } from '@/components/admin/inventory/inventory-volume-role-prices-section';
import { InventorySelectField } from '@/components/admin/inventory/inventory-select-field';
import { InventoryMerchandisingSection } from '@/components/admin/inventory/inventory-merchandising-section';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { appendProductGalleryUrls, setProductMainImageUrl } from '@/lib/product-gallery';
import { PRODUCT_IMAGE_UPLOAD_HINT } from '@/lib/product-media-upload-limits';
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
import { descriptionTextToHeroBullets } from '@/lib/product-storefront-detail';
import {
  buildProductMetaDescriptionSeo,
  formatProductPageTitleSeo,
  suggestProductSlug,
} from '@/lib/seo';
import type {
  InventoryProduct,
  InventorySupplier,
  ProductAttribute,
  ProductRolePrices,
  ProductVolumeRolePriceTier,
  SeminuevaPreparationPrices,
} from '@/types/product';

export type InventoryProductFormFocusSection =
  | 'title'
  | 'image'
  | 'attributes'
  | 'category'
  | 'stock'
  | 'prices';

interface InventoryProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: InventoryProduct | null;
  /** Tras crear un producto (no en edición). */
  onCreated?: (product: InventoryProduct) => void;
  /** Tras guardar una edición (la mutación ya invalida el catálogo). */
  onSaved?: (product: InventoryProduct) => void;
  /** Desplaza el foco a una sección al abrir (edición rápida desde tabla). */
  focusSection?: InventoryProductFormFocusSection | null;
}

const FOCUS_SECTION_TARGETS: Record<
  InventoryProductFormFocusSection,
  { id: string; tab: InventoryProductFormTabId; focusInput?: boolean }
> = {
  title: { id: 'inv-name', tab: 'general', focusInput: true },
  image: { id: 'inv-photos-section', tab: 'fotos' },
  attributes: { id: 'inv-attributes-fieldset', tab: 'atributos' },
  category: { id: 'inv-category', tab: 'atributos' },
  stock: { id: 'inv-stock-total', tab: 'precios', focusInput: true },
  prices: { id: 'inv-prices-section', tab: 'precios' },
};

const VISIBILITY_OPTIONS = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'activa', label: 'Activa (visible en tienda)' },
  { value: 'inactiva', label: 'Inactiva (oculta)' },
] as const;

export function InventoryProductFormDialog({
  open,
  onOpenChange,
  initial,
  onCreated,
  onSaved,
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
  const albumPickerRef = useRef<'main' | 'gallery' | null>(null);
  const [slugCopied, setSlugCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<InventoryProductFormTabId>('general');

  const openAlbumPicker = (mode: 'main' | 'gallery') => {
    albumPickerRef.current = mode;
    setAlbumPicker(mode);
  };

  const closeAlbumPicker = () => {
    albumPickerRef.current = null;
    setAlbumPicker(null);
  };

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
      setSlugCopied(false);
      setActiveTab(focusSection ? FOCUS_SECTION_TARGETS[focusSection].tab : 'general');
    }
  }, [open, initial, warehouses, focusSection]);

  useEffect(() => {
    if (!open || !focusSection) return;

    const target = FOCUS_SECTION_TARGETS[focusSection];
    setActiveTab(target.tab);
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
    }, 160);

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

  const seoPreview = useMemo(() => {
    const previewProduct = {
      id: form.id || 'preview',
      name: form.name,
      description: form.description,
      brand: form.brand,
      category: form.category,
      code: form.code,
      slug: form.slug,
      price: form.prices.public,
      prices: form.prices,
      currency: form.currency,
      stock: form.stock,
      attributes: form.attributes,
    };
    return {
      title: formatProductPageTitleSeo(previewProduct),
      description: buildProductMetaDescriptionSeo(previewProduct),
      slug: suggestProductSlug(previewProduct),
    };
  }, [form]);

  const slugPath = `/tienda/${form.slug?.trim() || seoPreview.slug || '…'}`;

  const updateField = <K extends keyof InventoryProduct>(key: K, value: InventoryProduct[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateDescription = (description: string) => {
    setForm((prev) => {
      // Lista vacía explícita = el usuario quitó las destacadas: no regenerar desde descripción.
      if (
        Array.isArray(prev.storefront_hero_bullets) &&
        prev.storefront_hero_bullets.length === 0
      ) {
        return { ...prev, description };
      }

      const shouldSyncHeroBullets =
        Array.isArray(prev.storefront_hero_bullets) && prev.storefront_hero_bullets.length > 0;

      if (!shouldSyncHeroBullets) {
        return { ...prev, description };
      }

      return {
        ...prev,
        description,
        storefront_hero_bullets: descriptionTextToHeroBullets(
          description,
          prev.storefront_hero_bullets ?? [],
        ),
      };
    });
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

  const updatePreparationPrices = (preparation_prices: SeminuevaPreparationPrices | undefined) => {
    setForm((prev) => {
      if (!preparation_prices) {
        const { preparation_prices: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, preparation_prices };
    });
  };

  const setMainImage = (url: string | null) => {
    setForm((prev) => ({
      ...prev,
      ...setProductMainImageUrl(prev.image_url, prev.gallery, url),
    }));
  };

  const appendGalleryUrls = (urls: string[]) => {
    if (urls.length === 0) return;
    setForm((prev) => ({
      ...prev,
      ...appendProductGalleryUrls(prev.image_url, prev.gallery, urls),
    }));
  };

  const uploadFilesToAlbum = async (files: File[]) => {
    // Secuencial: evita carreras en media-album.json y fallos opacos con Promise.all.
    const urls: string[] = [];
    for (const file of files) {
      const item = await uploadFileToMediaAlbum(file, readImageFile);
      if (!item?.url) {
        throw new Error(`La subida de «${file.name}» no devolvió una URL válida`);
      }
      urls.push(item.url);
    }
    return urls;
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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo cargar la imagen principal.',
      );
    }
  };

  const handleGalleryFiles = async (files: FileList) => {
    if (!files.length) return;
    try {
      await appendImages([...files]);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las imágenes de la galería.',
      );
    }
  };

  const handlePhotosPaste = async (event: ClipboardEvent<HTMLDivElement>) => {
    // No interceptar Ctrl+V / pegar en inputs o Descripción: el portapapeles
    // a menudo incluye imagen + texto (Word, Excel, web) y preventDefault
    // bloqueaba el pegado de descripción multilínea.
    const pasteTarget = event.target;
    if (
      pasteTarget instanceof HTMLElement &&
      (pasteTarget.closest('input, textarea, select, [contenteditable="true"]') ||
        pasteTarget.isContentEditable)
    ) {
      return;
    }

    const files = getImageFilesFromClipboard(event.clipboardData);
    if (files.length === 0) return;
    event.preventDefault();
    try {
      await appendImages(files);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo pegar la imagen desde el portapapeles.',
      );
    }
  };

  const removeGalleryUrl = (url: string) => {
    setForm((prev) => ({ ...prev, ...removeProductMediaUrl(prev, url) }));
  };

  const copySlug = async () => {
    const value = form.slug?.trim() || seoPreview.slug;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setSlugCopied(true);
      window.setTimeout(() => setSlugCopied(false), 1500);
    } catch {
      setError('No se pudo copiar el slug.');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.code.trim()) {
      setError('El código es obligatorio.');
      setActiveTab('general');
      return;
    }
    if (!form.name.trim()) {
      setError('El nombre del producto es obligatorio.');
      setActiveTab('general');
      return;
    }
    try {
      if (isEdit && initial) {
        const saved = await updateProduct.mutateAsync({
          id: initial.id,
          payload: await prepareInventoryPayloadForApi(form),
        });
        onSaved?.(saved);
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
  const galleryImages = (form.gallery ?? []).filter((url) => isImageMediaUrl(url));

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[92vh] w-[min(100vw-1.5rem,72rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[72rem]"
        overlayClassName="bg-black/45"
        onPointerDownOutside={(event) => {
          // El álbum vive en otro Dialog: no cerrar el formulario al interactuar con él.
          if (albumPickerRef.current !== null) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (albumPickerRef.current !== null) event.preventDefault();
        }}
        onFocusOutside={(event) => {
          if (albumPickerRef.current !== null) event.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border/60 bg-card px-6 py-4 pr-14 text-left sm:py-5">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground sm:text-[0.95rem]">
            Completa los datos principales, fotos, stock y precios.
          </DialogDescription>
        </DialogHeader>

        <InventoryProductFormTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div
            className="min-h-0 flex-1 overflow-y-auto bg-slate-100/80 px-4 py-4 text-sm sm:px-6 sm:py-5"
            onPaste={(event) => void handlePhotosPaste(event)}
          >
            {/* —— General: vista resumen 2 + 3 columnas —— */}
            {activeTab === 'general' ? (
            <div
              role="tabpanel"
              aria-labelledby="inv-tab-general"
              className="space-y-4"
            >
              <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
                <InventoryFormSection title="Información principal" icon={ClipboardList}>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="inv-code">Código</Label>
                        <Input
                          id="inv-code"
                          className="h-10 bg-background font-mono text-sm"
                          value={form.code}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            updateField('code', event.target.value.toUpperCase())
                          }
                          placeholder="Se genera al crear"
                        />
                        {!isEdit ? (
                          <p className="text-xs text-muted-foreground">
                            Generado automáticamente; puedes editarlo.
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inv-visibility">Visibilidad</Label>
                        <Select
                          value={form.status ?? 'borrador'}
                          onValueChange={(value) =>
                            updateField(
                              'status',
                              value as NonNullable<InventoryProduct['status']>,
                            )
                          }
                        >
                          <SelectTrigger id="inv-visibility" className="h-10 bg-background">
                            <SelectValue placeholder="Visibilidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {VISIBILITY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inv-name">Nombre del producto</Label>
                      <Input
                        id="inv-name"
                        className="h-10 bg-background text-sm"
                        value={form.name}
                        onChange={(event) => updateField('name', event.target.value)}
                        onBlur={() => {
                          if (!form.slug?.trim() && form.name.trim()) {
                            updateField(
                              'slug',
                              suggestProductSlug({
                                id: form.id,
                                name: form.name,
                                slug: form.slug,
                                brand: form.brand,
                                category: form.category,
                                attributes: form.attributes,
                              }),
                            );
                          }
                        }}
                        placeholder="Nombre del producto"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inv-slug">URL amigable (slug SEO)</Label>
                      <div className="relative">
                        <Input
                          id="inv-slug"
                          className="h-10 bg-background pr-10 font-mono text-sm"
                          value={form.slug ?? ''}
                          onChange={(event) =>
                            updateField('slug', event.target.value.toLowerCase().trim() || null)
                          }
                          placeholder={seoPreview.slug}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground"
                          aria-label={slugCopied ? 'Slug copiado' : 'Copiar slug'}
                          onClick={() => void copySlug()}
                        >
                          <Copy className="size-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inv-description">Descripción</Label>
                      <Textarea
                        id="inv-description"
                        className="min-h-[6.5rem] resize-y bg-background text-sm"
                        value={form.description ?? ''}
                        onChange={(event) => updateDescription(event.target.value)}
                        placeholder="Una línea por especificación destacada…"
                        rows={4}
                      />
                    </div>

                    <InventoryStorefrontDetailSection
                      embedded
                      variant="horizontal"
                      form={form}
                      onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                    />
                  </div>
                </InventoryFormSection>

                <InventoryFormSection
                  id="inv-prices-section-general"
                  title="Proveedor y precios"
                  icon={CircleDollarSign}
                  actions={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setActiveTab('precios')}
                    >
                      Editar
                    </Button>
                  }
                >
                  <div className="space-y-4">
                    <InventorySuppliersFieldset
                      embedded
                      suppliers={form.suppliers ?? []}
                      onChange={handleSuppliersChange}
                    />
                    <InventoryPricesGrid
                      purchasePriceUsd={form.purchase_price_usd}
                      onPurchaseChange={(value) =>
                        updateField('purchase_price_usd', Number(value) || 0)
                      }
                      prices={form.prices}
                      onPriceChange={updatePrice}
                      purchaseFromSuppliers={supplierCount > 0}
                    />
                    <InventoryInventorySection
                      showLocation
                      form={form}
                      warehouses={warehouses}
                      onChange={(stockFields) =>
                        setForm((current) => ({ ...current, ...stockFields }))
                      }
                    />
                  </div>
                </InventoryFormSection>
              </div>

              <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
                <InventoryFormSection
                  title="Clasificación y atributos"
                  icon={ListTree}
                  actions={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setActiveTab('atributos')}
                    >
                      Editar
                    </Button>
                  }
                >
                  <div className="space-y-3">
                    <div className="grid gap-3">
                      <InventorySelectField
                        id="inv-category-general"
                        label="Categoría"
                        placeholder="Elegir categoría..."
                        value={form.category ?? ''}
                        onChange={(value) => updateField('category', value || null)}
                        groups={categoryGroups}
                      />
                      <InventorySelectField
                        id="inv-brand-general"
                        label="Marca"
                        placeholder="Elegir marca..."
                        value={form.brand ?? ''}
                        onChange={(value) => updateField('brand', value || null)}
                        options={brandOptions}
                      />
                    </div>
                    {(form.attributes ?? []).length > 0 ? (
                      <div className="overflow-hidden rounded-md border border-border/70">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                            <tr>
                              <th className="px-3 py-2 font-medium">Atributo</th>
                              <th className="px-3 py-2 font-medium">Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(form.attributes ?? []).slice(0, 6).map((attr, index) => (
                              <tr key={`${attr.name}-${index}`} className="border-t border-border/60">
                                <td className="px-3 py-2 text-muted-foreground">{attr.name}</td>
                                <td className="px-3 py-2 font-medium text-foreground">{attr.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Sin atributos. Usa «Editar» para añadirlos.
                      </p>
                    )}
                  </div>
                </InventoryFormSection>

                <InventoryFormSection
                  id="inv-photos-section-general"
                  title="Fotos y recursos"
                  icon={Camera}
                  actions={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setActiveTab('fotos')}
                    >
                      Editar
                    </Button>
                  }
                >
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Foto principal</Label>
                      {form.image_url ? (
                        <InventoryPhotoPreview
                          src={form.image_url}
                          alt="Vista previa de la foto principal"
                          onRemove={() => setMainImage(null)}
                        />
                      ) : (
                        <InventoryPhotoUploadBox
                          label=""
                          uploadLabel="Subir imagen"
                          hint="Foto principal."
                          uploadLimitHint={PRODUCT_IMAGE_UPLOAD_HINT}
                          onFiles={(files) => void handleMainImageFiles(files)}
                          onPickFromAlbum={() => openAlbumPicker('main')}
                          className="[&_button]:min-h-[6rem] [&_button]:py-3"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Galería</Label>
                      {galleryImages.length > 0 ? (
                        <ul className="flex flex-wrap gap-2">
                          {galleryImages.slice(0, 4).map((url) => (
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
                      ) : (
                        <InventoryPhotoUploadBox
                          label=""
                          uploadLabel="Arrastra o sube"
                          hint="Varias imágenes."
                          uploadLimitHint={PRODUCT_IMAGE_UPLOAD_HINT}
                          multiple
                          onFiles={(files) => void handleGalleryFiles(files)}
                          onPickFromAlbum={() => openAlbumPicker('gallery')}
                          className="[&_button]:min-h-[5rem] [&_button]:py-3"
                        />
                      )}
                    </div>
                  </div>
                </InventoryFormSection>

                <InventoryFormSection
                  title="Productos relacionados"
                  icon={Link2}
                  actions={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setActiveTab('relacionados')}
                    >
                      Editar
                    </Button>
                  }
                >
                  <InventoryMerchandisingSection
                    embedded
                    compact
                    form={form}
                    products={inventoryProducts}
                    onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                  />
                </InventoryFormSection>
              </div>
            </div>
            ) : null}

            {/* —— Precios —— */}
            {activeTab === 'precios' ? (
            <div
              role="tabpanel"
              aria-labelledby="inv-tab-precios"
              className="mx-auto max-w-3xl space-y-4"
            >
              <InventoryFormSection
                id="inv-prices-section"
                title="Proveedor y precios"
                icon={CircleDollarSign}
              >
                <div className="space-y-4">
                  <InventorySuppliersFieldset
                    embedded
                    suppliers={form.suppliers ?? []}
                    onChange={handleSuppliersChange}
                  />
                  <InventoryPricesGrid
                    purchasePriceUsd={form.purchase_price_usd}
                    onPurchaseChange={(value) =>
                      updateField('purchase_price_usd', Number(value) || 0)
                    }
                    prices={form.prices}
                    onPriceChange={updatePrice}
                    purchaseFromSuppliers={supplierCount > 0}
                  />
                  <InventoryInventorySection
                    showLocation
                    form={form}
                    warehouses={warehouses}
                    onChange={(stockFields) =>
                      setForm((current) => ({ ...current, ...stockFields }))
                    }
                  />
                  <InventoryPreparationPricesSection
                    form={form}
                    onChange={updatePreparationPrices}
                  />
                  <InventoryVolumeRolePricesSection
                    compact
                    tiers={form.volume_role_prices ?? []}
                    basePrices={form.prices}
                    onChange={updateVolumeRolePrices}
                  />
                </div>
              </InventoryFormSection>
            </div>
            ) : null}

            {/* —— Atributos —— */}
            {activeTab === 'atributos' ? (
            <div
              role="tabpanel"
              aria-labelledby="inv-tab-atributos"
              className="mx-auto max-w-3xl space-y-4"
            >
              <InventoryFormSection title="Clasificación y atributos" icon={ListTree}>
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
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
                  <div className="space-y-2">
                    <Label>Atributos</Label>
                    <InventoryAttributesFieldset
                      embedded
                      attributes={form.attributes ?? []}
                      onChange={(attributes: ProductAttribute[]) =>
                        updateField('attributes', attributes)
                      }
                    />
                  </div>
                  <div className="relative rounded-md border border-slate-200 bg-slate-50/80 px-3 py-3 pr-10">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Vista previa SEO
                    </p>
                    <Eye
                      className="absolute right-3 top-3 size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold leading-snug text-[#1a0dab]">
                      {seoPreview.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#006621]">{slugPath}</p>
                    <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {seoPreview.description}
                    </p>
                  </div>
                </div>
              </InventoryFormSection>
            </div>
            ) : null}

            {/* —— Fotos —— */}
            {activeTab === 'fotos' ? (
            <div
              role="tabpanel"
              aria-labelledby="inv-tab-fotos"
              className="mx-auto max-w-3xl space-y-4"
            >
              <InventoryFormSection
                id="inv-photos-section"
                title="Fotos y recursos"
                icon={Camera}
              >
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Foto principal</Label>
                      {form.image_url ? (
                        <InventoryPhotoPreview
                          src={form.image_url}
                          alt="Vista previa de la foto principal"
                          onRemove={() => setMainImage(null)}
                        />
                      ) : (
                        <InventoryPhotoUploadBox
                          label=""
                          uploadLabel="Subir imagen"
                          hint="Foto principal del producto."
                          uploadLimitHint={PRODUCT_IMAGE_UPLOAD_HINT}
                          onFiles={(files) => void handleMainImageFiles(files)}
                          onPickFromAlbum={() => openAlbumPicker('main')}
                          className="[&_button]:min-h-[8rem] [&_button]:py-4"
                        />
                      )}
                      {form.image_url ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => openAlbumPicker('main')}
                          >
                            Cambiar desde álbum
                          </Button>
                          <label className="inline-flex h-8 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-muted">
                            Subir otra
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/*"
                              className="sr-only"
                              onChange={(event) => {
                                const files = event.target.files;
                                if (files?.length) void handleMainImageFiles(files);
                                event.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      ) : null}
                    </div>

                    <InventoryPhotoUploadBox
                      label="Galería"
                      uploadLabel="Subir imágenes"
                      hint="Múltiples archivos. Las fotos se muestran completas."
                      uploadLimitHint={PRODUCT_IMAGE_UPLOAD_HINT}
                      multiple
                      onFiles={(files) => void handleGalleryFiles(files)}
                      onPickFromAlbum={() => openAlbumPicker('gallery')}
                      className="[&_button]:min-h-[8rem] [&_button]:py-4"
                      preview={
                        galleryImages.length > 0 ? (
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {galleryImages.map((url) => (
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

                  <div className="space-y-2">
                    <Label>Recursos del producto</Label>
                    <InventoryProductResourceFields
                      compact
                      form={form}
                      onAttachmentsChange={(attachments) => updateField('attachments', attachments)}
                      onVideoChange={(media) => setForm((prev) => ({ ...prev, ...media }))}
                      onError={setError}
                    />
                  </div>
                </div>
              </InventoryFormSection>
            </div>
            ) : null}

            {/* —— Relacionados —— */}
            {activeTab === 'relacionados' ? (
            <div
              role="tabpanel"
              aria-labelledby="inv-tab-relacionados"
              className="mx-auto max-w-3xl space-y-4"
            >
              <InventoryFormSection title="Productos relacionados" icon={Link2}>
                <InventoryMerchandisingSection
                  embedded
                  compact
                  form={form}
                  products={inventoryProducts}
                  onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                />
              </InventoryFormSection>
            </div>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="mx-6 mb-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter className="shrink-0 gap-3 border-t border-border/60 bg-card px-6 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-10 min-w-[9.5rem] rounded-md bg-red-600 px-5 text-white hover:bg-red-500"
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
        if (!next) closeAlbumPicker();
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
        const mode = albumPickerRef.current ?? albumPicker;
        if (mode === 'main') {
          const url = items[0]?.url;
          if (url && isImageMediaUrl(url)) {
            setMainImage(url);
          }
        } else {
          appendGalleryUrls(
            items.map((item) => item.url).filter((url): url is string => Boolean(url)),
          );
        }
        closeAlbumPicker();
        setError(null);
      }}
    />
    </>
  );
}
