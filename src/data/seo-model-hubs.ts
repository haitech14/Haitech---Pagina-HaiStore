import { categoryLandingPath } from '@/lib/category-path';
import { productPath } from '@/lib/product-path';

export type SeoModelHubProductLink = {
  label: string;
  /** Slug de producto en `/tienda/{slug}` */
  productSlug: string;
  condition?: 'nuevo' | 'seminuevo';
};

export type SeoModelHub = {
  slug: string;
  modelName: string;
  title: string;
  description: string;
  pageName: string;
  h1: string;
  lead: string;
  bullets: string[];
  paragraphs: string[];
  categoryHref: string;
  products: SeoModelHubProductLink[];
  relatedModelSlugs: string[];
};

export const SEO_MODEL_HUBS: SeoModelHub[] = [
  {
    slug: 'im-550f',
    modelName: 'RICOH IM 550F',
    title: 'Ricoh IM 550F | Haitech',
    description:
      'Ricoh IM 550F: multifuncional B/N A4 de alto volumen. Compra nuevo o seminuevo con Distribuidor Autorizado HaiStore. Tóner, instalación y soporte en Perú.',
    pageName: 'Ricoh IM 550F',
    h1: 'Ricoh IM 550F',
    lead:
      'La IM 550F es una multifuncional monocromo A4 pensada para oficinas con alto flujo de impresión, copia y escaneo. En HaiStore la encuentras nueva o seminueva con asesoría de canal autorizado.',
    bullets: [
      'Impresión / copia / escaneo en blanco y negro A4',
      'Ideal para volúmenes altos de oficina',
      'Stock nuevo y seminuevo según disponibilidad',
      'Tóner y servicio técnico Ricoh disponibles',
    ],
    paragraphs: [
      'Si estás comparando la IM 550F frente a otras series IM, evalúa páginas mensuales, bandejas y si necesitas SPDF. Cotiza instalación en Lima y reposición de tóner desde el mismo canal.',
      'Explora fichas de producto abajo o la categoría de multifuncionales para ver precios y stock actualizados.',
    ],
    categoryHref: categoryLandingPath('multifuncionales'),
    products: [
      {
        label: 'IM 550F nueva',
        productSlug: 'impresora-multifuncional-nueva-ricoh-im-550f-e1db5bdf73fb',
        condition: 'nuevo',
      },
      {
        label: 'IM 550F seminueva 220V',
        productSlug: 'impresora-multifuncional-seminueva-ricoh-im-550f-220v-51b4c98fe9d2',
        condition: 'seminuevo',
      },
    ],
    relatedModelSlugs: ['im-430f', 'im-460f', 'im-600f'],
  },
  {
    slug: 'im-430f',
    modelName: 'RICOH IM 430F',
    title: 'Ricoh IM 430F | Haitech',
    description:
      'Ricoh IM 430F: multifuncional B/N compacta para oficina. Venta nueva y seminueva con Distribuidor Autorizado HaiStore en Perú.',
    pageName: 'Ricoh IM 430F',
    h1: 'Ricoh IM 430F',
    lead:
      'La IM 430F equilibra productividad y tamaño para oficinas que necesitan un multifuncional confiable en blanco y negro.',
    bullets: [
      'Multifuncional B/N A4',
      'Buena opción para oficinas medianas',
      'Disponible nueva y seminueva',
      'Compatible con ecosistema de tóner Ricoh',
    ],
    paragraphs: [
      'Compara la IM 430F con la IM 550F si tu volumen es más alto, o con equipos color si tu flujo lo requiere. Cotiza con HaiStore, Distribuidor Autorizado Ricoh.',
    ],
    categoryHref: categoryLandingPath('multifuncionales'),
    products: [
      {
        label: 'IM 430F nueva',
        productSlug: 'ricoh-im-430f',
        condition: 'nuevo',
      },
      {
        label: 'IM 430F seminueva 220V',
        productSlug: 'impresora-multifuncional-seminueva-ricoh-im-430f-220v-8aa6a308bd1d',
        condition: 'seminuevo',
      },
    ],
    relatedModelSlugs: ['im-550f', 'im-460f'],
  },
  {
    slug: 'im-c300f',
    modelName: 'RICOH IM C300F',
    title: 'Ricoh IM C300F | Haitech',
    description:
      'Ricoh IM C300F color A4 con SPDF. Compra nueva o seminueva en HaiStore, Distribuidor Autorizado Ricoh en Perú.',
    pageName: 'Ricoh IM C300F',
    h1: 'Ricoh IM C300F',
    lead:
      'Multifuncional color compacta para oficinas que necesitan impresión a color, escaneo dúplex de una pasada (SPDF) y conectividad moderna.',
    bullets: ['Color A4', 'SPDF / doble scan', 'Nueva y seminueva', 'Tóner color disponible'],
    paragraphs: [
      'Si tu volumen de color es mayor, también revisa la IM C320F. Cotiza tóner y garantía con nuestro equipo comercial.',
    ],
    categoryHref: categoryLandingPath('multifuncionales'),
    products: [
      {
        label: 'IM C300F seminueva',
        productSlug: 'impresora-multifuncional-seminueva-ricoh-im-c300f-94dcb40fd67c',
        condition: 'seminuevo',
      },
      {
        label: 'IM C300F nueva',
        productSlug: 'impresora-multifuncional-nueva-ricoh-im-c300f-442fe09a',
        condition: 'nuevo',
      },
    ],
    relatedModelSlugs: ['im-c320f', 'im-c2000'],
  },
  {
    slug: 'im-c320f',
    modelName: 'RICOH IM C320F',
    title: 'Ricoh IM C320F | Haitech',
    description:
      'Ricoh IM C320F multifuncional a color. Venta con Distribuidor Autorizado HaiStore: stock, tóner e instalación en Perú.',
    pageName: 'Ricoh IM C320F',
    h1: 'Ricoh IM C320F',
    lead:
      'La IM C320F es una opción color de oficina con productividad equilibrada. Consulta disponibilidad nueva en HaiStore.',
    bullets: ['Color para oficina', 'Ecosistema Ricoh', 'Asesoría de canal autorizado'],
    paragraphs: [
      'Compara con IM C300F si buscas un equipo más compacto, o con series A3 si necesitas formato grande.',
    ],
    categoryHref: categoryLandingPath('multifuncionales'),
    products: [
      {
        label: 'IM C320F nueva',
        productSlug: 'impresora-multifuncional-nueva-ricoh-im-c320f-930f7d79f4ff',
        condition: 'nuevo',
      },
    ],
    relatedModelSlugs: ['im-c300f', 'im-c2000'],
  },
  {
    slug: 'im-460f',
    modelName: 'RICOH IM 460F',
    title: 'Ricoh IM 460F | Haitech',
    description:
      'Ricoh IM 460F multifuncional monocromo. Compra con Distribuidor Autorizado HaiStore en Perú.',
    pageName: 'Ricoh IM 460F',
    h1: 'Ricoh IM 460F',
    lead:
      'Equipo pensado para oficinas que priorizan velocidad y robustez en blanco y negro. Cotiza stock y tóner en HaiStore.',
    bullets: ['B/N de oficina', 'Canal autorizado Ricoh', 'Soporte y consumibles'],
    paragraphs: ['Compara con IM 550F e IM 430F según tu volumen mensual estimado.'],
    categoryHref: categoryLandingPath('multifuncionales'),
    products: [
      {
        label: 'IM 460F nueva',
        productSlug: 'impresora-multifuncional-nueva-ricoh-im-460f-eb3d259fadb5',
        condition: 'nuevo',
      },
    ],
    relatedModelSlugs: ['im-550f', 'im-430f', 'im-600f'],
  },
  {
    slug: 'mp-3055',
    modelName: 'RICOH MP 3055',
    title: 'Ricoh MP 3055 | Haitech',
    description:
      'Ricoh MP 3055 seminueva B/N. Alternativa de productividad con garantía HaiStore, Distribuidor Autorizado Ricoh.',
    pageName: 'Ricoh MP 3055',
    h1: 'Ricoh MP 3055',
    lead:
      'La serie MP sigue siendo una opción sólida en oficinas que buscan costo controlado con equipo revisado.',
    bullets: ['B/N seminueva', 'Revisión técnica', 'Repuestos y tóner disponibles'],
    paragraphs: [
      'Si buscas equipos más recientes de la familia IM, revisa también IM 430F e IM 550F.',
    ],
    categoryHref: categoryLandingPath('multifuncionales'),
    products: [
      {
        label: 'MP 3055 seminueva 220V',
        productSlug: 'impresora-multifuncional-seminueva-ricoh-mp-3055-220v-64bf6990c418',
        condition: 'seminuevo',
      },
    ],
    relatedModelSlugs: ['im-430f', 'im-550f'],
  },
  {
    slug: 'im-c2000',
    modelName: 'RICOH IM C2000',
    title: 'Ricoh IM C2000 | Haitech',
    description:
      'Ricoh IM C2000 color A3 seminueva. Cotiza con HaiStore, Distribuidor Autorizado Ricoh en Perú.',
    pageName: 'Ricoh IM C2000',
    h1: 'Ricoh IM C2000',
    lead:
      'Multifuncional color A3 para oficinas que necesitan formato grande y color sin pasar a producción industrial.',
    bullets: ['Color A3', 'Seminueva certificada', 'Asesoría de volumen y tóner'],
    paragraphs: ['Compara con IM C300F/C320F si tu flujo es solo A4.'],
    categoryHref: categoryLandingPath('multifuncionales'),
    products: [
      {
        label: 'IM C2000 seminueva 220V',
        productSlug: 'impresora-multifuncional-seminueva-ricoh-im-c2000-220v-c35de3a33544',
        condition: 'seminuevo',
      },
    ],
    relatedModelSlugs: ['im-c300f', 'im-c320f'],
  },
  {
    slug: 'im-600f',
    modelName: 'RICOH IM 600F',
    title: 'Ricoh IM 600F | Haitech',
    description:
      'Ricoh IM 600F seminueva de alto volumen. Stock y soporte con Distribuidor Autorizado HaiStore.',
    pageName: 'Ricoh IM 600F',
    h1: 'Ricoh IM 600F',
    lead:
      'Opción seminueva para flotas que necesitan velocidad y robustez. Cotiza 110V/220V según tu sede.',
    bullets: ['Alto volumen B/N', 'Seminueva con stock', 'Tóner y técnico Ricoh'],
    paragraphs: ['Relacionada con IM 550F e IM 460F en la familia de productividad monocromo.'],
    categoryHref: categoryLandingPath('multifuncionales'),
    products: [
      {
        label: 'IM 600F seminueva 220V',
        productSlug: 'impresora-multifuncional-seminueva-ricoh-im-600f-220v-fd51b686-519',
        condition: 'seminuevo',
      },
    ],
    relatedModelSlugs: ['im-550f', 'im-460f'],
  },
];

const bySlug = new Map(SEO_MODEL_HUBS.map((hub) => [hub.slug, hub]));

export function getSeoModelHub(slug: string): SeoModelHub | null {
  return bySlug.get(slug) ?? null;
}

export function findSeoModelHubByProductSlug(productSlug: string): SeoModelHub | null {
  const needle = productSlug.trim().toLowerCase();
  if (!needle) return null;
  return (
    SEO_MODEL_HUBS.find((hub) =>
      hub.products.some((item) => item.productSlug.toLowerCase() === needle),
    ) ?? null
  );
}

export function findSeoModelHubByProductName(name: string): SeoModelHub | null {
  const upper = name.toUpperCase();
  return (
    SEO_MODEL_HUBS.find((hub) => {
      const token = hub.modelName.replace(/^RICOH\s+/i, '').toUpperCase();
      return upper.includes(token);
    }) ?? null
  );
}

export function modelHubPath(slug: string): string {
  return `/modelos/${slug}`;
}

export function modelHubProductHref(productSlug: string): string {
  return productPath(productSlug);
}
