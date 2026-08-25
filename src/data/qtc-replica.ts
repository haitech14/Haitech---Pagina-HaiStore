/** Tokens visuales QTC (referencia captura). */
export const QTC = {
  purple: '#7228F5',
  orange: '#FF6B00',
  orangeActive: '#FF6600',
  blackNav: '#131313',
  text: '#343434',
  textMuted: '#6B6B6B',
  grayBg: '#F5F5F5',
  cardBorder: '#E5E5E5',
  promoGreenBg: '#E8F8EE',
  promoGreenText: '#1B7A3D',
  discountRed: '#E30613',
  maxWidth: '1360px',
} as const;

export const QTC_TOPBAR_BRANDS = ['QTC', 'Mi', 'DJI', 'HONOR'] as const;

export const QTC_PRIMARY_CATEGORIES = [
  'Marcas',
  'Drones',
  'Celulares',
  'Computo',
  'Movilidad',
  'Wearable',
  'Audio',
  'Hogar',
  'Estaciones de Energía',
  'Impresoras 3D',
  'Nuevos',
] as const;

export const QTC_SECONDARY_NAV = [
  { id: 'agriculture', label: 'DJI Agriculture', icon: '🔥', hasMenu: false },
  { id: 'enterprise', label: 'DJI Enterprise', icon: '🚀', hasMenu: false },
  { id: 'flycart', label: 'DJI Flycart', icon: '🛸', hasMenu: true },
  { id: 'academia', label: 'DJI Academia QTC', icon: '🎓', hasMenu: true },
  { id: 'curso', label: 'Curso Drones Agrícolas', icon: '🛸', hasMenu: false },
  { id: 'care', label: 'QTC Care', icon: '🛡️', hasMenu: false },
] as const;

export const QTC_PRODUCT_TABS = [
  'Ofertas top',
  'Más vendidos',
  'Scooters',
  'Celulares',
  'Hogar',
] as const;

export type QtcProductTab = (typeof QTC_PRODUCT_TABS)[number];

export const QTC_WHATSAPP_URL =
  'https://wa.me/51999999999?text=' +
  encodeURIComponent('Hola QTC, quiero comprar por WhatsApp.');

export const QTC_HERO_SLIDES = [
  {
    id: 'modo-gamer',
    src: '/qtc/hero-modo-gamer.png',
    alt: 'MODO GAMER — Hasta S/500 de descuento en productos DJI',
  },
  {
    id: 'modo-gamer-2',
    src: '/qtc/hero-modo-gamer.png',
    alt: 'Promoción DJI — Ofertas QTC',
  },
  {
    id: 'modo-gamer-3',
    src: '/qtc/hero-modo-gamer.png',
    alt: 'DJI Osmo, Mic Mini y Lito X1',
  },
  {
    id: 'modo-gamer-4',
    src: '/qtc/hero-modo-gamer.png',
    alt: 'Cuotas sin intereses en QTC',
  },
  {
    id: 'modo-gamer-5',
    src: '/qtc/hero-modo-gamer.png',
    alt: 'Envío gratis QTC',
  },
  {
    id: 'modo-gamer-6',
    src: '/qtc/hero-modo-gamer.png',
    alt: 'Campañas DJI en QTC',
  },
  {
    id: 'modo-gamer-7',
    src: '/qtc/hero-modo-gamer.png',
    alt: 'Ofertas top QTC',
  },
] as const;

export type QtcProductCardData = {
  id: string;
  name: string;
  image: string;
  imageBg?: string;
  colorSwatch?: string;
  colorLabel?: string;
  price: number;
  compareAt?: number;
  discountLabel?: string;
  promoTag?: string;
  href?: string;
};

/** Carrusel principal — ¡Encuentra tu favorito! */
export const QTC_FAVORITE_PRODUCTS: readonly QtcProductCardData[] = [
  {
    id: 'scooter-ultra',
    name: 'Xiaomi Electric Scooter Ultra GL',
    image:
      'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#1a1a1a',
    colorLabel: 'Negro',
    price: 3399,
    compareAt: 3499,
    discountLabel: '3% DSCT',
  },
  {
    id: 'dreame-d20',
    name: 'Dreame Robot Vacuum Cleaner D20 Ultra',
    image:
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#2c2c2c',
    price: 2899,
    compareAt: 3199,
    discountLabel: '9% DSCT',
    promoTag: '+ ASPIRADORA',
  },
  {
    id: 'monitor-g27i',
    name: 'Xiaomi Gaming Monitor G27i',
    image:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#111111',
    price: 799,
    compareAt: 899,
    discountLabel: '11% DSCT',
  },
  {
    id: 'dji-rs4',
    name: 'DJI RS 4 Combo',
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#1f1f1f',
    price: 2499,
    compareAt: 2799,
    discountLabel: '11% DSCT',
  },
  {
    id: 'redmi-pad-2',
    name: 'Redmi Pad 2 Pro',
    image:
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#3d3d3d',
    price: 1299,
    compareAt: 1499,
    discountLabel: '13% DSCT',
    promoTag: '+ S/99 REDMI SMART PEN',
  },
  {
    id: 'honor-magic-v3',
    name: 'Honor Magic V3',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#0a0a0a',
    price: 4999,
    compareAt: 5499,
    discountLabel: '9% DSCT',
  },
  {
    id: 'scooter-4-pro',
    name: 'Xiaomi Electric Scooter 4 Pro',
    image:
      'https://images.unsplash.com/photo-1571068316344-75bc76f67877?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#222',
    price: 2199,
    compareAt: 2499,
    discountLabel: '12% DSCT',
  },
  {
    id: 'oppo-reno16',
    name: 'OPPO Reno16 5G',
    image:
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#1e3a5f',
    price: 1699,
    compareAt: 1899,
    discountLabel: '11% DSCT',
  },
];

/** Carrusel “Lo último” */
export const QTC_LATEST_PRODUCTS: readonly QtcProductCardData[] = [
  {
    id: 'vee-scooter',
    name: 'VEE Electric Scooter',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#111',
    price: 1899,
    compareAt: 2199,
    discountLabel: '14% DSCT',
  },
  {
    id: 'redmi-note-15',
    name: 'Redmi Note 15 Pro',
    image:
      'https://images.unsplash.com/photo-1598327105666-5b89351aff22?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#1a1a1a',
    price: 1199,
    compareAt: 1399,
    discountLabel: '14% DSCT',
  },
  {
    id: 'dji-rs5',
    name: 'DJI RS 5 Combo',
    image:
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#222',
    price: 3299,
    compareAt: 3699,
    discountLabel: '11% DSCT',
  },
  {
    id: 'innos-tv-55',
    name: 'INNOS TV 55"',
    image:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#0d0d0d',
    price: 1599,
    compareAt: 1899,
    discountLabel: '16% DSCT',
  },
  {
    id: 'dreame-wet-dry',
    name: 'Dreame Wet and Dry Vacuum',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#2a2a2a',
    price: 1499,
    compareAt: 1799,
    discountLabel: '17% DSCT',
    promoTag: '+ ASPIRADORA',
  },
  {
    id: 'xiaomi-scooter',
    name: 'Xiaomi Electric Scooter',
    image:
      'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#1a1a1a',
    price: 1299,
    compareAt: 1499,
    discountLabel: '13% DSCT',
  },
  {
    id: 'honor-pad',
    name: 'HONOR Pad X9',
    image:
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=400&q=80',
    colorSwatch: '#333',
    price: 899,
    compareAt: 999,
    discountLabel: '10% DSCT',
  },
];

export const QTC_PROMO_BANNERS = [
  {
    id: 'oppo',
    title: 'HASTA S/200 DSCTO.',
    subtitle: 'OPPO Reno16',
    cta: 'Comprar ahora',
    gradient: 'linear-gradient(135deg, #1a237e 0%, #3949ab 45%, #5c6bc0 100%)',
    accent: '#FFD54F',
  },
  {
    id: 'xiaomi-espresso',
    title: 'A SOLO S/429',
    subtitle: 'Máquina espresso Xiaomi',
    cta: null,
    gradient: 'linear-gradient(135deg, #eceff1 0%, #cfd8dc 50%, #b0bec5 100%)',
    accent: '#FF6B00',
    darkText: true,
  },
  {
    id: 'dji-osmo',
    title: '33% DSCTO.',
    subtitle: 'DJI Osmo Mobile',
    cta: null,
    gradient: 'linear-gradient(135deg, #0d0d0d 0%, #2c2c2c 50%, #1a1a1a 100%)',
    accent: '#7228F5',
  },
] as const;

export const QTC_BENEFITS = [
  {
    id: 'retiro',
    title: 'Retiro en tiendas\na nivel nacional',
    note: '*Aplican T&C',
    icon: 'store' as const,
  },
  {
    id: 'cuotas',
    title: 'Hasta 12 meses\nsin intereses con\nMercado Pago',
    note: '*Aplican T&C',
    icon: 'handshake' as const,
  },
  {
    id: 'atencion',
    title: 'Atención\nPersonalizada',
    note: null,
    icon: 'headphones' as const,
  },
] as const;

export const QTC_FOOTER_COLUMNS = [
  {
    id: 'welcome',
    title: 'Bienvenido a QTC.pe, tu tienda tecnológica oficial en Perú',
    body: 'Somos el ecosistema tecnológico donde encuentras lo último en productos Xiaomi, DJI, HONOR, OPPO y más marcas líderes. Compra con garantía oficial, asesoría experta y la seguridad de un retailer autorizado en todo el país.',
  },
  {
    id: 'secure',
    title: 'Compra segura, rápida y con respaldo oficial',
    body: 'Envíos a nivel nacional, retiro en tienda, múltiples métodos de pago y atención personalizada. Nuestro equipo de soporte técnico te acompaña antes, durante y después de tu compra para que disfrutes tu tecnología sin complicaciones.',
  },
] as const;

export function formatQtcPen(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
