import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { EquipmentModelCombobox } from '@/components/maintenance-plan-landing/EquipmentModelCombobox';
import { EquipmentSelector } from '@/components/maintenance-plan-landing/EquipmentSelector';
import { MaintenanceStepHeader } from '@/components/maintenance-plan-landing/MaintenanceStepHeader';
import { PricingSummary } from '@/components/maintenance-plan-landing/PricingSummary';
import { VisitScheduler } from '@/components/maintenance-plan-landing/VisitScheduler';
import { Label } from '@/components/ui/label';
import {
  DEFAULT_MAINTENANCE_PLAN_STATE,
  MAINTENANCE_CITY_SUGGESTIONS,
  MAINTENANCE_LIMA_DISTRICT_SUGGESTIONS,
  MAINTENANCE_PAPER_FORMATS,
  MAINTENANCE_PLAN_CALCULATOR_ID,
  MAINTENANCE_PRINT_TYPES,
  MAINTENANCE_VOLUME_OPTIONS,
  MAINTENANCE_VOLUME_SLIDER_MAX,
  MAINTENANCE_VOLUME_SLIDER_MIN,
  MAINTENANCE_VOLUME_MAX,
  MAINTENANCE_VOLUME_MIN,
  buildMaintenancePlanWhatsAppMessage,
  calculateMaintenancePlanQuote,
  clampMaintenanceQuantity,
  clampMaintenanceVolume,
  defaultModelForEquipment,
  defaultModelForEquipmentSpecs,
  difficultyLabel,
  isLimaCity,
  maintenanceEquipmentById,
  maintenanceModelById,
  modelsForEquipment,
  type MaintenanceEquipmentId,
  type MaintenancePaperFormat,
  type MaintenancePlanState,
  type MaintenancePrintType,
  type MaintenanceServiceModeId,
} from '@/data/maintenance-plan';
import {
  CATALOG_INDEX_UPDATED_EVENT,
  getCatalogActiveRows,
  loadCatalogIndex,
} from '@/lib/catalog-featured';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

const FIELD =
  'h-11 min-h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111111] outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]';

const optionCardClass = (selected: boolean) =>
  cn(
    'rounded-xl border px-3.5 py-3 text-left transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]',
    selected
      ? 'border-[#E30613] bg-[#FFF1F1] ring-1 ring-[#E30613]/20'
      : 'border-[#E5E7EB] bg-white hover:border-[#E30613]/40',
  );

export function MaintenanceCalculator({
  className,
  serviceMode = 'plan',
}: {
  className?: string;
  serviceMode?: MaintenanceServiceModeId;
}) {
  const [state, setState] = useState<MaintenancePlanState>(DEFAULT_MAINTENANCE_PLAN_STATE);
  const [catalogTick, setCatalogTick] = useState(0);
  const catalog = useMemo(() => {
    void catalogTick;
    return getCatalogActiveRows();
  }, [catalogTick]);
  const mergedState = useMemo(() => ({ ...state, serviceMode }), [state, serviceMode]);
  const quote = useMemo(
    () => calculateMaintenancePlanQuote(mergedState, catalog),
    [catalog, mergedState],
  );
  const equipment = maintenanceEquipmentById(mergedState.equipmentId);
  const model = maintenanceModelById(mergedState.modelId);
  const showPrintSpecs = equipment.usesPrintSpecs;
  const isPlan = serviceMode === 'plan';
  const equipmentModels = modelsForEquipment(state.equipmentId);
  const availablePaperFormats = showPrintSpecs
    ? MAINTENANCE_PAPER_FORMATS.filter((format) =>
        equipmentModels.some((item) => item.paperFormat === format.id),
      )
    : MAINTENANCE_PAPER_FORMATS;
  const availablePrintTypes = showPrintSpecs
    ? MAINTENANCE_PRINT_TYPES.filter((print) =>
        equipmentModels.some(
          (item) =>
            item.printType === print.id &&
            (availablePaperFormats.some((f) => f.id === state.paperFormat)
              ? item.paperFormat === state.paperFormat
              : true),
        ),
      )
    : MAINTENANCE_PRINT_TYPES;

  const patch = (partial: Partial<MaintenancePlanState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  useEffect(() => {
    void loadCatalogIndex().then(() => setCatalogTick((value) => value + 1));
    const onUpdated = () => setCatalogTick((value) => value + 1);
    window.addEventListener(CATALOG_INDEX_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(CATALOG_INDEX_UPDATED_EVENT, onUpdated);
  }, []);

  const volumePct = Math.min(
    100,
    Math.max(
      0,
      ((Math.min(MAINTENANCE_VOLUME_SLIDER_MAX, Math.max(MAINTENANCE_VOLUME_SLIDER_MIN, state.volumePages)) -
        MAINTENANCE_VOLUME_SLIDER_MIN) /
        (MAINTENANCE_VOLUME_SLIDER_MAX - MAINTENANCE_VOLUME_SLIDER_MIN)) *
        100,
    ),
  );

  const handleEquipmentChange = (equipmentId: MaintenanceEquipmentId) => {
    const nextModel = defaultModelForEquipment(equipmentId);
    patch({
      equipmentId,
      paperFormat: nextModel.paperFormat,
      printType: nextModel.printType,
      modelId: nextModel.id,
      customModel: '',
      planKind: nextModel.usesPrintVolume ? state.planKind : 'maintenance',
    });
  };

  const handlePaperFormat = (paperFormat: MaintenancePaperFormat) => {
    const nextModel = defaultModelForEquipmentSpecs(
      state.equipmentId,
      paperFormat,
      state.printType,
    );
    patch({
      paperFormat: nextModel.paperFormat,
      printType: nextModel.printType,
      modelId: nextModel.id,
      customModel: state.customModel.trim() ? state.customModel : '',
    });
  };

  const handlePrintType = (printType: MaintenancePrintType) => {
    const nextModel = defaultModelForEquipmentSpecs(
      state.equipmentId,
      state.paperFormat,
      printType,
    );
    patch({
      paperFormat: nextModel.paperFormat,
      printType: nextModel.printType,
      modelId: nextModel.id,
      customModel: state.customModel.trim() ? state.customModel : '',
    });
  };

  const handleRequestPlan = () => {
    const href = buildHaitechWhatsAppUrl(buildMaintenancePlanWhatsAppMessage(mergedState, quote));
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  if (!isPlan) {
    return <VisitScheduler className={className} />;
  }

  return (
    <section
      id={MAINTENANCE_PLAN_CALCULATOR_ID}
      aria-labelledby="maintenance-calculator-title"
      className={cn('scroll-mt-20 bg-[#F7F7F8] py-12 sm:py-16', className)}
    >
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="maintenance-calculator-title"
            className="text-balance text-2xl font-black tracking-tight text-[#111111] sm:text-3xl"
          >
            Configura tu plan
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4B5563] sm:text-base">
            Elige equipo, modelo y ubicación para estimar tu plan de mantenimiento.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)] lg:items-start lg:gap-8">
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E8E8E8] bg-white p-4 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)] sm:p-6">
              <MaintenanceStepHeader
                step={1}
                title="Configura tu plan"
                subtitle="Selecciona el tipo de equipo, modelo y ubicación."
              />

              <div className="mt-5 space-y-5">
                <EquipmentSelector value={state.equipmentId} onChange={handleEquipmentChange} />

                {showPrintSpecs ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-[#111111]">
                        Formato de papel
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(availablePaperFormats.length > 0
                          ? availablePaperFormats
                          : MAINTENANCE_PAPER_FORMATS
                        ).map((option) => {
                          const selected = option.id === state.paperFormat;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => handlePaperFormat(option.id)}
                              className={optionCardClass(selected)}
                            >
                              <span className="block text-sm font-bold text-[#111111]">
                                {option.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-[#111111]">
                        B/N o Color
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(availablePrintTypes.length > 0
                          ? availablePrintTypes
                          : MAINTENANCE_PRINT_TYPES
                        ).map((option) => {
                          const selected = option.id === state.printType;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => handlePrintType(option.id)}
                              className={optionCardClass(selected)}
                            >
                              <span className="block text-sm font-bold text-[#111111]">
                                {option.label}
                              </span>
                              <span className="mt-0.5 block text-[11px] text-[#6B7280]">
                                {option.hint}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <Label htmlFor="maintenance-model" className="text-sm font-semibold text-[#111111]">
                    Modelo del equipo
                  </Label>
                  <EquipmentModelCombobox
                    id="maintenance-model"
                    models={equipmentModels}
                    modelId={state.modelId}
                    customModel={state.customModel}
                    onSelectModel={(next) =>
                      patch({
                        modelId: next.id,
                        paperFormat: next.paperFormat,
                        printType: next.printType,
                        customModel: '',
                      })
                    }
                    onCustomModel={(label) =>
                      patch({
                        customModel: label,
                        modelId: defaultModelForEquipmentSpecs(
                          state.equipmentId,
                          state.paperFormat,
                          state.printType,
                        ).id,
                      })
                    }
                  />
                  <p className="text-[11px] text-[#6B7280]">
                    Escribe para buscar o ingresa un modelo que no esté en la lista. Dificultad:{' '}
                    <span className="font-semibold text-[#111111]">
                      {difficultyLabel(model.difficulty)}
                    </span>
                    {model.difficulty === 'pro' ? ' · Serie PRO' : null}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-[#111111]">Cantidad de equipos</Label>
                  <div className="flex h-11 max-w-xs items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-2">
                    <button
                      type="button"
                      aria-label="Disminuir cantidad"
                      disabled={state.quantity <= 1}
                      onClick={() =>
                        patch({ quantity: clampMaintenanceQuantity(state.quantity - 1) })
                      }
                      className="flex size-8 items-center justify-center rounded-lg text-[#111111] transition hover:bg-[#F3F4F6] disabled:opacity-35"
                    >
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-[#111111]">
                      {state.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar cantidad"
                      disabled={state.quantity >= 20}
                      onClick={() =>
                        patch({ quantity: clampMaintenanceQuantity(state.quantity + 1) })
                      }
                      className="flex size-8 items-center justify-center rounded-lg text-[#111111] transition hover:bg-[#F3F4F6] disabled:opacity-35"
                    >
                      <Plus className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="maintenance-city" className="text-sm font-semibold text-[#111111]">
                      Ciudad
                    </Label>
                    <input
                      id="maintenance-city"
                      type="text"
                      list="maintenance-city-suggestions"
                      value={state.city}
                      onChange={(event) => patch({ city: event.target.value })}
                      placeholder="Lima"
                      className={FIELD}
                      autoComplete="address-level2"
                    />
                    <datalist id="maintenance-city-suggestions">
                      {MAINTENANCE_CITY_SUGGESTIONS.map((item) => (
                        <option key={item} value={item} />
                      ))}
                    </datalist>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="maintenance-district"
                      className="text-sm font-semibold text-[#111111]"
                    >
                      Distrito
                    </Label>
                    <input
                      id="maintenance-district"
                      type="text"
                      list="maintenance-district-suggestions"
                      value={state.district}
                      onChange={(event) => patch({ district: event.target.value })}
                      placeholder={isLimaCity(state.city) ? 'Miraflores' : 'Centro'}
                      className={FIELD}
                      autoComplete="address-level3"
                    />
                    <datalist id="maintenance-district-suggestions">
                      {(isLimaCity(state.city) ? MAINTENANCE_LIMA_DISTRICT_SUGGESTIONS : []).map(
                        (item) => (
                          <option key={item} value={item} />
                        ),
                      )}
                    </datalist>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8E8E8] bg-white p-4 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)] sm:p-6">
                <MaintenanceStepHeader
                  step={2}
                  title="Volumen mensual"
                  subtitle="Se usa para proyectar cuántos tóner harán falta en el plazo del plan."
                />

                <div className="mt-5 space-y-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                      <Label
                        htmlFor="maintenance-volume"
                        className="text-sm font-semibold text-[#111111]"
                      >
                        Volumen mensual
                      </Label>
                      <span className="text-sm font-bold tabular-nums text-[#111111]">
                        {state.volumePages.toLocaleString('es-PE')} págs/mes
                      </span>
                    </div>
                    <input
                      id="maintenance-volume"
                      type="range"
                      min={MAINTENANCE_VOLUME_SLIDER_MIN}
                      max={MAINTENANCE_VOLUME_SLIDER_MAX}
                      step={500}
                      value={Math.min(
                        MAINTENANCE_VOLUME_SLIDER_MAX,
                        Math.max(MAINTENANCE_VOLUME_SLIDER_MIN, state.volumePages),
                      )}
                      onChange={(event) => {
                        patch({ volumePages: clampMaintenanceVolume(Number(event.target.value)) });
                      }}
                      className={cn(
                        'h-2 w-full cursor-pointer appearance-none rounded-full',
                        '[&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#E30613] [&::-webkit-slider-thumb]:shadow',
                        '[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#E30613]',
                      )}
                      style={{
                        background: `linear-gradient(90deg, #E30613 ${volumePct}%, #E5E7EB ${volumePct}%)`,
                      }}
                      aria-label="Volumen mensual"
                    />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {MAINTENANCE_VOLUME_OPTIONS.map((option) => {
                        const selected = option.pages === state.volumePages;
                        return (
                          <button
                            key={option.pages}
                            type="button"
                            onClick={() => patch({ volumePages: option.pages })}
                            className={cn(
                              'rounded-xl border px-2.5 py-2 text-center transition',
                              selected
                                ? 'border-[#E30613] bg-[#FFF1F1] text-[#E30613]'
                                : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#E30613]/40',
                            )}
                          >
                            <span className="block text-[11px] font-bold uppercase tracking-wide">
                              {option.label}
                            </span>
                            <span className="mt-0.5 block text-xs font-semibold tabular-nums">
                              {option.pages.toLocaleString('es-PE')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Label htmlFor="maintenance-volume-custom" className="text-sm font-semibold text-[#111111]">
                        Personalizar
                      </Label>
                      <input
                        id="maintenance-volume-custom"
                        type="number"
                        min={MAINTENANCE_VOLUME_MIN}
                        max={MAINTENANCE_VOLUME_MAX}
                        step={500}
                        value={state.volumePages}
                        onChange={(event) =>
                          patch({ volumePages: clampMaintenanceVolume(Number(event.target.value)) })
                        }
                        className={cn(FIELD, 'max-w-[9.5rem] tabular-nums')}
                        aria-label="Volumen mensual personalizado"
                      />
                      <span className="text-xs text-[#6B7280]">págs/mes</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#9CA3AF]">
                    El precio del mantenimiento es fijo por plazo (S/ 1,299 / 799 / 169 + IGV). Si
                    el equipo es a color se suman S/ 50. El volumen solo proyecta el tóner del plan
                    de suministros.
                  </p>
                </div>
              </div>
          </div>

          <PricingSummary
            state={mergedState}
            quote={quote}
            onRequestPlan={handleRequestPlan}
            onTermChange={(termMonths) => patch({ termMonths })}
            onPlanKindChange={(planKind) => patch({ planKind })}
          />
        </div>
      </div>
    </section>
  );
}
