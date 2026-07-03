import type { Category } from '@/data/categories';
import { categoryLandingPath } from '@/lib/category-path';

export type HomeCategoryStripItem = {
  id: string;
  name: string;
  description: string;
  image?: string;
  href: string;
  ctaLabel: string;
};

type CategoryOverride = Partial<
  Pick<HomeCategoryStripItem, 'name' | 'description' | 'href' | 'image' | 'ctaLabel'>
>;

const HOME_CATEGORY_DISPLAY_OVERRIDES: Record<string, CategoryOverride> = {
  multifuncionales: {
    name: 'Fotocopiadoras',
    description: 'Equipos de alto rendimiento para tu oficina.',
  },
  impresoras: {
    description: 'Impresión eficiente para tu negocio.',
  },
  'servicio-tecnico': {
    description: 'Mantenimiento, reparación y soporte profesional.',
    href: '/servicio-tecnico',
    ctaLabel: 'Saber más',
  },
  'toner-suministros': {
    name: 'Tóner',
    description: 'Cartuchos originales y compatibles.',
    ctaLabel: 'Ver tóner',
  },
  repuestos: {
    description: 'Repuestos y accesorios originales.',
    ctaLabel: 'Ver repuestos',
  },
};

const DEFAULT_CTA_LABEL = 'Ver productos';

function categoryHref(slug: string): string {
  if (slug === 'software') return '/software';
  if (slug === 'servicio-tecnico') return '/servicio-tecnico';
  return categoryLandingPath(slug);
}

function resolveCtaLabel(slug: string, override?: CategoryOverride): string {
  if (override?.ctaLabel) return override.ctaLabel;
  if (slug === 'servicio-tecnico') return 'Saber más';
  if (slug === 'toner-suministros' || slug === 'toner-compatibles') return 'Ver tóner';
  if (slug === 'repuestos') return 'Ver repuestos';
  return DEFAULT_CTA_LABEL;
}

/** Tarjetas del carrusel «Explorá nuestras categorías», derivadas del árbol de la tienda. */
export function buildHomeCategoryStripItems(categories: Category[]): HomeCategoryStripItem[] {
  return categories.map((category) => {
    const override = HOME_CATEGORY_DISPLAY_OVERRIDES[category.slug] ?? {};

    const image = override.image ?? category.image;

    return {
      id: category.slug,
      name: override.name ?? category.name,
      description: override.description ?? category.tagline,
      ...(image ? { image } : {}),
      href: override.href ?? categoryHref(category.slug),
      ctaLabel: resolveCtaLabel(category.slug, override),
    };
  });
}
