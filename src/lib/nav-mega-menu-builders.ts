import type { LucideIcon } from 'lucide-react';
import {
  AppWindow,
  Building2,
  Calendar,
  Cog,
  Droplets,
  GraduationCap,
  Headphones,
  HelpCircle,
  KeyRound,
  MessageSquareQuote,
  Users,
  Wrench,
} from 'lucide-react';

import { categories } from '@/data/categories';
import { megaMenuServiceLinks } from '@/data/mega-menu';
import { alquilerLanding } from '@/data/service-landings/alquiler';
import { soporteTecnicoLanding } from '@/data/service-landings/soporte-tecnico';
import {
  SOFTWARE_CATALOG_CATEGORIES,
  SOFTWARE_CATALOG_ITEMS,
  softwareDetailPath,
} from '@/data/software-catalog';
import { getServiceLandingBySlug } from '@/data/service-landings';
import type { ServiceLandingSlug } from '@/data/service-landings';
import type { SoftwareCatalogCategoryId } from '@/types/software-catalog';
import { categoryLandingPath, categoryPath } from '@/lib/category-path';
import { buildLandingMenuCategoriesFromTree } from '@/lib/landing-menu-categories';
import type {
  MegaMenuColumnGroup,
  MegaMenuFeaturedContent,
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

const COMPANIES_SIDEBAR_SECTIONS = [
  {
    slug: 'nosotros',
    label: 'Nosotros',
    description: 'Conoce a HaiStore y nuestro equipo.',
    icon: Building2,
    viewAllHref: '/contacto',
  },
  {
    slug: 'clientes',
    label: 'Clientes',
    description: 'Empresas que confían en nuestras soluciones.',
    icon: Users,
    viewAllHref: '/#clientes',
  },
  {
    slug: 'testimonios',
    label: 'Testimonios',
    description: 'Experiencias reales de nuestros clientes.',
    icon: MessageSquareQuote,
    viewAllHref: '/#testimonios',
  },
  {
    slug: 'faq',
    label: 'Preguntas frecuentes',
    description: 'Respuestas rápidas sobre productos y servicios.',
    icon: HelpCircle,
    viewAllHref: '/preguntas-frecuentes',
  },
] as const;

const SERVICIOS_SIDEBAR_SECTIONS = [
  {
    slug: 'alquiler',
    label: 'Alquiler',
    description: 'Impresoras, laptops y tecnología en alquiler flexible.',
    icon: KeyRound,
    viewAllHref: serviceHubPath('alquiler'),
  },
  {
    slug: 'servicio-tecnico',
    label: 'Soporte técnico',
    description: 'Atención especializada y respuesta rápida.',
    icon: Headphones,
    viewAllHref: serviceHubPath('servicio-tecnico'),
  },
  {
    slug: 'mantenimiento',
    label: 'Mantenimiento',
    description: 'Planes preventivos, correctivos y contratos.',
    icon: Wrench,
    viewAllHref: serviceDetailPathFromLanding('servicio-tecnico', 'preventivo'),
  },
  {
    slug: 'instalacion',
    label: 'Instalación',
    description: 'Puesta en marcha, configuración y capacitación.',
    icon: GraduationCap,
    viewAllHref: serviceDetailPathFromLanding('servicio-tecnico', 'instalacion-config-capacitacion'),
  },
] as const;

const MANTENIMIENTO_CARD_IDS = ['preventivo', 'correctivo', 'general', 'planes'] as const;
const INSTALACION_CARD_IDS = [
  'instalacion-config-capacitacion',
  'soporte-remoto',
  'actualizacion-firmware',
  'garantia',
] as const;

const TONER_ROOT_SLUG = 'toner-suministros' as const;
const REPUESTOS_ROOT_SLUG = 'repuestos' as const;
const TONER_ROOT_SLUGS = [TONER_ROOT_SLUG, REPUESTOS_ROOT_SLUG] as const;

const SOFTWARE_CATEGORY_DESCRIPTIONS: Record<SoftwareCatalogCategoryId, string> = {
  'gestion-documental': 'Archivo digital, flujos y búsqueda documental.',
  'automatizacion-procesos': 'Automatiza tareas repetitivas sin código.',
  'impresion-y-captura': 'Impresión segura y digitalización desde el equipo.',
  'integracion-ricoh': 'Administra y conecta tu flota Ricoh.',
  antivirus: 'Protección endpoint y licencias originales.',
  'inteligencia-artificial': 'IA aplicada a productividad empresarial.',
  'software-empresarial': 'CRM, facturación y herramientas de negocio.',
};

const SOFTWARE_CATEGORY_IMAGES: Record<SoftwareCatalogCategoryId, string> = {
  'gestion-documental': '/categories/soluciones-negocio.png',
  'automatizacion-procesos': '/services/servicios-corporativos/web.png',
  'impresion-y-captura': '/categories/escaneres.png',
  'integracion-ricoh': '/categories/computadoras-laptop.png',
  antivirus: '/products/eset-nod32-licencia-12-meses.webp',
  'inteligencia-artificial': '/services/servicios-corporativos/saas.png',
  'software-empresarial': '/logos/haisales-logo.png',
};

function softwareSectionHref(categoryId: SoftwareCatalogCategoryId): string {
  return `/software?seccion=${categoryId}`;
}

const SERVICIOS_FEATURED: Record<
  (typeof SERVICIOS_SIDEBAR_SECTIONS)[number]['slug'],
  MegaMenuFeaturedContent
> = {
  alquiler: {
    image: '/categories/alquiler-512.webp',
    title: 'Alquiler sin inversión inicial',
    description:
      'Impresoras, laptops y tecnología bajo demanda con planes flexibles adaptados a tu operación.',
    href: serviceHubPath('alquiler'),
  },
  'servicio-tecnico': {
    image: '/Soporte Tecnico v2.png',
    title: 'Soporte técnico especializado',
    description:
      'Atención rápida, técnicos certificados y cobertura nacional para mantener tu flota operativa.',
    href: serviceHubPath('servicio-tecnico'),
  },
  mantenimiento: {
    image: '/services/servicio-tecnico/preventivo.png',
    title: 'Mantenimiento preventivo y correctivo',
    description:
      'Planes a medida para evitar paradas, prolongar la vida útil y optimizar el rendimiento.',
    href: serviceDetailPathFromLanding('servicio-tecnico', 'preventivo'),
  },
  instalacion: {
    image: '/services/servicio-tecnico/planes.png',
    title: 'Instalación y capacitación',
    description:
      'Puesta en marcha, configuración de red y capacitación para que tu equipo aproveche al máximo.',
    href: serviceDetailPathFromLanding('servicio-tecnico', 'instalacion-config-capacitacion'),
  },
};

const COMPANIES_FEATURED: Record<
  (typeof COMPANIES_SIDEBAR_SECTIONS)[number]['slug'],
  MegaMenuFeaturedContent
> = {
  nosotros: {
    image: '/logos/haistore-logo.png',
    title: 'Somos HaiStore',
    description:
      'Partner Ricoh en Perú con más de una década asesorando empresas en impresión y tecnología.',
    href: '/contacto',
  },
  clientes: {
    image: '/Banner2hero.png',
    title: 'Empresas que confían en nosotros',
    description:
      'Sector público, educación, salud y corporativo: soluciones probadas a escala nacional.',
    href: '/#clientes',
  },
  testimonios: {
    image: '/services/servicios-corporativos/saas.png',
    title: 'Experiencias reales',
    description:
      'Conoce cómo nuestros clientes mejoraron productividad y redujeron costos con HaiStore.',
    href: '/#testimonios',
  },
  faq: {
    image: '/Soporte Tecnico v2.png',
    title: '¿Tienes dudas?',
    description:
      'Respuestas rápidas sobre productos, garantías, envíos y soporte técnico en un solo lugar.',
    href: '/preguntas-frecuentes',
  },
};

const SOFTWARE_FEATURED: Record<SoftwareCatalogCategoryId, MegaMenuFeaturedContent> = {
  'gestion-documental': {
    image: SOFTWARE_CATEGORY_IMAGES['gestion-documental'],
    title: 'Gestión documental digital',
    description:
      'Archivo electrónico, flujos de aprobación y búsqueda inteligente para oficinas sin papel.',
    href: softwareSectionHref('gestion-documental'),
  },
  'automatizacion-procesos': {
    image: SOFTWARE_CATEGORY_IMAGES['automatizacion-procesos'],
    title: 'Automatización sin código',
    description:
      'Conecta sistemas y elimina tareas repetitivas con flujos visuales fáciles de implementar.',
    href: softwareSectionHref('automatizacion-procesos'),
  },
  'impresion-y-captura': {
    image: SOFTWARE_CATEGORY_IMAGES['impresion-y-captura'],
    title: 'Impresión y captura segura',
    description:
      'Imprime desde cualquier dispositivo y digitaliza documentos con control de acceso empresarial.',
    href: softwareSectionHref('impresion-y-captura'),
  },
  'integracion-ricoh': {
    image: SOFTWARE_CATEGORY_IMAGES['integracion-ricoh'],
    title: 'Integración Ricoh',
    description:
      'Administra tu flota de multifuncionales, monitorea consumibles y optimiza costos de impresión.',
    href: softwareSectionHref('integracion-ricoh'),
  },
  antivirus: {
    image: SOFTWARE_CATEGORY_IMAGES.antivirus,
    title: 'Protección endpoint',
    description:
      'Licencias originales ESET y soluciones de ciberseguridad para proteger tu infraestructura.',
    href: softwareSectionHref('antivirus'),
  },
  'inteligencia-artificial': {
    image: SOFTWARE_CATEGORY_IMAGES['inteligencia-artificial'],
    title: 'IA para productividad',
    description:
      'Herramientas de inteligencia artificial aplicadas a documentos, atención y procesos de negocio.',
    href: softwareSectionHref('inteligencia-artificial'),
  },
  'software-empresarial': {
    image: SOFTWARE_CATEGORY_IMAGES['software-empresarial'],
    title: 'Software empresarial',
    description:
      'CRM, facturación electrónica y herramientas de gestión para hacer crecer tu negocio.',
    href: softwareSectionHref('software-empresarial'),
  },
};

const TONER_FEATURED: Record<string, MegaMenuFeaturedContent> = {
  'toner-suministros': {
    image: '/categories/toner-suministros-512.webp',
    title: 'Tóner y consumibles',
    description:
      'Originales Ricoh, compatibles certificados y opciones remanufacturadas para cada presupuesto.',
    href: categoryLandingPath('toner-suministros'),
  },
  repuestos: {
    image: '/categories/repuestos-512.webp',
    title: 'Repuestos originales',
    description:
      'Rodillos, fusores, kits de mantenimiento y componentes para extender la vida de tus equipos.',
    href: categoryLandingPath('repuestos'),
  },
};

function featuredFromSidebar(
  slug: string,
  map: Record<string, MegaMenuFeaturedContent>,
  fallback: MegaMenuFeaturedContent,
): MegaMenuFeaturedContent {
  return map[slug] ?? fallback;
}

function softwareColumnGroups(categoryId: SoftwareCatalogCategoryId): MegaMenuColumnGroup[] {
  const products = SOFTWARE_CATALOG_ITEMS.filter((item) => item.categoryId === categoryId);

  if (products.length > 0) {
    return products.slice(0, 4).map((item) => ({
      slug: item.slug,
      title: item.title,
      image: item.images[0] ?? SOFTWARE_CATEGORY_IMAGES[categoryId],
      href: softwareDetailPath(item.slug),
      links: [{ name: 'Ver solución', href: softwareDetailPath(item.slug) }],
    }));
  }

  const category = SOFTWARE_CATALOG_CATEGORIES.find((entry) => entry.id === categoryId);
  if (!category) return [];

  const href = softwareSectionHref(categoryId);
  return [
    {
      slug: categoryId,
      title: category.label,
      image: SOFTWARE_CATEGORY_IMAGES[categoryId],
      href,
      links: [{ name: 'Explorar', href }],
    },
  ];
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

function landingCardsToColumnGroups(
  landingSlug: string,
  cardIds: readonly string[],
): MegaMenuColumnGroup[] {
  const landing = getServiceLandingBySlug(landingSlug);
  if (!landing) return [];

  return cardIds.flatMap((cardId) => {
    const card = landing.cards.find((entry) => entry.id === cardId);
    if (!card) return [];

    const href = serviceDetailPathFromLanding(landing.slug, card.id);
    return [
      {
        slug: card.id,
        title: card.title,
        image: card.image,
        href,
        links: [{ name: 'Explorar', href }],
      },
    ];
  });
}

function companiesColumnGroups(slug: (typeof COMPANIES_SIDEBAR_SECTIONS)[number]['slug']): MegaMenuColumnGroup[] {
  const section = COMPANIES_SIDEBAR_SECTIONS.find((entry) => entry.slug === slug);
  if (!section) return [];

  const featuredBySlug: Record<(typeof COMPANIES_SIDEBAR_SECTIONS)[number]['slug'], MegaMenuColumnGroup[]> = {
    nosotros: [
      {
        slug: 'contacto',
        title: 'Contáctanos',
        image: '/logos/haistore-logo.png',
        href: '/contacto',
        links: [
          { name: 'Sobre HaiStore', href: '/contacto' },
          { name: 'Solicitar cotización', href: '/contacto' },
        ],
      },
      {
        slug: 'servicios',
        title: 'Nuestros servicios',
        image: '/categories/servicio-tecnico.png',
        href: serviceHubPath('servicio-tecnico'),
        links: [{ name: 'Ver servicios', href: serviceHubPath('servicio-tecnico') }],
      },
    ],
    clientes: [
      {
        slug: 'clientes',
        title: 'Empresas que confían en nosotros',
        image: '/Banner2hero.png',
        href: '/#clientes',
        links: [{ name: 'Ver clientes', href: '/#clientes' }],
      },
      {
        slug: 'productos',
        title: 'Catálogo de productos',
        image: '/categories/multifuncionales.png',
        href: categoryLandingPath('multifuncionales'),
        links: [{ name: 'Explorar productos', href: categoryLandingPath('multifuncionales') }],
      },
    ],
    testimonios: [
      {
        slug: 'testimonios',
        title: 'Lo que dicen nuestros clientes',
        image: '/services/servicios-corporativos/saas.png',
        href: '/#testimonios',
        links: [{ name: 'Leer testimonios', href: '/#testimonios' }],
      },
      {
        slug: 'contacto',
        title: 'Trabaja con nosotros',
        image: '/logos/haisales-logo.png',
        href: '/contacto',
        links: [{ name: 'Contactar', href: '/contacto' }],
      },
    ],
    faq: [
      {
        slug: 'faq',
        title: 'Preguntas frecuentes',
        image: '/Soporte Tecnico v2.png',
        href: '/preguntas-frecuentes',
        links: [{ name: 'Ver preguntas', href: '/preguntas-frecuentes' }],
      },
      {
        slug: 'soporte',
        title: 'Soporte técnico',
        image: '/services/servicio-tecnico/preventivo.png',
        href: serviceHubPath('servicio-tecnico'),
        links: [{ name: 'Solicitar soporte', href: serviceHubPath('servicio-tecnico') }],
      },
    ],
  };

  return featuredBySlug[slug] ?? [
    {
      slug: section.slug,
      title: section.label,
      image: '/logos/haistore-logo.png',
      href: section.viewAllHref,
      links: [{ name: 'Explorar', href: section.viewAllHref }],
    },
  ];
}

function serviciosColumnGroups(slug: (typeof SERVICIOS_SIDEBAR_SECTIONS)[number]['slug']): MegaMenuColumnGroup[] {
  if (slug === 'alquiler') {
    return alquilerLanding.cards.map((card) => ({
      slug: card.id,
      title: card.title.replace(/^Alquiler de /, ''),
      image: card.image,
      href: serviceDetailPathFromLanding('alquiler', card.id),
      links: [],
    }));
  }

  if (slug === 'servicio-tecnico') {
    return soporteTecnicoLanding.cards
      .filter((card) => ['soporte-remoto', 'general', 'garantia', 'suministro'].includes(card.id))
      .slice(0, 4)
      .map((card) => ({
        slug: card.id,
        title: card.title,
        image: card.image,
        href: serviceDetailPathFromLanding('servicio-tecnico', card.id),
        links: [{ name: 'Explorar', href: serviceDetailPathFromLanding('servicio-tecnico', card.id) }],
      }));
  }

  if (slug === 'mantenimiento') {
    return landingCardsToColumnGroups('servicio-tecnico', MANTENIMIENTO_CARD_IDS);
  }

  if (slug === 'instalacion') {
    return landingCardsToColumnGroups('servicio-tecnico', INSTALACION_CARD_IDS);
  }

  return [];
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
  const sidebarItems = SERVICIOS_SIDEBAR_SECTIONS.map((section) => ({
    slug: section.slug,
    label: section.label,
    description: section.description,
    icon: section.icon,
    viewAllHref: section.viewAllHref,
  }));

  return {
    sidebarItems,
    defaultCategorySlug: sidebarItems[0]?.slug ?? 'alquiler',
    getColumnGroups: (slug) => serviciosColumnGroups(slug as (typeof SERVICIOS_SIDEBAR_SECTIONS)[number]['slug']),
    getFeaturedContent: (slug) =>
      SERVICIOS_FEATURED[slug as (typeof SERVICIOS_SIDEBAR_SECTIONS)[number]['slug']] ??
      SERVICIOS_FEATURED.alquiler,
  };
}

/** @deprecated Usar buildServicesNavMegaMenu */
export function buildLegacyServicesNavMegaMenu(): NavMegaMenuModel {
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
    getFeaturedContent: (slug) => {
      const landing = getServiceLandingBySlug(slug);
      const firstCard = landing?.cards[0];
      return {
        image: firstCard?.image ?? '/Soporte Tecnico v2.png',
        title: landing?.title ?? 'Servicios HaiStore',
        description: landing?.subtitle ?? 'Soluciones profesionales para tu empresa.',
        href: landing ? serviceHubPath(landing.slug as ServiceLandingSlug) : '/servicios',
      };
    },
  };
}

export function buildCompaniesNavMegaMenu(): NavMegaMenuModel {
  const sidebarItems = COMPANIES_SIDEBAR_SECTIONS.map((section) => ({
    slug: section.slug,
    label: section.label,
    description: section.description,
    icon: section.icon,
    viewAllHref: section.viewAllHref,
  }));

  return {
    sidebarItems,
    defaultCategorySlug: sidebarItems[0]?.slug ?? 'nosotros',
    getColumnGroups: (slug) =>
      companiesColumnGroups(slug as (typeof COMPANIES_SIDEBAR_SECTIONS)[number]['slug']),
    getFeaturedContent: (slug) =>
      COMPANIES_FEATURED[slug as (typeof COMPANIES_SIDEBAR_SECTIONS)[number]['slug']] ??
      COMPANIES_FEATURED.nosotros,
  };
}

export function buildSoftwareNavMegaMenu(): NavMegaMenuModel {
  const sidebarItems = SOFTWARE_CATALOG_CATEGORIES.map((category) => ({
    slug: category.id,
    label: category.label,
    description: SOFTWARE_CATEGORY_DESCRIPTIONS[category.id],
    icon: category.icon,
    viewAllHref: softwareSectionHref(category.id),
  }));

  return {
    sidebarItems,
    defaultCategorySlug: sidebarItems[0]?.slug ?? 'gestion-documental',
    getColumnGroups: (slug) => softwareColumnGroups(slug as SoftwareCatalogCategoryId),
    getFeaturedContent: (slug) =>
      SOFTWARE_FEATURED[slug as SoftwareCatalogCategoryId] ?? SOFTWARE_FEATURED['gestion-documental'],
  };
}

export function buildRentalsNavMegaMenu(): NavMegaMenuModel {
  const sidebarItems = [
    {
      slug: 'alquiler',
      label: 'Alquiler',
      description: 'Impresoras, laptops y tecnología en alquiler flexible.',
      icon: KeyRound,
      viewAllHref: serviceHubPath('alquiler'),
    },
  ];

  const rentalColumns = alquilerLanding.cards.map((card) => ({
    slug: card.id,
    title: card.title.replace(/^Alquiler de /, ''),
    image: card.image,
    href: serviceDetailPathFromLanding('alquiler', card.id),
    links: [],
  }));

  return {
    sidebarItems,
    defaultCategorySlug: 'alquiler',
    getColumnGroups: () => rentalColumns,
    getFeaturedContent: () => ({
      image: '/categories/alquiler-512.webp',
      title: 'Alquiler sin inversión inicial',
      description:
        'Impresoras, laptops y tecnología bajo demanda con planes flexibles adaptados a tu operación.',
      href: serviceHubPath('alquiler'),
    }),
  };
}

function buildSingleRootCategoryNavMegaMenu(
  tree: StoreCategoryTreeNode[],
  rootSlug: typeof TONER_ROOT_SLUG | typeof REPUESTOS_ROOT_SLUG,
  options: {
    label: string;
    description: string;
    icon: LucideIcon;
    featured: MegaMenuFeaturedContent;
  },
): NavMegaMenuModel {
  const catalogMenu = buildLandingCatalogMegaMenu(tree);
  const staticMenu = buildTonerRepuestosNavMegaMenuStatic();
  const fallback = staticCategoryFallback(rootSlug);

  const sidebarItems = [
    {
      slug: rootSlug,
      label: options.label,
      description: options.description,
      icon: options.icon,
      viewAllHref: categoryLandingPath(rootSlug),
    },
  ];

  return {
    sidebarItems,
    defaultCategorySlug: rootSlug,
    getColumnGroups: (slug) => {
      const fromTree = catalogMenu.getColumnGroups(slug);
      return fromTree.length > 0 ? fromTree : staticMenu.getColumnGroups(slug);
    },
    getFeaturedContent: () =>
      options.featured ??
      (fallback
        ? {
            image: fallback.image ?? '/categories/toner-suministros-512.webp',
            title: fallback.name,
            description: fallback.tagline,
            href: categoryLandingPath(rootSlug),
          }
        : {
            image: '/categories/toner-suministros-512.webp',
            title: options.label,
            description: options.description,
            href: categoryLandingPath(rootSlug),
          }),
  };
}

export function buildConsumiblesNavMegaMenu(tree: StoreCategoryTreeNode[]): NavMegaMenuModel {
  return buildSingleRootCategoryNavMegaMenu(tree, TONER_ROOT_SLUG, {
    label: 'Consumibles',
    description: 'Tóner original, compatible y remanufacturado para tu flota.',
    icon: Droplets,
    featured: TONER_FEATURED[TONER_ROOT_SLUG],
  });
}

export function buildConsumiblesNavMegaMenuStatic(): NavMegaMenuModel {
  return buildSingleRootCategoryNavMegaMenu([], TONER_ROOT_SLUG, {
    label: 'Consumibles',
    description: 'Tóner original, compatible y remanufacturado para tu flota.',
    icon: Droplets,
    featured: TONER_FEATURED[TONER_ROOT_SLUG],
  });
}

export function buildRepuestosNavMegaMenu(tree: StoreCategoryTreeNode[]): NavMegaMenuModel {
  return buildSingleRootCategoryNavMegaMenu(tree, REPUESTOS_ROOT_SLUG, {
    label: 'Repuestos',
    description: 'Partes y componentes originales para impresoras.',
    icon: Cog,
    featured: TONER_FEATURED[REPUESTOS_ROOT_SLUG],
  });
}

export function buildRepuestosNavMegaMenuStatic(): NavMegaMenuModel {
  return buildSingleRootCategoryNavMegaMenu([], REPUESTOS_ROOT_SLUG, {
    label: 'Repuestos',
    description: 'Partes y componentes originales para impresoras.',
    icon: Cog,
    featured: TONER_FEATURED[REPUESTOS_ROOT_SLUG],
  });
}

export function buildTonerRepuestosNavMegaMenu(tree: StoreCategoryTreeNode[]): NavMegaMenuModel {
  const catalogMenu = buildLandingCatalogMegaMenu(tree);
  const landingCategories = buildLandingMenuCategoriesFromTree(tree);
  const staticMenu = buildTonerRepuestosNavMegaMenuStatic();

  const sidebarLabels: Record<(typeof TONER_ROOT_SLUGS)[number], string> = {
    'toner-suministros': 'Toner',
    repuestos: 'Repuestos',
  };

  const sidebarItems = TONER_ROOT_SLUGS.flatMap((slug) => {
    const fromTree = landingCategories.find((category) => category.slug === slug);
    const fallback = staticCategoryFallback(slug);
    const source = fromTree ?? fallback;
    if (!source) return [];

    return [
      {
        slug,
        label: sidebarLabels[slug],
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
    getFeaturedContent: (slug) => {
      const fromTree = catalogMenu.getFeaturedContent(slug);
      if (fromTree) return fromTree;
      return (
        TONER_FEATURED[slug] ?? {
          image: '/categories/toner-suministros-512.webp',
          title: 'Explorar catálogo',
          description: 'Tóner, repuestos y suministros para tu flota de impresión.',
          href: categoryLandingPath(slug),
        }
      );
    },
  };
}

export function buildTonerRepuestosNavMegaMenuStatic(): NavMegaMenuModel {
  const sidebarLabels: Record<(typeof TONER_ROOT_SLUGS)[number], string> = {
    'toner-suministros': 'Toner',
    repuestos: 'Repuestos',
  };

  const sidebarItems = TONER_ROOT_SLUGS.flatMap((slug) => {
    const category = staticCategoryFallback(slug);
    if (!category) return [];

    const href = categoryLandingPath(slug);

    return [
      {
        slug,
        label: sidebarLabels[slug],
        description: category.tagline,
        icon: category.icon,
        viewAllHref: href,
      },
    ];
  });

  const columnGroupsBySlug: Record<string, MegaMenuColumnGroup[]> = {
    'toner-suministros': [
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
    getFeaturedContent: (slug) =>
      featuredFromSidebar(slug, TONER_FEATURED, {
        image: '/categories/toner-suministros-512.webp',
        title: 'Explorar catálogo',
        description: 'Tóner, repuestos y suministros para tu flota de impresión.',
        href: categoryLandingPath(slug),
      }),
  };
}

export const RENTALS_NAV_MEGA_MENU_ICON = Calendar;
export const CONSUMABLES_NAV_MEGA_MENU_ICON = Droplets;
export const REPUESTOS_NAV_MEGA_MENU_ICON = Cog;
export const SOFTWARE_NAV_MEGA_MENU_ICON = AppWindow;
export const TONER_NAV_MEGA_MENU_ICON = Droplets;
export const COMPANIES_NAV_MEGA_MENU_ICON = Building2;
