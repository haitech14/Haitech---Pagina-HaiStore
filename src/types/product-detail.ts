import type { LucideIcon } from 'lucide-react';

import type { Product } from '@/types/product';

export interface ProductBreadcrumb {
  label: string;
  href?: string;
}

export interface ProductFeatureIcon {
  icon: LucideIcon;
  label: string;
}

export interface ProductResourceLink {
  label: string;
  subtitle: string;
  href?: string;
  icon: LucideIcon;
  accentSubtitle?: boolean;
  action?: 'quote' | 'technical_sheet';
  fileName?: string;
  mimeType?: string;
}

export interface ProductWarrantyOption {
  id: string;
  label: string;
  priceUsd?: number;
}

export interface ProductComboItem {
  id: string;
  /** Producto real del catálogo cuando está disponible. */
  productId?: string;
  name: string;
  image: string;
  pricePen: number;
  priceUsd?: number;
  defaultSelected: boolean;
}

export interface EquipmentConfigOption {
  id: string;
  name: string;
  description?: string;
  pricePen: number;
  /** Opción incluida en el equipo base (sin costo adicional). */
  included?: boolean;
  /** Producto del inventario enlazado. */
  productId?: string;
  sku?: string;
  image?: string;
  priceUsd?: number;
}

export type EquipmentConfigSelectionMode = 'single' | 'multiple';

export interface EquipmentConfigStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  pricePen: number;
  icon: LucideIcon;
  defaultSelected: boolean;
  /** single = una opción (garantía); multiple = varias (accesorios, tóner). */
  selectionMode?: EquipmentConfigSelectionMode;
  options: EquipmentConfigOption[];
}

export interface ProductSpecRow {
  label: string;
  value: string;
  /** Agrupa la fila en una sección de ficha técnica cuando el label es ambiguo. */
  section?: string;
}

export interface BulkDiscountTier {
  range: string;
  discount: string;
  discountPercent: number;
}

export interface RentalPlanOption {
  pagesPerMonth: number;
  monthlyPricePen: number;
}

export interface ProductDescriptionHighlight {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export interface ProductFeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Bloque de historia / marketing en la pestaña Descripción (texto + imagen alternados). */
export interface ProductDescriptionStoryBlock {
  id: string;
  title: string;
  body: string;
  /** `start` = imagen a la izquierda; `end` = imagen a la derecha. */
  imagePosition: 'start' | 'end';
  imageSrc?: string;
  imageAlt?: string;
  /** Panel ilustrado sin foto (p. ej. icono sobre color). */
  visual?: 'smartphone-cloud' | 'sustainability';
  footnote?: string;
}

export interface ProductDescriptionStoryCta {
  title: string;
  body: string;
}

export interface ProductHeroSpecBullet {
  icon?: LucideIcon;
  /** Formato con icono: una sola línea. */
  text?: string;
  /** Formato optimizado: etiqueta en negrita + valor. */
  label?: string;
  value?: string;
  /** Varias etiquetas en un mismo ítem (p. ej. Formato + Manejo de papel). */
  parts?: { label: string; value: string }[];
}

export interface ProductDescriptionContent {
  paragraphs: string[];
  youtubeVideoId?: string;
  youtubeTitle?: string;
  highlights: ProductDescriptionHighlight[];
  overviewTitle?: string;
  overviewParagraphs?: string[];
  overviewLink?: { label: string; href: string };
  featureCards?: ProductFeatureCard[];
  /** Bloques largos tipo brochure (p. ej. RICOH M 320F). */
  storyBlocks?: ProductDescriptionStoryBlock[];
  storyCta?: ProductDescriptionStoryCta;
}

export interface ProductDescriptionVisualItem {
  icon: LucideIcon;
  label: string;
}

export interface ProductDescriptionVisualSpec {
  icon: LucideIcon;
  title: string;
  lines: string[];
}

/** Infografía de funciones y especificaciones en la pestaña Descripción. */
export interface ProductDescriptionVisual {
  functions: ProductDescriptionVisualItem[];
  /** Conectividad (Wi-Fi, LAN, USB, móvil) a la derecha de las funciones. */
  connectivity?: ProductDescriptionVisualItem[];
  specs: ProductDescriptionVisualSpec[];
}

export type ProductGalleryItem =
  | { type: 'image'; src: string; alt?: string }
  | {
      type: 'video';
      youtubeId: string;
      title?: string;
      poster?: string;
    }
  | {
      type: 'video-file';
      src: string;
      title?: string;
      poster?: string;
    };

export interface ProductDetailViewModel {
  product: Product;
  sku: string;
  brandLabel: string;
  colorLabel: string;
  breadcrumbs: ProductBreadcrumb[];
  displayTitle: string;
  /** Título corto para breadcrumb y encabezado (p. ej. RICOH IM 430F). */
  shortTitle: string;
  /** Título principal en hero (nombre completo con capitalización). */
  heroTitle: string;
  /** Píldoras bajo la marca (Nuevo, ppm, A4, etc.). */
  tagPills: string[];
  /** Tarjetas de características en el hero (4 en 1, velocidad, etc.). */
  heroHighlights: ProductDescriptionHighlight[];
  /** Subtítulo bajo el nombre del producto. */
  displaySubtitle: string;
  /** Frase destacada bajo el título en el hero (negrita). */
  heroLead: string;
  /** Párrafo descriptivo en el hero. */
  heroDescription: string;
  /** Especificaciones con icono en el hero. */
  heroSpecBullets: ProductHeroSpecBullet[];
  /** Encabezado de la lista de specs del hero (p. ej. versión optimizada). */
  heroSpecTitle: string | null;
  /** Subtítulo opcional del beneficio de regalo en la franja de confianza. */
  giftTrustSubtitle: string;
  categoryLabel: string;
  rating: number;
  reviews: number;
  soldCount: number;
  bullets: string[];
  descriptionContent: ProductDescriptionContent | null;
  /** Iconos de funciones y especificaciones en la pestaña Descripción. */
  descriptionVisual: ProductDescriptionVisual | null;
  /** Barra horizontal de highlights bajo el hero de ficha. */
  featureBar: ProductDescriptionHighlight[];
  /** Píldoras compactas con icono bajo valoraciones (ppm, formato, ADF, etc.). */
  specPills: ProductDescriptionHighlight[];
  specs: ProductSpecRow[];
  warrantyBullets: string[];
  gallery: ProductGalleryItem[];
  features: ProductFeatureIcon[];
  resourceLinks: ProductResourceLink[];
  warrantyOptions: ProductWarrantyOption[];
  comboItems: ProductComboItem[];
  equipmentConfigSteps: EquipmentConfigStep[];
  bulkDiscountTiers: BulkDiscountTier[];
  rentalPlans: RentalPlanOption[];
  isPrinterEquipment: boolean;
  isSupplyProduct: boolean;
  isOnOffer: boolean;
  oldPricePen: number | null;
  discountPercent: number | null;
  /** URL del PDF de ficha técnica cuando está cargado en inventario. */
  technicalSheetUrl: string | null;
  /** Nombre de archivo sugerido para descargar la ficha técnica. */
  technicalSheetFileName: string | null;
  /** Tipo MIME de la ficha técnica cuando está disponible. */
  technicalSheetMimeType: string | null;
  /** Precio mayorista (USD) para mostrar junto al precio público. */
  wholesalePriceUsd: number | null;
}
