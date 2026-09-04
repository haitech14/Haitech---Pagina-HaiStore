import { BookOpen, MapPin, Printer, ShieldCheck, type LucideIcon } from 'lucide-react';

export type SitePrefooterItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Enlace SEO contextual (landings competitivas). */
  href?: string;
};

/** Franja de confianza encima del footer (rojo / negro) + enlaces a hubs SEO. */
export const SITE_PREFOOTER_ITEMS: readonly SitePrefooterItem[] = [
  {
    id: 'fotocopiadoras-peru',
    title: 'Fotocopiadoras en Perú',
    description: 'Venta y alquiler Ricoh con canal autorizado.',
    icon: Printer,
    href: '/fotocopiadoras-peru',
  },
  {
    id: 'distribuidor-autorizado',
    title: 'Distribuidor Autorizado',
    description: 'Respaldo oficial Ricoh, garantía y postventa.',
    icon: ShieldCheck,
    href: '/distribuidor-autorizado-ricoh',
  },
  {
    id: 'alquiler-lima',
    title: 'Alquiler en Lima',
    description: 'Planes mensuales con soporte técnico.',
    icon: MapPin,
    href: '/alquiler-fotocopiadoras-lima',
  },
  {
    id: 'guias-modelos',
    title: 'Guías y modelos',
    description: 'Elige multifuncional, tóner y equipos top.',
    icon: BookOpen,
    href: '/guias',
  },
] as const;

/** Enlaces SEO adicionales bajo la franja (compactos). */
export const SITE_PREFOOTER_SEO_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Fotocopiadoras Ricoh', href: '/fotocopiadoras-ricoh' },
  { label: 'Tóner Ricoh', href: '/toner-ricoh' },
  { label: 'Modelos destacados', href: '/modelos' },
  { label: 'Por qué comprarnos', href: '/por-que-comprar-con-nosotros' },
  { label: 'Empresas / contacto', href: '/contacto' },
];
