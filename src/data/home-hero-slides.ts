import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, Headphones, KeyRound, Percent, ShieldCheck, Tag, Truck } from 'lucide-react';

import { CATEGORY_STRIP_HERO_HEIGHT_CLASS } from '@/lib/category-strip-layout';

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

export type HomeHeroSlideLayout = 'image-only' | 'dia-papa-home';

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

/** Ajustes compartidos del hero compacto (misma altura en todos los slides). */
const HOME_HERO_COMPACT_SHARED = {
  imageOnly: true,
  singleAsset: true,
  compact: true,
  imageWidth: 2172,
  imageHeight: 724,
  objectFit: 'cover' as const,
  heroVerticalCrop: 0.84,
  objectPositionClass: 'object-[center_50%]',
  compactMaxHeightClass: CATEGORY_STRIP_HERO_HEIGHT_CLASS,
  ctaOverlay: false,
  linkHref: HOME_HERO_WHATSAPP_LINK,
};

/** Banner hero Fiestas Patrias — promociones generales (referencia de encuadre). */
export const FIESTAS_PATRIAS_BANNER_HERO_SLIDE: HomeHeroSlide = {
  ...HOME_HERO_COMPACT_SHARED,
  id: 'fiestas-patrias-banner',
  backgroundImage: '/categories/fiestaspatriasbanner.png',
  imageWidth: 1983,
  imageHeight: 793,
  imageAlt:
    'Promociones por Fiestas Patrias — Fotocopiadoras Ricoh para tu oficina. Rendimiento, velocidad y calidad profesional.',
};

/** Banner hero Fiestas Patrias — ofertas con precios (promonuevas). */
export const FIESTAS_PATRIAS_PROMO_NUEVAS_HERO_SLIDE: HomeHeroSlide = {
  ...HOME_HERO_COMPACT_SHARED,
  id: 'fiestas-patrias-promo-nuevas',
  backgroundImage: '/categories/promonuevas-1.png',
  imageWidth: 2172,
  imageHeight: 724,
  imageAlt:
    'Ofertas por Fiestas Patrias — Fotocopiadoras Ricoh para tu oficina. Instalación, soporte técnico y garantía.',
};

/** Slides activos del hero (LCP = primer slide). */
export const homeHeroSlides: HomeHeroSlide[] = [
  FIESTAS_PATRIAS_BANNER_HERO_SLIDE,
  FIESTAS_PATRIAS_PROMO_NUEVAS_HERO_SLIDE,
];
