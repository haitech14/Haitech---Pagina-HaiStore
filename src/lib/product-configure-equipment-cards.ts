import { resolveProductImageUrl } from '@/lib/product-image-url';
import type { EquipmentConfigOption, EquipmentConfigStep } from '@/types/product-detail';

/** Opciones mostradas en el carrusel «Configura tu equipo». */
export const CONFIGURE_EQUIPMENT_CAROUSEL_OPTION_IDS = [
  'casetera-250',
  'casetera-500',
  'gabinete',
  'estabilizador-2000w',
  'router-wifi',
  'garantia-2y',
] as const;

export type ConfigureEquipmentCarouselOptionId =
  (typeof CONFIGURE_EQUIPMENT_CAROUSEL_OPTION_IDS)[number];

const FALLBACK_IMAGES: Record<ConfigureEquipmentCarouselOptionId, string> = {
  'casetera-250': '/categories/accesorios-impresoras.png',
  'casetera-500': '/categories/repuestos.png',
  gabinete: '/products/combo-gabinete-alto.webp',
  'estabilizador-2000w': '/categories/accesorios-impresoras.png',
  'router-wifi': '/categories/soluciones-negocio.png',
  'garantia-2y': '/products/combo-garantia-extendida.webp',
};

const CARD_TITLES: Record<ConfigureEquipmentCarouselOptionId, string> = {
  'casetera-250': 'Casetera 250 Hojas',
  'casetera-500': 'Casetera 500 hojas',
  gabinete: 'Gabinete',
  'estabilizador-2000w': 'Estabilizador 2000 watts 220v',
  'router-wifi': 'Router Wifi',
  'garantia-2y': '2 años y/o 50,000 páginas',
};

export interface ConfigureEquipmentCard {
  stepId: string;
  optionId: ConfigureEquipmentCarouselOptionId;
  title: string;
  name: string;
  description: string;
  image: string;
  pricePen: number;
  priceUsd?: number;
  productId?: string;
  sku?: string;
}

function findOptionAcrossSteps(
  steps: EquipmentConfigStep[],
  optionId: ConfigureEquipmentCarouselOptionId,
): { step: EquipmentConfigStep; option: EquipmentConfigOption } | null {
  for (const step of steps) {
    const option = step.options.find((entry) => entry.id === optionId);
    if (option) return { step, option };
  }
  return null;
}

function resolveCardImage(option: EquipmentConfigOption, optionId: ConfigureEquipmentCarouselOptionId): string {
  if (option.image) return option.image;
  return FALLBACK_IMAGES[optionId];
}

function resolveModelLabel(option: EquipmentConfigOption): string {
  if (option.description?.trim()) return option.description.trim();
  if (option.sku) return `Modelo ${option.sku}`;
  return option.name.trim() || 'Según inventario';
}

function optionToCard(
  step: EquipmentConfigStep,
  option: EquipmentConfigOption,
  optionId: ConfigureEquipmentCarouselOptionId,
): ConfigureEquipmentCard | null {
  if (option.included) return null;
  if (option.pricePen <= 0 && (option.priceUsd == null || option.priceUsd <= 0)) return null;

  const title = CARD_TITLES[optionId];
  const modelName = resolveModelLabel(option);
  const description =
    optionId === 'garantia-2y'
      ? option.description?.trim() || '2 años y/o 50,000 páginas'
      : modelName;

  return {
    stepId: step.id,
    optionId,
    title,
    name: modelName,
    description,
    image: resolveCardImage(option, optionId),
    pricePen: option.pricePen,
    ...(option.priceUsd != null ? { priceUsd: option.priceUsd } : {}),
    ...(option.productId ? { productId: option.productId } : {}),
    ...(option.sku ? { sku: option.sku } : {}),
  };
}

export function resolveConfigureEquipmentCards(steps: EquipmentConfigStep[]): ConfigureEquipmentCard[] {
  const cards: ConfigureEquipmentCard[] = [];

  for (const optionId of CONFIGURE_EQUIPMENT_CAROUSEL_OPTION_IDS) {
    const match = findOptionAcrossSteps(steps, optionId);
    if (!match) continue;
    const card = optionToCard(match.step, match.option, optionId);
    if (card) cards.push(card);
  }

  return cards;
}

export function resolveConfigureEquipmentCardImage(
  option: EquipmentConfigOption,
  optionId: ConfigureEquipmentCarouselOptionId,
  catalogImage?: string | null,
): string {
  if (option.image) return option.image;
  if (catalogImage) return catalogImage;
  return FALLBACK_IMAGES[optionId];
}

export function resolveCatalogImageForOption(
  productId: string | undefined,
  catalog: Array<{ id: string; image_url?: string | null }>,
): string | undefined {
  if (!productId) return undefined;
  const product = catalog.find((row) => row.id === productId);
  if (!product) return undefined;
  return resolveProductImageUrl(product) ?? product.image_url ?? undefined;
}
