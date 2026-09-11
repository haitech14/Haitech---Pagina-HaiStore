export const TIENDANOVA_BRAND = {
  name: 'TiendaNova',
  tagline: 'Tu negocio, más grande',
  planTitle: 'Plan Profesional',
  planSubtitle: 'Tu tienda sin límites',
} as const;

export const TIENDANOVA_USER = {
  name: 'Valeria Torres',
  role: 'Administradora',
  initials: 'VT',
  avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96&q=80',
} as const;

export const TIENDANOVA_HEADER = {
  greeting: 'Hola, Valeria 👋',
  subtitle: 'Aquí tienes un resumen de tu tienda. ¡Todo va muy bien!',
  dateLabel: 'Lun, 14 de abril de 2025',
  searchPlaceholder: 'Buscar productos, pedidos, clientes...',
  notifications: 3,
} as const;

export type TiendaNovaNavId =
  | 'dashboard'
  | 'pedidos'
  | 'cotizaciones'
  | 'productos'
  | 'categorias'
  | 'inventario'
  | 'clientes'
  | 'ventas'
  | 'resenas'
  | 'cupones'
  | 'envios'
  | 'marketing'
  | 'configuracion';

export type TiendaNovaNavItem = {
  id: TiendaNovaNavId;
  label: string;
  href: string;
  icon:
    | 'home'
    | 'shopping-cart'
    | 'file-text'
    | 'package'
    | 'tags'
    | 'warehouse'
    | 'users'
    | 'bar-chart-3'
    | 'star'
    | 'ticket'
    | 'truck'
    | 'megaphone'
    | 'settings';
  badge?: number;
};

export const TIENDANOVA_NAV: readonly TiendaNovaNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: 'home' },
  { id: 'pedidos', label: 'Pedidos', href: '/admin/pedidos', icon: 'shopping-cart', badge: 12 },
  { id: 'cotizaciones', label: 'Cotizaciones', href: '/admin/ventas?vista=cotizaciones', icon: 'file-text' },
  { id: 'productos', label: 'Productos', href: '/admin/inventario', icon: 'package' },
  { id: 'categorias', label: 'Categorías', href: '/admin/categorias', icon: 'tags' },
  { id: 'inventario', label: 'Inventario', href: '/admin/inventario', icon: 'warehouse' },
  { id: 'clientes', label: 'Clientes', href: '/admin/crm/clientes', icon: 'users' },
  { id: 'ventas', label: 'Ventas y reportes', href: '/admin/ventas', icon: 'bar-chart-3' },
  { id: 'resenas', label: 'Reseñas', href: '/admin/mural', icon: 'star' },
  { id: 'cupones', label: 'Cupones y promociones', href: '/admin/marketing/cupones', icon: 'ticket' },
  { id: 'envios', label: 'Envíos', href: '/admin/envios', icon: 'truck' },
  { id: 'marketing', label: 'Marketing', href: '/admin/marketing', icon: 'megaphone' },
  { id: 'configuracion', label: 'Configuración', href: '/admin/configuracion', icon: 'settings' },
];

export type MetricTone = 'success' | 'primary' | 'purple' | 'warning';

export type TiendaNovaMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  trend: 'up' | 'down';
  tone: MetricTone;
  icon: 'dollar' | 'cart' | 'users' | 'file';
};

export const TIENDANOVA_METRICS: readonly TiendaNovaMetric[] = [
  {
    id: 'sales',
    label: 'Ventas hoy',
    value: '$12,450',
    delta: '+18%',
    deltaLabel: 'vs. ayer',
    trend: 'up',
    tone: 'success',
    icon: 'dollar',
  },
  {
    id: 'orders',
    label: 'Pedidos',
    value: '48',
    delta: '+12%',
    deltaLabel: 'vs. ayer',
    trend: 'up',
    tone: 'primary',
    icon: 'cart',
  },
  {
    id: 'customers',
    label: 'Clientes nuevos',
    value: '14',
    delta: '+27%',
    deltaLabel: 'vs. ayer',
    trend: 'up',
    tone: 'purple',
    icon: 'users',
  },
  {
    id: 'quotes',
    label: 'Cotizaciones pendientes',
    value: '6',
    delta: '-14%',
    deltaLabel: 'vs. ayer',
    trend: 'down',
    tone: 'warning',
    icon: 'file',
  },
];

export type TiendaNovaSalesPoint = {
  label: string;
  value: number;
};

export const TIENDANOVA_SALES: readonly TiendaNovaSalesPoint[] = [
  { label: '15 mar', value: 5000 },
  { label: '18 mar', value: 3500 },
  { label: '21 mar', value: 7000 },
  { label: '24 mar', value: 8500 },
  { label: '27 mar', value: 11000 },
  { label: '30 mar', value: 9000 },
  { label: '2 abr', value: 12000 },
  { label: '5 abr', value: 15000 },
  { label: '8 abr', value: 18000 },
  { label: '11 abr', value: 15500 },
  { label: '14 abr', value: 22450 },
];

export type TiendaNovaTopProduct = {
  rank: number;
  name: string;
  sales: number;
  price: string;
  image: string;
};

export const TIENDANOVA_TOP_PRODUCTS: readonly TiendaNovaTopProduct[] = [
  {
    rank: 1,
    name: 'Auriculares Bluetooth X1',
    sales: 128,
    price: '$2,499',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=96&h=96&q=80',
  },
  {
    rank: 2,
    name: 'Smartwatch Fit Pro',
    sales: 96,
    price: '$3,999',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=96&h=96&q=80',
  },
  {
    rank: 3,
    name: 'Botella Térmica 750ml',
    sales: 84,
    price: '$599',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=96&h=96&q=80',
  },
  {
    rank: 4,
    name: 'Mochila Urbana',
    sales: 73,
    price: '$1,299',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=96&h=96&q=80',
  },
  {
    rank: 5,
    name: 'Zapatillas Running MAX',
    sales: 61,
    price: '$2,799',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=96&h=96&q=80',
  },
];

export type OrderStatus = 'entregado' | 'proceso' | 'pagado' | 'envio' | 'cancelado';

export type TiendaNovaOrder = {
  id: string;
  customer: string;
  date: string;
  status: OrderStatus;
  total: string;
};

export const TIENDANOVA_ORDERS: readonly TiendaNovaOrder[] = [
  { id: '10045', customer: 'María González', date: '14 abr 2025, 10:24', status: 'entregado', total: '$1,299' },
  { id: '10044', customer: 'Carlos Ramírez', date: '14 abr 2025, 09:15', status: 'proceso', total: '$2,799' },
  { id: '10043', customer: 'Ana Torres', date: '13 abr 2025, 18:42', status: 'pagado', total: '$599' },
  { id: '10042', customer: 'Jorge Martínez', date: '13 abr 2025, 16:20', status: 'envio', total: '$3,499' },
  { id: '10041', customer: 'Lucía Fernández', date: '13 abr 2025, 12:11', status: 'cancelado', total: '$1,099' },
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  entregado: 'Entregado',
  proceso: 'En proceso',
  pagado: 'Pagado',
  envio: 'Envío',
  cancelado: 'Cancelado',
};

export type TiendaNovaStockItem = {
  name: string;
  units: number;
  image: string;
};

export const TIENDANOVA_STOCK: readonly TiendaNovaStockItem[] = [
  {
    name: 'Cámara Web Full HD',
    units: 3,
    image: 'https://images.unsplash.com/photo-1587825147378-1234e45771d4?auto=format&fit=crop&w=80&h=80&q=80',
  },
  {
    name: 'Teclado Mecánico TKL',
    units: 5,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=80&h=80&q=80',
  },
  {
    name: 'Mouse Inalámbrico M350',
    units: 4,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=80&h=80&q=80',
  },
  {
    name: 'Monitor 24" IPS',
    units: 2,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=80&h=80&q=80',
  },
];

export type ActivityKind = 'order' | 'customer' | 'stock' | 'review';

export type TiendaNovaActivity = {
  id: string;
  kind: ActivityKind;
  title: string;
  time: string;
};

export const TIENDANOVA_ACTIVITY: readonly TiendaNovaActivity[] = [
  { id: 'a1', kind: 'order', title: 'María González realizó un pedido', time: 'hace 5 min' },
  { id: 'a2', kind: 'customer', title: 'Nuevo cliente registrado: Pedro López', time: 'hace 12 min' },
  { id: 'a3', kind: 'stock', title: 'Se actualizó el stock de “Mochila Urbana”', time: 'hace 28 min' },
  { id: 'a4', kind: 'review', title: 'Ana Torres dejó una reseña de 5 estrellas', time: 'hace 1 hora' },
];
