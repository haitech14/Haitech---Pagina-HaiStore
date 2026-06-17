import type { LucideIcon } from 'lucide-react';
import {
  Copy,
  Cog,
  Droplets,
  Headphones,
  KeyRound,
  Laptop,
  Monitor,
  Package,
  PackageOpen,
  Printer,
  Ruler,
  ScanLine,
  Wrench,
} from 'lucide-react';

import { categoryPath } from '@/lib/category-path';
import { megaMenuImageForSlug, type MegaMenuSectionId } from '@/data/mega-menu';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export interface MegaMenuNavItem {
  slug: string;
  name: string;
  icon: LucideIcon;
  href: string;
  productCount: number;
}

export interface MegaMenuNavColumn {
  id: MegaMenuSectionId;
  title: string;
  items: MegaMenuNavItem[];
}

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

type MegaMenuCatalogSectionId = Exclude<MegaMenuSectionId, 'destacados' | 'servicios'>;

const SECTION_ROOT_IDS: Record<MegaMenuCatalogSectionId, string[]> = {
  impresion: [
    'cat-multifuncionales',
    'cat-impresoras',
    '54e448b6-6573-4c4b-9d35-a9f7eaf1c829',
    'cat-escaneres',
  ],
  suministros: ['cat-toner', 'cat-repuestos', 'cat-servicio-tecnico', 'cat-alquiler'],
  tecnologia: ['cat-tecnologia'],
};

const SECTION_TITLES: Record<MegaMenuCatalogSectionId, string> = {
  impresion: 'Impresión',
  suministros: 'Suministros',
  tecnologia: 'Tecnología',
};

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  multifuncionales: Copy,
  'multifuncionales-nuevas': Copy,
  'multifuncionales-seminuevas': Copy,
  'multifuncionales-remanufacturadas': Copy,
  impresoras: Printer,
  'impresoras-laser-nuevas': Printer,
  'impresoras-laser-seminuevas': Printer,
  'impresoras-laser-remanufacturadas': Printer,
  'formato-ancho': Ruler,
  escaneres: ScanLine,
  'toner-suministros': PackageOpen,
  toner: Droplets,
  'toner-originales': Droplets,
  'toner-compatibles': Droplets,
  suministros: Package,
  'accesorios-toner': Package,
  accesorios: Headphones,
  repuestos: Cog,
  alquiler: KeyRound,
  'alquiler-laptops': Laptop,
  'alquiler-computadoras': Monitor,
  'alquiler-proyectores': Monitor,
  'alquiler-impresoras': Printer,
  'alquiler-plotters': Ruler,
  'alquiler-escaneres': ScanLine,
  'servicio-tecnico': Wrench,
  tecnologia: Laptop,
  'computadoras-laptop': Laptop,
  laptops: Laptop,
  monitores: Monitor,
  'soluciones-colaboracion': Monitor,
  'soluciones-negocio': Monitor,
  audio: Headphones,
  smartphones: Laptop,
  smartwatches: Laptop,
};

const DEFAULT_ICON = Package;

function findNodeById(
  nodes: StoreCategoryTreeNode[],
  id: string,
): StoreCategoryTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const nested = findNodeById(node.children ?? [], id);
    if (nested) return nested;
  }
  return undefined;
}

function iconForSlug(slug: string): LucideIcon {
  return ICON_BY_SLUG[slug] ?? DEFAULT_ICON;
}

function hasProducts(node: StoreCategoryTreeNode): boolean {
  return (node.productCount ?? 0) > 0;
}

function collectMenuItemsForRoot(root: StoreCategoryTreeNode): MegaMenuNavItem[] {
  const items: MegaMenuNavItem[] = [];
  const children = (root.children ?? []).filter(hasProducts);

  const pushItem = (node: StoreCategoryTreeNode, parentSlug: string, subSlug?: string) => {
    items.push({
      slug: node.slug,
      name: node.name,
      icon: iconForSlug(node.slug),
      href: categoryPath(parentSlug, subSlug ?? null),
      productCount: node.productCount ?? 0,
    });
  };

  if (children.length === 0) {
    if (hasProducts(root)) {
      pushItem(root, root.slug);
    }
    return items;
  }

  for (const child of children) {
    const grandChildren = (child.children ?? []).filter(hasProducts);
    if (grandChildren.length > 0) {
      for (const grand of grandChildren) {
        pushItem(grand, root.slug, grand.slug);
      }
    } else if (hasProducts(child)) {
      pushItem(child, root.slug, child.slug);
    }
  }

  if (items.length === 0 && hasProducts(root)) {
    pushItem(root, root.slug);
  }

  return items;
}

const FALLBACK_COLUMN_IMAGE = '/categories/toner-suministros.png';

function imageForNode(node: StoreCategoryTreeNode, fallbackSlug?: string): string {
  return (
    node.image ??
    megaMenuImageForSlug(node.slug) ??
    (fallbackSlug ? megaMenuImageForSlug(fallbackSlug) : undefined) ??
    FALLBACK_COLUMN_IMAGE
  );
}

function collectColumnGroupsForRoot(root: StoreCategoryTreeNode): MegaMenuColumnGroup[] {
  const groups: MegaMenuColumnGroup[] = [];
  const children = (root.children ?? []).filter(hasProducts);

  if (children.length === 0) {
    if (!hasProducts(root)) return groups;
    groups.push({
      slug: root.slug,
      title: root.name,
      image: imageForNode(root),
      href: categoryPath(root.slug),
      links: [{ name: `Ver ${root.name}`, href: categoryPath(root.slug) }],
    });
    return groups;
  }

  for (const child of children) {
    const grandChildren = (child.children ?? []).filter(hasProducts);

    if (grandChildren.length > 0) {
      groups.push({
        slug: child.slug,
        title: child.name,
        image: imageForNode(child, root.slug),
        href: categoryPath(root.slug, child.slug),
        links: grandChildren.map((grand) => ({
          name: grand.name,
          href: categoryPath(root.slug, grand.slug),
        })),
      });
      continue;
    }

    if (hasProducts(child)) {
      groups.push({
        slug: child.slug,
        title: child.name,
        image: imageForNode(child, root.slug),
        href: categoryPath(root.slug, child.slug),
        links: [{ name: child.name, href: categoryPath(root.slug, child.slug) }],
      });
    }
  }

  return groups;
}

export function buildMegaMenuColumnGroupsForSection(
  sectionId: MegaMenuCatalogSectionId,
  tree: StoreCategoryTreeNode[],
): MegaMenuColumnGroup[] {
  const groups: MegaMenuColumnGroup[] = [];

  for (const rootId of SECTION_ROOT_IDS[sectionId]) {
    const root = findNodeById(tree, rootId);
    if (!root) continue;
    groups.push(...collectColumnGroupsForRoot(root));
  }

  return groups;
}

export function buildMegaMenuFromStoreCategories(
  tree: StoreCategoryTreeNode[],
): { columns: MegaMenuNavColumn[]; sidebarSectionIds: MegaMenuSectionId[] } {
  const columns: MegaMenuNavColumn[] = [];

  for (const sectionId of ['impresion', 'suministros', 'tecnologia'] as const satisfies readonly MegaMenuCatalogSectionId[]) {
    const items: MegaMenuNavItem[] = [];

    for (const rootId of SECTION_ROOT_IDS[sectionId]) {
      const root = findNodeById(tree, rootId);
      if (!root) continue;
      items.push(...collectMenuItemsForRoot(root));
    }

    if (items.length > 0) {
      columns.push({
        id: sectionId,
        title: SECTION_TITLES[sectionId],
        items,
      });
    }
  }

  const sidebarSectionIds: MegaMenuSectionId[] = [
    ...columns.map((column) => column.id),
    'servicios',
    'destacados',
  ];

  return { columns, sidebarSectionIds };
}
