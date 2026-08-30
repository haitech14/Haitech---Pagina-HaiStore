import { ensureFullPrices } from '@/lib/roles';

import { buildProductImageCandidates } from '@/lib/product-image-url';

import { penToUsd } from '@/lib/utils';

import type { EquipmentConfigOption, EquipmentConfigStep } from '@/types/product-detail';

import type { ProductRolePrices } from '@/lib/roles';



/** Pasos de equipo cuyos add-ons se muestran en «Complementa tu compra» (sin garantía ni estabilizador). */

export const COMPLEMENTA_ACCESSORY_STEP_IDS = ['accesorios'] as const;



/** Accesorios con etiqueta compacta en el hero (mockup Complementa tu compra). */

export const COMPLEMENTA_SIDEBAR_ACCESSORY_OPTION_IDS = [
  'casetera-250',
  'gabinete',
] as const;

export const COMPLEMENTA_SIDEBAR_STABILIZER_OPTION_ID = 'estabilizador-2000w';



export type HeroAccessoryOptionId = (typeof COMPLEMENTA_SIDEBAR_ACCESSORY_OPTION_IDS)[number];



const COMPLEMENTA_ACCESSORY_LABELS: Partial<Record<string, string>> = {
  'casetera-250': 'Casetera 250 Hojas',
  'casetera-500': 'Casetera Adicional',
  gabinete: 'Gabinete',
  'estabilizador-2000w': 'Estabilizador Sólido 2000 watts',
};



export const HERO_WARRANTY_BASE_OPTION_ID = 'garantia-base';



export const HERO_WARRANTY_UPGRADE_OPTION_IDS = ['garantia-2y', 'garantia-3y'] as const;



export type HeroWarrantyUpgradeOptionId = (typeof HERO_WARRANTY_UPGRADE_OPTION_IDS)[number];



const HERO_WARRANTY_BASE_LABEL = '1 año y/o 20,000 páginas incluido';



const HERO_WARRANTY_UPGRADE_LABELS: Record<HeroWarrantyUpgradeOptionId, string> = {

  'garantia-2y': '2 años y/o 50,000 páginas',

  'garantia-3y': '3 años y/o 80,000 páginas',

};



export interface ConfigureHeroAccessoryCard {

  stepId: string;

  optionId: string;

  title: string;

  code?: string;

  imageCandidates: string[];

  prices: ProductRolePrices;

}



export interface ConfigureHeroWarrantyUpgrade {

  optionId: HeroWarrantyUpgradeOptionId;

  label: string;

  pricePen: number;

  priceUsd?: number;

}



function resolveOptionPrices(option: EquipmentConfigOption): ProductRolePrices {

  if (option.priceUsd != null && option.priceUsd > 0) {

    return ensureFullPrices({ public: option.priceUsd });

  }

  if (option.pricePen > 0) {

    return ensureFullPrices({ public: penToUsd(option.pricePen) });

  }

  return ensureFullPrices({ public: 0 });

}



function resolveAccessoryImageCandidates(option: EquipmentConfigOption): string[] {

  if (!option.image?.trim()) return [];

  return buildProductImageCandidates({ image_url: option.image });

}



function resolveAccessoryTitle(option: EquipmentConfigOption): string {

  const override = COMPLEMENTA_ACCESSORY_LABELS[option.id];

  if (override) return override;

  return option.name.trim() || option.id;

}



function optionToAccessoryCard(

  step: EquipmentConfigStep,

  option: EquipmentConfigOption,

): ConfigureHeroAccessoryCard {

  return {

    stepId: step.id,

    optionId: option.id,

    title: resolveAccessoryTitle(option),

    ...(option.sku ? { code: option.sku } : {}),

    imageCandidates: resolveAccessoryImageCandidates(option),

    prices: resolveOptionPrices(option),

  };

}



export function resolveComplementaSidebarAccessoryCards(
  steps: EquipmentConfigStep[],
): ConfigureHeroAccessoryCard[] {
  const step = steps.find((entry) => entry.id === 'accesorios');
  if (!step) return [];

  return COMPLEMENTA_SIDEBAR_ACCESSORY_OPTION_IDS.flatMap((optionId) => {
    const option = step.options.find((entry) => entry.id === optionId);
    if (!option || option.included) return [];
    return [optionToAccessoryCard(step, option)];
  });
}

export function resolveComplementaStabilizerCard(
  steps: EquipmentConfigStep[],
): ConfigureHeroAccessoryCard | null {
  const step = steps.find((entry) => entry.id === 'estabilizador');
  const option = step?.options.find((entry) => entry.id === COMPLEMENTA_SIDEBAR_STABILIZER_OPTION_ID);
  if (!step || !option || option.included) return null;
  return optionToAccessoryCard(step, option);
}

export function resolveHeroAccessoryCards(

  steps: EquipmentConfigStep[],

): ConfigureHeroAccessoryCard[] {

  const cards: ConfigureHeroAccessoryCard[] = [];



  for (const stepId of COMPLEMENTA_ACCESSORY_STEP_IDS) {

    const step = steps.find((entry) => entry.id === stepId);

    if (!step) continue;



    for (const option of step.options) {

      if (option.included) continue;

      cards.push(optionToAccessoryCard(step, option));

    }

  }



  return cards;

}



export function resolveHeroWarrantyUpgrades(

  garantiaStep: EquipmentConfigStep | undefined,

): ConfigureHeroWarrantyUpgrade[] {

  if (!garantiaStep) return [];



  const upgrades: ConfigureHeroWarrantyUpgrade[] = [];



  for (const optionId of HERO_WARRANTY_UPGRADE_OPTION_IDS) {

    const option = garantiaStep.options.find((entry) => entry.id === optionId);

    if (!option || option.included) continue;

    if (option.pricePen <= 0 && (option.priceUsd == null || option.priceUsd <= 0)) continue;



    upgrades.push({

      optionId,

      label: HERO_WARRANTY_UPGRADE_LABELS[optionId],

      pricePen: option.pricePen,

      ...(option.priceUsd != null ? { priceUsd: option.priceUsd } : {}),

    });

  }



  return upgrades;

}



export function resolveHeroWarrantyBaseLabel(

  garantiaStep: EquipmentConfigStep | undefined,

): string {

  const baseOption = garantiaStep?.options.find((entry) => entry.id === HERO_WARRANTY_BASE_OPTION_ID);

  if (!baseOption) return HERO_WARRANTY_BASE_LABEL;

  return HERO_WARRANTY_BASE_LABEL;

}



export function hasHeroAccessoryOptions(steps: EquipmentConfigStep[]): boolean {

  return resolveHeroAccessoryCards(steps).length > 0;

}



export function hasHeroWarrantyOptions(garantiaStep: EquipmentConfigStep | undefined): boolean {

  return resolveHeroWarrantyUpgrades(garantiaStep).length > 0;

}

