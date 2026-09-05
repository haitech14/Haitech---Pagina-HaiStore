export type SeoGuide = {
  slug: string;
  pathname: string;
  title: string;
  description: string;
  pageName: string;
  h1: string;
  lead: string;
  paragraphs: string[];
  relatedLinks: Array<{ label: string; to: string }>;
};

export const SEO_GUIDES: SeoGuide[] = [
  {
    slug: 'como-elegir-multifuncional-ricoh',
    pathname: '/guias/como-elegir-multifuncional-ricoh',
    title: 'Cómo elegir multifuncional Ricoh | Haitech',
    description:
      'Guía para elegir multifuncional Ricoh: A4 vs A3, ppm, color, SPDF y alquiler vs compra. Consejos de Distribuidor Autorizado en Perú.',
    pageName: 'Cómo elegir multifuncional Ricoh',
    h1: 'Cómo elegir multifuncional Ricoh',
    lead:
      'Antes de comprar o alquilar, define volumen mensual, formato, color y tipo de alimentador. Esta guía resume los criterios que usamos en HaiStore con clientes empresariales.',
    paragraphs: [
      'A4 vs A3: si solo imprimes documentos estándar, un A4 (serie IM F / CxxxF) suele bastar. Si manejas planos o dos páginas por hoja con frecuencia, evalúa A3.',
      'Velocidad (ppm) y volumen: estima páginas al mes. Equipos como IM 430F cubren oficinas medianas; IM 550F / IM 600F apuntan a mayor ritmo. El color (IM C300F, IM C320F, IM C2000) suma costo de tóner: úsalo solo si el flujo lo exige.',
      'SPDF vs ARDF: el SPDF (doble scan) acelera digitalización dúplex. Si escaneas mucho, priorízalo en la ficha del modelo.',
      'Nuevo, seminuevo o alquiler: el seminuevo reduce inversión con garantía HaiStore; el alquiler fija un costo mensual con mantenimiento. Revisa hubs de modelo y la landing de alquiler en Lima.',
    ],
    relatedLinks: [
      { label: 'Fotocopiadoras Ricoh', to: '/fotocopiadoras-ricoh' },
      { label: 'Alquiler vs compra', to: '/guias/alquiler-vs-compra-fotocopiadora' },
      { label: 'Catálogo multifuncionales', to: '/categoria/multifuncionales' },
      { label: 'IM 550F', to: '/modelos/im-550f' },
    ],
  },
  {
    slug: 'toner-original-vs-compatible',
    pathname: '/guias/toner-original-vs-compatible',
    title: 'Tóner original vs compatible | Haitech',
    description:
      'Diferencias entre tóner Ricoh original y compatible: calidad, costo por página y cuándo conviene cada uno. Asesoría de Distribuidor Autorizado.',
    pageName: 'Tóner original vs compatible',
    h1: 'Tóner original vs compatible',
    lead:
      'Ambas opciones existen en el mercado peruano. La decisión depende de política de calidad, costo por página y criticidad del equipo.',
    paragraphs: [
      'Tóner original: máxima compatibilidad y respaldo de fabricante. Recomendado en equipos nuevos en garantía estricta o cuando la calidad de color/texto es crítica.',
      'Tóner compatible: reduce el costo por página en flotas de alto volumen. Elige proveedores probados y el código exacto del cartucho; un compatible incorrecto genera fallas y paradas.',
      'En HaiStore, Distribuidor Autorizado Ricoh, te ayudamos a no mezclar referencias. Cotiza desde el hub de tóner o la categoría de suministros con el modelo de tu fotocopiadora.',
    ],
    relatedLinks: [
      { label: 'Tóner Ricoh', to: '/toner-ricoh' },
      { label: 'Categoría suministros', to: '/categoria/toner-suministros' },
      { label: 'Repuestos', to: '/categoria/repuestos' },
      { label: 'Mantenimiento', to: '/guias/mantenimiento-fotocopiadoras' },
    ],
  },
  {
    slug: 'alquiler-vs-compra-fotocopiadora',
    pathname: '/guias/alquiler-vs-compra-fotocopiadora',
    title: 'Alquiler vs compra | Haitech',
    description:
      'Compara alquilar o comprar fotocopiadora Ricoh en Perú: inversión, mantenimiento, tóner y flexibilidad. Orientación HaiStore Lima.',
    pageName: 'Alquiler vs compra',
    h1: 'Alquiler vs compra',
    lead:
      'No hay una respuesta única: depende del flujo de caja, del volumen y de si quieres internalizar el mantenimiento.',
    paragraphs: [
      'Compra: tiene sentido con uso estable a mediano/largo plazo y cuando el costo total de propiedad (equipo + tóner + servicio) es menor que sumar rentas. Puedes elegir nuevo o seminuevo certificado.',
      'Alquiler: ideal si prefieres cuota mensual, incluir mantenimiento/tóner según plan y cambiar de equipo cuando crezca el volumen. Muy usado en Lima por empresas que evitan CAPEX.',
      'Pide una cotización paralela (venta vs alquiler) con páginas estimadas. Usa la landing de alquiler en Lima y el catálogo de multifuncionales para anclar modelos reales.',
    ],
    relatedLinks: [
      { label: 'Alquiler en Lima', to: '/alquiler-fotocopiadoras-lima' },
      { label: 'Servicios de alquiler', to: '/servicios?seccion=alquiler' },
      { label: 'Fotocopiadoras Perú', to: '/fotocopiadoras-peru' },
      { label: 'Cómo elegir multifuncional', to: '/guias/como-elegir-multifuncional-ricoh' },
    ],
  },
  {
    slug: 'mantenimiento-fotocopiadoras',
    pathname: '/guias/mantenimiento-fotocopiadoras',
    title: 'Mantenimiento de fotocopiadoras | Haitech',
    description:
      'Señales de que tu fotocopiadora Ricoh necesita mantenimiento: calidad, ruidos, atascos y contadores. Soporte técnico HaiStore en Perú.',
    pageName: 'Mantenimiento de fotocopiadoras',
    h1: 'Mantenimiento de fotocopiadoras',
    lead:
      'Actuar a tiempo evita paradas costosas. Estas señales indican que conviene agendar servicio técnico o revisar consumibles.',
    paragraphs: [
      'Calidad irregular (manchas, líneas, fondo sucio) suele apuntar a unidad de imagen, cilindro o fusor. No ignores mensajes de reemplazo de piezas.',
      'Atascos frecuentes, ruidos nuevos o sobrecalentamiento piden revisión mecánica. También vigila el contador de páginas frente al ciclo de vida recomendado del modelo.',
      'Mantén stock de tóner correcto y programa preventivos si tu volumen es alto. En HaiStore ofrecemos servicio técnico Ricoh, repuestos y tóner con Distribuidor Autorizado.',
    ],
    relatedLinks: [
      { label: 'Servicio técnico', to: '/servicios?seccion=servicio-tecnico' },
      { label: 'Repuestos', to: '/categoria/repuestos' },
      { label: 'Tóner Ricoh', to: '/toner-ricoh' },
      { label: 'Contacto', to: '/contacto' },
    ],
  },
];

const bySlug = new Map(SEO_GUIDES.map((guide) => [guide.slug, guide]));

export function getSeoGuide(slug: string): SeoGuide | null {
  return bySlug.get(slug) ?? null;
}

export function seoGuidePath(slug: string): string {
  return `/guias/${slug}`;
}
