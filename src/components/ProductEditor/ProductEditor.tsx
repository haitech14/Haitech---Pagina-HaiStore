import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

import { ProductAttributes, type ProductAttributeRow } from '@/components/ProductEditor/ProductAttributes';
import { ProductEditorTabs } from '@/components/ProductEditor/ProductEditorTabs';
import { ProductForm, type ProductFormValues } from '@/components/ProductEditor/ProductForm';
import { ProductInventory, type ProductInventoryValues } from '@/components/ProductEditor/ProductInventory';
import { ProductMedia, type ProductMediaItem } from '@/components/ProductEditor/ProductMedia';
import {
  ProductPricing,
  type ProductPricingValues,
  type ProductSalePriceRow,
} from '@/components/ProductEditor/ProductPricing';
import {
  RelatedProducts,
  type RelatedProductItem,
} from '@/components/ProductEditor/RelatedProducts';
import type { ProductEditorTabId } from '@/components/ProductEditor/product-editor-ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { InventoryProduct } from '@/types/product';
import { cn } from '@/lib/utils';

const MOCK_DESCRIPTION = `Copiadora, Impresora, Escáner y fax
Velocidad 40 ppm
Conectividad: Wi-Fi, Ethernet, USB
Multifuncional monocromática A4, panel táctil 10.1"
Formato A4`;

const MOCK_FORM: ProductFormValues = {
  code: '418491',
  statusLabel: 'Activo (visible en tienda)',
  name: 'Impresora Multifuncional Nueva RICOH IM 430F',
  slug: 'ricoh-im-430f',
  description: MOCK_DESCRIPTION,
  technicalSheetName: 'Ficha_Ricoh_IM430F.pdf',
  technicalSheetSize: '2.4 MB',
};

const MOCK_ATTRIBUTES: ProductAttributeRow[] = [
  { id: '1', name: 'Marca', value: 'Ricoh' },
  { id: '2', name: 'Modelo de equipo', value: 'IM 430F' },
  { id: '3', name: 'Formato de papel', value: 'A4' },
  { id: '4', name: 'Velocidad de impresión', value: '40 ppm' },
  { id: '5', name: 'Conectividad', value: 'Wi-Fi, Ethernet, USB' },
  { id: '6', name: 'Funciones', value: 'Impresora, Copiadora, Escáner, Fax' },
  { id: '7', name: 'Pantalla', value: 'Panel táctil 10.1"' },
];

const MOCK_IMAGES: ProductMediaItem[] = [
  {
    id: 'img-1',
    src: '/products/estabilizador-solido-2000w.png',
    alt: 'Estabilizador sólido 2 KVA',
  },
  {
    id: 'img-2',
    src: '/categories/multifuncionales.png',
    alt: 'Multifuncional',
  },
  {
    id: 'img-3',
    src: '/categories/toner-suministros.png',
    alt: 'Tóner',
  },
];

const MOCK_PRICING: ProductPricingValues = {
  supplier: 'Ricoh del Perú S.A.',
  purchaseUsd: '776.88',
  costPen: 'S/ 2,656.93',
  marginPercent: '30',
};

const MOCK_SALE_PRICES: ProductSalePriceRow[] = [
  { id: '1', customerType: 'Corporativo', currency: 'USD', price: '1079.00', margin: '30%' },
  { id: '2', customerType: 'Mayorista', currency: 'USD', price: '899.00', margin: '16%' },
  { id: '3', customerType: 'Técnico', currency: 'USD', price: '899.00', margin: '16%' },
];

const MOCK_INVENTORY: ProductInventoryValues = {
  stock: '50',
  minStock: '10',
  location: 'Almacén principal',
};

const MOCK_RELATED: RelatedProductItem[] = [
  {
    id: 'r1',
    name: 'Tóner original Ricoh',
    sku: '321654',
    image: '/categories/toner-suministros.png',
  },
  {
    id: 'r2',
    name: 'Torre de cartuchos',
    sku: '987321',
    image: '/categories/accesorios-impresoras.png',
  },
  {
    id: 'r3',
    name: 'Unidad de tambor',
    sku: '654987',
    image: '/categories/repuestos.png',
  },
];

function statusLabelFromProduct(product: InventoryProduct): string {
  if (product.status === 'borrador') return 'Borrador';
  if (product.status === 'inactiva') return 'Oculto';
  return 'Activo (visible en tienda)';
}

function buildFormFromProduct(product: InventoryProduct | null): ProductFormValues {
  if (!product) return MOCK_FORM;
  const sheet =
    product.attachments?.find((item) => item.kind === 'technical_sheet') ??
    product.attachments?.[0];
  return {
    code: product.code?.trim() || MOCK_FORM.code,
    statusLabel: statusLabelFromProduct(product),
    name: product.name?.trim() || MOCK_FORM.name,
    slug: product.slug?.trim() || MOCK_FORM.slug,
    description: product.description?.trim() || MOCK_FORM.description,
    technicalSheetName:
      sheet?.file_name?.trim() || sheet?.label?.trim() || MOCK_FORM.technicalSheetName,
    technicalSheetSize: MOCK_FORM.technicalSheetSize,
  };
}

function buildImagesFromProduct(product: InventoryProduct | null): ProductMediaItem[] {
  if (!product) return MOCK_IMAGES;
  const urls = [
    product.image_url,
    ...(Array.isArray(product.gallery) ? product.gallery : []),
  ]
    .map((url) => String(url ?? '').trim())
    .filter(Boolean);
  const unique = [...new Set(urls)];
  if (unique.length === 0) return MOCK_IMAGES;
  return unique.slice(0, 6).map((src, index) => ({
    id: `img-${index + 1}`,
    src,
    alt: product.name,
  }));
}

function buildAttributesFromProduct(product: InventoryProduct | null): ProductAttributeRow[] {
  if (!product?.attributes?.length) return MOCK_ATTRIBUTES;
  return product.attributes.slice(0, 12).map((attr, index) => ({
    id: String(attr.id ?? index),
    name: String(attr.name ?? 'Atributo'),
    value: String(attr.value ?? ''),
  }));
}

function buildInventoryFromProduct(product: InventoryProduct | null): ProductInventoryValues {
  if (!product) return MOCK_INVENTORY;
  return {
    stock: String(product.stock ?? 0),
    minStock: MOCK_INVENTORY.minStock,
    location: MOCK_INVENTORY.location,
  };
}

function buildPricingFromProduct(product: InventoryProduct | null): {
  pricing: ProductPricingValues;
  salePrices: ProductSalePriceRow[];
} {
  if (!product) {
    return { pricing: MOCK_PRICING, salePrices: MOCK_SALE_PRICES };
  }
  const publicUsd = Number(product.prices?.public ?? 0);
  const mayorista = Number(product.prices?.mayorista ?? publicUsd);
  const tecnico = Number(product.prices?.tecnico ?? mayorista);
  const supplierName =
    product.suppliers?.[0]?.name?.trim() ||
    product.brand?.trim() ||
    MOCK_PRICING.supplier;
  return {
    pricing: {
      supplier: supplierName,
      purchaseUsd: Number(product.purchase_price_usd ?? 0).toFixed(2),
      costPen: MOCK_PRICING.costPen,
      marginPercent: MOCK_PRICING.marginPercent,
    },
    salePrices: [
      {
        id: '1',
        customerType: 'Corporativo',
        currency: 'USD',
        price: publicUsd.toFixed(2),
        margin: '30%',
      },
      {
        id: '2',
        customerType: 'Mayorista',
        currency: 'USD',
        price: mayorista.toFixed(2),
        margin: '16%',
      },
      {
        id: '3',
        customerType: 'Técnico',
        currency: 'USD',
        price: tecnico.toFixed(2),
        margin: '16%',
      },
    ],
  };
}

interface ProductEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: InventoryProduct | null;
  onSaved?: (product: InventoryProduct) => void;
}

export function ProductEditor({
  open,
  onOpenChange,
  product = null,
  onSaved,
}: ProductEditorProps) {
  const [activeTab, setActiveTab] = useState<ProductEditorTabId>('informacion');
  const [form, setForm] = useState<ProductFormValues>(MOCK_FORM);
  const [attributes, setAttributes] = useState<ProductAttributeRow[]>(MOCK_ATTRIBUTES);
  const [images, setImages] = useState<ProductMediaItem[]>(MOCK_IMAGES);
  const [selectedImageId, setSelectedImageId] = useState(MOCK_IMAGES[0]?.id ?? '');
  const [pricing, setPricing] = useState<ProductPricingValues>(MOCK_PRICING);
  const [salePrices, setSalePrices] = useState<ProductSalePriceRow[]>(MOCK_SALE_PRICES);
  const [inventory, setInventory] = useState<ProductInventoryValues>(MOCK_INVENTORY);
  const [related, setRelated] = useState<RelatedProductItem[]>(MOCK_RELATED);

  useEffect(() => {
    if (!open) return;
    setActiveTab('informacion');
    setForm(buildFormFromProduct(product));
    setAttributes(buildAttributesFromProduct(product));
    const nextImages = buildImagesFromProduct(product);
    setImages(nextImages);
    setSelectedImageId(nextImages[0]?.id ?? '');
    const nextPricing = buildPricingFromProduct(product);
    setPricing(nextPricing.pricing);
    setSalePrices(nextPricing.salePrices);
    setInventory(buildInventoryFromProduct(product));
    setRelated(MOCK_RELATED);
  }, [open, product]);

  const handleSave = () => {
    toast.success('Interfaz lista. La persistencia se conectará en el siguiente paso.');
    if (product && onSaved) onSaved(product);
    onOpenChange(false);
  };

  const patchForm = (patch: Partial<ProductFormValues>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const patchPricing = (patch: Partial<ProductPricingValues>) => {
    setPricing((current) => ({ ...current, ...patch }));
  };

  const patchInventory = (patch: Partial<ProductInventoryValues>) => {
    setInventory((current) => ({ ...current, ...patch }));
  };

  const addAttribute = () => {
    setAttributes((current) => [
      ...current,
      { id: `new-${current.length + 1}`, name: 'Nuevo atributo', value: '' },
    ]);
  };

  const removeRelated = (id: string) => {
    setRelated((current) => current.filter((item) => item.id !== id));
  };

  const showOverview = activeTab === 'informacion';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex h-[min(94vh,920px)] w-[min(96vw,1180px)] max-w-[min(96vw,1180px)] flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-[0_25px_80px_rgba(15,23,42,0.28)]',
          '[&>button.absolute]:hidden',
        )}
      >
        <header className="shrink-0 border-b border-[#E5E7EB] bg-white">
          <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
                Editar producto
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-[#6B7280]">
                Completa los datos principales, fotos, stock y precios.
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
              aria-label="Cerrar"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <ProductEditorTabs activeTab={activeTab} onChange={setActiveTab} />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#F8FAFC] px-5 py-5 sm:px-6 sm:py-6">
          {showOverview ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <div className="space-y-5">
                <ProductForm values={form} onChange={patchForm} />
                <ProductAttributes attributes={attributes} onAdd={addAttribute} />
              </div>
              <div className="space-y-5">
                <ProductMedia
                  images={images}
                  selectedId={selectedImageId}
                  onSelect={setSelectedImageId}
                />
                <ProductPricing
                  values={pricing}
                  salePrices={salePrices}
                  onChange={patchPricing}
                />
                <ProductInventory values={inventory} onChange={patchInventory} />
                <RelatedProducts products={related} onRemove={removeRelated} />
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-5">
              {activeTab === 'precios' ? (
                <ProductPricing
                  values={pricing}
                  salePrices={salePrices}
                  onChange={patchPricing}
                />
              ) : null}
              {activeTab === 'inventario' ? (
                <ProductInventory values={inventory} onChange={patchInventory} />
              ) : null}
              {activeTab === 'atributos' ? (
                <ProductAttributes attributes={attributes} onAdd={addAttribute} />
              ) : null}
              {activeTab === 'multimedia' ? (
                <ProductMedia
                  images={images}
                  selectedId={selectedImageId}
                  onSelect={setSelectedImageId}
                />
              ) : null}
              {activeTab === 'relaciones' ? (
                <RelatedProducts products={related} onRemove={removeRelated} />
              ) : null}
            </div>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#E5E7EB] bg-white px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#374151] transition-colors hover:bg-[#F8FAFC]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#EF4444] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#DC2626]"
          >
            <Save className="size-4" aria-hidden="true" />
            Guardar cambios
          </button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
