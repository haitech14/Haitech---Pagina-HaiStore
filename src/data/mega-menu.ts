import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Headphones,
  KeyRound,
  Laptop,
  Package,
  Printer,
  Star,
  Wrench,
} from 'lucide-react';

import { categoryPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';

export type MegaMenuSectionId =
  | 'impresion'
  | 'suministros'
  | 'tecnologia'
  | 'servicios'
  | 'destacados';

export const megaMenuSectionMeta: Record<
  MegaMenuSectionId,
  { label: string; description: string; icon: LucideIcon }
> = {
  impresion: {
    label: 'Impresión',
    description: 'Multifuncionales, impresoras, escáneres y formato ancho.',
    icon: Printer,
  },
  suministros: {
    label: 'Suministros',
    description: 'Tóner, repuestos, alquiler y consumibles certificados.',
    icon: Package,
  },
  tecnologia: {
    label: 'Tecnología',
    description: 'Computadoras, monitores y soluciones para tu oficina.',
    icon: Laptop,
  },
  servicios: {
    label: 'Servicios',
    description: 'Alquiler, soporte técnico, outsourcing y soluciones corporativas.',
    icon: Wrench,
  },
  destacados: {
    label: 'Destacados',
    description: 'Accesos rápidos a las categorías más consultadas.',
    icon: Star,
  },
};

export interface MegaMenuServiceLink {
  slug: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const megaMenuServiceLinks: readonly MegaMenuServiceLink[] = [
  {
    slug: 'alquiler',
    label: 'Alquiler',
    description: 'Equipos flexibles para tu operación',
    href: serviceHubPath('alquiler'),
    icon: KeyRound,
  },
  {
    slug: 'servicio-tecnico',
    label: 'Soporte Técnico',
    description: 'Mantenimiento y reparación especializada',
    href: serviceHubPath('servicio-tecnico'),
    icon: Headphones,
  },
  {
    slug: 'outsourcing',
    label: 'Outsourcing',
    description: 'Personal y gestión operativa',
    href: serviceHubPath('outsourcing'),
    icon: Briefcase,
  },
  {
    slug: 'servicios-corporativos',
    label: 'Servicios Corporativos',
    description: 'Eventos, digital y capacitación',
    href: serviceHubPath('servicios-corporativos'),
    icon: Wrench,
  },
];

export interface MegaMenuHighlightCategory {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  href: string;
}

export const megaMenuHighlightCategories: readonly MegaMenuHighlightCategory[] = [
  {
    slug: 'multifuncionales',
    name: 'Multifuncionales',
    tagline: 'Imprime, escanea y copia',
    image: '/categories/multifuncionales.png',
    href: categoryPath('multifuncionales'),
  },
  {
    slug: 'toner-suministros',
    name: 'Suministros',
    tagline: 'Tóner original, remanufacturado y recargas',
    image: '/categories/toner-suministros.png',
    href: categoryPath('toner-suministros'),
  },
  {
    slug: 'repuestos',
    name: 'Repuestos',
    tagline: 'Partes y componentes',
    image: '/categories/repuestos.png',
    href: categoryPath('repuestos'),
  },
  {
    slug: 'servicio-tecnico',
    name: 'Servicio Técnico',
    tagline: 'Soporte especializado',
    image: '/categories/servicio-tecnico.png',
    href: categoryPath('servicio-tecnico'),
  },
  {
    slug: 'computadoras-laptop',
    name: 'Computadoras',
    tagline: 'Laptops y desktops',
    image: '/categories/computadoras-laptop.png',
    href: categoryPath('computadoras-laptop'),
  },
];

export interface MegaMenuStaticColumnGroup {
  slug: string;
  title: string;
  image: string;
  href: string;
  links: { name: string; href: string }[];
}

export const megaMenuDestacadosColumnGroups: readonly MegaMenuStaticColumnGroup[] =
  megaMenuHighlightCategories.map((category) => ({
    slug: category.slug,
    title: category.name,
    image: category.image,
    href: category.href,
    links: [
      { name: category.tagline, href: category.href },
      { name: 'Ver catálogo', href: category.href },
    ],
  }));

export const megaMenuServiciosColumnGroups: readonly MegaMenuStaticColumnGroup[] = [
  {
    slug: 'operacion',
    title: 'Operación',
    image: '/categories/alquiler.png',
    href: '/servicios',
    links: megaMenuServiceLinks
      .filter((service) => service.slug === 'alquiler' || service.slug === 'outsourcing')
      .map((service) => ({ name: service.label, href: service.href })),
  },
  {
    slug: 'soporte',
    title: 'Soporte',
    image: '/categories/servicio-tecnico.png',
    href: serviceHubPath('servicio-tecnico'),
    links: megaMenuServiceLinks
      .filter(
        (service) =>
          service.slug === 'servicio-tecnico' || service.slug === 'servicios-corporativos',
      )
      .map((service) => ({ name: service.label, href: service.href })),
  },
];

/** Imagen de categoría por slug (subcategorías incluidas). */
export const megaMenuCategoryImages: Record<string, string> = {
  multifuncionales: '/categories/multifuncionales.png',
  impresoras: '/categories/impresoras.png',
  'formato-ancho': '/categories/formato-ancho.png',
  'toner-suministros': '/categories/toner-suministros.png',
  'toner-compatibles': '/categories/toner-suministros.png',
  'toner-originales': '/categories/accesorios-impresoras.png',
  'toner-remanufacturado': '/categories/toner-suministros.png',
  'toner-recarga': '/categories/toner-suministros.png',
  toner: '/categories/toner-suministros.png',
  repuestos: '/categories/repuestos.png',
  'servicio-tecnico': '/categories/servicio-tecnico.png',
  escaneres: '/categories/escaneres.png',
  camaras: '/categories/camaras.png',
  alquiler: '/categories/alquiler.png',
  tecnologia: '/categories/computadoras-laptop.png',
  accesorios: '/categories/accesorios-impresoras.png',
  monitores: '/categories/monitores.png',
  'computadoras-laptop': '/categories/computadoras-laptop.png',
  'soluciones-colaboracion': '/categories/soluciones-colaboracion.png',
  'soluciones-negocio': '/categories/soluciones-negocio.png',
  'equipos-de-oficina': '/categories/repuestos.png',
  'equipamiento-videoconferencias': '/categories/soluciones-colaboracion.png',
  software: '/categories/soluciones-negocio.png',
};

export function megaMenuImageForSlug(slug: string): string | undefined {
  if (megaMenuCategoryImages[slug]) return megaMenuCategoryImages[slug];
  const root = slug.split('-')[0];
  return megaMenuCategoryImages[root];
}
