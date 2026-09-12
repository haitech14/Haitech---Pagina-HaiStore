import { useState } from 'react';
import { Check, ChevronDown, Minus, Plus } from 'lucide-react';

import { PagesEditPopover } from '@/components/rental-landing/solution-configurator/pages-edit-popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SOLUTION_CITY_SUGGESTIONS,
  SOLUTION_CONDITIONS,
  SOLUTION_COPY_COSTS,
  SOLUTION_EQUIPMENT,
  SOLUTION_LIMA_DISTRICT_SUGGESTIONS,
  SOLUTION_NEW_TERM_OPTIONS,
  SOLUTION_PRINT_TYPES,
  SOLUTION_USED_TERM_OPTIONS,
  SOLUTION_VOLUME_PRESETS,
  OPERATIONAL_MACHINE_MONTHLY_PEN,
  OPERATIONAL_SERVICE_EVERY_PAGES,
  OPERATIONAL_SERVICE_FEE_PEN,
  OPERATIONAL_TONER_PARTS_PER_PAGE_PEN,
  balancedSplitForVolume,
  clampExcessPages,
  clampVolumePages,
  defaultModelForEquipment,
  defaultModelForEquipmentAndPrintType,
  equipmentById,
  equipmentHasPrintTypeChoice,
  formatCopyCostPen,
  formatSolutionPen,
  modelById,
  modelsForEquipmentAndPrintType,
  resolveSolutionLocationFromCity,
  type SolutionConditionId,
  type SolutionEquipmentId,
  type SolutionModelId,
  type SolutionPrintType,
  type SolutionTermMonths,
} from '@/data/rental-solution-configurator';
import { cn } from '@/lib/utils';

interface ConfigurationFormProps {
  equipment: SolutionEquipmentId;
  condition: SolutionConditionId;
  modelId: SolutionModelId;
  quantity: number;
  termMonths: SolutionTermMonths;
  volumePages: number;
  blackPages: number;
  colorPages: number;
  excessBlackPages: number;
  excessColorPages: number;
  scanPages: number;
  city: string;
  district: string;
  onEquipmentChange: (value: SolutionEquipmentId) => void;
  onConditionChange: (value: SolutionConditionId) => void;
  onModelChange: (value: SolutionModelId) => void;
  onQuantityChange: (value: number) => void;
  onTermChange: (value: SolutionTermMonths) => void;
  onVolumeChange: (value: number) => void;
  onBlackPagesChange: (value: number) => void;
  onColorPagesChange: (value: number) => void;
  onExcessBlackPagesChange: (value: number) => void;
  onExcessColorPagesChange: (value: number) => void;
  onScanPagesChange: (value: number) => void;
  onCityChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
}

const FIELD =
  'h-11 min-h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111111] outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]';

function optionsWithCurrent(options: readonly string[], current: string): string[] {
  const trimmed = current.trim();
  if (!trimmed) return [...options];
  if (options.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
    return [...options];
  }
  return [trimmed, ...options];
}

function matchingOption(options: readonly string[], current: string): string | undefined {
  const trimmed = current.trim();
  if (!trimmed) return undefined;
  return options.find((item) => item.toLowerCase() === trimmed.toLowerCase()) ?? trimmed;
}

const optionCardClass = (selected: boolean) =>
  cn(
    'rounded-xl border px-3.5 py-3 text-left transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]',
    selected
      ? 'border-[#E30613] bg-[#FFF1F1] ring-1 ring-[#E30613]/20'
      : 'border-[#E5E7EB] bg-white hover:border-[#E30613]/40',
  );

export function ConfigurationForm({
  equipment,
  condition,
  modelId,
  quantity,
  termMonths,
  volumePages,
  blackPages,
  colorPages,
  excessBlackPages,
  excessColorPages,
  scanPages,
  city,
  district,
  onEquipmentChange,
  onConditionChange,
  onModelChange,
  onQuantityChange,
  onTermChange,
  onVolumeChange,
  onBlackPagesChange,
  onColorPagesChange,
  onExcessBlackPagesChange,
  onExcessColorPagesChange,
  onScanPagesChange,
  onCityChange,
  onDistrictChange,
}: ConfigurationFormProps) {
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const selectedEquipment = equipmentById(equipment);
  const model = modelById(modelId);
  const printType = model.printType;
  const showPrintTypeChoice = equipmentHasPrintTypeChoice(equipment);
  const availableModels = modelsForEquipmentAndPrintType(equipment, printType);
  const showPrintConfig = model.usesPrintVolume;
  const isColor = model.printType === 'color';
  const isNueva = condition === 'nueva';
  const isOperativo = condition === 'operativo';
  const termOptions = isNueva ? SOLUTION_NEW_TERM_OPTIONS : SOLUTION_USED_TERM_OPTIONS;
  const volume = clampVolumePages(volumePages);
  const volumePct = Math.min(100, Math.max(0, ((volume - 500) / (50_000 - 500)) * 100));

  const applyModel = (nextModel: ReturnType<typeof modelById>) => {
    onModelChange(nextModel.id);
    if (nextModel.printType === 'color') {
      const split = balancedSplitForVolume(volume);
      onBlackPagesChange(split.blackPages);
      onColorPagesChange(split.colorPages);
    } else {
      onExcessColorPagesChange(0);
    }
  };

  const handleEquipmentChange = (next: SolutionEquipmentId) => {
    onEquipmentChange(next);
    applyModel(defaultModelForEquipment(next));
    setModelPickerOpen(false);
  };

  const handlePrintTypeChange = (nextPrintType: SolutionPrintType) => {
    if (nextPrintType !== printType) {
      applyModel(defaultModelForEquipmentAndPrintType(equipment, nextPrintType));
    }
    setModelPickerOpen(true);
  };

  const handleModelChange = (nextId: SolutionModelId) => {
    applyModel(modelById(nextId));
    setModelPickerOpen(false);
  };

  const handleConditionChange = (next: SolutionConditionId) => {
    onConditionChange(next);
    if (next === 'nueva') {
      onTermChange(termMonths === 24 ? 24 : 36);
    } else if (termMonths !== 6 && termMonths !== 12 && termMonths !== 24 && termMonths !== 36) {
      onTermChange(12);
    }
  };

  const setVolumeBalanced = (nextRaw: number) => {
    const next = clampVolumePages(nextRaw);
    onVolumeChange(next);
    if (isColor) {
      const split = balancedSplitForVolume(next);
      onBlackPagesChange(split.blackPages);
      onColorPagesChange(split.colorPages);
    }
  };

  const handleBlackChange = (raw: number) => {
    const nextBlack = Math.max(0, Math.floor(raw) || 0);
    onBlackPagesChange(nextBlack);
    onVolumeChange(clampVolumePages(nextBlack + colorPages));
  };

  const handleColorChange = (raw: number) => {
    const nextColor = Math.max(0, Math.floor(raw) || 0);
    onColorPagesChange(nextColor);
    onVolumeChange(clampVolumePages(blackPages + nextColor));
  };

  return (
    <div className="rounded-2xl border border-[#E8E8E8] bg-white p-4 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E30613] text-sm font-bold text-white">
          1
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#111111] sm:text-xl">
            Configura tu alquiler
          </h2>
          <p className="mt-0.5 text-sm text-[#6B7280]">
            Elige equipo, condición, B/N o color y personaliza el modelo.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-[#111111]">Tipo de equipo</Label>
          <div
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
            role="listbox"
            aria-label="Tipo de equipo"
          >
            {SOLUTION_EQUIPMENT.map((item) => {
              const isSelected = equipment === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleEquipmentChange(item.id)}
                  className={cn(
                    'group relative flex flex-col items-center rounded-2xl border bg-white px-2 py-3 text-center transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                    isSelected
                      ? 'border-[#E30613] shadow-[0_8px_20px_-14px_rgba(227,6,19,0.55)] ring-1 ring-[#E30613]/20'
                      : 'border-[#E8E8E8] hover:border-[#E30613]/40 hover:shadow-sm',
                  )}
                >
                  <span
                    className={cn(
                      'absolute right-2 top-2 flex size-4 items-center justify-center rounded-full border transition-colors',
                      isSelected
                        ? 'border-[#E30613] bg-[#E30613] text-white'
                        : 'border-[#D1D5DB] bg-white text-transparent',
                    )}
                    aria-hidden="true"
                  >
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                  <span className="flex h-14 w-full items-center justify-center sm:h-16">
                    <img
                      src={item.image}
                      alt=""
                      className="max-h-full max-w-[4.75rem] object-contain transition-transform duration-200 group-hover:scale-[1.04] sm:max-w-[5.5rem]"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="mt-2 text-[12px] font-semibold leading-tight text-[#111111] sm:text-[13px]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 text-[10px] leading-snug text-[#9CA3AF] sm:text-[11px]">
                    {item.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-[#111111]">Condición del equipo</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            {SOLUTION_CONDITIONS.map((item) => {
              const selected = condition === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleConditionChange(item.id)}
                  className={optionCardClass(selected)}
                >
                  <span className="block text-sm font-bold text-[#111111]">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-[#6B7280]">
                    {item.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {showPrintTypeChoice ? (
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#111111]">Tipo de impresión</Label>
            <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="B/N o Color">
              {SOLUTION_PRINT_TYPES.map((item) => {
                const selected = printType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handlePrintTypeChange(item.id)}
                    className={optionCardClass(selected)}
                  >
                    <span className="block text-sm font-bold text-[#111111]">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-[#6B7280]">
                      {item.hint}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#9CA3AF]">
              Al elegir B/N o Color podrás personalizar el modelo del equipo.
            </p>
          </div>
        ) : null}

        <Dialog open={modelPickerOpen} onOpenChange={setModelPickerOpen}>
          <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-2xl p-5 sm:p-6">
            <DialogHeader>
              <DialogTitle>Personalizar equipo</DialogTitle>
              <DialogDescription>
                {selectedEquipment.label} · {isColor ? 'Color' : 'B/N'}. Elige el modelo que mejor se
                adapte a tu operación.
              </DialogDescription>
            </DialogHeader>

            <div
              className="grid gap-2 sm:grid-cols-2"
              role="listbox"
              aria-label="Elegir modelo"
            >
              {availableModels.map((item) => {
                const selected = modelId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleModelChange(item.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]',
                      selected
                        ? 'border-[#E30613] bg-[#FFF1F1] ring-1 ring-[#E30613]/20'
                        : 'border-[#E5E7EB] bg-white hover:border-[#E30613]/40',
                    )}
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="h-11 w-11 shrink-0 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[#111111]">
                        {item.shortLabel}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#6B7280]">
                        {item.paperFormat} · {item.printType === 'color' ? 'Color' : 'B/N'}
                      </span>
                    </span>
                    {selected ? (
                      <Check
                        className="ml-auto size-4 shrink-0 text-[#E30613]"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#111111]">Cantidad de equipos</Label>
            <div className="flex h-11 items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-2">
              <button
                type="button"
                aria-label="Disminuir cantidad"
                disabled={quantity <= 1}
                onClick={() => onQuantityChange(quantity - 1)}
                className="flex size-8 items-center justify-center rounded-lg text-[#111111] transition hover:bg-[#F3F4F6] disabled:opacity-35"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-[#111111]">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Aumentar cantidad"
                disabled={quantity >= 20}
                onClick={() => onQuantityChange(quantity + 1)}
                className="flex size-8 items-center justify-center rounded-lg text-[#111111] transition hover:bg-[#F3F4F6] disabled:opacity-35"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="solution-term" className="text-sm font-semibold text-[#111111]">
              Plazo de alquiler
            </Label>
            <Select
              value={String(termMonths)}
              onValueChange={(value) => onTermChange(Number(value) as SolutionTermMonths)}
            >
              <SelectTrigger id="solution-term" className={FIELD}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {termOptions.map((option) => (
                  <SelectItem key={option.months} value={String(option.months)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isNueva ? (
              <p className="text-[11px] text-[#6B7280]">
                En equipo nuevo el plazo es 24 o 36 meses (cuota del equipo).
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="solution-city" className="text-sm font-semibold text-[#111111]">
                Ciudad
              </Label>
              <Select
                value={matchingOption(SOLUTION_CITY_SUGGESTIONS, city) ?? 'Lima'}
                onValueChange={(value) => {
                  onCityChange(value);
                  if (resolveSolutionLocationFromCity(value) !== 'lima') {
                    onDistrictChange('');
                  }
                }}
              >
                <SelectTrigger id="solution-city" className={FIELD}>
                  <SelectValue placeholder="Selecciona ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {optionsWithCurrent(SOLUTION_CITY_SUGGESTIONS, city).map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="solution-district" className="text-sm font-semibold text-[#111111]">
                Distrito
              </Label>
              {resolveSolutionLocationFromCity(city) === 'lima' ? (
                <Select
                  value={matchingOption(SOLUTION_LIMA_DISTRICT_SUGGESTIONS, district)}
                  onValueChange={onDistrictChange}
                >
                  <SelectTrigger id="solution-district" className={FIELD}>
                    <SelectValue placeholder="Selecciona distrito" />
                  </SelectTrigger>
                  <SelectContent>
                    {optionsWithCurrent(SOLUTION_LIMA_DISTRICT_SUGGESTIONS, district).map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input
                  id="solution-district"
                  type="text"
                  name="solution-district"
                  value={district}
                  onChange={(event) => onDistrictChange(event.target.value)}
                  placeholder="Centro"
                  className={FIELD}
                  autoComplete="off"
                />
              )}
            </div>
          </div>
        </div>

        {showPrintConfig ? (
          <div className="space-y-3 rounded-xl border border-[#F0F0F0] bg-[#FAFAFA] p-3.5 sm:p-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <Label htmlFor="solution-volume" className="text-sm font-semibold text-[#111111]">
                {isOperativo
                  ? 'Volumen estimado (simulación)'
                  : 'Volumen de impresión mensual'}
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="solution-volume"
                  type="number"
                  min={500}
                  max={200000}
                  step={100}
                  value={isColor ? blackPages + colorPages : volume}
                  onChange={(event) => setVolumeBalanced(Number(event.target.value))}
                  className="h-9 w-[7.5rem] rounded-lg border border-[#E5E7EB] bg-white px-2.5 text-sm font-semibold tabular-nums text-[#111111] outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
                />
                <span className="text-xs text-[#6B7280]">págs/mes</span>
              </div>
            </div>

            <input
              type="range"
              min={500}
              max={50000}
              step={100}
              value={Math.min(50000, volume)}
              onChange={(event) => setVolumeBalanced(Number(event.target.value))}
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

            <div className="flex flex-wrap gap-2">
              {SOLUTION_VOLUME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setVolumeBalanced(preset)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums transition',
                    volume === preset
                      ? 'border-[#E30613] bg-[#FFF1F1] text-[#E30613]'
                      : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#E30613]/40',
                  )}
                >
                  {preset.toLocaleString('es-PE')}
                </button>
              ))}
            </div>

            {isOperativo ? (
              <div className="space-y-3 border-t border-[#ECECEC] pt-3">
                <p className="rounded-lg border border-[#E8E8E8] bg-white px-3 py-2 text-[11px] leading-snug text-[#4B5563]">
                  Sin bolsa ni costo por copia. Cuota máquina{' '}
                  <span className="font-semibold text-[#111111]">
                    {formatSolutionPen(
                      OPERATIONAL_MACHINE_MONTHLY_PEN[model.paperFormat === 'A3' ? 'A3' : 'A4'][
                        isColor ? 'color' : 'bw'
                      ],
                    )}
                  </span>
                  /mes · simulación tóner/repuestos y ST cada{' '}
                  {OPERATIONAL_SERVICE_EVERY_PAGES.toLocaleString('es-PE')} págs (B/N S/{' '}
                  {OPERATIONAL_SERVICE_FEE_PEN.bw} · Color S/ {OPERATIONAL_SERVICE_FEE_PEN.color}).
                </p>
                {isColor ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Label
                          htmlFor="solution-black-pages"
                          className="text-xs font-semibold text-[#111111]"
                        >
                          Páginas negro
                        </Label>
                        <PagesEditPopover
                          kind="black"
                          value={blackPages}
                          volume={volume}
                          onSelect={handleBlackChange}
                        />
                      </div>
                      <input
                        id="solution-black-pages"
                        type="number"
                        min={0}
                        max={200000}
                        step={100}
                        value={blackPages}
                        onChange={(event) => handleBlackChange(Number(event.target.value))}
                        className={FIELD}
                      />
                      <p className="text-[11px] text-[#6B7280]">
                        Sim. {formatCopyCostPen(OPERATIONAL_TONER_PARTS_PER_PAGE_PEN.colorBlack)}
                        /pág. tóner+repuestos
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Label
                          htmlFor="solution-color-pages"
                          className="text-xs font-semibold text-[#111111]"
                        >
                          Páginas color
                        </Label>
                        <PagesEditPopover
                          kind="color"
                          value={colorPages}
                          volume={volume}
                          onSelect={handleColorChange}
                        />
                      </div>
                      <input
                        id="solution-color-pages"
                        type="number"
                        min={0}
                        max={200000}
                        step={100}
                        value={colorPages}
                        onChange={(event) => handleColorChange(Number(event.target.value))}
                        className={FIELD}
                      />
                      <p className="text-[11px] text-[#6B7280]">
                        Sim. {formatCopyCostPen(OPERATIONAL_TONER_PARTS_PER_PAGE_PEN.color)}/pág.
                        tóner+repuestos
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#6B7280]">
                    Simulación B/N:{' '}
                    {formatCopyCostPen(OPERATIONAL_TONER_PARTS_PER_PAGE_PEN.bw)}/pág. tóner+repuestos
                    {model.paperFormat === 'A3'
                      ? ` · 1 A3 = ${SOLUTION_COPY_COSTS.a3Factor} A4 eq.`
                      : null}
                    .
                  </p>
                )}
              </div>
            ) : (
              <>
                {model.paperFormat === 'A3' && !isColor ? (
                  <p className="text-[11px] leading-snug text-[#6B7280]">
                    En B/N, 1 página A3 = {SOLUTION_COPY_COSTS.a3Factor} páginas A4 equivalentes.
                  </p>
                ) : null}

                {isColor ? (
                  <div className="space-y-3 border-t border-[#ECECEC] pt-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <Label
                            htmlFor="solution-black-pages"
                            className="text-xs font-semibold text-[#111111]"
                          >
                            Bolsa de impresión mínima negro
                          </Label>
                          <PagesEditPopover
                            kind="black"
                            value={blackPages}
                            volume={volume}
                            onSelect={handleBlackChange}
                          />
                        </div>
                        <input
                          id="solution-black-pages"
                          type="number"
                          min={0}
                          max={200000}
                          step={100}
                          value={blackPages}
                          onChange={(event) => handleBlackChange(Number(event.target.value))}
                          className={FIELD}
                        />
                        <p className="text-[11px] text-[#6B7280]">
                          {formatCopyCostPen(SOLUTION_COPY_COSTS.colorBlack)}/pág. + IGV
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="solution-excess-black"
                          className="text-xs font-semibold text-[#111111]"
                        >
                          Excedente negro
                        </Label>
                        <div className="flex items-center gap-2">
                          <input
                            id="solution-excess-black"
                            type="number"
                            min={0}
                            max={200000}
                            step={100}
                            value={excessBlackPages}
                            onChange={(event) =>
                              onExcessBlackPagesChange(clampExcessPages(Number(event.target.value)))
                            }
                            className={FIELD}
                          />
                          <span className="shrink-0 text-xs text-[#6B7280]">págs</span>
                        </div>
                        <p className="text-[11px] text-[#6B7280]">
                          {formatCopyCostPen(SOLUTION_COPY_COSTS.colorBlack)}/pág. + IGV
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <Label
                            htmlFor="solution-color-pages"
                            className="text-xs font-semibold text-[#111111]"
                          >
                            Bolsa de impresión mínima color
                          </Label>
                          <PagesEditPopover
                            kind="color"
                            value={colorPages}
                            volume={volume}
                            onSelect={handleColorChange}
                          />
                        </div>
                        <input
                          id="solution-color-pages"
                          type="number"
                          min={0}
                          max={200000}
                          step={100}
                          value={colorPages}
                          onChange={(event) => handleColorChange(Number(event.target.value))}
                          className={FIELD}
                        />
                        <p className="text-[11px] text-[#6B7280]">
                          {formatCopyCostPen(SOLUTION_COPY_COSTS.color)}/pág. + IGV
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="solution-excess-color"
                          className="text-xs font-semibold text-[#111111]"
                        >
                          Excedente color
                        </Label>
                        <div className="flex items-center gap-2">
                          <input
                            id="solution-excess-color"
                            type="number"
                            min={0}
                            max={200000}
                            step={100}
                            value={excessColorPages}
                            onChange={(event) =>
                              onExcessColorPagesChange(clampExcessPages(Number(event.target.value)))
                            }
                            className={FIELD}
                          />
                          <span className="shrink-0 text-xs text-[#6B7280]">págs</span>
                        </div>
                        <p className="text-[11px] text-[#6B7280]">
                          {formatCopyCostPen(SOLUTION_COPY_COSTS.color)}/pág. + IGV
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#6B7280]">
                      Volumen de impresión:{' '}
                      <span className="font-semibold tabular-nums text-[#111111]">
                        {(blackPages + colorPages).toLocaleString('es-PE')}
                      </span>{' '}
                      págs/mes (negro + color).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 border-t border-[#ECECEC] pt-3">
                    <p className="text-[11px] text-[#6B7280]">
                      Tarifa B/N: {formatCopyCostPen(SOLUTION_COPY_COSTS.bw)}/pág. A4 eq. + IGV
                      {model.paperFormat === 'A3'
                        ? ` · 1 A3 = ${SOLUTION_COPY_COSTS.a3Factor} A4`
                        : null}
                      .
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="solution-bag-bw"
                          className="text-xs font-semibold text-[#111111]"
                        >
                          Bolsa de impresión mínima
                        </Label>
                        <div className="flex items-center gap-2">
                          <input
                            id="solution-bag-bw"
                            type="number"
                            min={500}
                            max={200000}
                            step={100}
                            value={volume}
                            onChange={(event) => setVolumeBalanced(Number(event.target.value))}
                            className={FIELD}
                          />
                          <span className="shrink-0 text-xs text-[#6B7280]">págs</span>
                        </div>
                        <p className="text-[11px] text-[#6B7280]">
                          {formatCopyCostPen(SOLUTION_COPY_COSTS.bw)}/pág. A4 eq. + IGV
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="solution-excess-bw"
                          className="text-xs font-semibold text-[#111111]"
                        >
                          Excedente B/N
                        </Label>
                        <div className="flex items-center gap-2">
                          <input
                            id="solution-excess-bw"
                            type="number"
                            min={0}
                            max={200000}
                            step={100}
                            value={excessBlackPages}
                            onChange={(event) =>
                              onExcessBlackPagesChange(clampExcessPages(Number(event.target.value)))
                            }
                            className={FIELD}
                          />
                          <span className="shrink-0 text-xs text-[#6B7280]">págs</span>
                        </div>
                        <p className="text-[11px] text-[#6B7280]">
                          {formatCopyCostPen(SOLUTION_COPY_COSTS.bw)}/pág. A4 eq. + IGV
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-[#ECECEC] pt-3">
                  <button
                    type="button"
                    onClick={() => setScanOpen((open) => !open)}
                    className="flex w-full items-center justify-between gap-2 text-left"
                    aria-expanded={scanOpen}
                    aria-controls="solution-scan-panel"
                  >
                    <span>
                      <span className="block text-xs font-semibold text-[#111111]">
                        Escaneo mensual
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#9CA3AF]">
                        Cortesía {(SOLUTION_COPY_COSTS.scanCourtesyRatio * 100).toFixed(0)}% del
                        volumen (
                        {Math.floor(volume * SOLUTION_COPY_COSTS.scanCourtesyRatio).toLocaleString(
                          'es-PE',
                        )}{' '}
                        págs) · {formatCopyCostPen(SOLUTION_COPY_COSTS.scan)}/pág. excedente + IGV
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        'size-4 shrink-0 text-[#6B7280] transition-transform',
                        scanOpen && 'rotate-180',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {scanOpen ? (
                    <div id="solution-scan-panel" className="mt-3 max-w-xs space-y-1.5">
                      <Label
                        htmlFor="solution-scan-pages"
                        className="text-xs font-semibold text-[#111111]"
                      >
                        Escaneos estimados
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="solution-scan-pages"
                          type="number"
                          min={0}
                          max={200000}
                          step={100}
                          value={scanPages}
                          onChange={(event) =>
                            onScanPagesChange(clampExcessPages(Number(event.target.value)))
                          }
                          className={FIELD}
                        />
                        <span className="shrink-0 text-xs text-[#6B7280]">págs</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
