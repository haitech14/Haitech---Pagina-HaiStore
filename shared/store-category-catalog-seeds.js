import {
  COMPATIBLE_TONER_INVENTORY_LABELS,
  COMPATIBLE_TONER_SUBCATEGORY_ID,
  COMPATIBLE_TONER_SUBCATEGORY_SLUG,
} from './compatible-toner.js';
import { SUBCATEGORY_INVENTORY_LABELS } from './category-inventory-labels.js';
import { LANDING_CATEGORY } from './landing-categories.js';

/** @typedef {{ id?: string; slug: string; name: string; parentSlug?: string | null; sortOrder?: number; inventoryLabels?: string[]; image?: string | null; tagline?: string | null }} CatalogCategorySeed */

const KNOWN_IDS = {
  multifuncionales: 'cat-multifuncionales',
  impresoras: 'cat-impresoras',
  'toner-suministros': 'cat-toner',
  repuestos: 'cat-repuestos',
  'servicio-tecnico': 'cat-servicio-tecnico',
  'toner-compatibles': COMPATIBLE_TONER_SUBCATEGORY_ID,
  'toner-originales': 'cat-toner-originales',
  'toner-remanufacturado': 'cat-toner-remanufacturado',
  'toner-recarga': 'cat-toner-recarga',
  'tintas-originales': 'cat-tintas-originales',
  'tintas-compatibles': 'cat-tintas-compatibles',
  alquiler: 'cat-alquiler',
  software: 'cat-software',
};

/** Raíces de la tienda (paridad con src/data/categories.ts). */
const STORE_PAGE_ROOTS = [
  {
    slug: 'multifuncionales',
    name: 'Multifuncionales',
    tagline: 'Imprime, escanea y copia en un solo equipo',
    image: '/categories/multifuncionales.png',
    inventoryLabels: [
      'Multifuncionales',
      'Multifuncionales Nuevas',
      'Multifuncionales, Multifuncionales Nuevas',
      'Multifuncionales Seminuevas',
      'Multifuncionales, Multifuncionales Seminuevas',
      'Multifuncionales Remanufacturadas',
      'Multifuncionales, Multifuncionales Remanufacturadas',
    ],
  },
  {
    slug: 'impresoras',
    name: 'Impresoras',
    tagline: 'Láser, inkjet y soluciones de impresión',
    image: '/categories/impresoras.png',
    inventoryLabels: [
      'Impresoras',
      'Impresoras Laser Nuevas',
      'Impresoras Láser Nuevas',
      'Impresoras, Impresoras Laser Nuevas',
      'Impresoras, Impresoras Láser Nuevas',
    ],
  },
  {
    slug: 'formato-ancho',
    name: 'Formato Ancho',
    tagline: 'Plotters y equipos para gran formato',
    image: '/categories/formato-ancho.png',
    inventoryLabels: ['Formato Ancho', 'Plotter y Multifuncional de Planos'],
  },
  {
    slug: 'toner-suministros',
    name: 'Suministros',
    tagline: 'Tóner original, remanufacturado y compatibles',
    image: '/categories/toner-suministros.png',
    inventoryLabels: [
      'Suministros',
      'Toner y Suministros',
      'Toner y suministros',
      'Tóner y Suministros',
      'Toner',
      'Toner, Suministros',
    ],
  },
  {
    slug: 'repuestos',
    name: 'Repuestos',
    tagline: 'Partes y componentes para impresoras',
    image: '/categories/repuestos.png',
    inventoryLabels: ['Repuestos'],
  },
  {
    slug: 'accesorios',
    name: 'Accesorios',
    tagline: 'Bandejas, finisher y complementos para impresoras',
    image: '/categories/accesorios-impresoras.png',
    inventoryLabels: ['Accesorios'],
  },
  {
    slug: 'servicio-tecnico',
    name: 'Servicio Técnico',
    tagline: 'Mantenimiento, instalación y soporte especializado',
    image: '/categories/servicio-tecnico.png',
    inventoryLabels: ['Servicio Técnico', 'Servicio tecnico'],
  },
  {
    slug: 'escaneres',
    name: 'Escáneres',
    tagline: 'Digitalización rápida y precisa de documentos',
    image: '/categories/escaneres.png',
    inventoryLabels: ['Escáneres'],
  },
  {
    slug: 'camaras',
    name: 'Cámaras',
    tagline: 'Videovigilancia, grabación y seguridad',
    image: '/categories/camaras.png',
    inventoryLabels: ['Cámaras'],
  },
  {
    slug: 'soluciones-colaboracion',
    name: 'Pizarras Interactivas',
    tagline: 'Pizarras interactivas IFPD y accesorios para salas de reunión',
    image: '/categories/soluciones-colaboracion.png',
    inventoryLabels: ['Pizarras Interactivas'],
  },
  {
    slug: 'equipamiento-videoconferencias',
    name: 'Equipamiento para Videoconferencias',
    tagline: 'Cámaras, altavoces y accesorios para salas de reunión',
    image: '/categories/soluciones-colaboracion.png',
    inventoryLabels: ['Equipamiento para Videoconferencias'],
  },
  {
    slug: 'soluciones-negocio',
    name: 'Soluciones de Negocio',
    tagline: 'Infraestructura y tecnología para empresas',
    image: '/categories/soluciones-negocio.png',
    inventoryLabels: ['Soluciones de Negocio'],
  },
  {
    slug: 'computadoras-laptop',
    name: 'Computadoras y Laptop',
    tagline: 'Equipos de cómputo y accesorios',
    image: '/categories/computadoras-laptop.png',
    inventoryLabels: ['Computadoras y Laptop', 'Computadoras Laptop', 'Laptops'],
  },
  {
    slug: 'monitores',
    name: 'Monitores',
    tagline: 'Pantallas para oficina y productividad',
    image: '/categories/monitores.png',
    inventoryLabels: ['Monitores'],
  },
  {
    slug: 'tecnologia',
    name: 'Tecnología y cómputo',
    tagline: 'Equipos de cómputo, pantallas y accesorios',
    image: '/categories/computadoras-laptop.png',
    inventoryLabels: ['Tecnología y cómputo'],
  },
  {
    slug: 'software',
    name: 'Software',
    tagline: 'Soluciones de gestión documental y seguridad',
    image: '/categories/soluciones-negocio.png',
    inventoryLabels: ['Software'],
  },
  {
    slug: 'equipos-de-oficina',
    name: 'Equipos de Oficina',
    tagline: 'Equipamiento para oficina y encuadernación',
    image: '/categories/repuestos.png',
    inventoryLabels: [
      'Equipos de Oficina',
      'Equipos de Oficina, Espiraladoras',
      'Espiraladoras',
      'Espiraladora',
      'Equipos de Oficina, Anilladoras',
      'Anilladoras',
      'Anilladora',
      'Equipos de Oficina, Enmicadora',
      'Enmicadoras',
      'Enmicadora',
      'Equipos de Oficina, Guillotina',
      'Guillotinas',
      'Guillotina',
    ],
  },
];

/** Subcategorías de equipos (paridad con static-store-category-tree.ts). */
const EQUIPMENT_SUBCATEGORIES = {
  multifuncionales: [
    { slug: 'multifuncionales-nuevas', name: 'Multifuncionales Nuevas' },
    { slug: 'multifuncionales-seminuevas', name: 'Multifuncionales Seminuevas' },
    { slug: 'multifuncionales-remanufacturadas', name: 'Multifuncionales Remanufacturadas' },
  ],
  impresoras: [
    { slug: 'impresoras-laser-nuevas', name: 'Impresoras Láser Nuevas' },
    { slug: 'impresoras-laser-seminuevas', name: 'Impresoras Láser Seminuevas' },
    { slug: 'impresoras-laser-remanufacturadas', name: 'Impresoras Láser Remanufacturadas' },
  ],
  'toner-suministros': [
    { slug: 'toner-originales', name: 'Toner Originales' },
    { slug: 'suministros', name: 'Suministros' },
    { slug: 'toner-compatibles', name: 'Tóner Compatible' },
    { slug: 'tintas-originales', name: 'Tintas Originales' },
    { slug: 'tintas-compatibles', name: 'Tintas Compatibles' },
    { slug: 'toner-remanufacturado', name: 'Toner Remanufacturado' },
    { slug: 'toner-recarga', name: 'Toner Recarga' },
  ],
  escaneres: [{ slug: 'escaneres-nuevos', name: 'Escáneres Nuevos' }],
  'equipos-de-oficina': [
    { slug: 'espiraladoras', name: 'Espiraladoras' },
    { slug: 'anilladoras', name: 'Anilladoras' },
    { slug: 'enmicadoras', name: 'Enmicadoras' },
    { slug: 'guillotinas', name: 'Guillotinas' },
  ],
  repuestos: [
    { slug: 'repuestos-originales', name: 'Repuestos Originales', id: 'cat-repuestos-originales' },
    {
      slug: 'repuestos-compatibles',
      name: 'Repuestos Compatibles',
      id: 'cat-repuestos-compatibles',
    },
    { slug: 'unidades-compatibles', name: 'Unidades Compatibles', id: 'cat-unidades-compatibles', parentSlug: 'repuestos-compatibles' },
    { slug: 'cilindros', name: 'Cilindros', id: 'cat-cilindros-compatibles', parentSlug: 'repuestos-compatibles' },
  ],
};

/** Alquiler (paridad con src/data/rental-categories.ts). */
const RENTAL_CATEGORIES = [
  {
    slug: 'alquiler',
    name: LANDING_CATEGORY.alquiler,
    tagline: 'Alquiler de equipos para eventos y oficinas',
    image: '/services/alquiler/impresoras.png',
    inventoryLabels: ['Alquiler'],
  },
  { slug: 'alquiler-laptops', name: 'Laptops', parentSlug: 'alquiler', tagline: 'Alquiler de laptops corporativas' },
  { slug: 'alquiler-computadoras', name: 'Computadoras', parentSlug: 'alquiler', tagline: 'Alquiler de computadoras de escritorio' },
  { slug: 'alquiler-proyectores', name: 'Proyectores', parentSlug: 'alquiler', tagline: 'Alquiler de proyectores para eventos' },
  { slug: 'alquiler-impresoras', name: 'Impresoras', parentSlug: 'alquiler', tagline: 'Alquiler de impresoras multifuncionales' },
  { slug: 'alquiler-plotters', name: 'Plotters', parentSlug: 'alquiler', tagline: 'Alquiler de plotters de gran formato' },
  { slug: 'alquiler-escaneres', name: 'Escáneres', parentSlug: 'alquiler', tagline: 'Alquiler de escáneres de documentos' },
];

/** Servicios (paridad con src/data/services-catalog.ts). */
const SERVICES_CATEGORIES = [
  {
    slug: 'outsourcing',
    name: 'Servicios empresariales',
    tagline: 'Outsourcing y servicios corporativos',
    image: '/categories/soluciones-negocio.png',
    inventoryLabels: ['Outsourcing', 'Servicios empresariales'],
  },
  {
    slug: 'locales-eventos',
    name: 'Locales para eventos',
    tagline: 'Espacios para eventos corporativos',
    image: '/categories/soluciones-negocio.png',
    inventoryLabels: ['Locales para eventos', 'Servicios corporativos'],
  },
  {
    slug: 'paquetes-corporativos',
    name: 'Paquetes corporativos',
    tagline: 'Paquetes integrados para empresas',
    image: '/categories/soluciones-negocio.png',
    inventoryLabels: ['Paquetes corporativos', 'Servicios corporativos'],
  },
  {
    slug: 'servicios-corporativos',
    name: 'Servicios corporativos',
    tagline: 'Soluciones integrales para empresas',
    image: '/categories/soluciones-negocio.png',
    inventoryLabels: ['Servicios corporativos'],
  },
];

/** Software (paridad con src/data/software-catalog.ts). */
const SOFTWARE_SUBCATEGORIES = [
  { slug: 'gestion-documental', name: 'Gestión documental', parentSlug: 'software' },
  { slug: 'automatizacion-procesos', name: 'Automatización de procesos', parentSlug: 'software' },
  { slug: 'impresion-y-captura', name: 'Impresión y captura', parentSlug: 'software' },
  { slug: 'integracion-ricoh', name: 'Integración Ricoh', parentSlug: 'software' },
  { slug: 'antivirus', name: 'Antivirus', parentSlug: 'software', inventoryLabels: ['Antivirus', 'Software, Antivirus'] },
  {
    slug: 'inteligencia-artificial',
    name: 'Licencias',
    parentSlug: 'software',
    inventoryLabels: ['Inteligencia Artificial', 'Software, Inteligencia Artificial'],
  },
  { slug: 'software-empresarial', name: 'Software Empresarial', parentSlug: 'software' },
];

function labelsForSubSlug(slug) {
  const fromMap = SUBCATEGORY_INVENTORY_LABELS[slug];
  if (fromMap?.length) return fromMap;
  if (slug === COMPATIBLE_TONER_SUBCATEGORY_SLUG) return [...COMPATIBLE_TONER_INVENTORY_LABELS];
  return [];
}

function withKnownId(seed) {
  const id = seed.id ?? KNOWN_IDS[seed.slug] ?? `cat-${seed.slug}`;
  return { ...seed, id };
}

function expandEquipmentSubcategories() {
  /** @type {CatalogCategorySeed[]} */
  const seeds = [];

  for (const [parentSlug, entries] of Object.entries(EQUIPMENT_SUBCATEGORIES)) {
    for (const [index, entry] of entries.entries()) {
      const parentSlugResolved = entry.parentSlug ?? parentSlug;
      const labels = labelsForSubSlug(entry.slug);
      seeds.push(
        withKnownId({
          slug: entry.slug,
          name: entry.name,
          parentSlug: parentSlugResolved,
          sortOrder: index,
          inventoryLabels: labels.length > 0 ? labels : [entry.name],
          image: parentSlug === 'repuestos' ? '/categories/repuestos.png' : null,
          tagline: entry.name,
          id: entry.id,
        }),
      );
    }
  }

  return seeds;
}

/**
 * Semillas planas del catálogo público (tienda, servicios, alquiler, software, equipos).
 * Los padres van antes que los hijos para resolver parentId en la sincronización.
 * @returns {CatalogCategorySeed[]}
 */
export function getStoreCategoryCatalogSeeds() {
  /** @type {CatalogCategorySeed[]} */
  const seeds = [];

  for (const [index, root] of STORE_PAGE_ROOTS.entries()) {
    seeds.push(withKnownId({ ...root, sortOrder: index }));
  }

  seeds.push(...RENTAL_CATEGORIES.map((entry, index) => withKnownId({ ...entry, sortOrder: index })));
  seeds.push(...SERVICES_CATEGORIES.map((entry, index) => withKnownId({ ...entry, sortOrder: index })));
  seeds.push(...SOFTWARE_SUBCATEGORIES.map((entry, index) => withKnownId({ ...entry, sortOrder: index })));
  seeds.push(...expandEquipmentSubcategories());

  return seeds;
}

/**
 * @param {CatalogCategorySeed[]} seeds
 */
export function getCatalogSeedIdentifiers(seeds = getStoreCategoryCatalogSeeds()) {
  const identifiers = new Set();
  for (const seed of seeds) {
    identifiers.add(seed.slug);
    identifiers.add(seed.id ?? KNOWN_IDS[seed.slug] ?? `cat-${seed.slug}`);
    identifiers.add(`static-${seed.slug}`);
  }
  return identifiers;
}
