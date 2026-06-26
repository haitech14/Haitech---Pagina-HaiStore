import type { LucideIcon } from 'lucide-react';

export interface ServiceLandingCard {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: LucideIcon;
}

export interface ServiceLandingBenefit {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface ServiceLandingConfig {
  slug: string;
  metaTitle: string;
  badge: string;
  badgeIcon: LucideIcon;
  title: string;
  titleHighlight: string;
  subtitle: string;
  bullets: readonly string[];
  highlightBulletIndex?: number;
  cards: readonly ServiceLandingCard[];
  benefits: readonly ServiceLandingBenefit[];
  /** Tarjetas visibles por vista en desktop (carrusel) */
  gridCols?: 'four' | 'two';
}
