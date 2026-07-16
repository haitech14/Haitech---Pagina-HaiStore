import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, Headphones, KeyRound, Percent, ShieldCheck, Tag, Truck } from 'lucide-react';
export type HomeHeroTrustIcon =
  | 'badge-check'
  | 'tag'
  | 'truck'
  | 'shield'
  | 'percent'
  | 'key'
  | 'headset';

export interface HomeHeroTrustBadge {
  icon: HomeHeroTrustIcon;
  title: string;
  text: string;
}

export interface HomeHeroTitleLine {
  text: string;
  variant: 'white' | 'red';
}

export type HomeHeroSlideLayout = 'image-only' | 'dia-papa-home' | 'home-landing';

export interface HomeHeroSlide {
  id: string;
  layout?: HomeHeroSlideLayout;
  /** Banner completo solo imagen (sin textos superpuestos). */
  imageOnly?: boolean;
  /** Una sola imagen en `backgroundImage` (sin variantes @2x/@3x). */
  singleAsset?: boolean;
  /** Altura acorde al carrusel de categorías; ancho natural (no full-bleed). */
  compact?: boolean;
  linkHref?: string;
  imageAlt?: string;
  eyebrow?: string;
  titleLines?: HomeHeroTitleLine[];
  subtitle?: string;
  trustBadges?: HomeHeroTrustBadge[];
  primaryCta?:
    | { kind: 'whatsapp' }
    | { kind: 'link'; label: string; href: string; style?: 'green' | 'red' };
  secondaryCta?: { label: string; href: string; external?: boolean };
  footerNote?: string;
  backgroundImage: string;
  imageWidth?: number;
  imageHeight?: number;
  imageBackground?: string;
  backgroundClass?: string;
  /** `contain` muestra el banner completo; `cover` recorta (default compacto). */
  objectFit?: 'cover' | 'contain';
  /** 1 = sin recorte vertical en compact; <1 recorta márgenes (p. ej. 0.72). */
  heroVerticalCrop?: number;
  /** Altura fija del banner compacto (Tailwind h-* / max-h-*). Con `h-*` llena todo el ancho. */
  compactMaxHeightClass?: string;
  /** Anclaje `object-*` para recortar arriba y conservar la base del arte. */
  objectPositionClass?: string;
  /** Altura de la imagen dentro del contenedor (p. ej. `h-[96%]`). */
  compactImageFrameClass?: string;
  /** Zoom Tailwind opcional por slide (`scale-*`). */
  compactImageZoomClass?: string;
  /** Muestra botones flotantes sobre el banner compacto. */
  ctaOverlay?: boolean;
  /** Evita variantes WebP inexistentes (p. ej. categorías sin -768/-1920). */
  skipHeroWebpVariants?: boolean;
  /** Contraste de los puntos del carrusel: claros sobre fondo oscuro o oscuros sobre fondo claro. */
  dotTheme?: 'light' | 'dark';
  sealTitle?: string;
  sealSubtitle?: string;
}
export const HOME_HERO_WHATSAPP_NUMBER = '915 149 290';
export const HOME_HERO_WHATSAPP_LINK = 'https://wa.me/51915149290';

export const TRUST_ICON_MAP: Record<HomeHeroTrustIcon, LucideIcon> = {
  'badge-check': BadgeCheck,
  tag: Tag,
  truck: Truck,
  shield: ShieldCheck,
  percent: Percent,
  key: KeyRound,
  headset: Headphones,
};

/** Slide principal de la landing (texto + escena). */
export const HOME_LANDING_HERO_SLIDE: HomeHeroSlide = {
  id: 'home-landing',
  layout: 'home-landing',
  /** Primera slide LCP: WebP responsive (home-hero-scene-*.webp). */
  backgroundImage: '/hero/home-hero-scene.png',
  skipHeroWebpVariants: false,
  singleAsset: true,
  dotTheme: 'light',
};

/** Altura del carrusel para banners promocionales (slides 2 y 3), alineada al hero principal. */
export const HOME_HERO_PROMO_BANNER_HEIGHT_CLASS =
  'h-[min(66vw,22rem)] sm:h-[min(52vw,25rem)] lg:h-[28rem] xl:h-[31rem]';

/** Ajustes compartidos de banners promocionales (más compactos que el slide principal). */
const HOME_HERO_PROMO_IMAGE_SHARED = {
  imageOnly: true,
  singleAsset: true,
  compact: true,
  skipHeroWebpVariants: true,
  compactMaxHeightClass: HOME_HERO_PROMO_BANNER_HEIGHT_CLASS,
  objectFit: 'cover' as const,
  heroVerticalCrop: 1,
  objectPositionClass: 'object-[center_58%]',
  compactImageFrameClass: 'h-full w-full',
  compactImageZoomClass: 'scale-100',
  linkHref: HOME_HERO_WHATSAPP_LINK,
};
/** Banner Fiestas Patrias — promociones generales. */
export const FIESTAS_PATRIAS_BANNER_HERO_SLIDE: HomeHeroSlide = {
  ...HOME_HERO_PROMO_IMAGE_SHARED,
  id: 'fiestas-patrias-promociones',
  dotTheme: 'light',
  backgroundImage: '/Banner2hero.png',
  imageWidth: 2048,
  imageHeight: 768,
  imageAlt:
    'Promociones por Fiestas Patrias — Fotocopiadoras Ricoh para tu oficina. Rendimiento, velocidad y calidad profesional.',
};

/** Banner Fiestas Patrias — ofertas con precios. */
export const FIESTAS_PATRIAS_PROMO_NUEVAS_HERO_SLIDE: HomeHeroSlide = {
  ...HOME_HERO_PROMO_IMAGE_SHARED,
  id: 'fiestas-patrias-ofertas',
  dotTheme: 'dark',
  backgroundImage: '/hero/fiestas-patrias-ofertas.png',
  imageWidth: 2172,
  imageHeight: 724,
  imageAlt:
    'Ofertas por Fiestas Patrias — Fotocopiadoras Ricoh para tu oficina. Instalación, soporte técnico y garantía.',
};

/** Slides activos del hero (LCP = primer slide). */
export const homeHeroSlides: HomeHeroSlide[] = [
  HOME_LANDING_HERO_SLIDE,
  FIESTAS_PATRIAS_BANNER_HERO_SLIDE,
  FIESTAS_PATRIAS_PROMO_NUEVAS_HERO_SLIDE,
];
