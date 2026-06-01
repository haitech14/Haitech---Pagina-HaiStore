import {
  Briefcase,
  Copy,
  Printer,
  Ruler,
  PackageOpen,
  Cog,
  Laptop,
  Monitor,
  ScanLine,
  Video,
  type LucideIcon,
} from 'lucide-react';

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  image?: string;
  /** Nombres de categoría en inventario que coinciden con esta tarjeta. */
  inventoryCategories?: string[];
}

export const categories: Category[] = [
  {
    slug: 'multifuncionales',
    name: 'Multifuncionales',
    tagline: 'Imprime, escanea y copia en un solo equipo',
    icon: Copy,
    image: '/categories/multifuncionales.png',
    inventoryCategories: ['Multifuncionales', 'Multifuncionales Nuevas'],
  },
  {
    slug: 'impresoras',
    name: 'Impresoras',
    tagline: 'Láser, inkjet y soluciones de impresión',
    icon: Printer,
    image: '/categories/impresoras.png',
  },
  {
    slug: 'formato-ancho',
    name: 'Formato Ancho',
    tagline: 'Plotters y equipos para gran formato',
    icon: Ruler,
    image: '/categories/formato-ancho.png',
  },
  {
    slug: 'toner-suministros',
    name: 'Toner y Suministros',
    tagline: 'Consumibles originales y compatibles',
    icon: PackageOpen,
    image: '/categories/toner-suministros.png',
    inventoryCategories: ['Toner y suministros', 'Tóner y Suministros'],
  },
  {
    slug: 'repuestos',
    name: 'Repuestos',
    tagline: 'Partes y componentes para impresoras',
    icon: Cog,
    image: '/categories/repuestos.png',
  },
  {
    slug: 'escaneres',
    name: 'Escáneres',
    tagline: 'Digitalización rápida y precisa de documentos',
    icon: ScanLine,
    image: '/categories/escaneres.png',
  },
  {
    slug: 'soluciones-colaboracion',
    name: 'Soluciones de Colaboración',
    tagline: 'Videoconferencia y salas de reuniones inteligentes',
    icon: Video,
    image: '/categories/soluciones-colaboracion.png',
  },
  {
    slug: 'soluciones-negocio',
    name: 'Soluciones de Negocio',
    tagline: 'Infraestructura y tecnología para empresas',
    icon: Briefcase,
    image: '/categories/soluciones-negocio.png',
  },
  {
    slug: 'computadoras-laptop',
    name: 'Computadoras y Laptop',
    tagline: 'Equipos de cómputo y accesorios',
    icon: Laptop,
    image: '/categories/computadoras-laptop.png',
  },
  {
    slug: 'monitores',
    name: 'Monitores',
    tagline: 'Pantallas para oficina y productividad',
    icon: Monitor,
    image: '/categories/monitores.png',
  },
];
