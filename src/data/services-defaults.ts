import { createEmptyPrices } from '@/lib/roles';
import type { ServiceCategory, ServiceOrder, ServicePriceItem } from '@/types/service';

export const DEFAULT_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-mantenimiento',
    name: 'Mantenimiento preventivo',
    description: 'Revisiones programadas, limpieza y ajustes de equipos.',
    active: true,
    sortOrder: 1,
  },
  {
    id: 'cat-correctivo',
    name: 'Servicio correctivo',
    description: 'Reparación de fallas, atascos y errores en campo.',
    active: true,
    sortOrder: 2,
  },
  {
    id: 'cat-instalacion',
    name: 'Instalación',
    description: 'Puesta en marcha, red y capacitación básica.',
    active: true,
    sortOrder: 3,
  },
  {
    id: 'cat-remoto',
    name: 'Soporte remoto',
    description: 'Diagnóstico y configuración vía asistencia remota.',
    active: true,
    sortOrder: 4,
  },
];

export const DEMO_SERVICE_ORDERS: ServiceOrder[] = [];

export const DEFAULT_SERVICE_PRICE_LIST: ServicePriceItem[] = [
  {
    id: 'sp-001',
    code: 'SRV-MF-TRIM',
    name: 'Mantenimiento preventivo multifuncional',
    categoryId: 'cat-mantenimiento',
    description: 'Limpieza, rodillos y contador; hasta 1 equipo en sitio.',
    prices: { public: 280, tecnico: 240, mayorista: 220, distribuidor: 200 },
    active: true,
  },
  {
    id: 'sp-002',
    code: 'SRV-CORR-URG',
    name: 'Correctivo urgente (misma ciudad)',
    categoryId: 'cat-correctivo',
    description: 'Visita técnica prioritaria y diagnóstico en campo.',
    prices: { public: 180, tecnico: 150, mayorista: 140, distribuidor: 125 },
    active: true,
  },
  {
    id: 'sp-003',
    code: 'SRV-INST-BASE',
    name: 'Instalación y puesta en marcha',
    categoryId: 'cat-instalacion',
    description: 'Conexión red/USB, drivers y prueba de impresión.',
    prices: { public: 220, tecnico: 190, mayorista: 175, distribuidor: 160 },
    active: true,
  },
  {
    id: 'sp-004',
    code: 'SRV-REM-60',
    name: 'Soporte remoto (hasta 60 min)',
    categoryId: 'cat-remoto',
    description: 'Asistencia remota con registro de ticket.',
    prices: { public: 95, tecnico: 80, mayorista: 75, distribuidor: 70 },
    active: true,
  },
];

export function createDefaultServicePriceItem(
  categoryId: string,
  name: string,
): ServicePriceItem {
  const base = createEmptyPrices();
  return {
    id: `sp-${Date.now()}`,
    code: `SRV-${String(Date.now()).slice(-6)}`,
    name,
    categoryId,
    description: '',
    prices: { ...base, public: 0 },
    active: true,
  };
}
