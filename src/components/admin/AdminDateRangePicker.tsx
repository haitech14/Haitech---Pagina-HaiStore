import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  calcTrendPercent,
  getAdminDateRangeForMonth,
  getDefaultAdminDateRange,
  getPreviousPeriod,
  isCalendarMonthRange,
  isDateInRange,
  type AdminDateRange,
} from '@/lib/admin-date-range-presets';

export type { AdminDateRange } from '@/lib/admin-date-range-presets';
export {
  calcTrendPercent,
  getAdminDateRangeForMonth,
  getDefaultAdminDateRange,
  getPreviousPeriod,
  isCalendarMonthRange,
  isDateInRange,
};

interface AdminDateRangePickerProps {
  value: AdminDateRange;
  onChange: (range: AdminDateRange) => void;
  variant?: 'default' | 'sidebar' | 'toolbar';
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, month) => ({
  month,
  label: format(new Date(2024, month, 1), 'MMMM', { locale: es }),
}));

function buildYearOptions(anchorYear: number): number[] {
  const min = anchorYear - 8;
  const max = anchorYear + 1;
  const years: number[] = [];
  for (let y = max; y >= min; y -= 1) {
    years.push(y);
  }
  return years;
}

export function AdminDateRangePicker({
  value,
  onChange,
  variant = 'default',
}: AdminDateRangePickerProps) {
  const isSidebar = variant === 'sidebar';
  const isToolbar = variant === 'toolbar';
  const yearId = isSidebar
    ? 'admin-sidebar-range-year'
    : isToolbar
      ? 'admin-toolbar-range-year'
      : 'admin-range-year';
  const monthId = isSidebar
    ? 'admin-sidebar-range-month'
    : isToolbar
      ? 'admin-toolbar-range-month'
      : 'admin-range-month';
  const [monthYear, setMonthYear] = useState(() => ({
    month: value.from.getMonth(),
    year: value.from.getFullYear(),
  }));

  useEffect(() => {
    setMonthYear({ month: value.from.getMonth(), year: value.from.getFullYear() });
  }, [value.from, value.to]);

  const yearOptions = useMemo(() => buildYearOptions(monthYear.year), [monthYear.year]);

  const applyMonthYear = (month: number, year: number) => {
    setMonthYear({ month, year });
    onChange(getAdminDateRangeForMonth(year, month));
  };

  const fieldWrapperClass = cn(
    isSidebar && 'w-full space-y-1.5',
    isToolbar && 'flex shrink-0 items-center gap-1.5',
    !isSidebar && !isToolbar && 'w-full space-y-1.5 min-w-[6.5rem] flex-1 sm:max-w-[8.5rem]',
  );
  const monthFieldWrapperClass = cn(
    isSidebar && 'w-full space-y-1.5',
    isToolbar && 'flex shrink-0 items-center gap-1.5',
    !isSidebar && !isToolbar && 'w-full space-y-1.5 min-w-[7.5rem] flex-1 sm:max-w-[10rem]',
  );
  const labelClass = cn(
    'font-medium uppercase tracking-wide leading-none',
    isToolbar ? 'shrink-0 text-[0.65rem] text-muted-foreground' : 'text-xs',
    isSidebar && 'text-[hsl(var(--admin-sidebar-fg-muted))]',
  );

  return (
    <div
      className={cn(
        'flex gap-2',
        isSidebar && 'w-full flex-col gap-2.5',
        isToolbar && 'flex-nowrap items-center',
        !isSidebar && !isToolbar && 'flex-wrap items-end',
        isToolbar && 'p-0',
      )}
    >
      <div className={fieldWrapperClass}>
        <Label htmlFor={yearId} className={labelClass}>
          Año
        </Label>
        <Select
          value={String(monthYear.year)}
          onValueChange={(yearValue) => {
            applyMonthYear(monthYear.month, Number(yearValue));
          }}
        >
          <SelectTrigger
            id={yearId}
            className={cn(
              isToolbar ? 'h-8 w-[4.5rem] px-2 text-xs' : 'h-9 text-sm',
              isSidebar &&
                'border-[hsl(var(--admin-sidebar-border))] bg-[hsl(var(--admin-sidebar-hover))] text-[hsl(var(--admin-sidebar-fg))]',
            )}
            aria-label="Año del periodo"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className={monthFieldWrapperClass}>
        <Label htmlFor={monthId} className={labelClass}>
          Mes
        </Label>
        <Select
          value={String(monthYear.month)}
          onValueChange={(monthValue) => {
            applyMonthYear(Number(monthValue), monthYear.year);
          }}
        >
          <SelectTrigger
            id={monthId}
            className={cn(
              isToolbar ? 'h-8 w-[6.5rem] px-2 text-xs' : 'h-9 text-sm',
              isSidebar &&
                'border-[hsl(var(--admin-sidebar-border))] bg-[hsl(var(--admin-sidebar-hover))] text-[hsl(var(--admin-sidebar-fg))]',
            )}
            aria-label="Mes del periodo"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTH_OPTIONS.map(({ month, label: monthLabel }) => (
              <SelectItem key={month} value={String(month)}>
                <span className="capitalize">{monthLabel}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
