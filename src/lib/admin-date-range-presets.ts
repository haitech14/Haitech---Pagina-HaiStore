import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  isSameDay,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { es } from 'date-fns/locale';

export interface AdminDateRange {
  from: Date;
  to: Date;
}

export type AdminDateRangePresetId =
  | 'today'
  | 'week'
  | 'month'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 's1'
  | 's2'
  | 'year';

export interface AdminDateRangePreset {
  id: AdminDateRangePresetId;
  label: string;
  group: 'period' | 'quarter' | 'semester' | 'year';
}

export const ADMIN_DATE_RANGE_PRESETS: AdminDateRangePreset[] = [
  { id: 'today', label: 'Hoy', group: 'period' },
  { id: 'week', label: 'Semana', group: 'period' },
  { id: 'month', label: 'Mes', group: 'period' },
  { id: 'q1', label: 'Q1', group: 'quarter' },
  { id: 'q2', label: 'Q2', group: 'quarter' },
  { id: 'q3', label: 'Q3', group: 'quarter' },
  { id: 'q4', label: 'Q4', group: 'quarter' },
  { id: 's1', label: 'S1', group: 'semester' },
  { id: 's2', label: 'S2', group: 'semester' },
  { id: 'year', label: 'Año', group: 'year' },
];

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function quarterBounds(quarter: 1 | 2 | 3 | 4, year: number): AdminDateRange {
  const monthStart = (quarter - 1) * 3;
  const from = startOfDay(new Date(year, monthStart, 1));
  const to = endOfDay(endOfMonth(new Date(year, monthStart + 2, 1)));
  return { from, to };
}

function semesterBounds(semester: 1 | 2, year: number): AdminDateRange {
  if (semester === 1) {
    return {
      from: startOfDay(new Date(year, 0, 1)),
      to: endOfDay(endOfMonth(new Date(year, 5, 1))),
    };
  }
  return {
    from: startOfDay(new Date(year, 6, 1)),
    to: endOfDay(endOfMonth(new Date(year, 11, 1))),
  };
}

export function getAdminDateRangeForMonth(year: number, month: number): AdminDateRange {
  const from = startOfDay(new Date(year, month, 1));
  const to = endOfDay(endOfMonth(new Date(year, month, 1)));
  return { from, to };
}

export function isCalendarMonthRange(range: AdminDateRange): boolean {
  const { from, to } = range;
  if (from.getFullYear() !== to.getFullYear() || from.getMonth() !== to.getMonth()) {
    return false;
  }
  const expected = getAdminDateRangeForMonth(from.getFullYear(), from.getMonth());
  return isSameDay(expected.from, from) && isSameDay(expected.to, to);
}

export function getAdminDateRangeForPreset(
  presetId: AdminDateRangePresetId,
  referenceDate = new Date(),
): AdminDateRange {
  const year = referenceDate.getFullYear();
  const now = referenceDate;

  switch (presetId) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'week':
      return {
        from: startOfDay(startOfWeek(now, { locale: es, weekStartsOn: 1 })),
        to: endOfDay(endOfWeek(now, { locale: es, weekStartsOn: 1 })),
      };
    case 'month':
      return getAdminDateRangeForMonth(now.getFullYear(), now.getMonth());
    case 'q1':
      return quarterBounds(1, year);
    case 'q2':
      return quarterBounds(2, year);
    case 'q3':
      return quarterBounds(3, year);
    case 'q4':
      return quarterBounds(4, year);
    case 's1':
      return semesterBounds(1, year);
    case 's2':
      return semesterBounds(2, year);
    case 'year':
      return {
        from: startOfDay(startOfYear(now)),
        to: endOfDay(endOfYear(now)),
      };
    default: {
      const exhaustive: never = presetId;
      return exhaustive;
    }
  }
}

export function getDefaultAdminDateRange(
  presetId: AdminDateRangePresetId = 'month',
): AdminDateRange {
  return getAdminDateRangeForPreset(presetId);
}

export function detectAdminDateRangePreset(range: AdminDateRange): AdminDateRangePresetId | null {
  if (isCalendarMonthRange(range)) {
    return 'month';
  }
  for (const preset of ADMIN_DATE_RANGE_PRESETS) {
    if (preset.id === 'month') continue;
    const candidate = getAdminDateRangeForPreset(preset.id, range.to);
    if (isSameDay(candidate.from, range.from) && isSameDay(candidate.to, range.to)) {
      return preset.id;
    }
  }
  return null;
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
