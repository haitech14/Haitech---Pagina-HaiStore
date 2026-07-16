import { categoryLandingPath } from '@/lib/category-path';
import type { CatalogFamilySlug } from '@/lib/product-condition';

export type HomeSpotlightFeaturedCard = {
  id: string;
  model: string;
  subtitle: string;
  image: string;
  href: string;
  imageAlt: string;
  /** Bullets bajo el subtítulo (máx. 3 en UI). */
  features?: readonly string[];
};

export type HomeSpotlightThumbCard = {
  id: string;
  model: string;
  brand: string;
  image: string;
  href: string;
  imageAlt: string;
  /** Badge opcional (p. ej. premio BLI). */
  badgeImage?: string;
};

export type HomeCategorySpotlightConfig = {
  id: string;
  title: string;
  sectionSubtitle: string;
  /** Familia del home-bundle (si existe) o filtro por texto de categoría. */
  catalogFamily?: CatalogFamilySlug;
  categoryMatch: RegExp;
  bestsellersTitle: string;
  categoryHref: string;
  featured: readonly [HomeSpotlightFeaturedCard, HomeSpotlightFeaturedCard];
  thumbs: readonly HomeSpotlightThumbCard[];
};

export const HOME_CATEGORY_SPOTLIGHTS: readonly HomeCategorySpotlightConfig[] = [
  {
    id: 'multifuncionales',
    title: 'MULTIFUNCIONALES',
    sectionSubtitle: 'Tecnología, eficiencia y calidad para tu oficina',
    catalogFamily: 'multifuncionales',
    categoryMatch: /multifuncional/i,
    bestsellersTitle: 'Lo más vendido en multifuncionales',
    categoryHref: categoryLandingPath('multifuncionales'),
    featured: [
      {
        id: 'im-7000',
        model: 'IM 7000',
        subtitle: 'Multifuncional B/N A3',
        image: '/products/c44519d7-f600-43e5-8c08-b51f56d88b03.webp',
        href: '/tienda/impresora-multifuncional-nueva-ricoh-im-7000-b51f56d88b03',
        imageAlt: 'Multifuncional Ricoh IM 7000 blanco y negro A3',
        features: ['Hasta 70 ppm', 'Formato A3', 'Alta productividad'],
      },
      {
        id: 'im-c6010',
        model: 'IM C6010',
        subtitle: 'Multifuncional a color A3',
        image: '/products/e1bffdf0-3515-468e-859a-990d1cb12561.webp',
        href: '/tienda/impresora-multifuncional-nueva-ricoh-im-c6010-990d1cb12561',
        imageAlt: 'Multifuncional Ricoh IM C6010 color A3',
        features: ['Color profesional', 'Formato A3', 'Panel táctil'],
      },
    ],
    thumbs: [
      {
        id: 'im-c401f',
        model: 'IM C401F',
        brand: 'RICOH',
        image: '/products/5a142c47-521c-47af-92ec-dda8808907c9.webp',
        href: '/tienda/impresora-multifuncional-nueva-ricoh-im-c401f-dda8808907c9',
        imageAlt: 'Multifuncional Ricoh IM C401F',
      },
      {
        id: 'im-c320f',
        model: 'IM C320F',
        brand: 'RICOH',
        image: '/products/481dbc77-436b-464d-b76f-930f7d79f4ff.webp',
        href: '/tienda/impresora-multifuncional-nueva-ricoh-im-c320f-930f7d79f4ff',
        imageAlt: 'Multifuncional Ricoh IM C320F',
      },
      {
        id: 'im-430f',
        model: 'IM 430F',
        brand: 'RICOH',
        image: '/products/ricoh-im-430f.webp',
        href: '/tienda/ricoh-im-430f',
        imageAlt: 'Multifuncional Ricoh IM 430F',
      },
      {
        id: 'im-550f',
        model: 'IM 550F',
        brand: 'RICOH',
        image: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
        href: '/tienda/impresora-multifuncional-nueva-ricoh-im-550f-e1db5bdf73fb',
        imageAlt: 'Multifuncional Ricoh IM 550F',
      },
    ],
  },
  {
    id: 'impresoras',
    title: 'IMPRESORAS',
    sectionSubtitle: 'Velocidad y confiabilidad para tu día a día',
    catalogFamily: 'impresoras',
    categoryMatch: /impresor/i,
    bestsellersTitle: 'Lo más vendido en impresoras',
    categoryHref: categoryLandingPath('impresoras'),
    featured: [
      {
        id: 'p-800',
        model: 'P 800',
        subtitle: 'Impresora láser B/N A4',
        image: '/products/73ab69b8-602b-4203-a389-070ef7bb80b0.webp',
        href: '/tienda/impresora-laser-b-n-nueva-ricoh-p-800-070ef7bb80b0',
        imageAlt: 'Impresora láser Ricoh P 800',
        features: ['Alta velocidad', 'Formato A4', 'Bajo costo por página'],
      },
      {
        id: 'p-502',
        model: 'P 502',
        subtitle: 'Impresora láser B/N A4',
        image: '/products/cece2c48-e44a-4b93-a11a-7e8b244ad8ea.webp',
        href: '/tienda/impresora-laser-b-n-nueva-ricoh-p-502-7e8b244ad8ea',
        imageAlt: 'Impresora láser Ricoh P 502',
        features: ['Compacta', 'Formato A4', 'Ideal para oficina'],
      },
    ],
    thumbs: [
      {
        id: 'p-311',
        model: 'P 311',
        brand: 'RICOH',
        image: '/products/3ae7db52-6563-40c8-8436-d881a3eb283c.webp',
        href: '/tienda/impresora-laser-b-n-nueva-ricoh-p-311-d881a3eb283c',
        imageAlt: 'Impresora láser Ricoh P 311',
      },
      {
        id: 'p-801',
        model: 'P 801',
        brand: 'RICOH',
        image: '/products/be3457a0-76dd-4cf7-beca-31ad9aa7f541.webp',
        href: '/tienda/impresora-laser-b-n-nueva-ricoh-p-801-31ad9aa7f541',
        imageAlt: 'Impresora láser Ricoh P 801',
      },
      {
        id: 'p-c600',
        model: 'P C600',
        brand: 'RICOH',
        image: '/products/d53b0f11-e996-4f06-8857-13fc8a6d9eb8.webp',
        href: '/tienda/impresora-laser-nueva-ricoh-p-c600-220v-13fc8a6d9eb8',
        imageAlt: 'Impresora láser color Ricoh P C600',
      },
      {
        id: 'p-502-b',
        model: 'P 502',
        brand: 'RICOH',
        image: '/home/category-chips/equipment/impresora-laser.png',
        href: categoryLandingPath('impresoras'),
        imageAlt: 'Impresoras láser Ricoh',
      },
    ],
  },
  {
    id: 'escaneres',
    title: 'ESCÁNERES',
    sectionSubtitle: 'Digitaliza documentos con precisión y velocidad',
    categoryMatch: /esc[aá]ner/i,
    bestsellersTitle: 'Lo más vendido en escáneres',
    categoryHref: categoryLandingPath('escaneres'),
    featured: [
      {
        id: 'ix-1600',
        model: 'iX1600',
        subtitle: 'Escáner de documentos',
        image: '/products/ricoh-scansnap-ix-2500.webp',
        href: '/tienda/escaner-nuevo-ricoh-scansnap-ix-1600-78dadda32982',
        imageAlt: 'Escáner Ricoh ScanSnap iX1600',
        features: ['Alimentador automático', 'Wi-Fi', 'Escaneo a la nube'],
      },
      {
        id: 'sv-600',
        model: 'SV600',
        subtitle: 'Escáner de sobremesa',
        image: '/products/ricoh-scansnap-sv-600.webp',
        href: '/tienda/escaner-nuevo-ricoh-scansnap-sv-600-c2ec2e4fd55b',
        imageAlt: 'Escáner Ricoh ScanSnap SV600',
        features: ['Sin contacto', 'Libros y planos', 'Escaneo rápido'],
      },
    ],
    thumbs: [
      {
        id: 'ix-1300',
        model: 'iX1300',
        brand: 'RICOH',
        image: '/products/ricoh-scansnap-ix-1300.webp',
        href: '/tienda/escaner-nuevo-ricoh-scansnap-ix-1300-4ee80ffe633e',
        imageAlt: 'Escáner Ricoh ScanSnap iX1300',
      },
      {
        id: 'ix-2500',
        model: 'iX2500',
        brand: 'RICOH',
        image: '/products/ricoh-scansnap-ix-2500.webp',
        href: '/tienda/escaner-nuevo-ricoh-scansnap-ix-2500-328517923660',
        imageAlt: 'Escáner Ricoh ScanSnap iX2500',
      },
      {
        id: 'sp-1120n',
        model: 'SP 1120N',
        brand: 'RICOH',
        image: '/products/ricoh-sp-1120n.webp',
        href: '/tienda/escaner-nuevo-ricoh-sp-1120n-ce231f70970c',
        imageAlt: 'Escáner Ricoh SP 1120N',
      },
      {
        id: 'fi-8170',
        model: 'fi-8170',
        brand: 'RICOH',
        image: '/products/ricoh-fi-8170.webp',
        href: '/tienda/escaner-nuevo-ricoh-fi-8170-95b372236905',
        imageAlt: 'Escáner Ricoh fi-8170',
      },
    ],
  },
  {
    id: 'formato-ancho',
    title: 'FORMATO ANCHO',
    sectionSubtitle: 'Plotters y equipos para planos y gran formato',
    categoryMatch: /formato ancho|plotter/i,
    bestsellersTitle: 'Lo más vendido en formato ancho',
    categoryHref: categoryLandingPath('formato-ancho'),
    featured: [
      {
        id: 'im-cw2200',
        model: 'IM CW2200',
        subtitle: 'Plotter multifuncional color',
        image: '/products/plotter-laser-color-ricoh-im-cw2200.webp',
        href: '/tienda/plotter-multifuncional-laser-color-nuevo-ricoh-im-cw2200-4f977d63',
        imageAlt: 'Plotter Ricoh IM CW2200',
        features: ['Impresión color', 'Gran formato', 'Uso profesional'],
      },
      {
        id: 'formato-ancho-cat',
        model: 'Gran formato',
        subtitle: 'Plotters y multifuncionales de planos',
        image: '/categories/formato-ancho.png',
        href: categoryLandingPath('formato-ancho'),
        imageAlt: 'Equipos de formato ancho',
        features: ['Planos técnicos', 'Alta precisión', 'Variedad de modelos'],
      },
    ],
    thumbs: [
      {
        id: 'cw-1',
        model: 'IM CW2200',
        brand: 'RICOH',
        image: '/products/plotter-laser-color-ricoh-im-cw2200.webp',
        href: '/tienda/plotter-multifuncional-laser-color-nuevo-ricoh-im-cw2200-4f977d63',
        imageAlt: 'Plotter Ricoh IM CW2200',
      },
      {
        id: 'cw-2',
        model: 'MP CW2200',
        brand: 'RICOH',
        image: '/home/category-chips/equipment/plotter.png',
        href: categoryLandingPath('formato-ancho'),
        imageAlt: 'Plotter Ricoh MP CW2200',
      },
      {
        id: 'cw-3',
        model: 'TX 3200',
        brand: 'CANON',
        image: '/home/category-chips/equipment/formato-ancho.png',
        href: categoryLandingPath('formato-ancho'),
        imageAlt: 'Plotter Canon TX 3200',
      },
      {
        id: 'cw-4',
        model: 'TX 4200',
        brand: 'CANON',
        image: '/categories/formato-ancho.png',
        href: categoryLandingPath('formato-ancho'),
        imageAlt: 'Plotter Canon TX 4200',
      },
    ],
  },
];
