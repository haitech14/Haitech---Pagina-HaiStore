import type { LucideIcon } from 'lucide-react';

import type { Category } from '@/data/categories';
import { megaMenuImageForSlug } from '@/data/mega-menu';
import { categoryLandingPath, categoryPath } from '@/lib/category-path';
import { buildLandingMenuCategoriesFromTree } from '@/lib/landing-menu-categories';
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
}

const FALLBACK_COLUMN_IMAGE = '/categories/toner-suministros.png';

const BRAND_STRIP_SLUGS = new Set([
  'multifuncionales',
  'impresoras',
  'formato-ancho',
  'toner-suministros',
  'repuestos',
  'accesorios',
  'escaneres',
]);

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

export function buildLandingCatalogMegaMenu(tree: StoreCategoryTreeNode[]) {
  const landingCategories = buildLandingMenuCategoriesFromTree(tree);
  const sidebarItems: LandingCatalogMenuSidebarItem[] = landingCategories.map((category) => ({
    slug: category.slug,
    label: category.name,
    description: category.tagline,
    icon: category.icon,
  }));

  function getColumnGroups(categorySlug: string): MegaMenuColumnGroup[] {
    const staticCategory = landingCategories.find((category) => category.slug === categorySlug);
    const node = findNodeBySlug(tree, categorySlug);

    if (node) {
      const groups = collectColumnGroupsForCategory(node);
      if (groups.length > 0) return groups;
    }

    if (staticCategory) return fallbackColumnGroupsForCategory(staticCategory);
    return [];
  }

  function categoryShowsBrandStrip(categorySlug: string): boolean {
    return BRAND_STRIP_SLUGS.has(categorySlug);
  }

  return {
    sidebarItems,
    defaultCategorySlug: sidebarItems[0]?.slug ?? 'multifuncionales',
    getColumnGroups,
    categoryShowsBrandStrip,
  };
}
