import { alquilerLanding } from '@/data/service-landings/alquiler';
import { outsourcingLanding } from '@/data/service-landings/outsourcing';
import { soporteTecnicoLanding } from '@/data/service-landings/soporte-tecnico';
import { categoryLandingPath } from '@/lib/category-path';
import type { MegaMenuColumnGroup, NavMegaMenuModel } from '@/lib/mega-menu-from-store-categories';
import { megaMenuImageForSlug } from '@/data/mega-menu';
import { serviceDetailPathFromLanding, serviceHubPath } from '@/lib/service-hub';
import { storeShowcasePath } from '@/lib/store-showcase-path';

export type HaitechMegaMenuRowItem = {
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
};

export type HaitechMegaMenuSection = {
  id: string;
  title: string;
  items: readonly HaitechMegaMenuRowItem[];
  showAdvisorCta?: boolean;
};

export type HaitechMockupMegaMenuData = {
  sections: readonly HaitechMegaMenuSection[];
  featured: {
    headline: string;
    headlineAccent: string;
    image: string;
    imageAlt: string;
    bullets: readonly string[];
    ctaLabel: string;
    ctaHref: string;
  };
};

export type HaitechMockupMenuKind =
  | 'toner'
  | 'consumibles'
  | 'repuestos'
  | 'servicio-tecnico'
  | 'alquiler'
  | 'servicios';

function imageForSlug(slug: string, fallback?: string): string {
  return megaMenuImageForSlug(slug) ?? fallback ?? '/categories/multifuncionales.png';
}

/** Estructura fija del mega menú «Equipos» según mockup HAITECH. */
export const EQUIPOS_MEGA_MENU_MOCKUP: HaitechMockupMegaMenuData = {
  sections: [
    {
      id: 'impresion',
      title: 'SOLUCIONES DE IMPRESIÓN',
      items: [
        {
          slug: 'multifuncionales',
          title: 'Multifuncionales',
          subtitle: 'A3 · A4 · Color · B/N | Oficina y producción',
          href: storeShowcasePath({ categoryId: 'multifuncionales' }),
          image: imageForSlug('multifuncionales'),
        },
        {
          slug: 'impresoras',
          title: 'Impresoras',
          subtitle: 'Láser · Color · B/N | Oficina y producción',
          href: storeShowcasePath({ categoryId: 'impresoras' }),
          image: imageForSlug('impresoras'),
        },
        {
          slug: 'formato-ancho',
          title: 'Formato Ancho',
          subtitle: 'Plotters · CAD · Ingeniería | Arquitectura · Diseño',
          href: storeShowcasePath({ categoryId: 'formato-ancho' }),
          image: imageForSlug('formato-ancho'),
        },
        {
          slug: 'produccion',
          title: 'Producción',
          subtitle: 'Alto volumen · Impresión profesional | Soluciones corporativas',
          href: storeShowcasePath({ categoryId: 'multifuncionales' }),
          image: '/products/de-producci-n-laser-color-ricoh-pro-c5300s-512.webp',
        },
      ],
    },
    {
      id: 'tecnologia',
      title: 'TECNOLOGÍA Y OFICINA',
      items: [
        {
          slug: 'computadoras-laptop',
          title: 'Computadoras y Laptop',
          subtitle: 'Rendimiento y productividad para tu negocio',
          href: storeShowcasePath({ categoryId: 'laptops' }),
          image: imageForSlug('computadoras-laptop'),
        },
        {
          slug: 'monitores',
          title: 'Monitores',
          subtitle: 'Calidad de imagen y mayor productividad',
          href: storeShowcasePath({ categoryId: 'monitores' }),
          image: imageForSlug('monitores'),
        },
        {
          slug: 'escaneres',
          title: 'Escáneres',
          subtitle: 'Digitalización profesional de documentos',
          href: storeShowcasePath({ categoryId: 'escaneres' }),
          image: imageForSlug('escaneres'),
        },
        {
          slug: 'accesorios',
          title: 'Accesorios',
          subtitle: 'Teclados · Mouse · Cables | Soportes y más',
          href: storeShowcasePath({ categoryId: 'accesorios' }),
          image: imageForSlug('accesorios'),
        },
        {
          slug: 'equipos-de-oficina',
          title: 'Equipos de Oficina',
          subtitle: 'Soluciones para un entorno de trabajo eficiente',
          href: categoryLandingPath('equipos-de-oficina'),
          image: imageForSlug('equipos-de-oficina'),
        },
      ],
    },
    {
      id: 'colaboracion',
      title: 'COLABORACIÓN Y COMUNICACIÓN',
      showAdvisorCta: true,
      items: [
        {
          slug: 'soluciones-colaboracion',
          title: 'Pizarras Interactivas',
          subtitle: 'Educación · Empresas | Trabajo colaborativo',
          href: categoryLandingPath('soluciones-colaboracion'),
          image: imageForSlug('soluciones-colaboracion'),
        },
        {
          slug: 'equipamiento-videoconferencias',
          title: 'Equipamiento para Videoconferencias',
          subtitle: 'Comunicación sin límites',
          href: categoryLandingPath('equipamiento-videoconferencias'),
          image: imageForSlug('equipamiento-videoconferencias'),
        },
        {
          slug: 'camaras',
          title: 'Cámaras',
          subtitle: 'Videoconferencia · Seguridad | Soluciones empresariales',
          href: categoryLandingPath('camaras'),
          image: imageForSlug('camaras'),
        },
      ],
    },
  ],
  featured: {
    headline: 'Equipos que impulsan',
    headlineAccent: 'tu negocio',
    image: '/categories/multifuncionales-512.webp',
    imageAlt: 'Multifuncional Ricoh para empresas',
    bullets: ['Mayor productividad', 'Tecnología confiable', 'Respaldo y garantía'],
    ctaLabel: 'Ver todos los equipos',
    ctaHref: '/tienda',
  },
};

function columnGroupToRowItem(
  group: MegaMenuColumnGroup,
  subtitle?: string,
): HaitechMegaMenuRowItem {
  const resolvedSubtitle =
    subtitle ??
    group.links.find((link) => !/^ver\b|^explorar\b/i.test(link.name.trim()))?.name ??
    'Explorar catálogo';

  return {
    slug: group.slug,
    title: group.title,
    subtitle: resolvedSubtitle,
    href: group.href,
    image: group.image,
  };
}

const TONER_ROW_SUBTITLES: Record<string, string> = {
  'toner-originales': 'Cartuchos originales Ricoh | Máxima calidad de impresión',
  'toner-compatibles': 'Alternativas certificadas | Mejor costo por página',
  'toner-remanufacturado': 'Opción ecológica | Rendimiento confiable',
  'toner-recarga': 'Recargas profesionales | Ahorro sostenible',
};

const REPUESTOS_ROW_SUBTITLES: Record<string, string> = {
  partes: 'Componentes originales | Compatibilidad verificada por modelo',
  unidades: 'Unidades de imagen Ricoh | Calidad de impresión constante',
  fusores: 'Fusores y rodillos | Vida útil extendida del equipo',
  kits: 'Kits preventivos | Menos paradas inesperadas',
  tambores: 'Tambores y cilindros | Rendimiento profesional',
  'repuestos-generales': 'Catálogo completo | Stock y asesoría técnica',
};

const TONER_FALLBACK_ITEMS: readonly HaitechMegaMenuRowItem[] = [
  {
    slug: 'toner-originales',
    title: 'Tóner originales',
    subtitle: TONER_ROW_SUBTITLES['toner-originales'],
    href: storeShowcasePath({
      categoryId: 'toner-repuestos',
      filter: 'originales',
      consumableKind: 'toner',
    }),
    image: imageForSlug('toner-suministros'),
  },
  {
    slug: 'toner-compatibles',
    title: 'Tóner compatibles',
    subtitle: TONER_ROW_SUBTITLES['toner-compatibles'],
    href: storeShowcasePath({
      categoryId: 'toner-repuestos',
      filter: 'compatibles',
      consumableKind: 'toner',
    }),
    image: imageForSlug('toner-suministros'),
  },
  {
    slug: 'toner-remanufacturado',
    title: 'Tóner remanufacturado',
    subtitle: TONER_ROW_SUBTITLES['toner-remanufacturado'],
    href: storeShowcasePath({
      categoryId: 'toner-repuestos',
      filter: 'remanufacturados',
      consumableKind: 'toner',
    }),
    image: imageForSlug('toner-suministros'),
  },
  {
    slug: 'toner-todos',
    title: 'Ver todo el tóner',
    subtitle: TONER_ROW_SUBTITLES['toner-recarga'] ?? 'Catálogo completo de tóner',
    href: storeShowcasePath({ categoryId: 'toner-repuestos', consumableKind: 'toner' }),
    image: imageForSlug('toner-suministros'),
  },
];

const TONER_CONSUMIBLES_ITEMS: readonly HaitechMegaMenuRowItem[] = [
  {
    slug: 'repuestos',
    title: 'Repuestos',
    subtitle: 'Partes · Fusores · Unidades | Componentes originales',
    href: storeShowcasePath({ categoryId: 'toner-repuestos', consumableKind: 'repuestos' }),
    image: imageForSlug('repuestos'),
  },
  {
    slug: 'kits-mantenimiento',
    title: 'Kits de mantenimiento',
    subtitle: 'Preventivo · Correctivo | Piezas agrupadas por modelo',
    href: storeShowcasePath({ categoryId: 'toner-repuestos', consumableKind: 'repuestos' }),
    image: imageForSlug('repuestos'),
  },
  {
    slug: 'cartuchos-tinta',
    title: 'Cartuchos y tinta',
    subtitle: 'Color · B/N | Suministro para impresión diaria',
    href: storeShowcasePath({ categoryId: 'toner-repuestos', consumableKind: 'toner' }),
    image: imageForSlug('toner-suministros'),
  },
  {
    slug: 'toner-catalogo',
    title: 'Ver catálogo completo',
    subtitle: 'Tóner · Consumibles · Repuestos | Todo en un solo lugar',
    href: storeShowcasePath({ categoryId: 'toner-repuestos' }),
    image: imageForSlug('toner-suministros'),
  },
];

const TONER_CORPORATIVO_ITEMS: readonly HaitechMegaMenuRowItem[] = [
  {
    slug: 'planes-suministro',
    title: 'Planes de suministro',
    subtitle: 'Abastecimiento programado | Control de costos por flota',
    href: serviceDetailPathFromLanding('servicio-tecnico', 'suministro'),
    image: '/services/servicio-tecnico/suministro.png',
  },
  {
    slug: 'consumibles-ricoh',
    title: 'Consumibles Ricoh',
    subtitle: 'Originales certificados | Compatibilidad garantizada',
    href: storeShowcasePath({
      categoryId: 'toner-repuestos',
      filter: 'originales',
      consumableKind: 'toner',
    }),
    image: imageForSlug('toner-suministros'),
  },
  {
    slug: 'toner-catalogo',
    title: 'Ver catálogo completo',
    subtitle: 'Tóner · Consumibles · Recargas | Todo en un solo lugar',
    href: storeShowcasePath({ categoryId: 'toner-repuestos' }),
    image: '/categories/toner-suministros-512.webp',
  },
];

const REPUESTOS_FALLBACK_SECTIONS: readonly HaitechMegaMenuSection[] = [
  {
    id: 'componentes',
    title: 'COMPONENTES PRINCIPALES',
    items: [
      {
        slug: 'partes',
        title: 'Partes y componentes',
        subtitle: REPUESTOS_ROW_SUBTITLES.partes,
        href: categoryLandingPath('repuestos'),
        image: imageForSlug('repuestos'),
      },
      {
        slug: 'unidades',
        title: 'Unidades de imagen',
        subtitle: REPUESTOS_ROW_SUBTITLES.unidades,
        href: categoryLandingPath('repuestos'),
        image: imageForSlug('repuestos'),
      },
      {
        slug: 'fusores',
        title: 'Fusores y rodillos',
        subtitle: REPUESTOS_ROW_SUBTITLES.fusores,
        href: categoryLandingPath('repuestos'),
        image: imageForSlug('repuestos'),
      },
      {
        slug: 'tambores',
        title: 'Tambores y cilindros',
        subtitle: REPUESTOS_ROW_SUBTITLES.tambores,
        href: categoryLandingPath('repuestos'),
        image: imageForSlug('repuestos'),
      },
    ],
  },
  {
    id: 'mantenimiento',
    title: 'MANTENIMIENTO Y KITS',
    items: [
      {
        slug: 'kits',
        title: 'Kits de mantenimiento',
        subtitle: REPUESTOS_ROW_SUBTITLES.kits,
        href: categoryLandingPath('repuestos'),
        image: imageForSlug('repuestos'),
      },
      {
        slug: 'rodillos-transferencia',
        title: 'Rodillos de transferencia',
        subtitle: 'Calidad de impresión | Repuestos originales Ricoh',
        href: categoryLandingPath('repuestos'),
        image: imageForSlug('repuestos'),
      },
      {
        slug: 'bandejas-papel',
        title: 'Bandejas y alimentadores',
        subtitle: 'Productividad continua | Menos atascos de papel',
        href: categoryLandingPath('repuestos'),
        image: imageForSlug('accesorios-impresoras', '/categories/accesorios.png'),
      },
      {
        slug: 'repuestos-generales',
        title: 'Explorar repuestos',
        subtitle: REPUESTOS_ROW_SUBTITLES['repuestos-generales'],
        href: categoryLandingPath('repuestos'),
        image: '/categories/repuestos-512.webp',
      },
    ],
  },
  {
    id: 'asesoria-repuestos',
    title: 'REPUESTOS POR MODELO',
    showAdvisorCta: true,
    items: [
      {
        slug: 'multifuncionales-repuestos',
        title: 'Repuestos multifuncionales',
        subtitle: 'Ricoh IM · MP · Pro | Asesoría por serie',
        href: categoryLandingPath('repuestos'),
        image: imageForSlug('multifuncionales'),
      },
      {
        slug: 'impresoras-repuestos',
        title: 'Repuestos impresoras',
        subtitle: 'Láser · Color · Producción | Stock nacional',
        href: categoryLandingPath('repuestos'),
        image: imageForSlug('impresoras'),
      },
      {
        slug: 'soporte-repuestos',
        title: 'Solicitar cotización',
        subtitle: 'Identificamos la pieza exacta | Respuesta rápida',
        href: '/contacto',
        image: '/Soporte Tecnico v2.png',
      },
    ],
  },
];

function serviceCardToRowItem(
  cardId: string,
  subtitle?: string,
): HaitechMegaMenuRowItem | undefined {
  const card = soporteTecnicoLanding.cards.find((entry) => entry.id === cardId);
  if (!card) return undefined;

  return {
    slug: card.id,
    title: card.title,
    subtitle: subtitle ?? card.description,
    href: serviceDetailPathFromLanding('servicio-tecnico', card.id),
    image: card.image,
  };
}

function rentalCardToRowItem(
  cardId: string,
  subtitle?: string,
): HaitechMegaMenuRowItem | undefined {
  const card = alquilerLanding.cards.find((entry) => entry.id === cardId);
  if (!card) return undefined;

  return {
    slug: card.id,
    title: card.title.replace(/^Alquiler de /, ''),
    subtitle: subtitle ?? card.description,
    href: serviceDetailPathFromLanding('alquiler', card.id),
    image: card.image,
  };
}

function rowItemsFromServiceCards(
  cardIds: readonly string[],
  subtitles?: Record<string, string>,
): HaitechMegaMenuRowItem[] {
  return cardIds.flatMap((cardId) => {
    const item = serviceCardToRowItem(cardId, subtitles?.[cardId]);
    return item ? [item] : [];
  });
}

function rowItemsFromRentalCards(
  cardIds: readonly string[],
  subtitles?: Record<string, string>,
): HaitechMegaMenuRowItem[] {
  return cardIds.flatMap((cardId) => {
    const item = rentalCardToRowItem(cardId, subtitles?.[cardId]);
    return item ? [item] : [];
  });
}

/** Mega menú «Tóner y Consumibles» con layout mockup. */
export function buildTonerMockupMegaMenu(menu: NavMegaMenuModel): HaitechMockupMegaMenuData {
  const tonerGroups = menu.getColumnGroups('toner-suministros');
  const featured = menu.getFeaturedContent('toner-suministros');
  const tonerItems =
    tonerGroups.length > 0
      ? tonerGroups.map((group) => columnGroupToRowItem(group, TONER_ROW_SUBTITLES[group.slug]))
      : [...TONER_FALLBACK_ITEMS];

  return {
    sections: [
      {
        id: 'toner',
        title: 'TÓNER Y CARTUCHOS',
        items: tonerItems,
      },
      {
        id: 'consumibles',
        title: 'CONSUMIBLES DE IMPRESIÓN',
        items: TONER_CONSUMIBLES_ITEMS,
      },
      {
        id: 'suministros',
        title: 'SUMINISTROS CORPORATIVOS',
        showAdvisorCta: true,
        items: TONER_CORPORATIVO_ITEMS,
      },
    ],
    featured: {
      headline: 'Tóner y suministros',
      headlineAccent: 'originales Ricoh',
      image: featured.image,
      imageAlt: featured.title,
      bullets: ['Calidad certificada', 'Rendimiento garantizado', 'Compatibilidad verificada'],
      ctaLabel: 'Ver tóner y consumibles',
      ctaHref: storeShowcasePath({ categoryId: 'toner-repuestos' }),
    },
  };
}

/** Mega menú «Consumibles» (Tóner + Repuestos) con layout mockup. */
export function buildConsumiblesMockupMegaMenu(menu: NavMegaMenuModel): HaitechMockupMegaMenuData {
  const tonerData = buildTonerMockupMegaMenu(menu);
  const repuestosGroups = menu.getColumnGroups('repuestos');
  const repuestosItems =
    repuestosGroups.length > 0
      ? repuestosGroups.map((group) => columnGroupToRowItem(group, REPUESTOS_ROW_SUBTITLES[group.slug]))
      : REPUESTOS_FALLBACK_SECTIONS[0]?.items ?? [];

  return {
    sections: [
      tonerData.sections[0]!,
      {
        id: 'repuestos',
        title: 'REPUESTOS',
        items: repuestosItems.slice(0, 4),
      },
      {
        id: 'suministros',
        title: 'SUMINISTROS CORPORATIVOS',
        showAdvisorCta: true,
        items: TONER_CORPORATIVO_ITEMS,
      },
    ],
    featured: {
      headline: 'Consumibles para',
      headlineAccent: 'tu flota Ricoh',
      image: tonerData.featured.image,
      imageAlt: 'Tóner y repuestos Ricoh',
      bullets: ['Tóner originales y compatibles', 'Repuestos certificados', 'Stock nacional'],
      ctaLabel: 'Ver consumibles',
      ctaHref: storeShowcasePath({ categoryId: 'toner-repuestos' }),
    },
  };
}

/** Mega menú «Repuestos» con layout mockup. */
export function buildRepuestosMockupMegaMenu(menu: NavMegaMenuModel): HaitechMockupMegaMenuData {
  const repuestosGroups = menu.getColumnGroups('repuestos');
  const featured = menu.getFeaturedContent('repuestos');

  if (repuestosGroups.length === 0) {
    return {
      sections: REPUESTOS_FALLBACK_SECTIONS,
      featured: {
        headline: 'Repuestos para',
        headlineAccent: 'tu flota Ricoh',
        image: featured.image,
        imageAlt: featured.title,
        bullets: ['Piezas originales', 'Stock nacional', 'Asesoría por modelo'],
        ctaLabel: 'Ver todos los repuestos',
        ctaHref: categoryLandingPath('repuestos'),
      },
    };
  }

  const items = repuestosGroups.map((group) => columnGroupToRowItem(group, REPUESTOS_ROW_SUBTITLES[group.slug]));
  const chunkSize = Math.max(1, Math.ceil(items.length / 3));
  const sectionTitles = ['COMPONENTES PRINCIPALES', 'MANTENIMIENTO Y KITS', 'REPUESTOS POR MODELO'] as const;

  return {
    sections: sectionTitles.map((title, index) => ({
      id: `repuestos-${index + 1}`,
      title,
      showAdvisorCta: index === 2,
      items: items.slice(index * chunkSize, (index + 1) * chunkSize),
    })).filter((section) => section.items.length > 0),
    featured: {
      headline: 'Repuestos para',
      headlineAccent: 'tu flota Ricoh',
      image: featured.image,
      imageAlt: featured.title,
      bullets: ['Piezas originales', 'Stock nacional', 'Asesoría por modelo'],
      ctaLabel: 'Ver todos los repuestos',
      ctaHref: categoryLandingPath('repuestos'),
    },
  };
}

/** Mega menú «Servicio Técnico» con layout mockup. */
export function buildServicioTecnicoMockupMegaMenu(): HaitechMockupMegaMenuData {
  return {
    sections: [
      {
        id: 'mantenimiento',
        title: 'MANTENIMIENTO',
        items: rowItemsFromServiceCards(['preventivo', 'correctivo', 'general', 'planes']),
      },
      {
        id: 'soporte',
        title: 'SOPORTE Y COBERTURA',
        items: rowItemsFromServiceCards([
          'garantia',
          'soporte-remoto',
          'actualizacion-firmware',
          'suministro',
        ]),
      },
      {
        id: 'instalacion',
        title: 'INSTALACIÓN Y CAPACITACIÓN',
        showAdvisorCta: true,
        items: rowItemsFromServiceCards([
          'instalacion-config-capacitacion',
          'reparacion-fuente-tarjetas',
        ]),
      },
    ],
    featured: {
      headline: 'Soporte que mantiene',
      headlineAccent: 'tu operación',
      image: '/Soporte Tecnico v2.png',
      imageAlt: 'Soporte técnico especializado Ricoh',
      bullets: ['Respuesta rápida', 'Técnicos certificados', 'Cobertura nacional'],
      ctaLabel: 'Ver servicio técnico',
      ctaHref: serviceHubPath('servicio-tecnico'),
    },
  };
}

/** Mega menú «Alquiler» con layout mockup. */
export function buildAlquilerMockupMegaMenu(): HaitechMockupMegaMenuData {
  return {
    sections: [
      {
        id: 'impresion',
        title: 'IMPRESIÓN Y DIGITALIZACIÓN',
        items: rowItemsFromRentalCards(['impresoras', 'plotters', 'escaneres']),
      },
      {
        id: 'computo',
        title: 'CÓMPUTO Y COLABORACIÓN',
        items: rowItemsFromRentalCards(['laptops', 'computadoras', 'proyectores']),
      },
      {
        id: 'planes',
        title: 'PLANES FLEXIBLES',
        showAdvisorCta: true,
        items: [
          {
            slug: 'planes-mensuales',
            title: 'Planes mensuales',
            subtitle: 'Sin inversión inicial | Costo predecible por contrato',
            href: serviceHubPath('alquiler'),
            image: '/categories/alquiler-512.webp',
          },
          {
            slug: 'mantenimiento-incluido',
            title: 'Mantenimiento incluido',
            subtitle: 'Tóner · Repuestos · Soporte | Todo en un solo plan',
            href: serviceHubPath('alquiler'),
            image: '/services/alquiler/impresoras.png',
          },
          {
            slug: 'cotizar-alquiler',
            title: 'Cotizar alquiler',
            subtitle: 'Impresoras · Laptops · Plotters | Asesoría personalizada',
            href: '/contacto',
            image: '/services/alquiler/laptops.png',
          },
        ],
      },
    ],
    featured: {
      headline: 'Alquiler sin',
      headlineAccent: 'inversión inicial',
      image: '/categories/alquiler-512.webp',
      imageAlt: 'Alquiler de equipos Ricoh para empresas',
      bullets: ['Equipos de última tecnología', 'Mantenimiento incluido', 'Planes flexibles'],
      ctaLabel: 'Ver opciones de alquiler',
      ctaHref: serviceHubPath('alquiler'),
    },
  };
}

/** Mega menú «Servicios» (Alquiler · Leasing · Outsourcing). */
export function buildServiciosMockupMegaMenu(): HaitechMockupMegaMenuData {
  const alquiler = buildAlquilerMockupMegaMenu();
  const outsourcingItems = outsourcingLanding.cards.slice(0, 4).map((card) => ({
    slug: card.id,
    title: card.title,
    subtitle: card.description,
    href: serviceDetailPathFromLanding('outsourcing', card.id),
    image: card.image,
  }));

  return {
    sections: [
      {
        id: 'alquiler',
        title: 'ALQUILER',
        items: alquiler.sections[0]?.items ?? [],
      },
      {
        id: 'leasing',
        title: 'LEASING',
        items: [
          {
            slug: 'leasing-equipos',
            title: 'Equipos en leasing',
            subtitle: 'Multifuncionales · Laptops | Opción de compra',
            href: '/contacto?tema=leasing',
            image: imageForSlug('multifuncionales'),
          },
          {
            slug: 'leasing-plazos',
            title: 'Planes 12 a 36 meses',
            subtitle: 'Cuotas predecibles | Sin desembolso inicial alto',
            href: '/contacto?tema=leasing',
            image: '/categories/alquiler-512.webp',
          },
          {
            slug: 'leasing-asesoria',
            title: 'Asesoría comercial',
            subtitle: 'Cotización personalizada | Respuesta rápida',
            href: '/contacto?tema=leasing',
            image: '/Soporte Tecnico v2.png',
          },
        ],
      },
      {
        id: 'outsourcing',
        title: 'OUTSOURCING',
        showAdvisorCta: true,
        items: outsourcingItems,
      },
    ],
    featured: {
      headline: 'Servicios para',
      headlineAccent: 'tu operación',
      image: '/categories/alquiler-512.webp',
      imageAlt: 'Alquiler, leasing y outsourcing HaiStore',
      bullets: ['Alquiler flexible', 'Leasing con opción de compra', 'Outsourcing especializado'],
      ctaLabel: 'Ver servicios',
      ctaHref: serviceHubPath('alquiler'),
    },
  };
}
