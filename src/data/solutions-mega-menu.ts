import type { LucideIcon } from 'lucide-react';
import { Briefcase, Video, Wrench } from 'lucide-react';

import { categories } from '@/data/categories';
import type { MegaMenuStaticColumnGroup } from '@/data/mega-menu';
import { NUESTRAS_SOLUCIONES_ITEMS } from '@/data/nuestras-soluciones';
import { categoryLandingPath } from '@/lib/category-path';

export type SolutionsMegaMenuSectionId = 'colaboracion' | 'negocio' | 'servicios';

export const solutionsMegaMenuSectionMeta: Record<
  SolutionsMegaMenuSectionId,
  { label: string; description: string; icon: LucideIcon }
> = {
  colaboracion: {
    label: 'Colaboración',
    description: 'Videoconferencia y salas de reuniones inteligentes.',
    icon: Video,
  },
  negocio: {
    label: 'Negocio',
    description: 'Infraestructura y tecnología para empresas.',
    icon: Briefcase,
  },
  servicios: {
    label: 'Servicios',
    description: 'Alquiler, soporte técnico, outsourcing y servicios corporativos.',
    icon: Wrench,
  },
};

export const solutionsMegaMenuSidebarIds: SolutionsMegaMenuSectionId[] = [
  'colaboracion',
  'negocio',
  'servicios',
];

const colaboracionCategory = categories.find(
  (category) => category.slug === 'soluciones-colaboracion',
)!;
const negocioCategory = categories.find((category) => category.slug === 'soluciones-negocio')!;

export const solutionsMegaMenuColaboracionColumnGroups: readonly MegaMenuStaticColumnGroup[] = [
  {
    slug: colaboracionCategory.slug,
    title: colaboracionCategory.name,
    image: colaboracionCategory.image ?? '/categories/soluciones-colaboracion.png',
    href: categoryLandingPath(colaboracionCategory.slug),
    links: [
      { name: 'Salas de videoconferencia', href: categoryLandingPath(colaboracionCategory.slug) },
      { name: 'Pantallas interactivas', href: categoryLandingPath(colaboracionCategory.slug) },
      { name: 'Equipos de colaboración', href: categoryLandingPath(colaboracionCategory.slug) },
    ],
  },
];

export const solutionsMegaMenuNegocioColumnGroups: readonly MegaMenuStaticColumnGroup[] = [
  {
    slug: negocioCategory.slug,
    title: negocioCategory.name,
    image: negocioCategory.image ?? '/categories/soluciones-negocio.png',
    href: categoryLandingPath(negocioCategory.slug),
    links: [
      { name: 'Flotas gestionadas', href: categoryLandingPath(negocioCategory.slug) },
      { name: 'Leasing tecnológico', href: categoryLandingPath(negocioCategory.slug) },
      { name: 'Soluciones B2B a medida', href: categoryLandingPath(negocioCategory.slug) },
    ],
  },
];

export const solutionsMegaMenuServiciosColumnGroups: readonly MegaMenuStaticColumnGroup[] = [
  {
    slug: 'operacion',
    title: 'Operación',
    image: '/services/alquiler/impresoras.png',
    href: '/servicios',
    links: NUESTRAS_SOLUCIONES_ITEMS.filter(
      (item) => item.slug === 'alquiler' || item.slug === 'outsourcing',
    ).map((item) => ({ name: item.infoboxTitle, href: item.href })),
  },
  {
    slug: 'soporte',
    title: 'Soporte y corporativo',
    image: '/services/servicio-tecnico/preventivo.png',
    href: '/servicios',
    links: NUESTRAS_SOLUCIONES_ITEMS.filter(
      (item) => item.slug === 'servicio-tecnico' || item.slug === 'servicios-corporativos',
    ).map((item) => ({ name: item.infoboxTitle, href: item.href })),
  },
];

export const solutionsMegaMenuFeatured = {
  title: '¿Compras para tu empresa?',
  subtitle: 'Soluciones B2B a medida',
  image: '/promo-cards/b2b-printer.png',
  imageAlt: 'Multifuncional Ricoh profesional para empresas',
  cta: 'Ver soluciones B2B',
  href: categoryLandingPath('soluciones-negocio'),
};

export interface SolutionsMegaMenuCategorySection {
  id: Exclude<SolutionsMegaMenuSectionId, 'servicios'>;
  name: string;
  tagline: string;
  image: string;
  href: string;
  highlights: string[];
}

export const solutionsMegaMenuCategorySections: readonly SolutionsMegaMenuCategorySection[] = [
  {
    id: 'colaboracion',
    name: colaboracionCategory.name,
    tagline: colaboracionCategory.tagline ?? '',
    image: colaboracionCategory.image ?? '/categories/soluciones-colaboracion.png',
    href: categoryLandingPath(colaboracionCategory.slug),
    highlights: solutionsMegaMenuColaboracionColumnGroups[0].links.map((link) => link.name),
  },
  {
    id: 'negocio',
    name: negocioCategory.name,
    tagline: negocioCategory.tagline ?? '',
    image: negocioCategory.image ?? '/categories/soluciones-negocio.png',
    href: categoryLandingPath(negocioCategory.slug),
    highlights: solutionsMegaMenuNegocioColumnGroups[0].links.map((link) => link.name),
  },
];

export const solutionsMegaMenuServiceItems = NUESTRAS_SOLUCIONES_ITEMS;

export function solutionsMegaMenuColumnGroupsForSection(
  sectionId: SolutionsMegaMenuSectionId,
): readonly MegaMenuStaticColumnGroup[] {
  if (sectionId === 'colaboracion') return solutionsMegaMenuColaboracionColumnGroups;
  if (sectionId === 'negocio') return solutionsMegaMenuNegocioColumnGroups;
  return solutionsMegaMenuServiciosColumnGroups;
}
