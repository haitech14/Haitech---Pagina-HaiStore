import type { LucideIcon } from 'lucide-react';
import { Calendar, Droplets, Laptop, Printer } from 'lucide-react';

import { categories } from '@/data/categories';
import { megaMenuServiceLinks } from '@/data/mega-menu';
import { rentalCategories } from '@/data/rental-categories';
import { getServiceLandingBySlug } from '@/data/service-landings';
import type { ServiceLandingSlug } from '@/data/service-landings';
import { categoryLandingPath, categoryPath } from '@/lib/category-path';
import { buildLandingMenuCategoriesFromTree } from '@/lib/landing-menu-categories';
import type {
  MegaMenuColumnGroup,
  NavMegaMenuModel,
} from '@/lib/mega-menu-from-store-categories';
import {
  buildLandingCatalogMegaMenu,
  filterRedundantMegaMenuLinks,
} from '@/lib/mega-menu-from-store-categories';
import { serviceDetailPathFromLanding, serviceHubPath } from '@/lib/service-hub';
import type { StoreCategoryTreeNode } from '@/types/store-category';

const SERVICE_MEGA_SLUGS: ServiceLandingSlug[] = [
  'servicio-tecnico',
  'outsourcing',
  'servicios-corporativos',
];

const RENTAL_SIDEBAR_SECTIONS = [
  {
    slug: 'oficina',
    label: 'Oficina e impresión',
    description: 'Impresoras, plotters y escáneres en alquiler.',
    icon: Printer,
    viewAllHref: serviceHubPath('alquiler'),
    rentalSlugs: ['alquiler-impresoras', 'alquiler-plotters', 'alquiler-escaneres'],
  },
  {
    slug: 'tecnologia',
    label: 'Tecnología',
    description: 'Laptops, computadoras y proyectores para tu equipo.',
    icon: Laptop,
    viewAllHref: categoryLandingPath('alquiler'),
    rentalSlugs: ['alquiler-laptops', 'alquiler-computadoras', 'alquiler-proyectores'],
  },
] as const;

const TONER_ROOT_SLUGS = ['toner-suministros', 'repuestos'] as const;

function rentalColumnGroups(rentalSlugs: readonly string[]): MegaMenuColumnGroup[] {
  return rentalSlugs.flatMap((rentalSlug) => {
    const category = rentalCategories.find((entry) => entry.slug === rentalSlug);
    if (!category) return [];

    return [
      {
        slug: category.slug,
        title: category.name,
        image: category.image,
        href: categoryPath('alquiler', category.slug),
        links: [{ name: 'Explorar', href: categoryPath('alquiler', category.slug) }],
      },
    ];
  });
}

function serviceColumnGroups(slug: ServiceLandingSlug): MegaMenuColumnGroup[] {
  const landing = getServiceLandingBySlug(slug);
  if (!landing) return [];

  return landing.cards.slice(0, 4).map((card) => ({
    slug: card.id,
    title: card.title,
    image: card.image,
    href: serviceDetailPathFromLanding(landing.slug, card.id),
    links: [{ name: 'Explorar', href: serviceDetailPathFromLanding(landing.slug, card.id) }],
  }));
}

function staticCategoryFallback(slug: string): {
  name: string;
  tagline: string;
  icon: LucideIcon;
  image?: string;
} | undefined {
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) return undefined;
  return {
    name: category.name,
    tagline: category.tagline,
    icon: category.icon,
    ...(category.image ? { image: category.image } : {}),
  };
}

export function buildServicesNavMegaMenu(): NavMegaMenuModel {
  const sidebarItems = SERVICE_MEGA_SLUGS.flatMap((slug) => {
    const service = megaMenuServiceLinks.find((entry) => entry.slug === slug);
    if (!service) return [];

    return [
      {
        slug,
        label: service.label,
        description: service.description,
        icon: service.icon,
        viewAllHref: service.href,
      },
    ];
  });

  return {
    sidebarItems,
    defaultCategorySlug: sidebarItems[0]?.slug ?? 'servicio-tecnico',
    getColumnGroups: (slug) => serviceColumnGroups(slug as ServiceLandingSlug),
    categoryShowsBrandStrip: () => true,
  };
}

export function buildRentalsNavMegaMenu(): NavMegaMenuModel {
  const sidebarItems = RENTAL_SIDEBAR_SECTIONS.map((section) => ({
    slug: section.slug,
    label: section.label,
    description: section.description,
    icon: section.icon,
    viewAllHref: section.viewAllHref,
  }));

  return {
    sidebarItems,
    defaultCategorySlug: sidebarItems[0]?.slug ?? 'oficina',
    getColumnGroups: (slug) => {
      const section = RENTAL_SIDEBAR_SECTIONS.find((entry) => entry.slug === slug);
      return section ? rentalColumnGroups(section.rentalSlugs) : [];
    },
    categoryShowsBrandStrip: () => true,
  };
}

export function buildTonerRepuestosNavMegaMenu(tree: StoreCategoryTreeNode[]): NavMegaMenuModel {
  const catalogMenu = buildLandingCatalogMegaMenu(tree);
  const landingCategories = buildLandingMenuCategoriesFromTree(tree);
  const staticMenu = buildTonerRepuestosNavMegaMenuStatic();

  const sidebarItems = TONER_ROOT_SLUGS.flatMap((slug) => {
    const fromTree = landingCategories.find((category) => category.slug === slug);
    const fallback = staticCategoryFallback(slug);
    const source = fromTree ?? fallback;
    if (!source) return [];

    return [
      {
        slug,
        label: source.name,
        description: source.tagline,
        icon: source.icon,
        viewAllHref: categoryLandingPath(slug),
      },
    ];
  });

  const resolvedSidebar = sidebarItems.length > 0 ? sidebarItems : staticMenu.sidebarItems;

  return {
    sidebarItems: resolvedSidebar,
    defaultCategorySlug: resolvedSidebar[0]?.slug ?? staticMenu.defaultCategorySlug,
    getColumnGroups: (slug) => {
      const fromTree = catalogMenu.getColumnGroups(slug);
      return fromTree.length > 0 ? fromTree : staticMenu.getColumnGroups(slug);
    },
    categoryShowsBrandStrip: () => true,
  };
}

export function buildTonerRepuestosNavMegaMenuStatic(): NavMegaMenuModel {
  const sidebarItems = TONER_ROOT_SLUGS.flatMap((slug) => {
    const category = staticCategoryFallback(slug);
    if (!category) return [];

    const href = categoryLandingPath(slug);

    return [
      {
        slug,
        label: category.name,
        description: category.tagline,
        icon: category.icon,
        viewAllHref: href,
      },
    ];
  });

  const columnGroupsBySlug: Record<string, MegaMenuColumnGroup[]> = {
    'toner-suministros': [
      {
        slug: 'toner-compatibles',
        title: 'Tóner compatibles',
        image: '/categories/toner-suministros.png',
        href: categoryPath('toner-suministros', 'toner-compatibles'),
        links: [
          {
            name: 'Explorar',
            href: categoryPath('toner-suministros', 'toner-compatibles'),
          },
        ],
      },
      {
        slug: 'toner-originales',
        title: 'Tóner originales',
        image: '/categories/accesorios-impresoras.png',
        href: categoryPath('toner-suministros', 'toner-originales'),
        links: [
          {
            name: 'Explorar',
            href: categoryPath('toner-suministros', 'toner-originales'),
          },
        ],
      },
      {
        slug: 'toner-remanufacturado',
        title: 'Tóner remanufacturado',
        image: '/categories/toner-suministros.png',
        href: categoryPath('toner-suministros', 'toner-remanufacturado'),
        links: [
          {
            name: 'Explorar',
            href: categoryPath('toner-suministros', 'toner-remanufacturado'),
          },
        ],
      },
      {
        slug: 'toner-recarga',
        title: 'Recargas de tóner',
        image: '/categories/toner-suministros.png',
        href: categoryPath('toner-suministros', 'toner-recarga'),
        links: [{ name: 'Explorar', href: categoryPath('toner-suministros', 'toner-recarga') }],
      },
    ],
    repuestos: [
      {
        slug: 'repuestos',
        title: 'Repuestos',
        image: '/categories/repuestos.png',
        href: categoryLandingPath('repuestos'),
        links: filterRedundantMegaMenuLinks('Repuestos', [
          { name: 'Partes y componentes', href: categoryLandingPath('repuestos') },
          { name: 'Explorar', href: categoryLandingPath('repuestos') },
        ]),
      },
    ],
  };

  return {
    sidebarItems,
    defaultCategorySlug: sidebarItems[0]?.slug ?? 'toner-suministros',
    getColumnGroups: (slug) => columnGroupsBySlug[slug] ?? [],
    categoryShowsBrandStrip: () => true,
  };
}

export const RENTALS_NAV_MEGA_MENU_ICON = Calendar;
export const TONER_NAV_MEGA_MENU_ICON = Droplets;
