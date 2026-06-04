export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  VENTAS: '/admin/ventas',
  /** @deprecated Usar VENTAS */
  ORDERS: '/admin/ventas',
  PRODUCTS: '/admin/productos',
  INVENTORY: '/admin/inventario',
  /** @deprecated Usar CRM_CLIENTES */
  CUSTOMERS: '/admin/clientes',
  CRM: '/admin/crm',
  CRM_RESUMEN: '/admin/crm/resumen',
  CRM_PIPELINE: '/admin/crm/pipeline',
  CRM_MURAL: '/admin/crm/mural',
  CRM_CLIENTES: '/admin/crm/clientes',
  MARKETING: '/admin/marketing',
  REPORTS: '/admin/reportes',
  SETTINGS: '/admin/configuracion',
  SETTINGS_GENERAL: '/admin/configuracion/general',
  SETTINGS_PDF: '/admin/configuracion/pdf',
  SETTINGS_APPEARANCE: '/admin/configuracion/apariencia',
  SETTINGS_INTEGRATIONS: '/admin/configuracion/integraciones',
  SETTINGS_USUARIOS: '/admin/configuracion/usuarios',
  /** Punto de venta dentro de Ventas */
  TPV: '/admin/ventas?vista=tpv',
  /** @deprecated Usar TPV */
  TPV_LEGACY: '/admin/tpv',
  SERVICES: '/admin/servicios',
  RENTALS: '/admin/alquileres-planes',
  SHIPPING: '/admin/envios',
  CATEGORIES: '/admin/categorias',
  PRICE_LISTS: '/admin/listas-precios',
  APPEARANCE: '/admin/apariencia',
} as const;

export const ADMIN_CATALOG_NAV = [
  { label: 'Inventario', href: ADMIN_ROUTES.INVENTORY },
  { label: 'Categorías', href: ADMIN_ROUTES.CATEGORIES },
  { label: 'Listas de Precios', href: ADMIN_ROUTES.PRICE_LISTS },
] as const;

export const ADMIN_CRM_NAV = [
  { label: 'Resumen', href: ADMIN_ROUTES.CRM_RESUMEN },
  { label: 'Pipeline', href: ADMIN_ROUTES.CRM_PIPELINE },
  { label: 'Mural', href: ADMIN_ROUTES.CRM_MURAL },
] as const;

export function isAdminCrmPath(pathname: string): boolean {
  return (
    pathname === ADMIN_ROUTES.CRM ||
    pathname.startsWith(`${ADMIN_ROUTES.CRM}/`) ||
    pathname === ADMIN_ROUTES.CUSTOMERS
  );
}

export function isAdminCatalogPath(pathname: string): boolean {
  return ADMIN_CATALOG_NAV.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

export const ADMIN_SERVICES_NAV = [
  { label: 'Servicios', tab: null as string | null },
  { label: 'Categorías', tab: 'categorias' },
  { label: 'Lista de Precios', tab: 'precios' },
] as const;

export function isAdminServicesPath(pathname: string): boolean {
  return pathname === ADMIN_ROUTES.SERVICES || pathname.startsWith(`${ADMIN_ROUTES.SERVICES}/`);
}

export const ADMIN_SETTINGS_SECTIONS = [
  'general',
  'pdf',
  'apariencia',
  'integraciones',
] as const;

export type AdminSettingsSectionId = (typeof ADMIN_SETTINGS_SECTIONS)[number];

export const ADMIN_SETTINGS_NAV: Array<{
  id: AdminSettingsSectionId;
  label: string;
  href: string;
}> = [
  { id: 'general', label: 'General', href: ADMIN_ROUTES.SETTINGS_GENERAL },
  { id: 'pdf', label: 'PDF', href: ADMIN_ROUTES.SETTINGS_PDF },
  { id: 'apariencia', label: 'Apariencia', href: ADMIN_ROUTES.SETTINGS_APPEARANCE },
  { id: 'integraciones', label: 'Integraciones', href: ADMIN_ROUTES.SETTINGS_INTEGRATIONS },
];

export function isAdminSettingsPath(pathname: string): boolean {
  return pathname === ADMIN_ROUTES.SETTINGS || pathname.startsWith(`${ADMIN_ROUTES.SETTINGS}/`);
}

export type AdminRouteKey = keyof typeof ADMIN_ROUTES;

export const ADMIN_NAV_MAIN = [
  { key: 'DASHBOARD' as const, label: 'Dashboard', href: ADMIN_ROUTES.DASHBOARD, icon: 'layout-dashboard' },
  { key: 'CRM' as const, label: 'CRM', href: ADMIN_ROUTES.CRM_RESUMEN, icon: 'contact-round' },
  { key: 'VENTAS' as const, label: 'Ventas', href: ADMIN_ROUTES.VENTAS, icon: 'shopping-bag' },
  { key: 'INVENTORY' as const, label: 'Inventario', href: ADMIN_ROUTES.INVENTORY, icon: 'warehouse' },
  { key: 'MARKETING' as const, label: 'Marketing', href: ADMIN_ROUTES.MARKETING, icon: 'megaphone' },
  { key: 'SHIPPING' as const, label: 'Envíos', href: ADMIN_ROUTES.SHIPPING, icon: 'truck' },
  { key: 'SERVICES' as const, label: 'Servicios', href: ADMIN_ROUTES.SERVICES, icon: 'wrench' },
  {
    key: 'RENTALS' as const,
    label: 'Alquileres y Planes',
    href: ADMIN_ROUTES.RENTALS,
    icon: 'calendar-range',
  },
  { key: 'SETTINGS' as const, label: 'Configuración', href: ADMIN_ROUTES.SETTINGS_GENERAL, icon: 'settings' },
] as const;

export const TECHNICIAN_NAV_KEYS = ['INVENTORY', 'SETTINGS'] as const;
