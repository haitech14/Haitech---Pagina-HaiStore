import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import {
  filterMaintenanceModels,
  findMaintenanceModelMatch,
  type MaintenanceModelOption,
} from '@/data/maintenance-plan';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const FIELD =
  'h-11 min-h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 pr-10 text-sm text-[#111111] outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]';

interface EquipmentModelComboboxProps {
  id: string;
  models: readonly MaintenanceModelOption[];
  modelId: string;
  customModel: string;
  onSelectModel: (model: MaintenanceModelOption) => void;
  onCustomModel: (label: string) => void;
}

export function EquipmentModelCombobox({
  id,
  models,
  modelId,
  customModel,
  onSelectModel,
  onCustomModel,
}: EquipmentModelComboboxProps) {
  const [open, setOpen] = useState(false);
  const catalogLabel = models.find((item) => item.id === modelId)?.label ?? models[0]?.label ?? '';
  const [query, setQuery] = useState(customModel || catalogLabel);

  useEffect(() => {
    setQuery(customModel || catalogLabel);
  }, [catalogLabel, customModel, modelId]);

  const isBrowsingSelection = !customModel.trim() && query.trim() === catalogLabel.trim();
  const filtered = useMemo(
    () =>
      isBrowsingSelection ? [...models] : filterMaintenanceModels(models, query),
    [isBrowsingSelection, models, query],
  );
  const trimmed = query.trim();
  const exactMatch = findMaintenanceModelMatch(models, query);
  const showCustomOption =
    trimmed.length > 0 &&
    !isBrowsingSelection &&
    !exactMatch &&
    !filtered.some((item) => item.label.toLowerCase() === trimmed.toLowerCase());

  const applyQuery = (next: string) => {
    setQuery(next);
    const match = findMaintenanceModelMatch(models, next);
    if (match) {
      onSelectModel(match);
      return;
    }
    onCustomModel(next);
  };

  const pick = (model: MaintenanceModelOption) => {
    setQuery(model.label);
    onSelectModel(model);
    setOpen(false);
  };

  const pickCustom = () => {
    if (!trimmed) return;
    setQuery(trimmed);
    onCustomModel(trimmed);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor asChild>
        <div className="relative w-full">
          <input
            id={id}
            value={query}
            onChange={(event) => {
              applyQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            placeholder="Escribe o busca el modelo"
            className={FIELD}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-listbox`}
            aria-autocomplete="list"
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center rounded-r-xl text-[#9CA3AF] hover:text-[#111111]"
            aria-label="Mostrar modelos"
            onMouseDown={(event) => {
              event.preventDefault();
              setOpen((current) => !current);
            }}
          >
            <ChevronsUpDown className="size-4" aria-hidden />
          </button>
        </div>
      </PopoverAnchor>
      <PopoverContent
        id={`${id}-listbox`}
        role="listbox"
        className="z-[80] w-[var(--radix-popover-trigger-width)] p-1"
        align="start"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <ul className="max-h-56 overflow-y-auto">
          {filtered.map((item) => {
            const selected = !customModel && item.id === modelId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm',
                    selected
                      ? 'bg-[#FFF1F1] font-semibold text-[#111111]'
                      : 'text-[#111111] hover:bg-[#F3F4F6]',
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pick(item)}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{item.label}</span>
                    <span className="block text-[11px] font-normal text-[#6B7280]">
                      {item.paperFormat} · {item.printType === 'bw' ? 'B/N' : 'Color'}
                    </span>
                  </span>
                  {selected ? (
                    <Check className="size-4 shrink-0 text-[#E30613]" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
          {showCustomOption ? (
            <li>
              <button
                type="button"
                role="option"
                aria-selected={Boolean(customModel)}
                className={cn(
                  'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-[#111111] hover:bg-[#F3F4F6]',
                  filtered.length > 0 && 'mt-1 border-t border-[#F0F0F0] pt-2',
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={pickCustom}
              >
                Usar «{trimmed}»
              </button>
            </li>
          ) : null}
          {filtered.length === 0 && !showCustomOption ? (
            <li className="px-3 py-3 text-xs text-[#6B7280]">
              Escribe el modelo de tu equipo para continuar.
            </li>
          ) : null}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
