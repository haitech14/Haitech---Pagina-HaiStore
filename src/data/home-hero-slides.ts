import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, Headphones, KeyRound, Percent, ShieldCheck, Tag, Truck } from 'lucide-react';

import { STORE_RICOH_PROMO_DEFAULT_HEIGHT_CLASS } from '@/lib/store-ricoh-promo-layout';

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

/** Altura del carrusel: misma franja que el carrusel Ricoh / Cyber Days del home. */
export const HOME_HERO_PROMO_BANNER_HEIGHT_CLASS = STORE_RICOH_PROMO_DEFAULT_HEIGHT_CLASS;

/** Banner principal home — imagen completa (único slide del carrusel legacy). */
export const HAITECH_HOME_HERO_BANNER_SLIDE: HomeHeroSlide = {
  id: 'haitech-home-hero',
  imageOnly: true,
  singleAsset: true,
  compact: true,
  skipHeroWebpVariants: true,
  compactMaxHeightClass: HOME_HERO_PROMO_BANNER_HEIGHT_CLASS,
  objectFit: 'cover',
  heroVerticalCrop: 1,
  objectPositionClass: 'object-center',
  compactImageFrameClass: 'h-full w-full',
  compactImageZoomClass: 'scale-100',
  linkHref: HOME_HERO_WHATSAPP_LINK,
  dotTheme: 'dark',
  backgroundImage: '/hero/haitech-home-hero.png',
  imageWidth: 2094,
  imageHeight: 751,
  imageAlt:
    'Soluciones de impresión Ricoh — Fotocopiadoras inteligentes para tu empresa. Solicita tu cotización.',
};

/** Slides activos del hero legacy (solo el banner HAITECH). */
export const homeHeroSlides: HomeHeroSlide[] = [HAITECH_HOME_HERO_BANNER_SLIDE];
