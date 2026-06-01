export interface CategoryHeroContent {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  imageAlt?: string;
}

export interface ResolvedCategoryHero {
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
}

export const categoryHeroBySlug: Record<string, CategoryHeroContent> = {
  multifuncionales: {
    badge: 'Hasta 21% dto.',
    title: 'Multifuncionales en promoción',
    subtitle:
      'Imprime, escanea y copia con equipos Ricoh y más. Precios corporativos desde la primera unidad.',
    ctaLabel: 'Ver catálogo completo',
    ctaHref: '/tienda',
    image: '/promotions/promo-hero-multifuncionales.png',
    imageAlt: 'Impresora multifuncional de oficina en promoción',
  },
  impresoras: {
    badge: 'Novedades',
    title: 'Impresoras para cada oficina',
    subtitle: 'Láser, inkjet y equipos de alto volumen con soporte técnico HaiStore.',
    ctaLabel: 'Ver catálogo completo',
    ctaHref: '/tienda',
    image: '/promotions/promo-hero-ofertas.png',
    imageAlt: 'Impresoras de oficina',
  },
  'toner-suministros': {
    badge: 'Stock disponible',
    title: 'Tóner y suministros',
    subtitle: 'Consumibles originales y compatibles para mantener tu flota operativa.',
    ctaLabel: 'Ver catálogo completo',
    ctaHref: '/tienda',
    image: '/promotions/promo-hero-ofertas.png',
    imageAlt: 'Suministros de impresión',
  },
};

export function getCategoryHeroContent(
  slug: string,
  fallback: { name: string; tagline: string; image?: string },
): ResolvedCategoryHero {
  const custom = categoryHeroBySlug[slug];
  const resolved: ResolvedCategoryHero = {
    title: custom?.title ?? `${fallback.name} en HaiStore`,
    subtitle: custom?.subtitle ?? fallback.tagline,
    image: custom?.image ?? fallback.image ?? '/promotions/promo-hero-ofertas.png',
    imageAlt: custom?.imageAlt ?? `Equipos y productos de ${fallback.name}`,
    ctaLabel: custom?.ctaLabel ?? 'Ver catálogo completo',
    ctaHref: custom?.ctaHref ?? '/tienda',
  };
  if (custom?.badge) resolved.badge = custom.badge;
  return resolved;
}
