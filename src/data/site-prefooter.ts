import { Headset, ShieldCheck, Tag, Truck, type LucideIcon } from 'lucide-react';

export type SitePrefooterItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

/** Franja de confianza encima del footer (rojo / negro). */
export const SITE_PREFOOTER_ITEMS: readonly SitePrefooterItem[] = [
  {
    id: 'equipos-originales',
    title: 'Equipos Originales',
    description: 'Tecnología Ricoh 100% original.',
    icon: Tag,
  },
  {
    id: 'garantia-extendida',
    title: 'Garantía Extendida',
    description: 'Respaldo oficial y servicio postventa.',
    icon: ShieldCheck,
  },
  {
    id: 'asesoria-personalizada',
    title: 'Asesoría Personalizada',
    description: 'Te ayudamos a elegir el equipo ideal.',
    icon: Headset,
  },
  {
    id: 'cobertura-nacional',
    title: 'Cobertura Nacional',
    description: 'Entrega e instalación en todo el Perú.',
    icon: Truck,
  },
] as const;
