import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ImagePlus, Minus, Plus } from 'lucide-react';
import { es } from 'date-fns/locale';
import { startOfToday } from 'date-fns';

import { EquipmentModelCombobox } from '@/components/maintenance-plan-landing/EquipmentModelCombobox';
import { EquipmentSelector } from '@/components/maintenance-plan-landing/EquipmentSelector';
import { VisitSectionAccordion, type VisitFormStep } from '@/components/maintenance-plan-landing/VisitSectionAccordion';
import { RegisteredEquipmentPanel } from '@/components/maintenance-plan-landing/RegisteredEquipmentPanel';
import { VisitFaultCombobox } from '@/components/maintenance-plan-landing/VisitFaultCombobox';
import { VisitServiceTypeSelector } from '@/components/maintenance-plan-landing/VisitServiceTypeSelector';
import { SunatRucField } from '@/components/forms/sunat-ruc-field';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  MAINTENANCE_CITY_SUGGESTIONS,
  MAINTENANCE_LIMA_DISTRICT_SUGGESTIONS,
  MAINTENANCE_PAPER_FORMATS,
  MAINTENANCE_PLAN_CALCULATOR_ID,
  MAINTENANCE_PRINT_TYPES,
  clampMaintenanceQuantity,
  defaultModelForEquipment,
  defaultModelForEquipmentSpecs,
  difficultyLabel,
  formatMaintenancePen,
  isLimaCity,
  resolveMaintenanceModelLabel,
  maintenanceEquipmentById,
  maintenanceModelById,
  modelsForEquipment,
  type MaintenanceEquipmentId,
  type MaintenancePaperFormat,
  type MaintenancePrintType,
} from '@/data/maintenance-plan';
import {
  DEFAULT_MAINTENANCE_VISIT_STATE,
  VISIT_ATTENTION_HOURS,
  VISIT_SHIFT_OPTIONS,
  VISIT_TECHNICIANS,
  buildMaintenanceVisitWhatsAppMessage,
  calculateMaintenanceVisitQuote,
  dateToVisitKey,
  formatVisitDateLabel,
  formatVisitHour,
  isVisitSlotAvailable,
  visitDefectById,
  nextVisitBusinessDate,
  validateMaintenanceVisit,
  matchVisitModelFromLabel,
  visitKeyToDate,
  visitShiftHours,
  type MaintenanceVisitState,
  type VisitShiftId,
  type VisitTechnicianId,
} from '@/data/maintenance-visit';
import { useApplyHaiSupportClient } from '@/hooks/use-haisupport-client-lookup';
import { useApplySunatRuc } from '@/hooks/use-sunat-ruc-lookup';
import {
  applyHaiSupportToVisitFields,
  createHaiSupportVisit,
  type HaiSupportRegisteredEquipment,
} from '@/lib/haisupport-visit';
import { applySunatToVisitFields, isCompleteRuc } from '@/lib/sunat-ruc';
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

function isCompanySectionComplete(state: MaintenanceVisitState): boolean {
  return (
    isCompleteRuc(state.ruc) &&
    Boolean(state.razonSocial.trim()) &&
    Boolean(state.atencion.trim()) &&
    Boolean(state.celular.trim()) &&
    Boolean(state.address.trim()) &&
    Boolean(state.city.trim()) &&
    Boolean(state.district.trim())
  );
}

function isEquipmentSectionComplete(state: MaintenanceVisitState): boolean {
  return Boolean(resolveMaintenanceModelLabel(state.modelId, state.customModel).trim());
}

function isServiceSectionComplete(state: MaintenanceVisitState): boolean {
  if (state.defectId === 'correctivo' && !state.defectCustom.trim()) return false;
  return Boolean(state.visitDate) && state.visitHour != null;
}

export function VisitScheduler({ className }: { className?: string | undefined }) {
  const [state, setState] = useState<MaintenanceVisitState>(() => ({
    ...DEFAULT_MAINTENANCE_VISIT_STATE,
    visitDate: dateToVisitKey(nextVisitBusinessDate()),
  }));
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<string | null>(null);
  const [selectedEquipmentKey, setSelectedEquipmentKey] = useState<string | null>(null);
  const [openStep, setOpenStep] = useState<VisitFormStep | null>(1);
  const [equipmentConfirmed, setEquipmentConfirmed] = useState(false);
  const prevCompanyComplete = useRef(false);
  const prevServiceComplete = useRef(false);

  const quote = useMemo(() => calculateMaintenanceVisitQuote(state), [state]);
  const isRemote = state.defectId === 'remoto';
  const companyComplete = isCompanySectionComplete(state);
  const equipmentComplete = equipmentConfirmed && isEquipmentSectionComplete(state);
  const serviceComplete = isServiceSectionComplete(state);

  useEffect(() => {
    if (companyComplete && !prevCompanyComplete.current) {
      setOpenStep(2);
    }
    prevCompanyComplete.current = companyComplete;
  }, [companyComplete]);

  useEffect(() => {
    if (serviceComplete && !prevServiceComplete.current) {
      setOpenStep(null);
    }
    prevServiceComplete.current = serviceComplete;
  }, [serviceComplete]);

  const toggleStep = (step: VisitFormStep) => {
    if (openStep === 2) setEquipmentConfirmed(true);
    setOpenStep((current) => (current === step ? null : step));
  };
  const model = maintenanceModelById(state.modelId);
  const usesPrintSpecs = maintenanceEquipmentById(state.equipmentId).usesPrintSpecs;
  const equipmentModels = modelsForEquipment(state.equipmentId);
  const availablePaperFormats = usesPrintSpecs
    ? MAINTENANCE_PAPER_FORMATS.filter((format) =>
        equipmentModels.some((item) => item.paperFormat === format.id),
      )
    : MAINTENANCE_PAPER_FORMATS;
  const availablePrintTypes = usesPrintSpecs
    ? MAINTENANCE_PRINT_TYPES.filter((print) =>
        equipmentModels.some(
          (item) =>
            item.printType === print.id &&
            (availablePaperFormats.some((format) => format.id === state.paperFormat)
              ? item.paperFormat === state.paperFormat
              : true),
        ),
      )
    : MAINTENANCE_PRINT_TYPES;

  const hours = visitShiftHours(state.shiftId);
  const selectedDate = visitKeyToDate(state.visitDate);

  const sunat = useApplySunatRuc(state.ruc, (data) => {
    setState((prev) => applySunatToVisitFields(prev, data));
  });
  const haiSupport = useApplyHaiSupportClient(state.ruc, (data) => {
    setState((prev) => applyHaiSupportToVisitFields(prev, data));
  });
  const registeredEquipment =
    isCompleteRuc(state.ruc) && haiSupport.data?.found ? haiSupport.data.equipment : [];
  const foundHaiSupportClient = isCompleteRuc(state.ruc) && Boolean(haiSupport.data?.found);
  const sunatSuccessMessage = [
    sunat.data
      ? ['Datos extraídos de SUNAT', sunat.data.estado, sunat.data.condicion].filter(Boolean).join(' · ')
      : null,
    haiSupport.data?.found ? 'Contacto y equipos extraídos de HaiSupport' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    setSelectedEquipmentKey(null);
    setCreatedTicket(null);
  }, [state.ruc]);

  const patch = (partial: Partial<MaintenanceVisitState>) => {
    setState((prev) => ({ ...prev, ...partial }));
    setFormError(null);
  };

  const handleEquipmentChange = (equipmentId: MaintenanceEquipmentId) => {
    const nextModel = defaultModelForEquipment(equipmentId);
    patch({
      equipmentId,
      paperFormat: nextModel.paperFormat,
      printType: nextModel.printType,
      modelId: nextModel.id,
      customModel: '',
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

  const handleImage = (file: File | null) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (!file) {
      setImagePreview(null);
      patch({ imageName: '' });
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    patch({ imageName: file.name });
  };

  const handleSelectEquipment = (item: HaiSupportRegisteredEquipment) => {
    const matched = matchVisitModelFromLabel(item.model);
    setSelectedEquipmentKey(`${item.model}|${item.serial}`);
    setEquipmentConfirmed(true);
    setOpenStep(3);
    if (matched) {
      patch({
        equipmentId: matched.equipmentId,
        paperFormat: matched.paperFormat,
        printType: matched.printType,
        modelId: matched.id,
        customModel: item.model,
        serialNumber: item.serial,
      });
      return;
    }
    patch({
      customModel: item.model,
      serialNumber: item.serial,
    });
  };

  const handleSchedule = async () => {
    const error = validateMaintenanceVisit(state);
    if (error) {
      setFormError(error);
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const created = await createHaiSupportVisit(state, quote);
      setCreatedTicket(created.numeroTicket);
      const href = buildHaitechWhatsAppUrl(
        `${buildMaintenanceVisitWhatsAppMessage(state, quote)}\nTicket HaiSupport: ${created.numeroTicket}`,
      );
      window.open(href, '_blank', 'noopener,noreferrer');
    } catch (scheduleError) {
      setFormError(
        scheduleError instanceof Error
          ? scheduleError.message
          : 'No se pudo registrar la visita en HaiSupport.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id={MAINTENANCE_PLAN_CALCULATOR_ID}
      aria-labelledby="agenda-visita-title"
      className={cn('scroll-mt-20 bg-[#F7F7F8] py-12 sm:py-16', className)}
    >
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="agenda-visita-title"
            className="text-balance text-2xl font-black tracking-tight text-[#111111] sm:text-3xl"
          >
            Agenda tu visita
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4B5563] sm:text-base">
            Completa los datos de tu empresa y equipo. El costo se actualiza según distrito y ciudad.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)] lg:items-start lg:gap-8">
          <div className="space-y-6">
            <VisitSectionAccordion
              step={1}
              title="Empresa y contacto"
              subtitle="Al ingresar el RUC se extraen SUNAT y HaiSupport."
              summary={
                companyComplete
                  ? [state.razonSocial.trim() || state.ruc, state.district.trim() || state.city.trim()]
                      .filter(Boolean)
                      .join(' · ')
                  : 'Completa RUC, contacto y dirección.'
              }
              complete={companyComplete}
              open={openStep === 1}
              onToggle={() => toggleStep(1)}
            >
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <SunatRucField
                  id="visit-ruc"
                  label="RUC"
                  value={state.ruc}
                  onValueChange={(ruc) => patch({ ruc })}
                  isFetching={sunat.isFetching || haiSupport.isFetching}
                  isSuccess={Boolean(sunat.data) || Boolean(haiSupport.data?.found)}
                  errorMessage={sunat.error instanceof Error ? sunat.error.message : null}
                  required
                  className="sm:col-span-1"
                  labelClassName="text-sm font-semibold text-[#111111]"
                  inputClassName="h-11 min-h-11 rounded-xl border-[#E5E7EB] shadow-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
                  successMessage={sunatSuccessMessage}
                />
                <div className="space-y-1.5">
                  <Label htmlFor="visit-razon" className="text-sm font-semibold text-[#111111]">
                    Razón social
                  </Label>
                  <input
                    id="visit-razon"
                    value={state.razonSocial}
                    onChange={(event) => patch({ razonSocial: event.target.value })}
                    className={FIELD}
                    autoComplete="organization"
                    placeholder="Empresa S.A.C."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="visit-atencion" className="text-sm font-semibold text-[#111111]">
                    Atención
                  </Label>
                  <input
                    id="visit-atencion"
                    value={state.atencion}
                    onChange={(event) => patch({ atencion: event.target.value })}
                    className={cn(
                      FIELD,
                      foundHaiSupportClient && state.atencion.trim() && 'bg-[#EEF2FF]',
                    )}
                    autoComplete="name"
                    placeholder="Nombre de quien recibe al técnico"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="visit-celular" className="text-sm font-semibold text-[#111111]">
                    Celular
                  </Label>
                  <input
                    id="visit-celular"
                    type="tel"
                    value={state.celular}
                    onChange={(event) => patch({ celular: event.target.value })}
                    className={cn(
                      FIELD,
                      foundHaiSupportClient && state.celular.trim() && 'bg-[#EEF2FF]',
                    )}
                    autoComplete="tel"
                    placeholder="999 999 999"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="visit-address" className="text-sm font-semibold text-[#111111]">
                    Dirección del equipo
                  </Label>
                  <input
                    id="visit-address"
                    value={state.address}
                    onChange={(event) => patch({ address: event.target.value })}
                    className={cn(
                      FIELD,
                      foundHaiSupportClient && state.address.trim() && 'bg-[#EEF2FF]',
                    )}
                    autoComplete="street-address"
                    placeholder="Av. Ejemplo 123, oficina 4"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="visit-reference" className="text-sm font-semibold text-[#111111]">
                    Referencia
                  </Label>
                  <input
                    id="visit-reference"
                    value={state.reference}
                    onChange={(event) => patch({ reference: event.target.value })}
                    className={FIELD}
                    placeholder="Edificio, piso, contacto en recepción…"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="visit-city" className="text-sm font-semibold text-[#111111]">
                    Ciudad
                  </Label>
                  <input
                    id="visit-city"
                    type="text"
                    list="visit-city-suggestions"
                    value={state.city}
                    onChange={(event) => patch({ city: event.target.value })}
                    className={cn(
                      FIELD,
                      foundHaiSupportClient && state.city.trim() && 'bg-[#EEF2FF]',
                    )}
                    autoComplete="address-level2"
                    placeholder="Lima"
                  />
                  <datalist id="visit-city-suggestions">
                    {MAINTENANCE_CITY_SUGGESTIONS.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="visit-district" className="text-sm font-semibold text-[#111111]">
                    Distrito
                  </Label>
                  <input
                    id="visit-district"
                    type="text"
                    list="visit-district-suggestions"
                    value={state.district}
                    onChange={(event) => patch({ district: event.target.value })}
                    className={cn(
                      FIELD,
                      foundHaiSupportClient && state.district.trim() && 'bg-[#EEF2FF]',
                    )}
                    autoComplete="address-level3"
                    placeholder={isLimaCity(state.city) ? 'Miraflores' : 'Centro'}
                  />
                  <datalist id="visit-district-suggestions">
                    {(isLimaCity(state.city) ? MAINTENANCE_LIMA_DISTRICT_SUGGESTIONS : []).map(
                      (item) => (
                        <option key={item} value={item} />
                      ),
                    )}
                  </datalist>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#6B7280]">{quote.coverageNote}</p>
            </VisitSectionAccordion>

            <VisitSectionAccordion
              step={2}
              title="Equipo"
              subtitle="Elige un equipo registrado o completa el modelo."
              summary={
                equipmentComplete
                  ? `${quote.modelLabel} · ${quote.paperFormat} · ${quote.printType === 'bw' ? 'B/N' : 'Color'}${
                      state.quantity > 1 ? ` · ×${state.quantity}` : ''
                    }`
                  : 'Selecciona modelo y formato.'
              }
              complete={equipmentComplete}
              open={openStep === 2}
              onToggle={() => toggleStep(2)}
            >
              <div className="mt-5 space-y-5">
                <EquipmentSelector value={state.equipmentId} onChange={handleEquipmentChange} />

                {usesPrintSpecs ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-[#111111]">A4 o A3</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(availablePaperFormats.length > 0
                          ? availablePaperFormats
                          : MAINTENANCE_PAPER_FORMATS
                        ).map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={option.id === state.paperFormat}
                            onClick={() => handlePaperFormat(option.id)}
                            className={optionCardClass(option.id === state.paperFormat)}
                          >
                            <span className="block text-sm font-bold text-[#111111]">
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-[#111111]">B/N o Color</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(availablePrintTypes.length > 0
                          ? availablePrintTypes
                          : MAINTENANCE_PRINT_TYPES
                        ).map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={option.id === state.printType}
                            onClick={() => handlePrintType(option.id)}
                            className={optionCardClass(option.id === state.printType)}
                          >
                            <span className="block text-sm font-bold text-[#111111]">
                              {option.label}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-[#6B7280]">
                              {option.hint}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <Label htmlFor="visit-model" className="text-sm font-semibold text-[#111111]">
                    Modelo del equipo
                  </Label>
                  <EquipmentModelCombobox
                    key={`${state.modelId}|${state.customModel}|${state.serialNumber}`}
                    id="visit-model"
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
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="visit-serial" className="text-sm font-semibold text-[#111111]">
                      Número de serie{' '}
                      <span className="font-normal text-[#9CA3AF]">(opcional)</span>
                    </Label>
                    <input
                      id="visit-serial"
                      value={state.serialNumber}
                      onChange={(event) => patch({ serialNumber: event.target.value })}
                      className={FIELD}
                      placeholder="Serie del equipo"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="visit-counter" className="text-sm font-semibold text-[#111111]">
                      Contador{' '}
                      <span className="font-normal text-[#9CA3AF]">(opcional)</span>
                    </Label>
                    <input
                      id="visit-counter"
                      inputMode="numeric"
                      value={state.counter}
                      onChange={(event) => patch({ counter: event.target.value })}
                      className={FIELD}
                      placeholder="Páginas del equipo"
                      autoComplete="off"
                    />
                  </div>
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
              </div>
            </VisitSectionAccordion>

            <VisitSectionAccordion
              step={3}
              title="Servicio y cita"
              subtitle="Tipo de servicio y horario de la visita."
              summary={
                serviceComplete
                  ? `${visitDefectById(state.defectId).label} · ${formatVisitDateLabel(state.visitDate)} · ${formatVisitHour(state.visitHour ?? 0)}`
                  : 'Elige tipo de servicio, fecha y hora.'
              }
              complete={serviceComplete}
              open={openStep === 3}
              onToggle={() => toggleStep(3)}
            >
              <div className="mt-5 space-y-4">
                <VisitServiceTypeSelector
                  value={state.defectId}
                  onChange={(defectId) => patch({ defectId })}
                />

                <div className="space-y-1.5">
                  <Label htmlFor="visit-fault" className="text-sm font-semibold text-[#111111]">
                    Especifica la falla
                    {state.defectId === 'correctivo' ? (
                      <span className="text-[#E30613]"> *</span>
                    ) : (
                      <span className="font-normal text-[#9CA3AF]"> (opcional)</span>
                    )}
                  </Label>
                  <VisitFaultCombobox
                    id="visit-fault"
                    value={state.defectCustom}
                    onChange={(defectCustom) => patch({ defectCustom })}
                    placeholder={
                      state.defectId === 'correctivo'
                        ? 'Ej. Error SC542, atasco, no enciende…'
                        : state.defectId === 'remoto'
                          ? 'Ej. No imprime por red, drivers, error en pantalla…'
                          : 'Síntoma o detalle adicional'
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="visit-image" className="text-sm font-semibold text-[#111111]">
                    Imagen adjunta{' '}
                    <span className="font-normal text-[#9CA3AF]">(opcional)</span>
                  </Label>
                  <label
                    htmlFor="visit-image"
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#D1D5DB] bg-[#FAFAFA] px-3 py-3 transition hover:border-[#E30613]/40"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#E30613] shadow-sm">
                      <ImagePlus className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 text-sm text-[#4B5563]">
                      {state.imageName || 'Adjunta una foto del equipo o del error'}
                    </span>
                  </label>
                  <input
                    id="visit-image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => handleImage(event.target.files?.[0] ?? null)}
                  />
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Vista previa de la imagen adjunta"
                      className="mt-2 max-h-36 rounded-xl border border-[#E8E8E8] object-contain"
                    />
                  ) : null}
                </div>

                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-[#111111]">Técnico</p>
                  <p className="text-xs text-[#6B7280]">
                    Horario de atención: {VISIT_ATTENTION_HOURS}
                  </p>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {VISIT_TECHNICIANS.map((tech) => {
                    const selected = tech.id === state.technicianId;
                    return (
                      <button
                        key={tech.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          patch({ technicianId: tech.id as VisitTechnicianId, visitHour: null })
                        }
                        className={optionCardClass(selected)}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-[#111111]">{tech.name}</span>
                          <span
                            className={cn(
                              'flex size-4 items-center justify-center rounded-full border',
                              selected
                                ? 'border-[#E30613] bg-[#E30613] text-white'
                                : 'border-[#D1D5DB] bg-white text-transparent',
                            )}
                            aria-hidden
                          >
                            <Check className="size-2.5" strokeWidth={3} />
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[11px] text-[#6B7280]">{tech.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                <p className="text-sm font-semibold text-[#111111]">Jornada</p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {VISIT_SHIFT_OPTIONS.map((option) => {
                    const selected = option.id === state.shiftId;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          patch({ shiftId: option.id as VisitShiftId, visitHour: null })
                        }
                        className={optionCardClass(selected)}
                      >
                        <span className="block text-sm font-bold text-[#111111]">{option.label}</span>
                        <span className="mt-0.5 block text-[11px] text-[#6B7280]">{option.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                <div className="overflow-hidden rounded-xl border border-[#E8E8E8] bg-[#FAFAFA]">
                  <Calendar
                    mode="single"
                    locale={es}
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (!date) return;
                      patch({ visitDate: dateToVisitKey(date), visitHour: null });
                    }}
                    disabled={[{ before: startOfToday() }, { dayOfWeek: [0] }]}
                    className="mx-auto"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Horarios disponibles</p>
                  <p className="mt-0.5 text-[11px] text-[#6B7280]">
                    {state.shiftId === 'refrigerio'
                      ? 'Sin atención de 13:00 a 14:00 (refrigerio).'
                      : 'Horario corrido de 9:00 a 18:00.'}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {hours.map((hour) => {
                      const available = state.visitDate
                        ? isVisitSlotAvailable(state.technicianId, state.visitDate, hour)
                        : false;
                      const selected = state.visitHour === hour;
                      return (
                        <button
                          key={hour}
                          type="button"
                          disabled={!available}
                          aria-pressed={selected}
                          onClick={() => patch({ visitHour: hour })}
                          className={cn(
                            optionCardClass(selected),
                            'px-3 py-2 text-center',
                            !available && 'cursor-not-allowed opacity-40 hover:border-[#E5E7EB]',
                          )}
                        >
                          <span className="block text-sm font-bold tabular-nums text-[#111111]">
                            {formatVisitHour(hour)}
                          </span>
                          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
                            {available ? 'Libre' : 'Ocupado'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              </div>
            </VisitSectionAccordion>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24">
            <RegisteredEquipmentPanel
              equipment={registeredEquipment}
              selectedKey={selectedEquipmentKey}
              onSelect={handleSelectEquipment}
              loading={haiSupport.isFetching}
              foundClient={foundHaiSupportClient}
            />

          <aside
            className="rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-[0_16px_36px_-22px_rgba(15,23,42,0.45)]"
            aria-live="polite"
          >
            <p className="text-sm font-bold text-[#111111]">
              {isRemote ? 'Tu soporte remoto' : 'Tu visita técnica'}
            </p>
            <p className="mt-3 flex flex-wrap items-baseline gap-1.5">
              <span className="text-4xl font-black tracking-tight text-[#111111]">
                {formatMaintenancePen(quote.visitPen)}
              </span>
              <span className="text-sm font-semibold text-[#6B7280]">{quote.priceSuffix}</span>
            </p>
            {quote.includesPackage ? (
              <p className="mt-1 text-xs font-semibold text-[#6B7280]">
                2 visitas + 1 garantía
              </p>
            ) : null}

            <dl className="mt-5 space-y-2 border-t border-[#F0F0F0] pt-4 text-[12px] sm:text-[13px]">
              <div>
                <dt className="text-[#9CA3AF]">Servicio</dt>
                <dd className="font-semibold text-[#111111]">{quote.serviceLabel}</dd>
              </div>
              {quote.faultLabel ? (
                <div>
                  <dt className="text-[#9CA3AF]">Falla</dt>
                  <dd className="font-semibold text-[#111111]">{quote.faultLabel}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[#9CA3AF]">Modelo</dt>
                <dd className="font-semibold text-[#111111]">{quote.modelLabel}</dd>
              </div>
              {quote.serialNumber ? (
                <div>
                  <dt className="text-[#9CA3AF]">Serie</dt>
                  <dd className="font-semibold text-[#111111]">{quote.serialNumber}</dd>
                </div>
              ) : null}
              {quote.counter ? (
                <div>
                  <dt className="text-[#9CA3AF]">Contador</dt>
                  <dd className="font-semibold text-[#111111]">{quote.counter}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[#9CA3AF]">Formato / impresión</dt>
                <dd className="font-semibold text-[#111111]">
                  {quote.paperFormat} · {quote.printType === 'bw' ? 'B/N' : 'Color'}
                </dd>
              </div>
              <div>
                <dt className="text-[#9CA3AF]">Ubicación</dt>
                <dd className="font-semibold text-[#111111]">{quote.locationLabel}</dd>
              </div>
              <div>
                <dt className="text-[#9CA3AF]">Técnico</dt>
                <dd className="font-semibold text-[#111111]">{quote.technicianName}</dd>
              </div>
              <div>
                <dt className="text-[#9CA3AF]">Cita</dt>
                <dd className="font-semibold capitalize text-[#111111]">{quote.slotLabel}</dd>
              </div>
              <div>
                <dt className="text-[#9CA3AF]">Jornada</dt>
                <dd className="font-semibold text-[#111111]">{quote.shiftLabel}</dd>
              </div>
            </dl>

            <div className="mt-5 rounded-xl bg-[#FFF1F2] p-3.5">
              <p className="text-xs font-bold text-[#991B1B]">
                {isRemote
                  ? 'La sesión incluye'
                  : quote.includesPackage
                    ? 'El paquete incluye'
                    : 'La visita incluye'}
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {quote.includes.map((item) => (
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

            {createdTicket ? (
              <p role="status" className="mt-4 rounded-xl bg-[#E8F8EE] px-3 py-2 text-sm font-semibold text-[#1B7A3D]">
                Registrado en HaiSupport · {createdTicket}
              </p>
            ) : null}

            {formError ? (
              <p role="alert" className="mt-4 text-sm text-[#E30613]">
                {formError}
              </p>
            ) : null}

            <Button
              type="button"
              className="mt-5 h-12 w-full bg-[#E30613] text-sm font-bold text-white hover:bg-[#c40511]"
              onClick={() => void handleSchedule()}
              disabled={isSubmitting || Boolean(createdTicket)}
            >
              {createdTicket
                ? 'Visita registrada'
                : isSubmitting
                  ? 'Registrando en HaiSupport…'
                  : isRemote
                    ? 'Agendar soporte remoto'
                    : 'Agendar visita'}
            </Button>
            <p className="mt-3 text-[11px] leading-snug text-[#9CA3AF]">
              Se crea el registro de servicio técnico en HaiSupport. No incluye repuestos.
            </p>
          </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
