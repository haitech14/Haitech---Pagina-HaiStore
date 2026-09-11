import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import {
  VISIT_FAULT_OPTIONS,
  filterVisitFaults,
  findVisitFaultMatch,
} from '@/data/maintenance-visit';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const FIELD =
  'h-11 min-h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 pr-10 text-sm text-[#111111] outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]';

interface VisitFaultComboboxProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function VisitFaultCombobox({
  id,
  value,
  onChange,
  placeholder = 'Escribe o elige la falla',
}: VisitFaultComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const catalogMatch = VISIT_FAULT_OPTIONS.some(
    (item) => item.id !== 'otro' && item.label === value.trim(),
  );
  const isBrowsingSelection = catalogMatch && query.trim() === value.trim();
  const filtered = useMemo(
    () => (isBrowsingSelection ? filterVisitFaults('') : filterVisitFaults(query)),
    [isBrowsingSelection, query],
  );
  const trimmed = query.trim();
  const exactMatch = findVisitFaultMatch(query);
  const showCustomOption =
    trimmed.length > 0 &&
    !isBrowsingSelection &&
    !exactMatch &&
    !filtered.some((item) => item.label.toLowerCase() === trimmed.toLowerCase());

  const applyQuery = (next: string) => {
    setQuery(next);
    const match = findVisitFaultMatch(next);
    onChange(match ? match.label : next);
  };

  const pick = (label: string) => {
    setQuery(label);
    onChange(label);
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
            placeholder={placeholder}
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
            aria-label="Mostrar fallas"
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
            const selected = item.label === value.trim();
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
                  onClick={() => pick(item.label)}
                >
                  {item.label}
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
                aria-selected
                className={cn(
                  'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-[#111111] hover:bg-[#F3F4F6]',
                  filtered.length > 0 && 'mt-1 border-t border-[#F0F0F0] pt-2',
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(trimmed)}
              >
                Usar «{trimmed}»
              </button>
            </li>
          ) : null}
          {filtered.length === 0 && !showCustomOption ? (
            <li className="px-3 py-3 text-xs text-[#6B7280]">
              Escribe la falla para continuar.
            </li>
          ) : null}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
