import {
  AlertTriangle,
  BookOpen,
  Cpu,
  Download,
  MessageSquare,
  ShoppingBag,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface ForumHomeCategory {
  id: string;
  title: string;
  description: string;
  href: string;
  topicCount: string;
  icon: LucideIcon;
  iconClass: string;
  brandInitial?: string;
}

export const FORUM_HOME_CATEGORIES: ForumHomeCategory[] = [
  {
    id: 'diagnostico',
    title: 'Diagnóstico y errores',
    description: 'Códigos SC, fallas de impresión y soluciones paso a paso.',
    href: '/foro/preguntas',
    topicCount: '3.2K temas',
    icon: AlertTriangle,
    iconClass: 'bg-red-600 text-white',
  },
  {
    id: 'repuestos',
    title: 'Repuestos',
    description: 'Rodillos, fusores, kits de mantenimiento y compatibilidad.',
    href: '/foro/categoria/hardware',
    topicCount: '1.8K temas',
    icon: Wrench,
    iconClass: 'bg-neutral-800 text-white',
  },
  {
    id: 'firmware',
    title: 'Firmware y drivers',
    description: 'Actualizaciones, controladores y utilidades oficiales.',
    href: '/foro/firmware',
    topicCount: '956 temas',
    icon: Cpu,
    iconClass: 'bg-red-700 text-white',
  },
  {
    id: 'ricoh',
    title: 'Ricoh',
    description: 'IM Series, MP, Pro C y multifuncionales Ricoh.',
    href: '/foro?q=Ricoh',
    topicCount: '2.1K temas',
    icon: MessageSquare,
    iconClass: 'bg-red-600 text-white',
    brandInitial: 'R',
  },
  {
    id: 'canon',
    title: 'Canon',
    description: 'imageRUNNER, imageCLASS y plotters Canon.',
    href: '/foro?q=Canon',
    topicCount: '1.4K temas',
    icon: MessageSquare,
    iconClass: 'bg-neutral-900 text-white',
    brandInitial: 'C',
  },
  {
    id: 'xerox',
    title: 'Xerox',
    description: 'VersaLink, AltaLink y WorkCentre.',
    href: '/foro?q=Xerox',
    topicCount: '890 temas',
    icon: MessageSquare,
    iconClass: 'bg-neutral-700 text-white',
    brandInitial: 'X',
  },
  {
    id: 'toshiba',
    title: 'Toshiba',
    description: 'e-STUDIO y soluciones empresariales Toshiba.',
    href: '/foro?q=Toshiba',
    topicCount: '620 temas',
    icon: MessageSquare,
    iconClass: 'bg-neutral-800 text-white',
    brandInitial: 'T',
  },
  {
    id: 'kyocera',
    title: 'Kyocera',
    description: 'TASKalfa, ECOSYS y componentes de impresión.',
    href: '/foro?q=Kyocera',
    topicCount: '540 temas',
    icon: MessageSquare,
    iconClass: 'bg-red-800 text-white',
    brandInitial: 'K',
  },
];

export interface ForumPopularEquipment {
  rank: number;
  name: string;
  topicCount: number;
  href: string;
  imageUrl?: string;
}

export const FORUM_POPULAR_EQUIPMENT: ForumPopularEquipment[] = [
  { rank: 1, name: 'Ricoh IM C3010', topicCount: 342, href: '/foro?q=IM+C3010' },
  { rank: 2, name: 'Canon imageRUNNER 2625i', topicCount: 287, href: '/foro?q=imageRUNNER+2625' },
  { rank: 3, name: 'Xerox VersaLink C405', topicCount: 198, href: '/foro?q=VersaLink+C405' },
  { rank: 4, name: 'Ricoh MP 3054', topicCount: 176, href: '/foro?q=MP+3054' },
  { rank: 5, name: 'Kyocera TASKalfa 4054ci', topicCount: 142, href: '/foro?q=TASKalfa+4054' },
];

export const FORUM_HEADER_NAV = [
  {
    id: 'foros',
    to: '/foro',
    label: 'Foros',
    end: true,
    icon: MessageSquare,
    matchActive: ({ pathname }: { pathname: string }) => {
      if (!pathname.startsWith('/foro')) return false;
      const pillarPrefixes = ['/foro/tutoriales', '/foro/firmware', '/foro/preguntas'] as const;
      return !pillarPrefixes.some((prefix) => pathname.startsWith(prefix));
    },
  },
  {
    id: 'manuales',
    to: '/foro/tutoriales',
    label: 'Manuales',
    end: true,
    icon: BookOpen,
    matchActive: ({ pathname }: { pathname: string }) => pathname.startsWith('/foro/tutoriales'),
  },
  {
    id: 'drivers',
    to: '/foro/firmware',
    label: 'Drivers',
    end: true,
    icon: Download,
    matchActive: ({ pathname }: { pathname: string }) => pathname.startsWith('/foro/firmware'),
  },
  {
    id: 'soluciones',
    to: '/foro/preguntas',
    label: 'Soluciones',
    end: true,
    icon: AlertTriangle,
    matchActive: ({ pathname }: { pathname: string }) => pathname.startsWith('/foro/preguntas'),
  },
  {
    id: 'mercado',
    to: '/tienda',
    label: 'Mercado',
    end: false,
    icon: ShoppingBag,
    matchActive: ({ pathname }: { pathname: string }) =>
      pathname === '/tienda' || pathname.startsWith('/tienda/'),
  },
] as const;

export type ForumHeaderNavItem = (typeof FORUM_HEADER_NAV)[number];
