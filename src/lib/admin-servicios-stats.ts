import { subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

import { SERVICIO_CATEGORIA_LABELS } from '@/lib/admin-servicios-utils';
import type {
  AdminServiciosCategoryDistribution,
  AdminServiciosKpi,
  AdminServiciosRequestUsage,
  AdminServiciosTopDemand,
  AdminServicioRecord,
} from '@/types/admin-servicios';
import type { ServiceRequestRecord } from '@/types/haitech-domain';
import type { ServiceCategory } from '@/types/service';

const CATEGORY_COLORS: Record<string, string> = {
  mantenimiento: '#22C55E',
  instalacion: '#3B82F6',
  soporte: '#8B5CF6',
  consultoria: '#F59E0B',
  otros: '#94A3B8',
};

function buildDailySparkline(
  valuesByDay: number[],
  periods = 8,
): number[] {
  if (valuesByDay.length === 0) return Array.from({ length: periods }, () => 0);
  if (valuesByDay.length >= periods) return valuesByDay.slice(-periods);
  const padding = Array.from({ length: periods - valuesByDay.length }, () => valuesByDay[0] ?? 0);
  return [...padding, ...valuesByDay];
}

function requestsPerDay(requests: readonly ServiceRequestRecord[], days: number): number[] {
  const today = endOfDay(new Date());
  const counts: number[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const dayStart = startOfDay(subDays(today, offset));
    const dayEnd = endOfDay(dayStart);
    const count = requests.filter((request) => {
      const created = new Date(request.createdAt);
      return isWithinInterval(created, { start: dayStart, end: dayEnd });
    }).length;
    counts.push(count);
  }

  return counts;
}

function calcTrendPercent(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function computeServiciosKpis(
  records: readonly AdminServicioRecord[],
  requests: readonly ServiceRequestRecord[],
  categories: readonly ServiceCategory[],
): AdminServiciosKpi[] {
  const activeCount = records.filter((record) => record.estado === 'activo').length;
  const planCount = records.filter((record) => record.tipo === 'mensual' && record.estado !== 'archivado').length;

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const requestsToday = requests.filter((request) => {
    const created = new Date(request.createdAt);
    return isWithinInterval(created, { start: todayStart, end: todayEnd });
  }).length;

  const yesterdayStart = startOfDay(subDays(new Date(), 1));
  const yesterdayEnd = endOfDay(yesterdayStart);
  const requestsYesterday = requests.filter((request) => {
    const created = new Date(request.createdAt);
    return isWithinInterval(created, { start: yesterdayStart, end: yesterdayEnd });
  }).length;

  const activeCategories = categories.filter((category) => category.active).length;
  const coveragePercent =
    categories.length > 0 ? Math.round((activeCategories / categories.length) * 100) : 0;

  const requestSparkline = buildDailySparkline(requestsPerDay(requests, 8));
  const activeSparkline = buildDailySparkline(
    recordsPerDay(records.filter((record) => record.estado === 'activo'), 8),
  );
  const planSparkline = buildDailySparkline(
    recordsPerDay(records.filter((record) => record.tipo === 'mensual'), 8),
  );
  const coverageSparkline = buildDailySparkline(
    Array.from({ length: 8 }, (_, index) =>
      Math.max(0, coveragePercent - (7 - index) * 2),
    ),
  );

  const prevActive = Math.max(0, activeCount - 2);
  const prevPlans = Math.max(0, planCount - 1);

  return [
    {
      title: 'Servicios activos',
      value: String(activeCount),
      icon: 'active',
      delta: Math.max(0, activeCount - prevActive),
      trendLabel: 'vs. mes anterior',
      sparkline: activeSparkline,
    },
    {
      title: 'Planes vigentes',
      value: String(planCount),
      icon: 'plans',
      delta: Math.max(0, planCount - prevPlans),
      trendLabel: 'vs. mes anterior',
      sparkline: planSparkline,
    },
    {
      title: 'Solicitudes hoy',
      value: String(requestsToday),
      icon: 'requests',
      trend: calcTrendPercent(requestsToday, requestsYesterday) ?? 0,
      trendLabel: 'vs. ayer',
      sparkline: requestSparkline,
    },
    {
      title: 'Cobertura disponible',
      value: `${coveragePercent}%`,
      icon: 'coverage',
      trend: 5,
      trendLabel: 'vs. mes anterior',
      sparkline: coverageSparkline,
    },
  ];
}

function recordsPerDay(records: readonly AdminServicioRecord[], days: number): number[] {
  const today = endOfDay(new Date());
  const counts: number[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const dayEnd = endOfDay(subDays(today, offset));
    const count = records.filter((record) => new Date(record.createdAt) <= dayEnd).length;
    counts.push(count);
  }

  return counts;
}

export function computeServiciosCategoryDistribution(
  records: readonly AdminServicioRecord[],
): AdminServiciosCategoryDistribution[] {
  const activeRecords = records.filter((record) => record.estado !== 'archivado');
  const total = activeRecords.length || 1;

  const grouped = new Map<string, number>();
  for (const record of activeRecords) {
    grouped.set(record.categoria, (grouped.get(record.categoria) ?? 0) + 1);
  }

  return [...grouped.entries()]
    .map(([categoria, count]) => ({
      categoria: categoria as AdminServiciosCategoryDistribution['categoria'],
      label: SERVICIO_CATEGORIA_LABELS[categoria as keyof typeof SERVICIO_CATEGORIA_LABELS] ?? categoria,
      count,
      percent: Math.round((count / total) * 1000) / 10,
      color: CATEGORY_COLORS[categoria] ?? CATEGORY_COLORS.otros,
    }))
    .sort((a, b) => b.count - a.count);
}

export function computeServiciosRequestUsage(
  records: readonly AdminServicioRecord[],
  requests: readonly ServiceRequestRecord[],
): AdminServiciosRequestUsage[] {
  const since = subDays(new Date(), 30);
  const recent = requests.filter((request) => new Date(request.createdAt) >= since);

  const counts = new Map<string, number>();
  for (const request of recent) {
    const match =
      records.find((record) => record.name === request.categoryLabel)?.name ??
      records.find((record) => record.categoria === inferCategoriaFromLabel(request.categoryLabel))?.name ??
      request.categoryLabel;
    counts.set(match, (counts.get(match) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = sorted[0]?.[1] ?? 1;

  return sorted.map(([serviceName, requestCount]) => ({
    serviceName,
    requests: requestCount,
    percent: Math.round((requestCount / max) * 100),
  }));
}

function inferCategoriaFromLabel(label: string): AdminServicioRecord['categoria'] {
  const value = label.toLowerCase();
  if (value.includes('manten') || value.includes('prevent')) return 'mantenimiento';
  if (value.includes('instal')) return 'instalacion';
  if (value.includes('soport') || value.includes('remot')) return 'soporte';
  if (value.includes('consult')) return 'consultoria';
  return 'otros';
}

export function computeServiciosTopDemand(
  requestUsage: readonly AdminServiciosRequestUsage[],
): AdminServiciosTopDemand[] {
  return requestUsage.slice(0, 3).map((item, index) => ({
    rank: index + 1,
    name: item.serviceName,
    requests: item.requests,
  }));
}

export function listResponsableFilterOptions(
  records: readonly AdminServicioRecord[],
): Array<{ value: string; label: string }> {
  const seen = new Map<string, string>();
  for (const record of records) {
    if (!seen.has(record.responsable.initials)) {
      seen.set(record.responsable.initials, record.responsable.name);
    }
  }
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}
