import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_RENTAL_PLANS } from '@/data/rental-plans-defaults';
import { useRentalPlans } from '@/hooks/use-rental-plans';
import {
  RENTAL_DEFAULT_TERM_MONTHS,
  RENTAL_TERM_PRESET_OPTIONS,
  computeEquipmentRentalEstimate,
  formatEquipmentRentalPen,
  type EquipmentRentalEstimate,
} from '@/lib/rental-calculator';
import type { RentalPlanConfig } from '@/types/rental-plan';

export const REFERENCE_EQUIPMENT_BASE_USD = 850;
export const COLOR_EQUIPMENT_BASE_USD = 1450;

export type RentalMachineType = 'bw' | 'color';

export type RentalExtraServiceId =
  | 'scan'
  | 'software'
  | 'finishing'
  | 'install';

export const RENTAL_EXTRA_SERVICES: Array<{
  id: RentalExtraServiceId;
  label: string;
}> = [
  { id: 'scan', label: 'Escaneo de documentos' },
  { id: 'software', label: 'Software de gestión documental' },
  { id: 'finishing', label: 'Acabados profesionales' },
  { id: 'install', label: 'Instalación y capacitación' },
];

export function formatRentalVolumeLabel(pages: number): string {
  return `${pages.toLocaleString('es-PE')} páginas`;
}

export function formatRentalQuantityLabel(quantity: number): string {
  return quantity === 1 ? '1 equipo' : `${quantity} equipos`;
}

export function formatRentalPriceWithIgv(value: number): string {
  return `S/ ${formatEquipmentRentalPen(value)} + IGV`;
}

export interface UseRentalQuickQuoteOptions {
  /** Incluye extras del configurador detallado. */
  withExtras?: boolean;
}

export interface RentalQuickQuoteState {
  plans: RentalPlanConfig[];
  machineType: RentalMachineType;
  setMachineType: (value: RentalMachineType) => void;
  planId: string;
  setPlanId: (value: string) => void;
  quantity: number;
  setQuantity: (value: number) => void;
  termMonths: number;
  setTermMonths: (value: number) => void;
  customTerm: boolean;
  setCustomTerm: (value: boolean) => void;
  extras: Record<RentalExtraServiceId, boolean>;
  toggleExtra: (id: RentalExtraServiceId) => void;
  selectedPlan: RentalPlanConfig;
  estimate: EquipmentRentalEstimate;
  termPresets: readonly number[];
  selectTermPreset: (months: number) => void;
  selectOtherTerm: () => void;
}

export function useRentalQuickQuote(
  options: UseRentalQuickQuoteOptions = {},
): RentalQuickQuoteState {
  const withExtras = options.withExtras === true;
  const { data: apiPlans } = useRentalPlans({ activeOnly: true });
  const plans = useMemo(() => {
    const source =
      apiPlans && apiPlans.length > 0
        ? apiPlans.filter((plan) => plan.active !== false)
        : DEFAULT_RENTAL_PLANS;
    return source.length > 0 ? source : DEFAULT_RENTAL_PLANS;
  }, [apiPlans]);

  const [machineType, setMachineType] = useState<RentalMachineType>('bw');
  const [planId, setPlanId] = useState(() => plans[0]?.id ?? 'plan-5k');
  const [quantity, setQuantity] = useState(1);
  const [termMonths, setTermMonths] = useState<number>(RENTAL_DEFAULT_TERM_MONTHS);
  const [customTerm, setCustomTerm] = useState(false);
  const [extras, setExtras] = useState<Record<RentalExtraServiceId, boolean>>({
    scan: false,
    software: false,
    finishing: false,
    install: false,
  });

  useEffect(() => {
    if (plans.length === 0) return;
    if (!plans.some((plan) => plan.id === planId)) {
      setPlanId(plans[0]!.id);
    }
  }, [planId, plans]);

  const selectedPlan = useMemo(() => {
    return plans.find((plan) => plan.id === planId) ?? plans[0] ?? DEFAULT_RENTAL_PLANS[0]!;
  }, [planId, plans]);

  const estimate = useMemo(() => {
    const pages = selectedPlan.pagesPerMonth;
    const monthlyPrice = selectedPlan.monthlyPricePen;
    const isColor = machineType === 'color';
    const includeScan = withExtras && extras.scan;
    const includeFinishing = withExtras && extras.finishing;
    const includeSoftware = withExtras && extras.software;

    return computeEquipmentRentalEstimate({
      ...(selectedPlan.id ? { planId: selectedPlan.id } : {}),
      planMonthlyPricePen: monthlyPrice,
      includedPages: pages,
      monthlyPages: pages,
      equipmentQuantity: quantity,
      termMonths,
      equipmentBasePriceUsd: isColor ? COLOR_EQUIPMENT_BASE_USD : REFERENCE_EQUIPMENT_BASE_USD,
      isColorEquipment: isColor,
      ...(isColor
        ? {
            blackPages: Math.round(pages * 0.6),
            colorPages: Math.round(pages * 0.4),
          }
        : { a4Pages: pages, a3Pages: 0 }),
      ...(includeScan ? { scanPages: Math.round(pages * 0.8) } : {}),
      ...(includeFinishing
        ? { includeLaminator: true, includeGuillotine: true }
        : {}),
      ...(includeSoftware ? { includeLaptop: true } : {}),
    });
  }, [extras, machineType, quantity, selectedPlan, termMonths, withExtras]);

  const toggleExtra = (id: RentalExtraServiceId) => {
    setExtras((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectTermPreset = (months: number) => {
    setCustomTerm(false);
    setTermMonths(months);
  };

  const selectOtherTerm = () => {
    setCustomTerm(true);
  };

  return {
    plans,
    machineType,
    setMachineType,
    planId,
    setPlanId,
    quantity,
    setQuantity,
    termMonths,
    setTermMonths,
    customTerm,
    setCustomTerm,
    extras,
    toggleExtra,
    selectedPlan,
    estimate,
    termPresets: RENTAL_TERM_PRESET_OPTIONS,
    selectTermPreset,
    selectOtherTerm,
  };
}
