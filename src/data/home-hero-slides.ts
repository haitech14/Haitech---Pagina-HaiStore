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

/**
 * Slide evergreen B2B.
 * Para volver al promocional: restaura `DIA_PAPA_HERO_SLIDE` en `homeHeroSlides`.
 */
export const EVERGREEN_HERO_SLIDE: HomeHeroSlide = {
  id: 'evergreen-ricoh-b2b',
  imageOnly: false,
  backgroundImage: '/categories/multifuncionales.png',
  imageWidth: 1920,
  imageHeight: 800,
  eyebrow: 'Ricoh Alliance Partner',
  titleLines: [
    { text: 'Equipos Ricoh', variant: 'white' },
    { text: 'para tu empresa', variant: 'red' },
  ],
  subtitle: 'Multifuncionales, soporte experto y cotización en minutos.',
  trustBadges: [
    { icon: 'shield', title: '100% originales', text: 'Garantía Ricoh' },
    { icon: 'truck', title: 'Envío nacional', text: 'Rápido y seguro' },
    { icon: 'headset', title: 'Soporte experto', text: 'Siempre contigo' },
  ],
  primaryCta: { kind: 'whatsapp' },
  secondaryCta: { label: 'Ver multifuncionales', href: '/categoria/multifuncionales' },
  footerNote: 'Asesoría gratuita sin compromiso',
  imageAlt: 'Equipos Ricoh para empresas — Hai Tech',
};

/** Slide promocional Día del Padre (archivado; reactivar si hay campaña). */
export const DIA_PAPA_HERO_SLIDE: HomeHeroSlide = {
  id: 'dia-papa-ricoh-promo',
  imageOnly: true,
  singleAsset: true,
  compact: true,
  backgroundImage: '/categories/banner2.png',
  imageWidth: 2172,
  imageHeight: 724,
  imageAlt:
    'Día del Padre — Promociones especiales en fotocopiadoras Ricoh IM 550F, IM C2010 e IM 430F. Potencia tu oficina con rendimiento, velocidad y calidad profesional.',
  linkHref: HOME_HERO_WHATSAPP_LINK,
};

/** Slides activos del hero. Solo el primero se precarga (LCP). */
export const homeHeroSlides: HomeHeroSlide[] = [
  EVERGREEN_HERO_SLIDE,
  // DIA_PAPA_HERO_SLIDE,
];
