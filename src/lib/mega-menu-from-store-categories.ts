import type { LucideIcon } from 'lucide-react';

import type { Category } from '@/data/categories';
import { megaMenuImageForSlug } from '@/data/mega-menu';
import { subcategoryStockImage } from '@/data/subcategory-images';
import { categoryLandingPath, categoryPath } from '@/lib/category-path';
import { prepareProductosNavCategoryTree } from '@/lib/catalog-category-tree';
import { buildLandingMenuCategoriesFromTree } from '@/lib/landing-menu-categories';
import {
  buildStaticStoreCategoryTree,
  enrichStoreCategoryTree,
} from '@/lib/static-store-category-tree';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export interface MegaMenuLinkItem {
  name: string;
  href: string;
}

export interface MegaMenuColumnGroup {
  slug: string;
  title: string;
  image: string;
  href: string;
  links: MegaMenuLinkItem[];
}

function normalizeMegaMenuLabel(value: string): string {
  return value.trim().toLowerCase();
}

/** Omite enlaces que repiten el título de la columna (p. ej. «Multifuncionales Nuevas» ×2). */
export function filterRedundantMegaMenuLinks(
  title: string,
  links: MegaMenuLinkItem[],
): MegaMenuLinkItem[] {
  const normalizedTitle = normalizeMegaMenuLabel(title);
  return links.filter((link) => normalizeMegaMenuLabel(link.name) !== normalizedTitle);
}

export interface LandingCatalogMenuSidebarItem {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
  viewAllHref?: string;
}

export interface MegaMenuFeaturedContent {
  image: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

export interface NavMegaMenuModel {
  sidebarItems: LandingCatalogMenuSidebarItem[];
  defaultCategorySlug: string;
  getColumnGroups: (categorySlug: string) => MegaMenuColumnGroup[];
  getFeaturedContent: (categorySlug: string) => MegaMenuFeaturedContent;
}

const FALLBACK_COLUMN_IMAGE = '/categories/toner-suministros.png';

function findNodeBySlug(
  nodes: StoreCategoryTreeNode[],
  slug: string,
): StoreCategoryTreeNode | undefined {
  for (const node of nodes) {
    if (node.slug === slug) return node;
    const nested = findNodeBySlug(node.children ?? [], slug);
    if (nested) return nested;
  }
  return undefined;
}

function imageForNode(node: StoreCategoryTreeNode, fallbackSlug?: string): string {
  const curated = subcategoryStockImage(node.name, node.slug);
  if (curated) return curated;

  return (
    node.image ??
    megaMenuImageForSlug(node.slug) ??
    (fallbackSlug ? megaMenuImageForSlug(fallbackSlug) : undefined) ??
    FALLBACK_COLUMN_IMAGE
  );
}

function fallbackColumnGroupsForCategory(category: Category): MegaMenuColumnGroup[] {
  const href = categoryLandingPath(category.slug);
  return [
    {
      slug: category.slug,
      title: category.name,
      image: category.image ?? megaMenuImageForSlug(category.slug) ?? FALLBACK_COLUMN_IMAGE,
      href,
      links: [
        { name: category.tagline, href },
        { name: `Ver ${category.name}`, href },
      ],
    },
  ];
}

function collectColumnGroupsForCategory(node: StoreCategoryTreeNode): MegaMenuColumnGroup[] {
  const groups: MegaMenuColumnGroup[] = [];
  const children = node.children ?? [];

  if (children.length === 0) {
    groups.push({
      slug: node.slug,
      title: node.name,
      image: imageForNode(node),
      href: categoryLandingPath(node.slug),
      links: [{ name: `Ver ${node.name}`, href: categoryLandingPath(node.slug) }],
    });
    return groups;
  }

  for (const child of children) {
    const grandChildren = child.children ?? [];

    if (grandChildren.length > 0) {
      groups.push({
        slug: child.slug,
        title: child.name,
        image: imageForNode(child, node.slug),
        href: categoryPath(node.slug, child.slug),
        links: grandChildren.map((grand) => ({
          name: grand.name,
          href: categoryPath(node.slug, grand.slug),
        })),
      });
      continue;
    }

    groups.push({
      slug: child.slug,
      title: child.name,
      image: imageForNode(child, node.slug),
      href: categoryPath(node.slug, child.slug),
      links: [],
    });
  }

  return groups;
}

const CATALOG_FEATURED_BY_SLUG: Record<string, MegaMenuFeaturedContent> = {
  multifuncionales: {
    image: '/categories/multifuncionales-512.webp',
    title: 'Multifuncionales Ricoh',
    description:
      'Equipos todo en uno para imprimir, escanear y copiar con eficiencia energética y conectividad empresarial.',
    href: '/categoria/multifuncionales',
  },
  impresoras: {
    image: '/categories/impresoras-512.webp',
    title: 'Impresoras láser e inkjet',
    description:
      'Desde equipos de escritorio hasta impresoras de alto volumen para oficinas exigentes.',
    href: '/categoria/impresoras',
  },
  'formato-ancho': {
    image: '/categories/formato-ancho-512.webp',
    title: 'Plotters y formato ancho',
    description:
      'Impresión de planos, gráficos y señalización con precisión profesional.',
    href: '/categoria/formato-ancho',
  },
  escaneres: {
    image: '/categories/escaneres-512.webp',
    title: 'Escáneres de documentos',
    description:
      'Digitaliza archivos con velocidad y calidad para flujos de trabajo sin papel.',
    href: '/categoria/escaneres',
  },
  'toner-suministros': {
    image: '/categories/toner-suministros-512.webp',
    title: 'Tóner y suministros',
    description:
      'Consumibles originales y compatibles certificados para tu flota de impresión.',
    href: '/categoria/toner-suministros',
  },
  repuestos: {
    image: '/categories/repuestos-512.webp',
    title: 'Repuestos y componentes',
    description:
      'Partes originales y compatibles para mantener tus equipos en óptimas condiciones.',
    href: '/categoria/repuestos',
  },
  accesorios: {
    image: '/categories/accesorios-impresoras-512.webp',
    title: 'Accesorios de impresión',
    description:
      'Bandejas, finisher, grapadoras y accesorios para ampliar las capacidades de tu equipo.',
    href: '/categoria/accesorios',
  },
  'computadoras-laptop': {
    image: '/categories/computadoras-laptop-512.webp',
    title: 'Computadoras y laptops',
    description:
      'Equipos de cómputo para productividad empresarial con soporte local HaiStore.',
    href: '/categoria/computadoras-laptop',
  },
  monitores: {
    image: '/categories/monitores-512.webp',
    title: 'Monitores profesionales',
    description:
      'Pantallas para oficina, diseño y videoconferencia con excelente relación calidad-precio.',
    href: '/categoria/monitores',
  },
  camaras: {
    image: '/categories/camaras-512.webp',
    title: 'Cámaras y videovigilancia',
    description:
      'Soluciones de seguridad y monitoreo para proteger tu negocio las 24 horas.',
    href: '/categoria/camaras',
  },
  alquiler: {
    image: '/categories/alquiler-512.webp',
    title: 'Alquiler de equipos',
    description:
      'Tecnología bajo demanda sin inversión inicial: impresoras, laptops y más.',
    href: '/categoria/alquiler',
  },
  'soluciones-colaboracion': {
    image: '/categories/soluciones-colaboracion-512.webp',
    title: 'Pizarras interactivas',
    description:
      'IFPD 4K y soluciones de colaboración para salas de reunión modernas.',
    href: '/categoria/soluciones-colaboracion',
  },
  'soluciones-negocio': {
    image: '/categories/soluciones-negocio-512.webp',
    title: 'Soluciones de negocio',
    description:
      'Infraestructura tecnológica integral para empresas en crecimiento.',
    href: '/categoria/soluciones-negocio',
  },
};

function featuredContentForCategory(
  categorySlug: string,
  staticCategory?: Category,
): MegaMenuFeaturedContent {
  const curated = CATALOG_FEATURED_BY_SLUG[categorySlug];
  if (curated) return curated;

  if (staticCategory) {
    return {
      image:
        staticCategory.image ??
        megaMenuImageForSlug(staticCategory.slug) ??
        FALLBACK_COLUMN_IMAGE,
      title: staticCategory.name,
      description: staticCategory.tagline,
      href: categoryLandingPath(staticCategory.slug),
    };
  }

  return {
    image: megaMenuImageForSlug(categorySlug) ?? FALLBACK_COLUMN_IMAGE,
    title: 'Explorar catálogo',
    description: 'Descubre equipos, suministros y soluciones para tu empresa.',
    href: categoryLandingPath(categorySlug),
  };
}

export type DesktopMegaMenuColumnMode = 'sidebar-as-columns' | 'flatten-groups';

/** Agrupa columnas del mega menú para el layout tipo Dataplus en escritorio. */
export function buildDesktopMegaMenuColumns(
  menu: NavMegaMenuModel,
  mode: DesktopMegaMenuColumnMode,
): MegaMenuColumnGroup[] {
  if (mode === 'sidebar-as-columns') {
    return menu.sidebarItems.map((item) => {
      const childGroups = menu.getColumnGroups(item.slug);
      const image =
        megaMenuImageForSlug(item.slug) ??
        childGroups.find((group) => group.image)?.image ??
        FALLBACK_COLUMN_IMAGE;

      return {
        slug: item.slug,
        title: item.label,
        image,
        href: item.viewAllHref ?? categoryLandingPath(item.slug),
        links: filterRedundantMegaMenuLinks(
          item.label,
          childGroups.flatMap((group) =>
            group.links.length > 0 ? group.links : [{ name: group.title, href: group.href }],
          ),
        ),
      };
    });
  }

  return menu.sidebarItems.flatMap((item) => menu.getColumnGroups(item.slug));
}

/** Mega menú «Productos» del header: equipos con todas sus subcategorías. */
export function buildProductosNavMegaMenu(apiTree: StoreCategoryTreeNode[]): NavMegaMenuModel {
  const staticTree = buildStaticStoreCategoryTree();
  const productTree = prepareProductosNavCategoryTree(apiTree, staticTree);
  return buildLandingCatalogMegaMenu(productTree);
}

export function buildLandingCatalogMegaMenu(tree: StoreCategoryTreeNode[]) {
  const enrichedTree = enrichStoreCategoryTree(tree);
  const landingCategories = buildLandingMenuCategoriesFromTree(enrichedTree);
  const sidebarItems: LandingCatalogMenuSidebarItem[] = landingCategories.map((category) => ({
    slug: category.slug,
    label: category.name,
    description: category.tagline,
    icon: category.icon,
    viewAllHref: categoryLandingPath(category.slug),
  }));

  function getColumnGroups(categorySlug: string): MegaMenuColumnGroup[] {
    const staticCategory = landingCategories.find((category) => category.slug === categorySlug);
    const node = findNodeBySlug(enrichedTree, categorySlug);

    if (node) {
      const groups = collectColumnGroupsForCategory(node);
      if (groups.length > 0) return groups;
    }

    if (staticCategory) return fallbackColumnGroupsForCategory(staticCategory);
    return [];
  }

  function getFeaturedContent(categorySlug: string): MegaMenuFeaturedContent {
    const staticCategory = landingCategories.find((category) => category.slug === categorySlug);
    return featuredContentForCategory(categorySlug, staticCategory);
  }

  return {
    sidebarItems,
    defaultCategorySlug: sidebarItems[0]?.slug ?? 'multifuncionales',
    getColumnGroups,
    getFeaturedContent,
  };
}
