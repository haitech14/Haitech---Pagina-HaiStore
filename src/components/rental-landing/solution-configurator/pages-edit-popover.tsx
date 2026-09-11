import { useState } from 'react';
import { Pencil } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const FIELD =
  'h-11 min-h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111111] outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]';

const BLACK_SHARE_OPTIONS = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9] as const;

function buildPageOptions(volume: number, current: number): number[] {
  const safeVolume = Math.max(0, Math.floor(volume));
  const safeCurrent = Math.max(0, Math.min(safeVolume, Math.floor(current) || 0));
  const step = safeVolume >= 20000 ? 1000 : safeVolume >= 5000 ? 500 : 100;
  const values = new Set<number>([0, safeVolume, safeCurrent]);
  for (let n = 0; n <= safeVolume; n += step) values.add(n);
  for (const share of BLACK_SHARE_OPTIONS) {
    values.add(Math.round(safeVolume * share));
  }
  return [...values].filter((n) => n >= 0 && n <= safeVolume).sort((a, b) => a - b);
}

export function PagesEditPopover({
  kind,
  value,
  volume,
  onSelect,
  className,
}: {
  kind: 'black' | 'color';
  value: number;
  volume: number;
  onSelect: (pages: number) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const options = buildPageOptions(volume, value);
  const label = kind === 'black' ? 'Páginas negro' : 'Páginas color';
  const selectValue = options.includes(value) ? String(value) : String(options[0] ?? 0);

  const commit = (raw: number) => {
    const next = Math.max(0, Math.min(Math.max(0, volume), Math.floor(Number(raw) || 0)));
    onSelect(next);
    setDraft(String(next));
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setDraft(String(value));
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#E30613] transition hover:border-[#E30613] hover:bg-[#FFF1F1]',
            className,
          )}
          aria-label={`Modificar ${label.toLowerCase()}`}
        >
          <Pencil className="size-3" strokeWidth={2.25} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="z-[80] w-[17.5rem] space-y-3 p-3.5">
        <div>
          <p className="text-sm font-bold text-[#111111]">{label}</p>
          <p className="mt-0.5 text-[11px] text-[#6B7280]">
            Escribe un valor o elige uno; el otro canal se ajusta para sumar{' '}
            {volume.toLocaleString('es-PE')} págs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={volume}
            step={100}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => commit(Number(draft))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commit(Number(draft));
                setOpen(false);
              }
            }}
            className={FIELD}
            aria-label={label}
          />
          <span className="shrink-0 text-xs text-[#6B7280]">págs</span>
        </div>

        <Select
          value={selectValue}
          onValueChange={(next) => {
            commit(Number(next));
          }}
        >
          <SelectTrigger className={FIELD}>
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent className="z-[90] max-h-56" position="popper">
            {options.map((pages) => (
              <SelectItem key={pages} value={String(pages)}>
                {pages.toLocaleString('es-PE')} págs
                {kind === 'black'
                  ? ` · ${Math.round((pages / Math.max(1, volume)) * 100)}% negro`
                  : ` · ${Math.round((pages / Math.max(1, volume)) * 100)}% color`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-1.5">
          {BLACK_SHARE_OPTIONS.map((share) => {
            const pages =
              kind === 'black' ? Math.round(volume * share) : Math.round(volume * (1 - share));
            const active = value === pages;
            return (
              <button
                key={`${kind}-${share}`}
                type="button"
                onClick={() => commit(pages)}
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums transition',
                  active
                    ? 'border-[#E30613] bg-[#FFF1F1] text-[#E30613]'
                    : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#E30613]/40',
                )}
              >
                {kind === 'black'
                  ? `${Math.round(share * 100)}% N`
                  : `${Math.round((1 - share) * 100)}% C`}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
