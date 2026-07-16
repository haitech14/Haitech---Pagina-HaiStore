import { useEffect, useId, useMemo, useState, type ComponentType } from 'react';
import {
  Calculator,
  Calendar,
  Check,
  ChevronDown,
  FileText,
  Film,
  Laptop,
  Layers,
  PlusCircle,
  Printer,
  Scissors,
  UserCog,
  UserRound,
} from 'lucide-react';

import { ProductDetailHeroCollapsibleSection } from '@/components/product-detail/product-detail-hero-collapsible-section';
import { RentalEstimateDualPrice } from '@/components/product/product-dual-price';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEFAULT_RENTAL_PLANS } from '@/data/rental-plans-defaults';
import {
  RENTAL_A3_TO_A4_FACTOR,
  RENTAL_BW_COPY_COST_PEN,
  RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN,
  RENTAL_COLOR_EXCESS_COPY_COST_PEN,
  RENTAL_CUSTOM_PLAN_ID,
  RENTAL_DEFAULT_MONTHLY_PAGES,
  RENTAL_DEFAULT_TERM_MONTHS,
  RENTAL_FINISHING_COPY_SURCHARGE_PEN,
  RENTAL_PAPER_SURCHARGE_BW_PEN,
  RENTAL_PAPER_SURCHARGE_COLOR_PEN,
  RENTAL_SCAN_COURTESY_RATIO,
  RENTAL_SCAN_EXCESS_COPY_COST_PEN,
  RENTAL_TERM_PRESET_OPTIONS,
  computeEquipmentRentalEstimate,
  defaultColorPageSplit,
  formatEquipmentRentalPen,
  type EquipmentRentalEstimate,
  type EquipmentRentalExtraServices,
} from '@/lib/rental-calculator';
import { cn } from '@/lib/utils';
import type { RentalPlanOption } from '@/types/product-detail';

export type {
  EquipmentRentalEstimate,
  EquipmentRentalExtraServices,
} from '@/lib/rental-calculator';

export { computeEquipmentRentalEstimate, formatEquipmentRentalPen } from '@/lib/rental-calculator';

interface ProductDetailRentalConfiguratorProps {
  rentalPlans: RentalPlanOption[];
  equipmentBasePriceUsd: number;
  isColorEquipment?: boolean;
  onEstimateChange?: (estimate: EquipmentRentalEstimate) => void;
  className?: string;
  hideTitle?: boolean;
  variant?: 'full' | 'minimal';
}

type PlanSelectId = string;

const EXTRA_SERVICES = [
  { key: 'paper', label: 'Suministro de papel', Icon: FileText },
  { key: 'operator', label: 'Operador dedicado', Icon: UserRound },
  { key: 'laptop', label: 'Laptop', Icon: Laptop },
  { key: 'laminator', label: 'Enmicadora', Icon: Film },
  { key: 'guillotine', label: 'Guillotina', Icon: Scissors },
  { key: 'residentTech', label: 'Técnico residente', Icon: UserCog },
  { key: 'spiralBinder', label: 'Espiraladora', Icon: Layers },
  { key: 'ringBinder', label: 'Anilladora', Icon: Layers },
] as const satisfies ReadonlyArray<{
  key: keyof EquipmentRentalExtraServices;
  label: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>;
}>;

type ExtraServiceKey = (typeof EXTRA_SERVICES)[number]['key'];

function formatPen(value: number): string {
  return formatEquipmentRentalPen(value);
}

function resolvePlanCatalog(rentalPlans: RentalPlanOption[]) {
  const canonicalPages = new Set(DEFAULT_RENTAL_PLANS.map((plan) => plan.pagesPerMonth));
  const apiLooksStale =
    rentalPlans.length === 0 ||
    rentalPlans.some((plan) => plan.pagesPerMonth === 3000 || plan.pagesPerMonth === 8000) ||
    !DEFAULT_RENTAL_PLANS.every((plan) =>
      rentalPlans.some((apiPlan) => apiPlan.pagesPerMonth === plan.pagesPerMonth),
    );

  if (apiLooksStale) {
    return DEFAULT_RENTAL_PLANS.map((plan) => ({
      id: plan.id,
      label: plan.label,
      pagesPerMonth: plan.pagesPerMonth,
      monthlyPricePen: plan.monthlyPricePen,
    }));
  }

  return rentalPlans
    .filter((plan) => canonicalPages.has(plan.pagesPerMonth) || plan.pagesPerMonth > 0)
    .map((plan) => {
      const matched = DEFAULT_RENTAL_PLANS.find(
        (defaultPlan) => defaultPlan.pagesPerMonth === plan.pagesPerMonth,
      );
      return {
        id: matched?.id ?? `plan-${plan.pagesPerMonth}`,
        label: matched?.label ?? `Plan ${plan.pagesPerMonth.toLocaleString('es-PE')} páginas`,
        pagesPerMonth: plan.pagesPerMonth,
        monthlyPricePen: plan.monthlyPricePen,
      };
    });
}

function useRentalConfiguratorState(
  rentalPlans: RentalPlanOption[],
  equipmentBasePriceUsd: number,
  initialIsColorEquipment: boolean,
  onEstimateChange?: (estimate: EquipmentRentalEstimate) => void,
) {
  const planCatalog = useMemo(() => resolvePlanCatalog(rentalPlans), [rentalPlans]);
  const defaultPlan = planCatalog[0] ?? {
    id: 'plan-5k',
    label: 'Plan 5,000 páginas',
    pagesPerMonth: RENTAL_DEFAULT_MONTHLY_PAGES,
    monthlyPricePen: 499,
  };

  const [machineType, setMachineType] = useState<'bw' | 'color'>(
    initialIsColorEquipment ? 'color' : 'bw',
  );
  const isColorEquipment = machineType === 'color';

  const [selectedPlanId, setSelectedPlanId] = useState<PlanSelectId>(defaultPlan.id);
  const [customPlanPages, setCustomPlanPages] = useState(RENTAL_DEFAULT_MONTHLY_PAGES);
  const [customPlanPricePen, setCustomPlanPricePen] = useState(0);

  const selectedPlan =
    selectedPlanId === RENTAL_CUSTOM_PLAN_ID
      ? null
      : (planCatalog.find((plan) => plan.id === selectedPlanId) ?? defaultPlan);

  const includedPages =
    selectedPlanId === RENTAL_CUSTOM_PLAN_ID
      ? Math.max(1, customPlanPages)
      : (selectedPlan?.pagesPerMonth ?? RENTAL_DEFAULT_MONTHLY_PAGES);

  const planMonthlyPricePen =
    selectedPlanId === RENTAL_CUSTOM_PLAN_ID
      ? Math.max(0, customPlanPricePen)
      : (selectedPlan?.monthlyPricePen ?? 0);

  const defaultSplit = defaultColorPageSplit(includedPages);

  const [blackPages, setBlackPages] = useState(defaultSplit.blackPages);
  const [colorPages, setColorPages] = useState(defaultSplit.colorPages);
  const [a4Pages, setA4Pages] = useState(includedPages);
  const [a3Pages, setA3Pages] = useState(0);
  const [scanPages, setScanPages] = useState(0);
  const [equipmentQuantity, setEquipmentQuantity] = useState(1);

  const [termIsCustom, setTermIsCustom] = useState(false);
  const [termMonths, setTermMonths] = useState(RENTAL_DEFAULT_TERM_MONTHS);
  const [customTermMonths, setCustomTermMonths] = useState(18);

  const [includePaper, setIncludePaper] = useState(false);
  const [includeOperator, setIncludeOperator] = useState(false);
  const [includeLaptop, setIncludeLaptop] = useState(false);
  const [includeLaminator, setIncludeLaminator] = useState(false);
  const [includeGuillotine, setIncludeGuillotine] = useState(false);
  const [includeResidentTech, setIncludeResidentTech] = useState(false);
  const [includeSpiralBinder, setIncludeSpiralBinder] = useState(false);
  const [includeRingBinder, setIncludeRingBinder] = useState(false);

  useEffect(() => {
    setMachineType(initialIsColorEquipment ? 'color' : 'bw');
  }, [initialIsColorEquipment]);

  useEffect(() => {
    const split = defaultColorPageSplit(includedPages);
    setBlackPages(split.blackPages);
    setColorPages(split.colorPages);
    setA4Pages(includedPages);
    setA3Pages(0);
  }, [selectedPlanId, includedPages, machineType]);

  const effectiveTermMonths = termIsCustom
    ? Math.max(1, Math.floor(customTermMonths) || 1)
    : termMonths;

  const estimate = useMemo(
    () =>
      computeEquipmentRentalEstimate({
        planId: selectedPlanId,
        planMonthlyPricePen,
        includedPages,
        blackPages,
        colorPages,
        a4Pages,
        a3Pages,
        scanPages,
        equipmentQuantity,
        termMonths: effectiveTermMonths,
        equipmentBasePriceUsd,
        isColorEquipment,
        includePaper,
        includeOperator,
        includeLaptop,
        includeLaminator,
        includeGuillotine,
        includeResidentTech,
        includeSpiralBinder,
        includeRingBinder,
      }),
    [
      selectedPlanId,
      planMonthlyPricePen,
      includedPages,
      blackPages,
      colorPages,
      a4Pages,
      a3Pages,
      scanPages,
      equipmentQuantity,
      effectiveTermMonths,
      equipmentBasePriceUsd,
      isColorEquipment,
      includePaper,
      includeOperator,
      includeLaptop,
      includeLaminator,
      includeGuillotine,
      includeResidentTech,
      includeSpiralBinder,
      includeRingBinder,
    ],
  );

  useEffect(() => {
    onEstimateChange?.(estimate);
  }, [estimate, onEstimateChange]);

  const extraServiceState: Record<ExtraServiceKey, boolean> = {
    paper: includePaper,
    operator: includeOperator,
    laptop: includeLaptop,
    laminator: includeLaminator,
    guillotine: includeGuillotine,
    residentTech: includeResidentTech,
    spiralBinder: includeSpiralBinder,
    ringBinder: includeRingBinder,
  };

  const toggleExtraService = (key: ExtraServiceKey) => {
    switch (key) {
      case 'paper':
        setIncludePaper((value) => !value);
        break;
      case 'operator':
        setIncludeOperator((value) => !value);
        break;
      case 'laptop':
        setIncludeLaptop((value) => !value);
        break;
      case 'laminator':
        setIncludeLaminator((value) => !value);
        break;
      case 'guillotine':
        setIncludeGuillotine((value) => !value);
        break;
      case 'residentTech':
        setIncludeResidentTech((value) => !value);
        break;
      case 'spiralBinder':
        setIncludeSpiralBinder((value) => !value);
        break;
      case 'ringBinder':
        setIncludeRingBinder((value) => !value);
        break;
    }
  };

  const selectPlan = (planId: PlanSelectId) => {
    setSelectedPlanId(planId);
    if (planId === RENTAL_CUSTOM_PLAN_ID) {
      setCustomPlanPages(includedPages);
      setCustomPlanPricePen(planMonthlyPricePen);
    }
  };

  return {
    planCatalog,
    selectedPlanId,
    selectPlan,
    customPlanPages,
    setCustomPlanPages,
    customPlanPricePen,
    setCustomPlanPricePen,
    machineType,
    setMachineType,
    isColorEquipment,
    blackPages,
    setBlackPages,
    colorPages,
    setColorPages,
    a4Pages,
    setA4Pages,
    a3Pages,
    setA3Pages,
    scanPages,
    setScanPages,
    equipmentQuantity,
    setEquipmentQuantity,
    termIsCustom,
    setTermIsCustom,
    termMonths,
    setTermMonths,
    customTermMonths,
    setCustomTermMonths,
    effectiveTermMonths,
    estimate,
    extraServiceState,
    toggleExtraService,
    includedPages,
    planMonthlyPricePen,
  };
}

function RentalPriceSummary({
  estimate,
  variant,
}: {
  estimate: EquipmentRentalEstimate;
  variant: 'full' | 'minimal';
}) {
  const selectedExtraLabels = [
    estimate.extraServices.paper ? 'Suministro de papel' : null,
    estimate.extraServices.operator ? 'Operador dedicado' : null,
    estimate.extraServices.laptop ? 'Laptop' : null,
    estimate.extraServices.laminator ? 'Enmicadora (+S/ 0.05/pág.)' : null,
    estimate.extraServices.guillotine ? 'Guillotina (+S/ 0.05/pág.)' : null,
    estimate.extraServices.residentTech ? 'Técnico residente' : null,
    estimate.extraServices.spiralBinder ? 'Espiraladora (+S/ 0.05/pág.)' : null,
    estimate.extraServices.ringBinder ? 'Anilladora (+S/ 0.05/pág.)' : null,
  ].filter(Boolean);

  const [breakdownExpanded, setBreakdownExpanded] = useState(false);
  const breakdownTriggerId = useId();
  const breakdownPanelId = useId();

  if (variant === 'minimal') {
    return (
      <div className="mt-2 border-t border-border/50 pt-2">
        <p className="text-sm font-bold text-foreground">
          Total mensual: S/ {formatPen(estimate.estimatedMonthlyPen)}
        </p>
        <p className="mt-0.5 text-[0.625rem] leading-snug text-muted-foreground">
          Cuota fija S/ {formatPen(estimate.fixedFeeMonthlyPen)} + variable S/{' '}
          {formatPen(estimate.variableFeeMonthlyPen)}
          {estimate.extraServicesMonthlyPen > 0
            ? ` + extras S/ ${formatPen(estimate.extraServicesMonthlyPen)}`
            : null}
        </p>
        {estimate.hasExtraServices ? (
          <p className="mt-0.5 text-[0.625rem] text-muted-foreground">
            Extras: {selectedExtraLabels.join(', ')}
          </p>
        ) : null}
      </div>
    );
  }

  const paperRate = estimate.isColorEquipment
    ? RENTAL_PAPER_SURCHARGE_COLOR_PEN
    : RENTAL_PAPER_SURCHARGE_BW_PEN;

  const variableFormula = estimate.isColorEquipment ? (
    <>
      Plan S/ {formatPen(estimate.planBaseMonthlyPen)}
      {estimate.excessFeeMonthlyPen > 0
        ? ` + excedentes (negro S/ ${RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN} · color S/ ${RENTAL_COLOR_EXCESS_COPY_COST_PEN})`
        : null}
      {estimate.paperSurchargeMonthlyPen > 0
        ? ` + papel S/ ${paperRate} × ${estimate.billablePages.toLocaleString('es-PE')}`
        : null}
      {estimate.finishingPerCopyPen > 0
        ? ` + acabados S/ ${estimate.finishingPerCopyPen}/pág.`
        : null}
      {estimate.scanFeeMonthlyPen > 0
        ? ` + escaneo S/ ${RENTAL_SCAN_EXCESS_COPY_COST_PEN}`
        : null}
    </>
  ) : (
    <>
      Plan S/ {formatPen(estimate.planBaseMonthlyPen)}
      {estimate.excessFeeMonthlyPen > 0
        ? ` + excedentes B/N S/ ${RENTAL_BW_COPY_COST_PEN} (A3 = ${RENTAL_A3_TO_A4_FACTOR} A4)`
        : null}
      {estimate.paperSurchargeMonthlyPen > 0
        ? ` + papel S/ ${paperRate} × ${estimate.billablePages.toLocaleString('es-PE')} A4 eq.`
        : null}
      {estimate.finishingPerCopyPen > 0
        ? ` + acabados S/ ${estimate.finishingPerCopyPen}/pág.`
        : null}
      {estimate.scanFeeMonthlyPen > 0
        ? ` + escaneo S/ ${RENTAL_SCAN_EXCESS_COPY_COST_PEN}`
        : null}
    </>
  );

  const fixedFeeDescription =
    estimate.laptopFeeMonthlyPen > 0
      ? `Valor del equipo + 20% (×1,2) ÷ ${estimate.termMonths} meses + laptop S/ ${formatPen(estimate.laptopFeeMonthlyPen)}`
      : `Valor del equipo + 20% (×1,2) ÷ ${estimate.termMonths} meses`;

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <button
          type="button"
          id={breakdownTriggerId}
          className="flex w-full items-center gap-1.5 px-3 py-2 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:px-3 sm:py-2.5"
          aria-expanded={breakdownExpanded}
          aria-controls={breakdownPanelId}
          onClick={() => setBreakdownExpanded((value) => !value)}
        >
          <Calculator
            className="size-4 shrink-0 text-[#0f1f3d]"
            strokeWidth={2}
            aria-hidden={true}
          />
          <span className="flex min-w-0 flex-1 text-xs font-semibold text-[#0f1f3d]">
            Total configurado
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-neutral-400 transition-transform duration-200',
              breakdownExpanded && 'rotate-180',
            )}
            aria-hidden={true}
          />
        </button>

        <div
          id={breakdownPanelId}
          role="region"
          aria-labelledby={breakdownTriggerId}
          aria-label="Desglose de cuotas de alquiler"
          hidden={!breakdownExpanded}
          className={cn(
            'border-t border-neutral-200 px-3 pb-2.5 pt-2 sm:px-3 sm:pb-3',
            !breakdownExpanded && 'hidden',
          )}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0f1f3d]">Cuota fija mensual</p>
                <p className="mt-0.5 text-[0.6875rem] leading-snug text-muted-foreground">
                  {fixedFeeDescription}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-[#0f1f3d]">
                S/ {formatPen(estimate.fixedFeeMonthlyPen)}
              </p>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0f1f3d]">Cuota variable mensual</p>
                <p className="mt-0.5 text-[0.6875rem] leading-snug text-muted-foreground">
                  {variableFormula}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-[#0f1f3d]">
                S/ {formatPen(estimate.variableFeeMonthlyPen)}
              </p>
            </div>

            {estimate.extraServicesMonthlyPen > 0 ? (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#0f1f3d]">Personal mensual</p>
                  <p className="mt-0.5 text-[0.6875rem] leading-snug text-muted-foreground">
                    Operador / técnico residente
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-[#0f1f3d]">
                  S/ {formatPen(estimate.extraServicesMonthlyPen)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Total estimado / mes</p>
          {estimate.hasExtraServices ? (
            <p className="mt-0.5 text-[0.625rem] text-muted-foreground">
              {selectedExtraLabels.join(' · ')}
            </p>
          ) : null}
        </div>
        <RentalEstimateDualPrice estimatedMonthlyPen={estimate.estimatedMonthlyPen} />
      </div>
    </>
  );
}

function IconInput({
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<'input'> & {
  icon: ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>;
}) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden={true}
      />
      <input
        {...props}
        className={cn(
          'h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
          className,
        )}
      />
    </div>
  );
}

function TermButton({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'relative h-11 rounded-md border px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
        selected
          ? 'border-red-600 bg-white text-red-600'
          : 'border-border bg-background text-foreground hover:bg-muted/30',
      )}
    >
      {selected ? (
        <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-600 shadow-sm">
          <Check className="size-2.5 text-white" strokeWidth={3} aria-hidden={true} />
        </span>
      ) : null}
      {label}
    </button>
  );
}

function ExtraServiceCard({
  label,
  icon: Icon,
  checked,
  onToggle,
}: {
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 transition-colors',
        checked
          ? 'border-red-600 bg-red-50/40'
          : 'border-border/80 bg-white hover:bg-muted/20',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="size-3.5 shrink-0 rounded border-border text-red-600 focus:ring-red-600"
      />
      <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden={true} />
      <span className="min-w-0 text-xs font-medium text-[#0f1f3d]">{label}</span>
    </label>
  );
}

function PageInputs({
  state,
}: {
  state: ReturnType<typeof useRentalConfiguratorState>;
}) {
  if (state.isColorEquipment) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <label className="min-w-0 space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Páginas negro</span>
          <input
            type="number"
            min={0}
            step={100}
            value={state.blackPages}
            onChange={(event) =>
              state.setBlackPages(Math.max(0, Number(event.target.value) || 0))
            }
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="min-w-0 space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Páginas color</span>
          <input
            type="number"
            min={0}
            step={100}
            value={state.colorPages}
            onChange={(event) =>
              state.setColorPages(Math.max(0, Number(event.target.value) || 0))
            }
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </label>
        <p className="col-span-2 text-[0.625rem] text-muted-foreground">
          Incluidas en plan: {state.estimate.includedBlackPages.toLocaleString('es-PE')} negro +{' '}
          {state.estimate.includedColorPages.toLocaleString('es-PE')} color. Excedente: S/{' '}
          {RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN} negro · S/{' '}
          {RENTAL_COLOR_EXCESS_COPY_COST_PEN} color.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="min-w-0 space-y-1">
        <span className="text-[11px] font-medium text-muted-foreground">Páginas A4</span>
        <input
          type="number"
          min={0}
          step={100}
          value={state.a4Pages}
          onChange={(event) => state.setA4Pages(Math.max(0, Number(event.target.value) || 0))}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
      </label>
      <label className="min-w-0 space-y-1">
        <span className="text-[11px] font-medium text-muted-foreground">Páginas A3 (= 2 A4)</span>
        <input
          type="number"
          min={0}
          step={50}
          value={state.a3Pages}
          onChange={(event) => state.setA3Pages(Math.max(0, Number(event.target.value) || 0))}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
      </label>
      <p className="col-span-2 text-[0.625rem] text-muted-foreground">
        Equivalente A4: {state.estimate.billablePages.toLocaleString('es-PE')} · Incluidas:{' '}
        {state.estimate.includedPages.toLocaleString('es-PE')} · Excedente B/N S/{' '}
        {RENTAL_BW_COPY_COST_PEN}/pág.
      </p>
    </div>
  );
}

export function ProductDetailRentalConfigurator({
  rentalPlans,
  equipmentBasePriceUsd,
  isColorEquipment = false,
  onEstimateChange,
  className,
  hideTitle = false,
  variant = 'full',
}: ProductDetailRentalConfiguratorProps) {
  const state = useRentalConfiguratorState(
    rentalPlans,
    equipmentBasePriceUsd,
    isColorEquipment,
    onEstimateChange,
  );

  const inputClass =
    'h-7 w-full rounded border border-border/70 bg-background px-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-600';

  const termButtonClassMinimal = (active: boolean) =>
    cn(
      'h-6 flex-1 rounded border px-0.5 text-[0.6875rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-600',
      active
        ? 'border-red-600 bg-red-50 text-foreground'
        : 'border-border bg-background text-foreground hover:bg-muted/30',
    );

  const machineTypeControl = (
    <fieldset className="space-y-1.5">
      <legend className="text-[11px] font-semibold text-[#0f1f3d] sm:text-xs">Tipo de máquina</legend>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { id: 'bw' as const, label: 'B/N monocromático' },
            { id: 'color' as const, label: 'Color' },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={state.machineType === option.id}
            onClick={() => state.setMachineType(option.id)}
            className={cn(
              'h-10 rounded-md border text-xs font-semibold transition-colors',
              state.machineType === option.id
                ? 'border-red-600 bg-red-50 text-red-700'
                : 'border-border bg-background text-foreground hover:bg-muted/30',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );

  const planControl = (
    <div className="space-y-1.5">
      <label htmlFor="rental-plan" className="text-[11px] font-semibold text-[#0f1f3d] sm:text-xs">
        Plan de páginas
      </label>
      <Select value={state.selectedPlanId} onValueChange={state.selectPlan}>
        <SelectTrigger id="rental-plan" className="h-10 w-full">
          <SelectValue placeholder="Selecciona un plan" />
        </SelectTrigger>
        <SelectContent>
          {state.planCatalog.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              {plan.label} — S/ {plan.monthlyPricePen.toLocaleString('es-PE')}
              {state.isColorEquipment
                ? (() => {
                    const split = defaultColorPageSplit(plan.pagesPerMonth);
                    return ` (${split.blackPages.toLocaleString('es-PE')} N + ${split.colorPages.toLocaleString('es-PE')} C)`;
                  })()
                : ''}
            </SelectItem>
          ))}
          <SelectItem value={RENTAL_CUSTOM_PLAN_ID}>Personalizado</SelectItem>
        </SelectContent>
      </Select>
      {state.selectedPlanId === RENTAL_CUSTOM_PLAN_ID ? (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <label className="space-y-1">
            <span className="text-[0.625rem] text-muted-foreground">Páginas incluidas</span>
            <input
              type="number"
              min={1}
              value={state.customPlanPages}
              onChange={(event) =>
                state.setCustomPlanPages(
                  Math.max(1, Number(event.target.value) || RENTAL_DEFAULT_MONTHLY_PAGES),
                )
              }
              className="h-9 w-full rounded-md border border-border px-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[0.625rem] text-muted-foreground">Cuota plan (S/)</span>
            <input
              type="number"
              min={0}
              step={1}
              value={state.customPlanPricePen}
              onChange={(event) =>
                state.setCustomPlanPricePen(Math.max(0, Number(event.target.value) || 0))
              }
              className="h-9 w-full rounded-md border border-border px-2 text-sm"
            />
          </label>
        </div>
      ) : null}
    </div>
  );

  const scanControl = (
    <label className="min-w-0 space-y-1">
      <span className="text-[11px] font-semibold text-[#0f1f3d] sm:text-xs">
        Escaneos / mes
      </span>
      <IconInput
        icon={FileText}
        type="number"
        min={0}
        step={100}
        value={state.scanPages}
        onChange={(event) => state.setScanPages(Math.max(0, Number(event.target.value) || 0))}
      />
      <span className="block text-[0.625rem] text-muted-foreground">
        Cortesía {(RENTAL_SCAN_COURTESY_RATIO * 100).toFixed(0)}% del plan (
        {Math.floor(state.includedPages * RENTAL_SCAN_COURTESY_RATIO).toLocaleString('es-PE')} pág.);
        excedente S/ {RENTAL_SCAN_EXCESS_COPY_COST_PEN}
      </span>
    </label>
  );

  if (variant === 'minimal') {
    return (
      <div className={cn('space-y-2', className)}>
        {hideTitle ? null : (
          <p className="text-xs font-semibold text-[#0f1f3d]">Configura tu alquiler</p>
        )}

        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { id: 'bw' as const, label: 'B/N' },
              { id: 'color' as const, label: 'Color' },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => state.setMachineType(option.id)}
              className={termButtonClassMinimal(state.machineType === option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Select value={state.selectedPlanId} onValueChange={state.selectPlan}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {state.planCatalog.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.pagesPerMonth.toLocaleString('es-PE')} pág.
              </SelectItem>
            ))}
            <SelectItem value={RENTAL_CUSTOM_PLAN_ID}>Personalizado</SelectItem>
          </SelectContent>
        </Select>

        {state.isColorEquipment ? (
          <div className="grid grid-cols-2 gap-1.5">
            <label className="space-y-0.5">
              <span className="text-[0.625rem] text-muted-foreground">Negro</span>
              <input
                type="number"
                min={0}
                value={state.blackPages}
                onChange={(event) =>
                  state.setBlackPages(Math.max(0, Number(event.target.value) || 0))
                }
                className={inputClass}
              />
            </label>
            <label className="space-y-0.5">
              <span className="text-[0.625rem] text-muted-foreground">Color</span>
              <input
                type="number"
                min={0}
                value={state.colorPages}
                onChange={(event) =>
                  state.setColorPages(Math.max(0, Number(event.target.value) || 0))
                }
                className={inputClass}
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            <label className="space-y-0.5">
              <span className="text-[0.625rem] text-muted-foreground">A4</span>
              <input
                type="number"
                min={0}
                value={state.a4Pages}
                onChange={(event) =>
                  state.setA4Pages(Math.max(0, Number(event.target.value) || 0))
                }
                className={inputClass}
              />
            </label>
            <label className="space-y-0.5">
              <span className="text-[0.625rem] text-muted-foreground">A3</span>
              <input
                type="number"
                min={0}
                value={state.a3Pages}
                onChange={(event) =>
                  state.setA3Pages(Math.max(0, Number(event.target.value) || 0))
                }
                className={inputClass}
              />
            </label>
          </div>
        )}

        <label className="min-w-0 space-y-0.5">
          <span className="text-[0.625rem] font-medium text-muted-foreground">Equipos</span>
          <input
            type="number"
            min={1}
            step={1}
            value={state.equipmentQuantity}
            onChange={(event) =>
              state.setEquipmentQuantity(Math.max(1, Number(event.target.value) || 1))
            }
            className={inputClass}
          />
        </label>

        <fieldset className="space-y-0.5">
          <legend className="text-[0.625rem] font-medium text-muted-foreground">
            Plazo contrato
          </legend>
          <div className="flex gap-1">
            {RENTAL_TERM_PRESET_OPTIONS.map((months) => (
              <button
                key={months}
                type="button"
                onClick={() => {
                  state.setTermIsCustom(false);
                  state.setTermMonths(months);
                }}
                className={termButtonClassMinimal(
                  !state.termIsCustom && state.termMonths === months,
                )}
                aria-pressed={!state.termIsCustom && state.termMonths === months}
              >
                {months}m
              </button>
            ))}
            <button
              type="button"
              onClick={() => state.setTermIsCustom(true)}
              className={termButtonClassMinimal(state.termIsCustom)}
              aria-pressed={state.termIsCustom}
            >
              Otro
            </button>
          </div>
          {state.termIsCustom ? (
            <input
              type="number"
              min={1}
              value={state.customTermMonths}
              onChange={(event) =>
                state.setCustomTermMonths(Math.max(1, Number(event.target.value) || 1))
              }
              className={inputClass}
              aria-label="Plazo personalizado en meses"
            />
          ) : null}
        </fieldset>

        <ProductDetailHeroCollapsibleSection
          title="Servicios adicionales"
          badge="Opcional"
          compact
          panelAriaLabel="Servicios adicionales de alquiler"
          className="border-0 bg-transparent"
        >
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {EXTRA_SERVICES.map((service) => (
              <label
                key={service.key}
                className="flex items-center gap-1.5 text-[0.625rem] text-foreground"
              >
                <input
                  type="checkbox"
                  checked={state.extraServiceState[service.key]}
                  onChange={() => state.toggleExtraService(service.key)}
                  className="size-3 shrink-0 rounded border-border text-red-600 focus:ring-red-600"
                />
                {service.label}
                {service.key === 'laminator' ||
                service.key === 'guillotine' ||
                service.key === 'spiralBinder' ||
                service.key === 'ringBinder'
                  ? ` (+${RENTAL_FINISHING_COPY_SURCHARGE_PEN})`
                  : ''}
              </label>
            ))}
          </div>
        </ProductDetailHeroCollapsibleSection>

        <RentalPriceSummary estimate={state.estimate} variant="minimal" />
      </div>
    );
  }

  return (
    <section className={cn('overflow-hidden rounded-xl bg-white shadow-sm', className)}>
      <div className="space-y-4 px-3 py-3 sm:space-y-5 sm:px-4 sm:py-4">
        {machineTypeControl}
        {planControl}

        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-[#0f1f3d] sm:text-xs">
            Volumen de impresión / mes
          </p>
          <PageInputs state={state} />
        </div>

        {scanControl}

        <fieldset className="space-y-2">
          <legend className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-[#0f1f3d] sm:text-xs">
            <Calendar
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden={true}
            />
            Plazo del contrato
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {RENTAL_TERM_PRESET_OPTIONS.map((months) => (
              <TermButton
                key={months}
                label={`${months} meses`}
                selected={!state.termIsCustom && state.termMonths === months}
                onSelect={() => {
                  state.setTermIsCustom(false);
                  state.setTermMonths(months);
                }}
              />
            ))}
            <TermButton
              label="Personalizado"
              selected={state.termIsCustom}
              onSelect={() => state.setTermIsCustom(true)}
            />
          </div>
          {state.termIsCustom ? (
            <IconInput
              icon={Calendar}
              type="number"
              min={1}
              step={1}
              value={state.customTermMonths}
              onChange={(event) =>
                state.setCustomTermMonths(Math.max(1, Number(event.target.value) || 1))
              }
              aria-label="Plazo personalizado en meses"
            />
          ) : null}
          {state.effectiveTermMonths === 36 && !state.termIsCustom ? (
            <p className="text-[0.6875rem] font-medium text-red-600">
              Plan de 36 meses con renovación automática.
            </p>
          ) : null}
        </fieldset>

        <div className="space-y-1.5">
          <label
            htmlFor="rental-equipment-quantity"
            className="whitespace-nowrap text-[11px] font-semibold text-[#0f1f3d] sm:text-xs"
          >
            Cantidad de equipos
          </label>
          <IconInput
            id="rental-equipment-quantity"
            icon={Printer}
            type="number"
            min={1}
            step={1}
            value={state.equipmentQuantity}
            onChange={(event) =>
              state.setEquipmentQuantity(Math.max(1, Number(event.target.value) || 1))
            }
          />
        </div>

        <ProductDetailHeroCollapsibleSection
          title="Servicios adicionales"
          icon={PlusCircle}
          badge="Opcional"
          compact
          panelAriaLabel="Servicios adicionales de alquiler"
          defaultExpanded={false}
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EXTRA_SERVICES.map((service) => {
              const finishingHint =
                service.key === 'laminator' ||
                service.key === 'guillotine' ||
                service.key === 'spiralBinder' ||
                service.key === 'ringBinder'
                  ? ` (+S/ ${RENTAL_FINISHING_COPY_SURCHARGE_PEN}/pág.)`
                  : '';
              return (
                <ExtraServiceCard
                  key={service.key}
                  label={`${service.label}${finishingHint}`}
                  icon={service.Icon}
                  checked={state.extraServiceState[service.key]}
                  onToggle={() => state.toggleExtraService(service.key)}
                />
              );
            })}
          </div>
        </ProductDetailHeroCollapsibleSection>

        <RentalPriceSummary estimate={state.estimate} variant="full" />
      </div>
    </section>
  );
}
