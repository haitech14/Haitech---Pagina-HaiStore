export type CrmResumenPeriod = 'hoy' | 'ayer' | 'semana' | 'mes' | 'fechas';

export const CRM_RESUMEN_PERIODS: ReadonlyArray<{
  id: CrmResumenPeriod;
  label: string;
}> = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'ayer', label: 'Ayer' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'fechas', label: 'Fechas' },
] as const;

export function crmResumenPeriodFooter(period: CrmResumenPeriod): string {
  switch (period) {
    case 'hoy':
      return 'por hoy';
    case 'ayer':
      return 'por ayer';
    case 'semana':
      return 'por semana';
    case 'mes':
      return 'por mes';
    case 'fechas':
      return 'por rango';
    default: {
      const _exhaustive: never = period;
      return _exhaustive;
    }
  }
}
