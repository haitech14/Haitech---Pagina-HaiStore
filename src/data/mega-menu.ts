import type { LucideIcon } from 'lucide-react';
import {
  Copy,
  Cog,
  Droplets,
  Headphones,
  Laptop,
  Monitor,
  Package,
  Printer,
  Ruler,
  Star,
} from 'lucide-react';

export interface MegaMenuLink {
  slug: string;
  name: string;
  icon: LucideIcon;
  href: string;
}

export interface MegaMenuColumn {
  id: MegaMenuSectionId;
  title: string;
  items: MegaMenuLink[];
}

export type MegaMenuSectionId = 'impresion' | 'suministros' | 'tecnologia' | 'destacados';

export const megaMenuSidebar: {
  id: MegaMenuSectionId;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: 'impresion', label: 'Impresión', icon: Printer },
  { id: 'suministros', label: 'Suministros', icon: Package },
  { id: 'tecnologia', label: 'Tecnología', icon: Laptop },
  { id: 'destacados', label: 'Destacados', icon: Star },
];

export const megaMenuColumns: MegaMenuColumn[] = [
  {
    id: 'impresion',
    title: 'Impresión',
    items: [
      { slug: 'multifuncionales', name: 'Multifuncionales', icon: Copy, href: '/tienda' },
      { slug: 'impresoras', name: 'Impresoras', icon: Printer, href: '/tienda' },
      { slug: 'formato-ancho', name: 'Formato Ancho', icon: Ruler, href: '/tienda' },
    ],
  },
  {
    id: 'suministros',
    title: 'Suministros',
    items: [
      {
        slug: 'toner-suministros',
        name: 'Tóner y Suministros',
        icon: Package,
        href: '/tienda',
      },
      { slug: 'repuestos', name: 'Repuestos', icon: Cog, href: '/tienda' },
      {
        slug: 'consumibles-originales',
        name: 'Consumibles Originales',
        icon: Droplets,
        href: '/tienda',
      },
    ],
  },
  {
    id: 'tecnologia',
    title: 'Tecnología',
    items: [
      {
        slug: 'computadoras-laptop',
        name: 'Computadoras y Laptop',
        icon: Laptop,
        href: '/tienda',
      },
      { slug: 'monitores', name: 'Monitores', icon: Monitor, href: '/tienda' },
      { slug: 'accesorios', name: 'Accesorios', icon: Headphones, href: '/tienda' },
    ],
  },
];

export const megaMenuFeatured = {
  title: 'Soluciones para oficina',
  description: 'Equipos, tóners y repuestos con atención especializada.',
  cta: 'Ver catálogo',
  href: '/tienda',
  image: '/hero-bg.png',
  imageAlt: 'Multifuncional y laptop para oficina',
};
