import type { CrmMuralCard, CrmMuralColumn } from '@/types/crm-mural';

/** Orden del lienzo: Ventas (con cuentas al pie) → Productos → Equipos → Envíos. */
export const CRM_MURAL_COLUMNS: CrmMuralColumn[] = [
  { id: 'ventas', label: 'Ventas', accentClass: 'bg-violet-500' },
  { id: 'productos', label: 'Productos', accentClass: 'bg-emerald-500' },
  { id: 'equipos', label: 'Equipos', accentClass: 'bg-amber-500' },
  { id: 'envios', label: 'Envíos', accentClass: 'bg-red-500' },
];

export const CRM_MURAL_PINNED_ACCOUNTS_LABEL = 'Número de cuenta';

export const CRM_MURAL_CARDS: CrmMuralCard[] = [];
