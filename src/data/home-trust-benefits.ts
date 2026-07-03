import { Headphones, ShieldCheck, Truck, Users, type LucideIcon } from 'lucide-react';

export interface HomeTrustBenefit {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const HOME_TRUST_BENEFITS: HomeTrustBenefit[] = [
  {
    id: 'envios',
    title: 'Envíos rápidos',
    description: 'A todo el país en 24/48 hs.',
    icon: Truck,
  },
  {
    id: 'soporte',
    title: 'Soporte técnico',
    description: 'Especialistas siempre listos',
    icon: Headphones,
  },
  {
    id: 'garantia',
    title: 'Garantía asegurada',
    description: 'Equipos y repuestos originales',
    icon: ShieldCheck,
  },
  {
    id: 'atencion',
    title: 'Atención personalizada',
    description: 'Asesoramiento a medida',
    icon: Users,
  },
];
