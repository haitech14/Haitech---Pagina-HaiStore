import { useEffect, useId, useMemo, useState, type ComponentType } from 'react';

import {

  Calculator,

  Calendar,

  ChevronDown,

  Check,

  FileText,

  Laptop,

  Film,

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

import {

  RENTAL_BW_VARIABLE_COPY_COST_PEN,

  RENTAL_COLOR_BLACK_VARIABLE_COPY_COST_PEN,

  RENTAL_COLOR_VARIABLE_COPY_COST_PEN,

  RENTAL_DEFAULT_MONTHLY_PAGES,

  RENTAL_EQUIPMENT_GUILLOTINE_MONTHLY_PEN,

  RENTAL_EQUIPMENT_LAMINATOR_MONTHLY_PEN,

  RENTAL_EQUIPMENT_LAPTOP_MONTHLY_PEN,

  RENTAL_EQUIPMENT_OPERATOR_MONTHLY_PEN,

  RENTAL_EQUIPMENT_RESIDENT_TECH_MONTHLY_PEN,

  RENTAL_EQUIPMENT_SPIRAL_BINDER_MONTHLY_PEN,

  RENTAL_EXCESS_COPY_COST_PEN,

  RENTAL_PAPER_SURCHARGE_PEN,

  formatEquipmentRentalPen,

} from '@/lib/rental-calculator';

import { cn, usdToPen } from '@/lib/utils';

import type { RentalPlanOption } from '@/types/product-detail';



export interface EquipmentRentalExtraServices {
  paper: boolean;
  operator: boolean;
  laptop: boolean;
  laminator: boolean;
  guillotine: boolean;
  residentTech: boolean;
  spiralBinder: boolean;
}

export interface EquipmentRentalEstimate {

  billablePages: number;

  /** @deprecated Usar variableFeeMonthlyPen */

  copyCostMonthlyPen: number;

  fixedFeeMonthlyPen: number;

  variableFeeMonthlyPen: number;

  excessFeeMonthlyPen: number;

  blackVariableMonthlyPen: number;

  colorVariableMonthlyPen: number;

  isColorEquipment: boolean;

  estimatedMonthlyPen: number;

  termMonths: 6 | 12 | 36;

  equipmentQuantity: number;

  monthlyPages: number;

  hasExtraServices: boolean;

  laptopFeeMonthlyPen: number;

  paperSurchargeMonthlyPen: number;

  extraServicesMonthlyPen: number;

  extraServices: EquipmentRentalExtraServices;

}



interface ProductDetailRentalConfiguratorProps {

  rentalPlans: RentalPlanOption[];

  equipmentBasePriceUsd: number;

  isColorEquipment?: boolean;

  onEstimateChange?: (estimate: EquipmentRentalEstimate) => void;

  className?: string;

  hideTitle?: boolean;

  variant?: 'full' | 'minimal';

}



const EXTRA_SERVICES = [

  { key: 'paper', label: 'Suministro de papel', Icon: FileText },

  { key: 'operator', label: 'Operador dedicado', Icon: UserRound },

  { key: 'laptop', label: 'Laptop', Icon: Laptop },

  { key: 'laminator', label: 'Enmicadora', Icon: Film },

  { key: 'guillotine', label: 'Guillotina', Icon: Scissors },

  { key: 'residentTech', label: 'Técnico residente', Icon: UserCog },

  { key: 'spiralBinder', label: 'Espiraladora/Anilladora', Icon: Layers },

] as const satisfies ReadonlyArray<{

  key: string;

  label: string;

  Icon: ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>;

}>;



type ExtraServiceKey = (typeof EXTRA_SERVICES)[number]['key'];



export function computeEquipmentRentalEstimate(input: {

  monthlyPages: number;

  equipmentQuantity: number;

  termMonths: 6 | 12 | 36;

  equipmentBasePriceUsd: number;

  isColorEquipment?: boolean;

  includePaper: boolean;

  includeOperator: boolean;

  includeLaptop: boolean;

  includeLaminator: boolean;

  includeGuillotine: boolean;

  includeResidentTech: boolean;

  includeSpiralBinder: boolean;

}): EquipmentRentalEstimate {

  const pages = Math.max(1, Math.floor(input.monthlyPages || RENTAL_DEFAULT_MONTHLY_PAGES));

  const quantity = Math.max(1, input.equipmentQuantity);

  const isColorEquipment = input.isColorEquipment === true;

  const quotaBase = RENTAL_DEFAULT_MONTHLY_PAGES;

  const basePages = Math.min(pages, quotaBase);

  const excessPages = Math.max(0, pages - quotaBase);



  const productValuePen = usdToPen(input.equipmentBasePriceUsd);

  const equipmentFixedFeeMonthlyPen =

    Math.round(((productValuePen * 1.2) / input.termMonths) * quantity * 100) / 100;

  const laptopFeeMonthlyPen = input.includeLaptop ? RENTAL_EQUIPMENT_LAPTOP_MONTHLY_PEN : 0;

  const fixedFeeMonthlyPen =

    Math.round((equipmentFixedFeeMonthlyPen + laptopFeeMonthlyPen) * 100) / 100;



  let blackVariableMonthlyPen = 0;

  let colorVariableMonthlyPen = 0;

  let excessFeeMonthlyPen = 0;



  if (isColorEquipment) {

    const blackBase = basePages * RENTAL_COLOR_BLACK_VARIABLE_COPY_COST_PEN;

    const blackExcess = excessPages * RENTAL_EXCESS_COPY_COST_PEN;

    const colorBase = basePages * RENTAL_COLOR_VARIABLE_COPY_COST_PEN;

    const colorExcess = excessPages * RENTAL_COLOR_VARIABLE_COPY_COST_PEN;

    blackVariableMonthlyPen =

      Math.round((blackBase + blackExcess) * quantity * 100) / 100;

    colorVariableMonthlyPen =

      Math.round((colorBase + colorExcess) * quantity * 100) / 100;

    excessFeeMonthlyPen =

      Math.round((blackExcess + colorExcess) * quantity * 100) / 100;

  } else {

    const baseVariable = basePages * RENTAL_BW_VARIABLE_COPY_COST_PEN;

    const excessVariable = excessPages * RENTAL_EXCESS_COPY_COST_PEN;

    blackVariableMonthlyPen =

      Math.round((baseVariable + excessVariable) * quantity * 100) / 100;

    excessFeeMonthlyPen = Math.round(excessVariable * quantity * 100) / 100;

  }



  const paperSurchargeMonthlyPen = input.includePaper

    ? Math.round(pages * RENTAL_PAPER_SURCHARGE_PEN * quantity * 100) / 100

    : 0;



  const variableFeeMonthlyPen =

    Math.round((blackVariableMonthlyPen + colorVariableMonthlyPen + paperSurchargeMonthlyPen) * 100) / 100;



  let extraServicesMonthlyPen = 0;

  if (input.includeGuillotine) {

    extraServicesMonthlyPen += RENTAL_EQUIPMENT_GUILLOTINE_MONTHLY_PEN;

  }

  if (input.includeLaminator) {

    extraServicesMonthlyPen += RENTAL_EQUIPMENT_LAMINATOR_MONTHLY_PEN;

  }

  if (input.includeOperator) {

    extraServicesMonthlyPen += RENTAL_EQUIPMENT_OPERATOR_MONTHLY_PEN;

  }

  if (input.includeResidentTech) {

    extraServicesMonthlyPen += RENTAL_EQUIPMENT_RESIDENT_TECH_MONTHLY_PEN;

  }

  if (input.includeSpiralBinder) {

    extraServicesMonthlyPen += RENTAL_EQUIPMENT_SPIRAL_BINDER_MONTHLY_PEN;

  }

  extraServicesMonthlyPen = Math.round(extraServicesMonthlyPen * 100) / 100;



  const estimatedMonthlyPen =

    Math.round((fixedFeeMonthlyPen + variableFeeMonthlyPen + extraServicesMonthlyPen) * 100) / 100;



  return {

    billablePages: pages,

    copyCostMonthlyPen: variableFeeMonthlyPen,

    fixedFeeMonthlyPen,

    variableFeeMonthlyPen,

    excessFeeMonthlyPen,

    blackVariableMonthlyPen,

    colorVariableMonthlyPen,

    isColorEquipment,

    estimatedMonthlyPen,

    termMonths: input.termMonths,

    equipmentQuantity: quantity,

    monthlyPages: pages,

    laptopFeeMonthlyPen,

    paperSurchargeMonthlyPen,

    extraServicesMonthlyPen,

    hasExtraServices:

      input.includePaper ||

      input.includeOperator ||

      input.includeLaptop ||

      input.includeLaminator ||

      input.includeGuillotine ||

      input.includeResidentTech ||

      input.includeSpiralBinder,

    extraServices: {

      paper: input.includePaper,

      operator: input.includeOperator,

      laptop: input.includeLaptop,

      laminator: input.includeLaminator,

      guillotine: input.includeGuillotine,

      residentTech: input.includeResidentTech,

      spiralBinder: input.includeSpiralBinder,

    },

  };

}



export { formatEquipmentRentalPen } from '@/lib/rental-calculator';

function formatPen(value: number): string {
  return formatEquipmentRentalPen(value);
}



function useRentalConfiguratorState(

  rentalPlans: RentalPlanOption[],

  equipmentBasePriceUsd: number,

  isColorEquipment: boolean,

  onEstimateChange?: (estimate: EquipmentRentalEstimate) => void,

) {

  const [includeLaminator, setIncludeLaminator] = useState(false);

  const [includeGuillotine, setIncludeGuillotine] = useState(false);

  const [monthlyPages, setMonthlyPages] = useState(() => rentalPlans[0]?.pagesPerMonth ?? 5000);

  const [equipmentQuantity, setEquipmentQuantity] = useState(1);

  const [termMonths, setTermMonths] = useState<6 | 12 | 36>(12);

  const [includePaper, setIncludePaper] = useState(false);

  const [includeOperator, setIncludeOperator] = useState(false);

  const [includeLaptop, setIncludeLaptop] = useState(false);

  const [includeResidentTech, setIncludeResidentTech] = useState(false);

  const [includeSpiralBinder, setIncludeSpiralBinder] = useState(false);



  const rentalPageSuggestions = useMemo(

    () =>

      Array.from(

        new Set([RENTAL_DEFAULT_MONTHLY_PAGES, ...rentalPlans.map((plan) => plan.pagesPerMonth)]),

      )

        .filter((pages) => pages > 0)

        .sort((a, b) => a - b),

    [rentalPlans],

  );



  const estimate = useMemo(

    () =>

      computeEquipmentRentalEstimate({

        monthlyPages,

        equipmentQuantity,

        termMonths,

        equipmentBasePriceUsd,

        isColorEquipment,

        includePaper,

        includeOperator,

        includeLaptop,

        includeLaminator,

        includeGuillotine,

        includeResidentTech,

        includeSpiralBinder,

      }),

    [

      monthlyPages,

      equipmentQuantity,

      termMonths,

      equipmentBasePriceUsd,

      isColorEquipment,

      includePaper,

      includeOperator,

      includeLaptop,

      includeLaminator,

      includeGuillotine,

      includeResidentTech,

      includeSpiralBinder,

    ],

  );



  useEffect(() => {

    if (

      rentalPageSuggestions.length > 0 &&

      !rentalPageSuggestions.includes(monthlyPages)

    ) {

      setMonthlyPages(rentalPageSuggestions[0]);

    }

  }, [rentalPageSuggestions, monthlyPages]);



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

    }

  };



  return {

    monthlyPages,

    setMonthlyPages,

    equipmentQuantity,

    setEquipmentQuantity,

    termMonths,

    setTermMonths,

    rentalPageSuggestions,

    estimate,

    extraServiceState,

    toggleExtraService,

    includePaper,

    includeOperator,

    includeLaptop,

    includeLaminator,

    includeGuillotine,

    includeResidentTech,

    includeSpiralBinder,

  };

}



function RentalPriceSummary({

  estimate,

  isColorEquipment,

  variant,

}: {

  estimate: EquipmentRentalEstimate;

  isColorEquipment: boolean;

  variant: 'full' | 'minimal';

}) {

  const selectedExtraLabels = [

    estimate.extraServices.paper ? 'Suministro de papel' : null,

    estimate.extraServices.operator ? 'Operador dedicado' : null,

    estimate.extraServices.laptop ? 'Laptop' : null,

    estimate.extraServices.laminator ? 'Enmicadora' : null,

    estimate.extraServices.guillotine ? 'Guillotina' : null,

    estimate.extraServices.residentTech ? 'Técnico residente' : null,

    estimate.extraServices.spiralBinder ? 'Espiraladora/Anilladora' : null,

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



  const paperNote =

    estimate.paperSurchargeMonthlyPen > 0

      ? ` + S/ ${RENTAL_PAPER_SURCHARGE_PEN} papel × ${estimate.billablePages.toLocaleString('es-PE')} impresiones`

      : '';



  const variableFormula = isColorEquipment ? (

    <>

      S/ {RENTAL_COLOR_BLACK_VARIABLE_COPY_COST_PEN} negro + S/ {RENTAL_COLOR_VARIABLE_COPY_COST_PEN}{' '}

      color × {estimate.billablePages.toLocaleString('es-PE')} impresiones

      {estimate.excessFeeMonthlyPen > 0

        ? ` (excedentes S/ ${formatPen(estimate.excessFeeMonthlyPen)})`

        : null}

      {paperNote}

    </>

  ) : (

    <>

      S/ {RENTAL_BW_VARIABLE_COPY_COST_PEN} × {estimate.billablePages.toLocaleString('es-PE')}{' '}

      impresiones

      {estimate.excessFeeMonthlyPen > 0

        ? ` (excedentes S/ ${formatPen(estimate.excessFeeMonthlyPen)})`

        : null}

      {paperNote}

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

                <p className="text-xs font-semibold text-[#0f1f3d]">Servicios adicionales</p>

                <p className="mt-0.5 text-[0.6875rem] leading-snug text-muted-foreground">

                  {selectedExtraLabels.join(', ')}

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



      <div className="mt-2" aria-live="polite" aria-atomic="true">

        <p className="text-2xl font-bold leading-tight text-foreground sm:text-[1.75rem]">

          <RentalEstimateDualPrice estimatedMonthlyPen={estimate.estimatedMonthlyPen} />

          <span className="ml-1 text-sm font-semibold text-muted-foreground">/ mes</span>

        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">

          {estimate.equipmentQuantity} equipo

          {estimate.equipmentQuantity > 1 ? 's' : ''} ·{' '}

          {estimate.billablePages.toLocaleString('es-PE')} pág./mes · IGV incluido

        </p>

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



function IconSelect({

  id,

  icon: Icon,

  value,

  onValueChange,

  options,

  className,

}: {

  id: string;

  icon: ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>;

  value: number;

  onValueChange: (value: number) => void;

  options: number[];

  className?: string;

}) {

  return (

    <Select value={String(value)} onValueChange={(next) => onValueChange(Number(next))}>

      <div className="relative">

        <Icon

          className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"

          strokeWidth={1.75}

          aria-hidden={true}

        />

        <SelectTrigger

          id={id}

          className={cn(

            'h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground shadow-none focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-0',

            className,

          )}

        >

          <SelectValue />

        </SelectTrigger>

      </div>

      <SelectContent>

        {options.map((pages) => (

          <SelectItem key={pages} value={String(pages)}>

            {pages.toLocaleString('es-PE')}

          </SelectItem>

        ))}

      </SelectContent>

    </Select>

  );

}



function TermButton({

  months,

  selected,

  onSelect,

}: {

  months: 6 | 12 | 36;

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

      {months} meses

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



  const termButtonClassMinimal = (months: number) =>

    cn(

      'h-6 flex-1 rounded border px-0.5 text-[0.6875rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-600',

      state.termMonths === months

        ? 'border-red-600 bg-red-50 text-foreground'

        : 'border-border bg-background text-foreground hover:bg-muted/30',

    );



  if (variant === 'minimal') {

    return (

      <div className={cn('space-y-2', className)}>

        {hideTitle ? null : (

          <p className="text-xs font-semibold text-[#0f1f3d]">Configura tu alquiler</p>

        )}



        <div className="grid grid-cols-2 gap-1.5">

          <label className="min-w-0 space-y-0.5">

            <span className="text-[0.625rem] font-medium text-muted-foreground">

              Págs / mes

            </span>

            <input

              type="number"

              min={1}

              step={500}

              value={state.monthlyPages}

              onChange={(event) =>

                state.setMonthlyPages(

                  Math.max(1, Number(event.target.value) || RENTAL_DEFAULT_MONTHLY_PAGES),

                )

              }

              className={inputClass}

            />

          </label>



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

        </div>



        <fieldset className="space-y-0.5">

          <legend className="text-[0.625rem] font-medium text-muted-foreground">

            Plazo contrato

          </legend>

          <div className="flex gap-1">

            {[6, 12, 36].map((months) => (

              <button

                key={months}

                type="button"

                onClick={() => state.setTermMonths(months as 6 | 12 | 36)}

                className={termButtonClassMinimal(months)}

                aria-pressed={state.termMonths === months}

              >

                {months}m

              </button>

            ))}

          </div>

          {state.termMonths === 36 ? (

            <p className="text-[0.5625rem] font-medium leading-tight text-red-600">

              Renovación automática.

            </p>

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

              </label>

            ))}

          </div>

        </ProductDetailHeroCollapsibleSection>



        <RentalPriceSummary

          estimate={state.estimate}

          isColorEquipment={isColorEquipment}

          variant="minimal"

        />

      </div>

    );

  }



  return (

    <section

      className={cn(

        'overflow-hidden rounded-xl bg-white shadow-sm',

        className,

      )}

    >

      <div className="space-y-4 px-3 py-3 sm:space-y-5 sm:px-4 sm:py-4">

        <div className="space-y-1.5">

          <label

            htmlFor="rental-monthly-pages"

            className="whitespace-nowrap text-[11px] font-semibold text-[#0f1f3d] sm:text-xs"

          >

            Cantidad de págs / mes

          </label>

          <IconSelect

            id="rental-monthly-pages"

            icon={FileText}

            value={state.monthlyPages}

            onValueChange={state.setMonthlyPages}

            options={state.rentalPageSuggestions}

          />

        </div>



        <fieldset className="space-y-2">

          <legend className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-[#0f1f3d] sm:text-xs">

            <Calendar className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden={true} />

            Plazo del contrato

          </legend>

          <div className="grid grid-cols-3 gap-2">

            {([6, 12, 36] as const).map((months) => (

              <TermButton

                key={months}

                months={months}

                selected={state.termMonths === months}

                onSelect={() => state.setTermMonths(months)}

              />

            ))}

          </div>

          {state.termMonths === 36 ? (

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

            {EXTRA_SERVICES.map((service) => (

              <ExtraServiceCard

                key={service.key}

                label={service.label}

                icon={service.Icon}

                checked={state.extraServiceState[service.key]}

                onToggle={() => state.toggleExtraService(service.key)}

              />

            ))}

          </div>

        </ProductDetailHeroCollapsibleSection>



        <RentalPriceSummary

          estimate={state.estimate}

          isColorEquipment={isColorEquipment}

          variant="full"

        />

      </div>

    </section>

  );

}


