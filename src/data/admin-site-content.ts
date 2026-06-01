export const adminPlaceholderCopy: Record<
  string,
  { title: string; description: string }
> = {
  pedidos: {
    title: 'Pedidos',
    description:
      'Aquí verás el listado y seguimiento de pedidos cuando se conecte el módulo de ventas.',
  },
  marketing: {
    title: 'Marketing',
    description: 'Campañas, cupones y promociones estarán disponibles próximamente.',
  },
  reportes: {
    title: 'Reportes',
    description:
      'Los reportes detallados se habilitarán cuando existan datos de pedidos en Supabase.',
  },
  tpv: {
    title: 'TPV',
    description: 'Punto de venta en tienda — módulo en desarrollo.',
  },
  servicios: {
    title: 'Servicios',
    description: 'Órdenes de servicio técnico y mantenimiento.',
  },
  envios: {
    title: 'Envíos',
    description: 'Tarifas, zonas y seguimiento de entregas.',
  },
  categorias: {
    title: 'Categorías',
    description: 'Familias de producto del catálogo.',
  },
  apariencia: {
    title: 'Apariencia',
    description: 'Logo, colores y marca del sitio.',
  },
};
