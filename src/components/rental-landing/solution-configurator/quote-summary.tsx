import { ArrowRight, Check, MapPin, Package, Printer } from 'lucide-react';

import { PagesEditPopover } from '@/components/rental-landing/solution-configurator/pages-edit-popover';
import { Button } from '@/components/ui/button';
import {
  OPERATIONAL_SERVICE_EVERY_PAGES,
  OPERATIONAL_SERVICE_FEE_PEN,
  OPERATIONAL_TONER_PARTS_PER_PAGE_PEN,
  SOLUTION_MIN_MONTHLY_PEN,
  SOLUTION_TERM_OPTIONS,
  clampVolumePages,
  conditionLabel,
  equipmentLabel,
  formatCopyCostPen,
  formatSolutionPen,
  formatSolutionTermLabel,
  formatSolutionVolumeLabel,
  includesForCondition,
  modelById,
  type SolutionConfiguratorState,
  type SolutionQuoteBreakdown,
  type SolutionTermMonths,
} from '@/data/rental-solution-configurator';
import { cn } from '@/lib/utils';

interface QuoteSummaryProps {
  state: SolutionConfiguratorState;
  quote: SolutionQuoteBreakdown;
  onRequestProposal: () => void;
  onBlackPagesChange?: (value: number) => void;
  onColorPagesChange?: (value: number) => void;
  onVolumePagesChange?: (value: number) => void;
  onTermChange?: (value: SolutionTermMonths) => void;
  canEditMinBagSplit?: boolean;
  className?: string;
}

export function QuoteSummary({
  state,
  quote,
  onRequestProposal,
  onBlackPagesChange,
  onColorPagesChange,
  onVolumePagesChange,
  onTermChange,
  canEditMinBagSplit = false,
  className,
}: QuoteSummaryProps) {
  const model = modelById(state.modelId);
  const isColor = model.printType === 'color' && model.usesPrintVolume;
  const isNueva = state.condition === 'nueva';
  const isOperativo = state.condition === 'operativo';
  const planIncludes = includesForCondition(state.condition);
  const volume = clampVolumePages(state.volumePages);

  const handleBlackChange = (raw: number) => {
    const nextBlack = Math.max(0, Math.min(volume, Math.floor(raw) || 0));
    const nextColor = Math.max(0, volume - nextBlack);
    onBlackPagesChange?.(nextBlack);
    onColorPagesChange?.(nextColor);
    onVolumePagesChange?.(clampVolumePages(nextBlack + nextColor));
  };

  const handleColorChange = (raw: number) => {
    const nextColor = Math.max(0, Math.min(volume, Math.floor(raw) || 0));
    const nextBlack = Math.max(0, volume - nextColor);
    onColorPagesChange?.(nextColor);
    onBlackPagesChange?.(nextBlack);
    onVolumePagesChange?.(clampVolumePages(nextBlack + nextColor));
  };

  return (
    <aside
      className={cn(
        'rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-[0_16px_36px_-22px_rgba(15,23,42,0.45)]',
        'lg:sticky lg:top-24',
        className,
      )}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-[#111111]">Tu cotización estimada</p>
        <span className="inline-flex items-center rounded-full bg-[#E8F8EE] px-2.5 py-1 text-[11px] font-bold text-[#1B7A3D]">
          Ahorra hasta {quote.savingsPercent}%
        </span>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Plazo</p>
        <div
          className="mt-1.5 grid grid-cols-3 gap-1.5"
          role="radiogroup"
          aria-label="Plazo de alquiler"
        >
          {SOLUTION_TERM_OPTIONS.map((option) => {
            const selected = state.termMonths === option.months;
            return (
              <button
                key={option.months}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!onTermChange}
                onClick={() => onTermChange?.(option.months)}
                className={cn(
                  'rounded-full border px-2 py-1.5 text-center text-[11px] font-bold transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]',
                  selected
                    ? 'border-[#E30613] bg-[#FFF1F1] text-[#E30613]'
                    : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#E30613]/40',
                  !onTermChange && 'cursor-default',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#E30613]/25 bg-[#FFF1F2] px-3.5 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#991B1B]">
          Total mensual
        </p>
        <p className="mt-1 flex flex-wrap items-baseline gap-1.5">
          <span className="text-3xl font-black tracking-tight text-[#111111] sm:text-[2.35rem]">
            {formatSolutionPen(quote.subtotalMonthly, 2)}
          </span>
          <span className="text-sm font-semibold text-[#6B7280]">/mes · sin IGV</span>
        </p>
        <p className="mt-2 border-t border-[#E30613]/15 pt-2 flex flex-wrap items-baseline gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#991B1B]">
            Total con IGV
          </span>
          <span className="text-xl font-black tracking-tight text-[#111111]">
            {formatSolutionPen(quote.totalMonthly, 2)}
          </span>
          <span className="text-sm font-semibold text-[#6B7280]">/mes</span>
        </p>
        {quote.minMonthlyApplied > 0 ? (
          <p className="mt-2 text-[11px] leading-snug text-[#991B1B]">
            El alquiler no baja de {formatSolutionPen(SOLUTION_MIN_MONTHLY_PEN)} al mes, aunque el
            volumen sea menor.
          </p>
        ) : null}
      </div>

      <dl className="mt-5 space-y-2 border-t border-[#F0F0F0] pt-4 text-[12px] sm:text-[13px]">
        <div className="flex items-start gap-2">
          <Printer className="mt-0.5 size-3.5 shrink-0 text-[#E30613]" aria-hidden />
          <div className="min-w-0 flex-1">
            <dt className="text-[#9CA3AF]">Equipo</dt>
            <dd className="font-semibold text-[#111111]">
              {equipmentLabel(state)}
              {state.quantity > 1 ? ` × ${state.quantity}` : ''}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Package className="mt-0.5 size-3.5 shrink-0 text-[#E30613]" aria-hidden />
          <div>
            <dt className="text-[#9CA3AF]">Condición</dt>
            <dd className="font-semibold text-[#111111]">{conditionLabel(state.condition)}</dd>
          </div>
        </div>
        {model.usesPrintVolume ? (
          <div className="flex items-start gap-2">
            <Package className="mt-0.5 size-3.5 shrink-0 text-[#E30613]" aria-hidden />
            <div className="min-w-0 flex-1">
              <dt className="text-[#9CA3AF]">Volumen</dt>
              {isColor ? (
                <dd className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-semibold text-[#111111]">
                  <span className="inline-flex items-center gap-1">
                    {state.blackPages.toLocaleString('es-PE')} negro
                    {canEditMinBagSplit && onBlackPagesChange ? (
                      <PagesEditPopover
                        kind="black"
                        value={state.blackPages}
                        volume={volume}
                        onSelect={handleBlackChange}
                      />
                    ) : null}
                  </span>
                  <span className="text-[#9CA3AF]">+</span>
                  <span className="inline-flex items-center gap-1">
                    {state.colorPages.toLocaleString('es-PE')} color
                    {canEditMinBagSplit && onColorPagesChange ? (
                      <PagesEditPopover
                        kind="color"
                        value={state.colorPages}
                        volume={volume}
                        onSelect={handleColorChange}
                      />
                    ) : null}
                  </span>
                </dd>
              ) : (
                <dd className="font-semibold text-[#111111]">
                  {formatSolutionVolumeLabel(state.volumePages)}
                </dd>
              )}
            </div>
          </div>
        ) : null}
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#E30613]" aria-hidden />
          <div className="min-w-0 flex-1">
            <dt className="text-[#9CA3AF]">Ciudad</dt>
            <dd className="font-semibold text-[#111111]">{state.city.trim() || 'Lima'}</dd>
            {state.district.trim() ? (
              <>
                <dt className="mt-1.5 text-[#9CA3AF]">Distrito</dt>
                <dd className="font-semibold text-[#111111]">{state.district.trim()}</dd>
              </>
            ) : null}
          </div>
        </div>
      </dl>

      <div className="mt-4 space-y-2 rounded-xl border border-[#ECECEC] bg-[#FAFAFA] p-3 text-[11px] leading-snug text-[#4B5563]">
        <p className="font-semibold text-[#111111]">Desglose mensual (sin IGV)</p>

        {isNueva ? (
          <ul className="space-y-0.5">
            <li>
              Cuota equipo (corp. + 20% / {formatSolutionTermLabel(state.termMonths)}):{' '}
              <span className="font-medium text-[#111111]">
                {formatSolutionPen(quote.equipmentFinanceMonthly, 2)}
              </span>
            </li>
            <li className="text-[#9CA3AF]">
              Corp. US$ {quote.corporateSaleUsd.toLocaleString('es-PE')} →{' '}
              {formatSolutionPen(quote.corporateSalePen)} + 20% ={' '}
              {formatSolutionPen(quote.financedValuePen)}
            </li>
          </ul>
        ) : null}

        {isOperativo ? (
          <div className="space-y-2 rounded-lg border border-[#E8E8E8] bg-white/70 p-2.5">
            <p className="flex flex-wrap items-baseline justify-between gap-1 font-semibold text-[#111111]">
              <span>Alquiler operativo (máquina)</span>
              <span>{formatSolutionPen(quote.operationalMachineMonthly, 2)}</span>
            </p>
            <p className="text-[#9CA3AF]">
              {model.paperFormat} · {isColor ? 'Color' : 'B/N'} · sin bolsa ni costo por copia
            </p>
            {model.usesPrintVolume ? (
              <ul className="space-y-0.5 border-t border-[#F0F0F0] pt-2">
                <li className="flex flex-wrap items-baseline justify-between gap-1">
                  <span>Simulación tóner + repuestos</span>
                  <span className="font-medium text-[#111111]">
                    {formatSolutionPen(quote.tonerPartsMonthly, 2)}
                  </span>
                </li>
                <li className="text-[#9CA3AF]">
                  {isColor
                    ? `Negro ${formatCopyCostPen(OPERATIONAL_TONER_PARTS_PER_PAGE_PEN.colorBlack)} · color ${formatCopyCostPen(OPERATIONAL_TONER_PARTS_PER_PAGE_PEN.color)} /pág.`
                    : `${formatCopyCostPen(OPERATIONAL_TONER_PARTS_PER_PAGE_PEN.bw)}/pág. B/N`}
                </li>
                <li className="flex flex-wrap items-baseline justify-between gap-1">
                  <span>
                    Servicio técnico (cada {OPERATIONAL_SERVICE_EVERY_PAGES.toLocaleString('es-PE')}{' '}
                    págs)
                  </span>
                  <span className="font-medium text-[#111111]">
                    {formatSolutionPen(quote.serviceTechMonthly, 2)}
                  </span>
                </li>
                <li className="text-[#9CA3AF]">
                  ~{quote.serviceTechVisitsYearly.toLocaleString('es-PE', {
                    maximumFractionDigits: 2,
                  })}{' '}
                  visitas/año · S/{' '}
                  {isColor ? OPERATIONAL_SERVICE_FEE_PEN.color : OPERATIONAL_SERVICE_FEE_PEN.bw} por
                  visita
                </li>
              </ul>
            ) : null}
          </div>
        ) : model.usesPrintVolume ? (
          <div className="space-y-1 rounded-lg border border-[#E8E8E8] bg-white/70 p-2.5">
            <p className="flex flex-wrap items-baseline justify-between gap-1 font-semibold text-[#111111]">
              <span>Impresión (bolsa + excedentes)</span>
              <span>{formatSolutionPen(quote.printBundleMonthly, 2)}</span>
            </p>
            <ul className="space-y-0.5 pl-0.5">
              <li>
                Bolsa ({quote.includedPages.toLocaleString('es-PE')} págs):{' '}
                <span className="font-medium text-[#111111]">
                  {formatSolutionPen(quote.planBaseMonthly, 2)}
                </span>
              </li>
              {isColor ? (
                <>
                  <li className="text-[#9CA3AF]">
                    Tarifas: negro {formatCopyCostPen(quote.colorBlackCopyCost)} · color{' '}
                    {formatCopyCostPen(quote.colorCopyCost)} /pág. + IGV
                  </li>
                  <li>
                    Excedente negro ({state.excessBlackPages.toLocaleString('es-PE')} págs):{' '}
                    <span className="font-medium text-[#111111]">
                      {formatSolutionPen(quote.blackCopyMonthly, 2)}
                    </span>
                  </li>
                  <li>
                    Excedente color ({state.excessColorPages.toLocaleString('es-PE')} págs):{' '}
                    <span className="font-medium text-[#111111]">
                      {formatSolutionPen(quote.colorCopyMonthly, 2)}
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li className="text-[#9CA3AF]">
                    Tarifa B/N {formatCopyCostPen(quote.bwCopyCost)}/pág. A4 eq. + IGV
                  </li>
                  <li>
                    Excedentes ({quote.excessPages.toLocaleString('es-PE')} págs
                    {model.paperFormat === 'A3' && state.excessBlackPages > 0
                      ? ` · ${state.excessBlackPages.toLocaleString('es-PE')} A3`
                      : ''}
                    ):{' '}
                    <span className="font-medium text-[#111111]">
                      {formatSolutionPen(quote.copyVariableMonthly, 2)}
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>
        ) : (
          <ul className="space-y-0.5">
            <li>
              Cuota base:{' '}
              <span className="font-medium text-[#111111]">
                {formatSolutionPen(quote.planBaseMonthly + quote.equipmentFinanceMonthly, 2)}
              </span>
            </li>
          </ul>
        )}

        {model.usesPrintVolume && !isOperativo ? (
          <ul className="space-y-0.5">
            <li>
              Escaneo (cortesía {quote.scanCourtesyPages.toLocaleString('es-PE')} págs · excedente{' '}
              {quote.scanExcessPages.toLocaleString('es-PE')} × {formatCopyCostPen(quote.scanCopyCost)}
              ):{' '}
              <span className="font-medium text-[#111111]">
                {formatSolutionPen(quote.scanMonthly, 2)}
              </span>
            </li>
            <li>
              Costo de envío (
              {model.paperFormat}: S/ {quote.shippingLegPen} ida + S/ {quote.shippingLegPen} vuelta ={' '}
              {formatSolutionPen(quote.shippingTotalPen)} / {formatSolutionTermLabel(state.termMonths)}
              ):{' '}
              <span className="font-medium text-[#111111]">
                {formatSolutionPen(quote.shippingMonthly, 2)}
              </span>
            </li>
          </ul>
        ) : (
          <ul className="space-y-0.5">
            <li>
              Costo de envío (S/ {quote.shippingLegPen} ida + S/ {quote.shippingLegPen} vuelta /{' '}
              {formatSolutionTermLabel(state.termMonths)}):{' '}
              <span className="font-medium text-[#111111]">
                {formatSolutionPen(quote.shippingMonthly, 2)}
              </span>
            </li>
          </ul>
        )}

        {quote.extrasMonthly > 0 ? (
          <p>
            Adicionales:{' '}
            <span className="font-medium text-[#111111]">
              {formatSolutionPen(quote.extrasMonthly, 2)}
            </span>
          </p>
        ) : null}
        {quote.locationMonthly > 0 ? (
          <p>
            Ajuste provincias:{' '}
            <span className="font-medium text-[#111111]">
              {formatSolutionPen(quote.locationMonthly, 2)}
            </span>
          </p>
        ) : null}
        {quote.minMonthlyApplied > 0 ? (
          <p>
            Mínimo mensual ({formatSolutionPen(SOLUTION_MIN_MONTHLY_PEN)}):{' '}
            <span className="font-medium text-[#111111]">
              {formatSolutionPen(quote.minMonthlyApplied, 2)}
            </span>
          </p>
        ) : null}
      </div>

      <div className="mt-5 rounded-xl bg-[#FAFAFA] p-3.5">
        <p className="text-xs font-bold text-[#991B1B]">Este plan incluye</p>
        <ul className="mt-2.5 space-y-1.5">
          {planIncludes.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[12px] leading-snug text-[#4B5563] sm:text-[13px]"
            >
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-[#E30613]"
                strokeWidth={2.5}
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Button
        type="button"
        className="mt-5 h-12 w-full gap-1.5 bg-[#E30613] text-sm font-bold text-white hover:bg-[#c40511]"
        onClick={onRequestProposal}
      >
        Solicitar cotización
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
      <p className="mt-2.5 text-center text-[11px] leading-snug text-[#9CA3AF]">
        Genera la proforma PDF con los mismos datos de la cotización de tienda.
      </p>
    </aside>
  );
}
