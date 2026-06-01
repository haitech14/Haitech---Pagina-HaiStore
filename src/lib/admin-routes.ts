export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  VENTAS: '/admin/ventas',
  /** @deprecated Usar VENTAS */
  ORDERS: '/admin/ventas',
  PRODUCTS: '/admin/productos',
  INVENTORY: '/admin/inventario',
  CUSTOMERS: '/admin/clientes',
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

export function isAdminCatalogPath(pathname: string): boolean {
  return ADMIN_CATALOG_NAV.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

export const ADMIN_SETTINGS_SECTIONS = [
  'general',
  'usuarios',
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
  { id: 'usuarios', label: 'Clientes', href: ADMIN_ROUTES.SETTINGS_USUARIOS },
  { id: 'pdf', label: 'PDF', href: ADMIN_ROUTES.SETTINGS_PDF },
  { id: 'apariencia', label: 'Apariencia', href: ADMIN_ROUTES.SETTINGS_APPEARANCE },
  { id: 'integraciones', label: 'Integraciones', href: ADMIN_ROUTES.SETTINGS_INTEGRATIONS },
];

export function isAdminSettingsPath(pathname: string): boolean {
  return pathname === ADMIN_ROUTES.SETTINGS || pathname.startsWith(`${ADMIN_ROUTES.SETTINGS}/`);
}

export type AdminRouteKey = keyof typeof ADMIN_ROUTES;

export const ADMIN_NAV_MAIN = [
  { key: 'DASHBOARD' as const, label: 'Resumen', href: ADMIN_ROUTES.DASHBOARD, icon: 'layout-dashboard' },
  { key: 'VENTAS' as const, label: 'Ventas', href: ADMIN_ROUTES.VENTAS, icon: 'shopping-bag' },
  { key: 'INVENTORY' as const, label: 'Inventario', href: ADMIN_ROUTES.INVENTORY, icon: 'warehouse' },
  { key: 'CUSTOMERS' as const, label: 'Clientes', href: ADMIN_ROUTES.CUSTOMERS, icon: 'users' },
  { key: 'MARKETING' as const, label: 'Marketing', href: ADMIN_ROUTES.MARKETING, icon: 'megaphone' },
  { key: 'SHIPPING' as const, label: 'Envíos', href: ADMIN_ROUTES.SHIPPING, icon: 'truck' },
  { key: 'SETTINGS' as const, label: 'Configuración', href: ADMIN_ROUTES.SETTINGS_GENERAL, icon: 'settings' },
] as const;

export const TECHNICIAN_NAV_KEYS = ['INVENTORY', 'SETTINGS'] as const;
