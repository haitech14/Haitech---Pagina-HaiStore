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
  Wrench,
  Camera,
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
    inventoryCategories: [
      'Multifuncionales',
      'Multifuncionales Nuevas',
      'Multifuncionales, Multifuncionales Nuevas',
      'Multifuncionales Seminuevas',
      'Multifuncionales, Multifuncionales Seminuevas',
      'Multifuncionales Remanufacturadas',
      'Multifuncionales, Multifuncionales Remanufacturadas',
    ],
  },
  {
    slug: 'impresoras',
    name: 'Impresoras',
    tagline: 'Láser, inkjet y soluciones de impresión',
    icon: Printer,
    inventoryCategories: [
      'Impresoras',
      'Impresoras Laser Nuevas',
      'Impresoras Láser Nuevas',
      'Impresoras, Impresoras Laser Nuevas',
      'Impresoras, Impresoras Láser Nuevas',
    ],
    image: '/categories/impresoras.png',
  },
  {
    slug: 'formato-ancho',
    name: 'Formato Ancho',
    tagline: 'Plotters y equipos para gran formato',
    icon: Ruler,
    inventoryCategories: [
      'Formato Ancho',
      'Plotter y Multifuncional de Planos',
    ],
    image: '/categories/formato-ancho.png',
  },
  {
    slug: 'toner-compatibles',
    name: 'Tóner Compatible',
    tagline: 'Cartuchos compatibles y alternativos',
    icon: PackageOpen,
    image: '/categories/toner-suministros.png',
    inventoryCategories: [
      'Toner Compatible',
      'Toner, Toner Compatible',
      'Toner y Suministros, Toner Compatible',
      'Suministros, Toner Compatible',
      'Toner Compatibles',
      'Toner, Toner Compatibles',
      'Toner Compatibles HaiPrint',
      'Toner Compatibles Haitone',
    ],
  },
  {
    slug: 'repuestos',
    name: 'Repuestos',
    tagline: 'Partes y componentes para impresoras',
    icon: Cog,
    image: '/categories/repuestos.png',
    inventoryCategories: [
      'Repuestos',
      'Repuestos Originales',
      'Repuestos, Repuestos Originales',
    ],
  },
  {
    slug: 'accesorios',
    name: 'Accesorios',
    tagline: 'Bandejas, finisher y complementos para impresoras',
    icon: PackageOpen,
    image: '/categories/accesorios-impresoras.png',
    inventoryCategories: ['Accesorios'],
  },
  {
    slug: 'servicio-tecnico',
    name: 'Servicio Técnico',
    tagline: 'Mantenimiento, instalación y soporte especializado',
    icon: Wrench,
    image: '/categories/servicio-tecnico.png',
  },
  {
    slug: 'escaneres',
    name: 'Escáneres',
    tagline: 'Digitalización rápida y precisa de documentos',
    icon: ScanLine,
    image: '/categories/escaneres.png',
    inventoryCategories: ['Escáneres'],
  },
  {
    slug: 'camaras',
    name: 'Cámaras',
    tagline: 'Videovigilancia, grabación y seguridad',
    icon: Camera,
    image: '/categories/camaras.png',
    inventoryCategories: ['Cámaras'],
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
    inventoryCategories: ['Computadoras y Laptop', 'Computadoras Laptop', 'Laptops'],
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

/** Categorías visibles en home («Explora nuestras categorías») y mega menú Productos. */
const LANDING_MENU_HIDDEN_SLUGS = new Set<string>(['servicio-tecnico']);

export const landingMenuCategories = categories.filter(
  (category) => !LANDING_MENU_HIDDEN_SLUGS.has(category.slug),
);
