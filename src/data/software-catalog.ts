import { Brain, Building2, FileSearch, ScanLine, Shield, Workflow, Wrench } from 'lucide-react';

import { ensureFullPrices, resolvePriceRole, type PriceRole } from '@/lib/roles';
import { SOFTWARE_IA_CATALOG_ITEMS } from '@/data/software-ia-licenses';

import type {
  SoftwareCatalogCategory,
  SoftwareCatalogCategoryId,
  SoftwareCatalogFilters,
  SoftwareCatalogItem,
  SoftwareContractDuration,
  SoftwarePlan,
  SoftwarePlanFeature,
  SoftwarePlanId,
  SoftwarePricePeriod,
} from '@/types/software-catalog';

export const SOFTWARE_CATALOG_ID = 'software-catalogo';

export const SOFTWARE_CONTRACT_DURATIONS: readonly SoftwareContractDuration[] = [
  { id: 'mensual', label: 'Mensual', months: 1, discountFactor: 1 },
  { id: 'trimestral', label: 'Trimestral (-5%)', months: 3, discountFactor: 0.95 },
  { id: 'anual', label: 'Anual (-12%)', months: 12, discountFactor: 0.88 },
] as const;

const DEFAULT_SOFTWARE_PLANS: readonly SoftwarePlan[] = [
  {
    id: 'basico',
    label: 'Básico',
    description: 'Licenciamiento esencial para equipos pequeños.',
    priceMultiplier: 1,
    features: ['Hasta 10 usuarios', 'Soporte en horario laboral', 'Actualizaciones incluidas'],
  },
  {
    id: 'empresarial',
    label: 'Empresarial',
    description: 'Ideal para empresas en crecimiento con flotas Ricoh.',
    priceMultiplier: 1.4,
    highlighted: true,
    features: [
      'Hasta 50 usuarios',
      'Soporte prioritario',
      'Integración con multifuncionales Ricoh',
      'Capacitación inicial incluida',
    ],
  },
  {
    id: 'premium',
    label: 'Premium',
    description: 'Máxima cobertura, personalización y soporte dedicado.',
    priceMultiplier: 1.85,
    features: [
      'Usuarios ilimitados',
      'Soporte 24/7',
      'Implementación y migración asistida',
      'Gerente de cuenta dedicado',
      'SLA garantizado',
    ],
  },
] as const;

const DEFAULT_PLAN_COMPARISON: readonly SoftwarePlanFeature[] = [
  { id: 'usuarios', label: 'Usuarios incluidos', basico: '10', empresarial: '50', premium: 'Ilimitados' },
  { id: 'soporte', label: 'Horario de soporte', basico: 'L-V 9-18h', empresarial: 'L-S 8-20h', premium: '24/7' },
  { id: 'integracion', label: 'Integración Ricoh', basico: true, empresarial: true, premium: true },
  { id: 'capacitacion', label: 'Capacitación inicial', basico: false, empresarial: true, premium: true },
  { id: 'migracion', label: 'Migración de datos', basico: false, empresarial: 'Básica', premium: 'Completa' },
  { id: 'sla', label: 'SLA garantizado', basico: false, empresarial: '8h', premium: '4h' },
];

const DEFAULT_VALUE_PROPS = [
  {
    id: 'productividad',
    title: 'Productividad inmediata',
    description: 'Digitaliza procesos y reduce tareas manuales desde el primer día.',
  },
  {
    id: 'seguridad',
    title: 'Seguridad documental',
    description: 'Control de accesos, trazabilidad y respaldo de información crítica.',
  },
  {
    id: 'integracion',
    title: 'Integración Ricoh',
    description: 'Conecta tu flota de impresoras y escáneres con flujos digitales.',
  },
  {
    id: 'soporte',
    title: 'Soporte especializado',
    description: 'Implementación, capacitación y acompañamiento por expertos HaiStore.',
  },
] as const;

const CATEGORY_META: Record<
  SoftwareCatalogCategoryId,
  { basePrice: number; period: SoftwarePricePeriod }
> = {
  'gestion-documental': { basePrice: 180, period: 'mes' },
  'automatizacion-procesos': { basePrice: 320, period: 'mes' },
  'impresion-y-captura': { basePrice: 95, period: 'usuario' },
  'integracion-ricoh': { basePrice: 140, period: 'mes' },
  antivirus: { basePrice: 120, period: 'licencia' },
  'inteligencia-artificial': { basePrice: 30, period: 'mes' },
  'software-empresarial': { basePrice: 280, period: 'mes' },
};

const BADGE_ROTATION = ['disponible', 'popular', 'disponible', 'reserva'] as const;

function buildSoftwareItem(
  input: {
    slug: string;
    title: string;
    description: string;
    categoryId: SoftwareCatalogCategoryId;
    image: string;
    imageAlt: string;
    features: readonly string[];
    whatsappMessage: string;
  },
  index: number,
): SoftwareCatalogItem {
  const meta = CATEGORY_META[input.categoryId];
  const badge = BADGE_ROTATION[index % BADGE_ROTATION.length];

  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    shortDescription: input.description,
    categoryId: input.categoryId,
    images: [input.image, input.image],
    imageAlt: input.imageAlt,
    badge,
    rating: 0,
    reviewCount: 0,
    basePricePen: meta.basePrice + index * 20,
    pricePeriod: meta.period,
    features: input.features,
    availability: badge,
    contractTypes: ['mensual', 'trimestral', 'anual'],
    plans: DEFAULT_SOFTWARE_PLANS,
    planComparison: DEFAULT_PLAN_COMPARISON,
    inclusions: [
      'Licenciamiento según plan contratado',
      'Instalación y configuración inicial',
      'Capacitación básica de usuarios',
      'Soporte técnico especializado',
    ],
    conditions: [
      'Contrato mínimo según duración seleccionada.',
      'Precios en soles (PEN), sujetos a evaluación de requerimientos.',
      'Licencias adicionales con costo por usuario según plan.',
    ],
    faq: [
      {
        question: '¿Cuánto demora la implementación?',
        answer:
          'La mayoría de soluciones se implementan en 3 a 10 días hábiles según el alcance y la integración requerida.',
      },
      {
        question: '¿Es compatible con equipos Ricoh?',
        answer:
          'Sí, todas nuestras soluciones están optimizadas para multifuncionales y escáneres Ricoh certificados.',
      },
    ],
    valueProps: [...DEFAULT_VALUE_PROPS],
    whatsappMessage: input.whatsappMessage,
  };
}

export const SOFTWARE_CATALOG_ITEMS: readonly SoftwareCatalogItem[] = [
  buildSoftwareItem(
    {
      slug: 'ricoh-smart-flow-connector',
      title: 'Ricoh Smart Flow Connector',
      description:
        'Conecta tus equipos Ricoh con flujos de trabajo digitales para captura, clasificación y envío automático de documentos.',
      categoryId: 'gestion-documental',
      image: '/services/servicios-corporativos/saas.png',
      imageAlt: 'Plataforma de flujos de trabajo documental Ricoh Smart Flow',
      features: [
        'Captura desde multifuncionales Ricoh',
        'Clasificación automática de documentos',
        'Integración con carpetas y aplicaciones',
      ],
      whatsappMessage:
        'Hola, me interesa Ricoh Smart Flow Connector en HaiStore. ¿Podrían brindarme más información y cotización?',
    },
    0,
  ),
  buildSoftwareItem(
    {
      slug: 'docuware-cloud',
      title: 'DocuWare Cloud',
      description:
        'Gestión documental en la nube con búsqueda avanzada, flujos de aprobación y archivo digital seguro para tu empresa.',
      categoryId: 'gestion-documental',
      image: '/categories/soluciones-negocio.png',
      imageAlt: 'Interfaz de gestión documental DocuWare en la nube',
      features: [
        'Archivo digital centralizado',
        'Flujos de aprobación configurables',
        'Búsqueda full-text y metadatos',
      ],
      whatsappMessage:
        'Hola, me interesa DocuWare Cloud en HaiStore. ¿Podrían brindarme más información y cotización?',
    },
    1,
  ),
  buildSoftwareItem(
    {
      slug: 'ricoh-streamline-nx',
      title: 'Ricoh Streamline NX',
      description:
        'Suite de impresión y captura que optimiza costos, seguridad y productividad en entornos corporativos.',
      categoryId: 'impresion-y-captura',
      image: '/categories/escaneres.png',
      imageAlt: 'Solución de impresión y captura Ricoh Streamline NX',
      features: [
        'Impresión segura con liberación en equipo',
        'Seguimiento de costos por departamento',
        'Perfiles de escaneo preconfigurados',
      ],
      whatsappMessage:
        'Hola, me interesa Ricoh Streamline NX en HaiStore. ¿Podrían brindarme más información y cotización?',
    },
    2,
  ),
  buildSoftwareItem(
    {
      slug: 'ricoh-remote-enterprise',
      title: 'Ricoh @Remote Enterprise',
      description:
        'Monitoreo y administración remota de tu flota Ricoh con alertas proactivas, reportes y mantenimiento predictivo.',
      categoryId: 'integracion-ricoh',
      image: '/categories/computadoras-laptop.png',
      imageAlt: 'Panel de administración remota Ricoh @Remote Enterprise',
      features: [
        'Monitoreo en tiempo real de consumibles',
        'Alertas proactivas de mantenimiento',
        'Reportes de uso y rendimiento',
      ],
      whatsappMessage:
        'Hola, me interesa Ricoh @Remote Enterprise en HaiStore. ¿Podrían brindarme más información y cotización?',
    },
    3,
  ),
  buildSoftwareItem(
    {
      slug: 'ricoh-globalscan-nx',
      title: 'Ricoh GlobalScan NX',
      description:
        'Digitalización avanzada desde el panel del equipo con OCR, envío a la nube y conectores para aplicaciones empresariales.',
      categoryId: 'impresion-y-captura',
      image: '/categories/escaneres.png',
      imageAlt: 'Escaneo digital con Ricoh GlobalScan NX',
      features: [
        'OCR y reconocimiento de documentos',
        'Envío directo a nube y correo',
        'Conectores para ERP y gestión documental',
      ],
      whatsappMessage:
        'Hola, me interesa Ricoh GlobalScan NX en HaiStore. ¿Podrían brindarme más información y cotización?',
    },
    4,
  ),
  buildSoftwareItem(
    {
      slug: 'ricoh-intelligent-process-automation',
      title: 'Ricoh Intelligent Process Automation',
      description:
        'Automatiza procesos repetitivos con captura inteligente, validación de datos y flujos sin intervención manual.',
      categoryId: 'automatizacion-procesos',
      image: '/services/servicios-corporativos/web.png',
      imageAlt: 'Automatización de procesos con Ricoh Intelligent Process Automation',
      features: [
        'Automatización de tareas documentales',
        'Validación y enrutamiento inteligente',
        'Integración con sistemas existentes',
      ],
      whatsappMessage:
        'Hola, me interesa Ricoh Intelligent Process Automation en HaiStore. ¿Podrían brindarme más información y cotización?',
    },
    5,
  ),
  buildSoftwareItem(
    {
      slug: 'haisupport',
      title: 'HaiSupport',
      description: 'Gestión de Soporte Técnico y Alquileres',
      categoryId: 'software-empresarial',
      image: '/logos/haisupport-logo.png',
      imageAlt: 'HaiSupport — plataforma de soporte técnico y alquileres',
      features: [
        'Tickets y seguimiento de soporte técnico',
        'Gestión de alquileres y equipos en campo',
        'Reportes de SLA y productividad del equipo',
      ],
      whatsappMessage:
        'Hola, me interesa HaiSupport en HaiStore. ¿Podrían brindarme más información y cotización?',
    },
    6,
  ),
  buildSoftwareItem(
    {
      slug: 'haisales',
      title: 'HaiSales',
      description: 'CRM + Ventas',
      categoryId: 'software-empresarial',
      image: '/logos/haisales-logo.png',
      imageAlt: 'HaiSales — CRM y gestión comercial',
      features: [
        'Pipeline de ventas y oportunidades',
        'Cotizaciones y seguimiento comercial',
        'Dashboards de desempeño del equipo',
      ],
      whatsappMessage:
        'Hola, me interesa HaiSales en HaiStore. ¿Podrían brindarme más información y cotización?',
    },
    7,
  ),
  buildSoftwareItem(
    {
      slug: 'rapifac',
      title: 'Rapifac',
      description: 'Facturación Electrónica Completa',
      categoryId: 'software-empresarial',
      image: '/services/servicios-corporativos/saas.png',
      imageAlt: 'Rapifac — facturación electrónica completa',
      features: [
        'Emisión de comprobantes electrónicos SUNAT',
        'Gestión de clientes, productos y series',
        'Reportes fiscales y control de caja',
      ],
      whatsappMessage:
        'Hola, me interesa Rapifac en HaiStore. ¿Podrían brindarme más información y cotización?',
    },
    8,
  ),
  buildSoftwareItem(
    {
      slug: 'keyfacil',
      title: 'Keyfacil',
      description: 'Facturación Electrónica Estándar',
      categoryId: 'software-empresarial',
      image: '/services/servicios-corporativos/web.png',
      imageAlt: 'Keyfacil — facturación electrónica estándar',
      features: [
        'Facturación electrónica ágil para PYMEs',
        'Emisión de boletas y facturas SUNAT',
        'Interfaz simple y soporte de implementación',
      ],
      whatsappMessage:
        'Hola, me interesa Keyfacil en HaiStore. ¿Podrían brindarme más información y cotización?',
    },
    9,
  ),
  buildSoftwareItem(
    {
      slug: 'kommo-crm',
      title: 'Kommo CRM',
      description: 'CRM + Ventas',
      categoryId: 'software-empresarial',
      image: '/services/servicios-corporativos/saas.png',
      imageAlt: 'Kommo CRM — gestión comercial y ventas',
      features: [
        'Embudos de venta y automatizaciones',
        'Integración con WhatsApp y mensajería',
        'Seguimiento de leads y clientes',
      ],
      whatsappMessage:
        'Hola, me interesa Kommo CRM en HaiStore. ¿Podrían brindarme más información y cotización?',
    },
    10,
  ),
  {
    slug: 'eset-nod32-licencia-12-meses',
    title: 'Licencia Original ESET NOD32 12 Meses',
    description:
      'Licencia original ESET NOD32 por 12 meses. Protección antivirus y antiespía para 1 dispositivo en Windows y Mac, con administración y soporte HaiStore.',
    shortDescription:
      'Antivirus y antiespía ESET NOD32 por 12 meses. 1 dispositivo · Windows y Mac · facturación legal.',
    categoryId: 'antivirus',
    subcategoryLabel: 'Antivirus',
    images: ['/products/eset-nod32-licencia-12-meses.webp'],
    imageAlt: 'Licencia original ESET NOD32 antivirus 12 meses',
    badge: 'popular',
    rating: 4.9,
    reviewCount: 24,
    basePricePen: 120,
    pricesByRole: {
      public: 120,
      tecnico: 90,
      distribuidor: 90,
      mayorista: 90,
    },
    pricePeriod: 'licencia',
    features: [
      'Antivirus y antiespía',
      'Detección de páginas fraudulentas',
      'Modo de juego',
      'Bloqueo de exploits',
      'Análisis potenciado en la nube',
      'Bajo consumo de recursos',
      'Protección de banca y pagos por Internet',
    ],
    availability: 'disponible',
    contractTypes: ['anual'],
    plans: [
      {
        id: 'basico',
        label: 'Licencia 12 meses',
        description: '1 dispositivo · Windows y Mac · administración HaiStore',
        priceMultiplier: 1,
        highlighted: true,
        features: [
          'Antivirus y antiespía',
          'Detección de páginas fraudulentas',
          'Modo de juego',
          'Bloqueo de exploits',
          'Análisis potenciado en la nube',
          'Bajo consumo de recursos',
          'Protección de banca y pagos por Internet',
        ],
      },
    ],
    planComparison: [
      { id: 'dispositivos', label: 'Dispositivos incluidos', basico: '1', empresarial: '—', premium: '—' },
      { id: 'duracion', label: 'Duración', basico: '12 meses', empresarial: '—', premium: '—' },
      { id: 'soporte', label: 'Administración HaiStore', basico: true, empresarial: false, premium: false },
      { id: 'garantia', label: 'Garantía HaiStore', basico: '90 días', empresarial: '—', premium: '—' },
      { id: 'plataformas', label: 'Plataformas', basico: 'Windows y Mac', empresarial: '—', premium: '—' },
      { id: 'facturacion', label: 'Facturación legal', basico: true, empresarial: false, premium: false },
    ],
    inclusions: [
      'Licencia original ESET NOD32 por 12 meses',
      'Administración de la licencia por HaiStore',
      'Soporte para activación e instalación',
      'Facturación legal',
    ],
    conditions: [
      'La licencia es válida solo para 1 dispositivo.',
      'Es reinstalable previa coordinación en el plazo que está en plataforma la licencia (90 días).',
      'La licencia dura 12 meses.',
      'Nosotros administramos la licencia.',
      'La garantía que brindamos es de 90 días.',
      'Compatible con Windows y Mac.',
      'Facturación legal.',
    ],
    faq: [
      {
        question: '¿Cuántos equipos cubre la licencia?',
        answer: 'Esta licencia cubre 1 dispositivo (Windows o Mac).',
      },
      {
        question: '¿Puedo reinstalar el antivirus en otro equipo?',
        answer:
          'Sí, es reinstalable previa coordinación con HaiStore dentro del plazo de 90 días mientras la licencia esté activa en plataforma.',
      },
      {
        question: '¿Quién administra la licencia?',
        answer:
          'HaiStore administra la licencia por ti: activación, seguimiento y soporte durante los 12 meses de vigencia.',
      },
    ],
    valueProps: [
      {
        id: 'original',
        title: 'Licencia original',
        description: 'Producto ESET NOD32 genuino con facturación legal en Perú.',
      },
      {
        id: 'administracion',
        title: 'Administración incluida',
        description: 'Nosotros gestionamos la licencia para que operes sin complicaciones.',
      },
      {
        id: 'garantia',
        title: 'Garantía 90 días',
        description: 'Respaldo HaiStore durante los primeros 90 días de tu licencia.',
      },
      {
        id: 'ligero',
        title: 'Bajo consumo',
        description: 'Protección robusta sin ralentizar tu equipo de trabajo.',
      },
    ],
    whatsappMessage:
      'Hola, me interesa la Licencia Original ESET NOD32 12 Meses en HaiStore. ¿Podrían brindarme más información?',
  },
  ...SOFTWARE_IA_CATALOG_ITEMS,
];

export const SOFTWARE_CATALOG_CATEGORIES: readonly SoftwareCatalogCategory[] = [
  {
    id: 'gestion-documental',
    label: 'Gestión documental',
    icon: FileSearch,
  },
  {
    id: 'automatizacion-procesos',
    label: 'Automatización de procesos',
    icon: Workflow,
  },
  {
    id: 'impresion-y-captura',
    label: 'Impresión y captura',
    icon: ScanLine,
  },
  {
    id: 'integracion-ricoh',
    label: 'Integración Ricoh',
    icon: Wrench,
  },
  {
    id: 'antivirus',
    label: 'Antivirus',
    icon: Shield,
  },
  {
    id: 'inteligencia-artificial',
    label: 'Licencias',
    icon: Brain,
  },
  {
    id: 'software-empresarial',
    label: 'Software Empresarial',
    icon: Building2,
  },
];

export function getSoftwareBySlug(slug: string): SoftwareCatalogItem | undefined {
  return SOFTWARE_CATALOG_ITEMS.find((item) => item.slug === slug);
}

export function getSoftwareCategoryLabel(categoryId: SoftwareCatalogCategoryId): string {
  return SOFTWARE_CATALOG_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}

export function getSoftwareCategoryCounts(): Record<SoftwareCatalogCategoryId, number> {
  const counts: Record<string, number> = {};
  for (const item of SOFTWARE_CATALOG_ITEMS) {
    counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
  }
  return counts as Record<SoftwareCatalogCategoryId, number>;
}

export function getSoftwareCatalogPriceBounds(): { min: number; max: number } {
  const prices = SOFTWARE_CATALOG_ITEMS.map((item) =>
    item.pricesByRole ? ensureFullPrices(item.pricesByRole).public : item.basePricePen,
  );
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function getSoftwarePlanPrice(
  item: SoftwareCatalogItem,
  planId: SoftwarePlanId,
  durationId: string,
  priceRole: PriceRole = 'public',
): number {
  if (item.pricesByRole) {
    const prices = ensureFullPrices(item.pricesByRole);
    return prices[priceRole];
  }
  const plan = item.plans.find((p) => p.id === planId) ?? item.plans[0];
  const duration =
    SOFTWARE_CONTRACT_DURATIONS.find((d) => d.id === durationId) ?? SOFTWARE_CONTRACT_DURATIONS[0];
  return Math.round(item.basePricePen * plan.priceMultiplier * duration.discountFactor);
}

export function getSoftwareDisplayPrice(
  item: SoftwareCatalogItem,
  planId: SoftwarePlanId,
  durationId: string,
  userRole: string,
): number {
  return getSoftwarePlanPrice(item, planId, durationId, resolvePriceRole(userRole));
}

export function formatSoftwarePrice(amountPen: number, period: SoftwarePricePeriod): string {
  const periodLabel =
    period === 'mes' ? '/mes' : period === 'usuario' ? '/usuario' : '/licencia';
  return `S/ ${amountPen.toLocaleString('es-PE')}${periodLabel}`;
}

export function filterSoftware(filters: SoftwareCatalogFilters): SoftwareCatalogItem[] {
  return SOFTWARE_CATALOG_ITEMS.filter((item) => {
    if (filters.categories.length > 0 && !filters.categories.includes(item.categoryId)) {
      return false;
    }

    if (filters.availability.length > 0 && !filters.availability.includes(item.availability)) {
      return false;
    }

    if (filters.priceMin != null && item.basePricePen < filters.priceMin) return false;
    if (filters.priceMax != null && item.basePricePen > filters.priceMax) return false;

    if (
      filters.contractTypes.length > 0 &&
      !filters.contractTypes.some((type) => item.contractTypes.includes(type))
    ) {
      return false;
    }

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const haystack =
        `${item.title} ${item.description} ${getSoftwareCategoryLabel(item.categoryId)}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function softwareDetailPath(slug: string): string {
  return `/software/${slug}`;
}

export function mapSoftwareHubSectionToCategory(
  section: string,
): SoftwareCatalogCategoryId | null {
  const map: Record<string, SoftwareCatalogCategoryId> = {
    'gestion-documental': 'gestion-documental',
    'automatizacion-procesos': 'automatizacion-procesos',
    'impresion-y-captura': 'impresion-y-captura',
    'integracion-ricoh': 'integracion-ricoh',
    antivirus: 'antivirus',
    'inteligencia-artificial': 'inteligencia-artificial',
    'software-empresarial': 'software-empresarial',
  };
  return map[section] ?? null;
}
