import {
  CalendarDays,
  Droplets,
  Printer,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';

import { HOME_LANDING_LINKS } from '@/data/home-landing-sections';

export interface HomeHeroServiceBarItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
}

/** Franja flotante a altura del hero (ventas, alquiler, servicio, consumibles, repuestos). */
export const HOME_HERO_SERVICES_BAR: HomeHeroServiceBarItem[] = [
  {
    id: 'venta',
    title: 'Venta de Equipos',
    subtitle: 'Las mejores marcas.',
    href: HOME_LANDING_LINKS.allProducts,
    icon: Printer,
  },
  {
    id: 'alquiler',
    title: 'Alquiler y Leasing',
    subtitle: 'Planes flexibles.',
    href: HOME_LANDING_LINKS.rentalCatalog,
    icon: CalendarDays,
  },
  {
    id: 'servicio',
    title: 'Servicio Técnico',
    subtitle: 'Soporte 24/7.',
    href: HOME_LANDING_LINKS.technicalService,
    icon: SlidersHorizontal,
  },
  {
    id: 'consumibles',
    title: 'Consumibles',
    subtitle: 'Originales y compatibles.',
    href: HOME_LANDING_LINKS.tonerCatalog,
    icon: Droplets,
  },
  {
    id: 'repuestos',
    title: 'Repuestos',
    subtitle: 'Calidad garantizada.',
    href: HOME_LANDING_LINKS.sparePartsCatalog,
    icon: ShieldCheck,
  },
];
