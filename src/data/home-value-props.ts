import {
  Award,
  CircleDollarSign,
  Receipt,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface HomeValueProp {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
}

export const HOME_VALUE_PROPS: HomeValueProp[] = [
  {
    id: 'originales',
    title: 'Equipos 100% originales',
    icon: ShieldCheck,
  },
  {
    id: 'marcas',
    title: 'Marcas líderes del mercado',
    icon: Award,
  },
  {
    id: 'factura',
    title: 'Factura y boleta',
    description: 'Emitimos comprobantes electrónicos',
    icon: Receipt,
  },
  {
    id: 'precios',
    title: 'Precios competitivos',
    description: 'Las mejores ofertas para tu empresa',
    icon: CircleDollarSign,
  },
];
