import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface AdminDateRange {
  from: Date;
  to: Date;
}

const PRESETS = [
  { label: '7 días', days: 7 },
  { label: '14 días', days: 14 },
  { label: '30 días', days: 30 },
] as const;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getDefaultAdminDateRange(days = 14): AdminDateRange {
  const to = endOfDay(new Date());
  const from = startOfDay(new Date());
  from.setDate(from.getDate() - (days - 1));
  return { from, to };
}

interface AdminDateRangePickerProps {
  value: AdminDateRange;
  onChange: (range: AdminDateRange) => void;
}

export function AdminDateRangePicker({ value, onChange }: AdminDateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>({
    from: value.from,
    to: value.to,
  });

  const label = useMemo(() => {
    return `${format(value.from, 'd MMM yyyy', { locale: es })} – ${format(value.to, 'd MMM yyyy', { locale: es })}`;
  }, [value.from, value.to]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.days}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(getDefaultAdminDateRange(preset.days))}
        >
          {preset.label}
        </Button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn('min-w-[220px] justify-start text-left font-normal')}
          >
            <CalendarIcon className="mr-2 size-4" aria-hidden="true" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={draft}
            onSelect={setDraft}
            numberOfMonths={2}
            locale={es}
          />
          <div className="flex justify-end gap-2 border-t p-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (draft?.from && draft?.to) {
                  onChange({ from: startOfDay(draft.from), to: endOfDay(draft.to) });
                  setOpen(false);
                }
              }}
              disabled={!draft?.from || !draft?.to}
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function getPreviousPeriod(range: AdminDateRange): AdminDateRange {
  const durationMs = range.to.getTime() - range.from.getTime();
  const prevTo = new Date(range.from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - durationMs);
  return { from: startOfDay(prevFrom), to: endOfDay(prevTo) };
}

export function isDateInRange(dateStr: string, range: AdminDateRange) {
  const date = new Date(dateStr);
  return date >= range.from && date <= range.to;
}

export function calcTrendPercent(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}
