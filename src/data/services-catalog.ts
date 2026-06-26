import {
  Building2,
  Gift,
  Headphones,
  Printer,
  Users,
} from 'lucide-react';

import {
  alquilerLanding,
  outsourcingLanding,
  serviciosCorporativosLanding,
  soporteTecnicoLanding,
} from '@/data/service-landings';
import type { ServiceLandingConfig } from '@/types/service-landing';
import type {
  ServiceCatalogCategory,
  ServiceCatalogCategoryId,
  ServiceCatalogFilters,
  ServiceCatalogItem,
  ServiceContractDuration,
  ServiceContractType,
  ServicePlan,
  ServicePlanFeature,
  ServicePlanId,
  ServicePricePeriod,
} from '@/types/services-catalog';

export const SERVICES_CATALOG_ID = 'catalogo';

export const SERVICE_CONTRACT_DURATIONS: readonly ServiceContractDuration[] = [
  { id: 'mensual', label: 'Mensual', months: 1, discountFactor: 1 },
  { id: 'trimestral', label: 'Trimestral (-5%)', months: 3, discountFactor: 0.95 },
  { id: 'anual', label: 'Anual (-12%)', months: 12, discountFactor: 0.88 },
  { id: 'evento', label: 'Por evento', months: 0, discountFactor: 1 },
  { id: 'unico', label: 'Por servicio', months: 0, discountFactor: 1 },
] as const;

export const DEFAULT_SERVICE_PLANS: readonly ServicePlan[] = [
  {
    id: 'basico',
    label: 'Básico',
    description: 'Cobertura esencial para operaciones pequeñas.',
    priceMultiplier: 1,
    features: ['Soporte en horario laboral', 'Insumos básicos incluidos', '1 visita técnica al mes'],
  },
  {
    id: 'empresarial',
    label: 'Empresarial',
    description: 'Equilibrio entre costo y cobertura para equipos en crecimiento.',
    priceMultiplier: 1.35,
    highlighted: true,
    features: [
      'Soporte prioritario',
      'Insumos y repuestos incluidos',
      'Visitas técnicas programadas',
      'Reporte mensual de uso',
    ],
  },
  {
    id: 'premium',
    label: 'Premium',
    description: 'Máxima cobertura y atención dedicada.',
    priceMultiplier: 1.75,
    features: [
      'Soporte 24/7',
      'Equipo de respaldo',
      'Visitas ilimitadas',
      'Gerente de cuenta dedicado',
      'SLA garantizado',
    ],
  },
] as const;

const EVENT_VENUE_PLANS: readonly ServicePlan[] = [
  {
    id: 'basico',
    label: 'Básico',
    description: 'Espacio funcional para reuniones y capacitaciones pequeñas.',
    priceMultiplier: 1,
    fixedPricePen: 400,
    priceNote: '+ Transporte',
    features: ['Sala equipada hasta 20 personas', 'Wi-Fi y proyector', 'Mobiliario estándar'],
  },
  {
    id: 'empresarial',
    label: 'Empresarial',
    description: 'Configuración completa para eventos corporativos medianos.',
    priceMultiplier: 1,
    fixedPricePen: 700,
    highlighted: true,
    features: [
      'Capacidad hasta 50 personas',
      'Sonido y proyección incluidos',
      'Soporte en sitio durante el evento',
    ],
  },
  {
    id: 'premium',
    label: 'Premium',
    description: 'Experiencia premium para lanzamientos y eventos ejecutivos.',
    priceMultiplier: 1,
    fixedPricePen: 1000,
    features: [
      'Capacidad hasta 100 personas',
      'Montaje personalizado',
      'Coordinador de evento dedicado',
      'Coffee break básico incluido',
    ],
  },
] as const;

const EVENT_VENUE_PLAN_COMPARISON: readonly ServicePlanFeature[] = [
  { id: 'capacidad', label: 'Capacidad', basico: '20 pers.', empresarial: '50 pers.', premium: '100 pers.' },
  { id: 'proyector', label: 'Proyector y pantalla', basico: true, empresarial: true, premium: true },
  { id: 'sonido', label: 'Sistema de sonido', basico: false, empresarial: true, premium: true },
  { id: 'soporte', label: 'Soporte en sitio', basico: false, empresarial: true, premium: true },
  { id: 'coffee', label: 'Coffee break', basico: false, empresarial: false, premium: true },
  { id: 'transporte', label: 'Transporte', basico: 'Adicional', empresarial: 'Incluido', premium: 'Incluido' },
];

const FIXED_SERVICE_PLAN: readonly ServicePlan[] = [
  {
    id: 'basico',
    label: 'Servicio',
    description: 'Precio fijo por intervención.',
    priceMultiplier: 1,
    features: ['Precio cerrado por servicio', 'Sin contrato recurrente'],
  },
] as const;

const EMPTY_PLAN_COMPARISON: readonly ServicePlanFeature[] = [];

const DEFAULT_PLAN_COMPARISON: readonly ServicePlanFeature[] = [
  { id: 'visitas', label: 'Visitas técnicas', basico: '1/mes', empresarial: '2/mes', premium: 'Ilimitadas' },
  { id: 'soporte', label: 'Horario de soporte', basico: 'L-V 9-18h', empresarial: 'L-S 8-20h', premium: '24/7' },
  { id: 'insumos', label: 'Insumos incluidos', basico: true, empresarial: true, premium: true },
  { id: 'repuestos', label: 'Repuestos originales', basico: false, empresarial: true, premium: true },
  { id: 'respaldo', label: 'Equipo de respaldo', basico: false, empresarial: false, premium: true },
  { id: 'sla', label: 'SLA garantizado', basico: false, empresarial: '4h', premium: '2h' },
];

const DEFAULT_VALUE_PROPS = [
  { id: 'ahorro', title: 'Ahorro garantizado', description: 'Sin inversión inicial en equipos ni mantenimiento imprevisto.' },
  { id: 'tecnologia', title: 'Tecnología actualizada', description: 'Equipos profesionales listos para operar desde el día uno.' },
  { id: 'suministros', title: 'Suministros incluidos', description: 'Tóner, tinta y consumibles según tu plan contratado.' },
  { id: 'soporte', title: 'Soporte 24/7', description: 'Técnicos certificados Ricoh con cobertura en Lima y provincias.' },
] as const;

const CATEGORY_META: Record<
  Exclude<ServiceCatalogCategoryId, 'locales-eventos' | 'paquetes-corporativos'>,
  { basePrice: number; period: ServicePricePeriod; contractTypes: ServiceContractType[] }
> = {
  alquiler: { basePrice: 120, period: 'mes', contractTypes: ['mensual', 'trimestral', 'anual'] },
  'servicio-tecnico': { basePrice: 89, period: 'mes', contractTypes: ['mensual', 'trimestral', 'anual'] },
  outsourcing: { basePrice: 450, period: 'mes', contractTypes: ['mensual', 'trimestral', 'anual'] },
  'servicios-corporativos': { basePrice: 350, period: 'evento', contractTypes: ['evento', 'mensual'] },
};

const BADGE_ROTATION = ['disponible', 'popular', 'disponible', 'reserva'] as const;

function buildPlans(): readonly ServicePlan[] {
  return DEFAULT_SERVICE_PLANS;
}

function buildItemFromCard(
  landing: ServiceLandingConfig,
  cardIndex: number,
  overrides?: Partial<ServiceCatalogItem>,
): ServiceCatalogItem {
  const card = landing.cards[cardIndex];
  const categoryId = landing.slug as ServiceCatalogCategoryId;
  const meta = CATEGORY_META[categoryId as keyof typeof CATEGORY_META] ?? CATEGORY_META.alquiler;
  const priceOffset = cardIndex * 15;
  const badge = BADGE_ROTATION[cardIndex % BADGE_ROTATION.length];
  const isEventLocal = card.id === 'local-eventos';
  const isPackage = card.id === 'saas' || card.id === 'planes';

  return {
    slug: `${landing.slug}-${card.id}`,
    title: card.title,
    description: card.description,
    shortDescription: card.description,
    categoryId: isEventLocal ? 'locales-eventos' : categoryId,
    landingSlug: landing.slug,
    images: [card.image, card.image],
    imageAlt: card.imageAlt,
    badge,
    rating: 4.5 + (cardIndex % 5) * 0.1,
    reviewCount: 12 + cardIndex * 7,
    basePricePen: isEventLocal ? 400 : meta.basePrice + priceOffset,
    pricePeriod: isEventLocal ? 'evento' : meta.period,
    features: isEventLocal
      ? [
          'Salón con Wi-Fi y proyector',
          'Planes por evento sin contrato largo',
          'Transporte disponible en plan Básico',
        ]
      : [
          'Instalación y configuración incluida',
          'Soporte técnico especializado',
          'Planes flexibles sin inversión inicial',
        ],
    availability: badge,
    contractTypes: isEventLocal ? ['evento'] : meta.contractTypes,
    ...(isEventLocal ? { eventCapacity: 50 } : {}),
    ...(isPackage ? { isPackage: true } : {}),
    plans: isEventLocal ? EVENT_VENUE_PLANS : buildPlans(),
    planComparison: isEventLocal ? EVENT_VENUE_PLAN_COMPARISON : DEFAULT_PLAN_COMPARISON,
    inclusions: isEventLocal
      ? [
          'Uso del local por jornada acordada',
          'Mobiliario y conectividad básica',
          'Soporte de coordinación previa al evento',
        ]
      : [
          'Entrega e instalación en Lima Metropolitana',
          'Capacitación básica de uso',
          'Mantenimiento preventivo según plan',
          'Soporte técnico por teléfono y remoto',
        ],
    conditions: [
      'Contrato mínimo según duración seleccionada.',
      'Precios en soles (PEN), sujetos a evaluación técnica previa.',
      'Cobertura en Lima Metropolitana; provincias con costo adicional.',
    ],
    faq: [
      {
        question: '¿Cuánto demora la implementación?',
        answer: 'La mayoría de servicios se activan en 24 a 72 horas hábiles tras confirmar la cotización.',
      },
      {
        question: '¿Puedo cambiar de plan?',
        answer: 'Sí, puedes escalar o reducir tu plan con 15 días de anticipación al cierre del periodo.',
      },
    ],
    valueProps: [...DEFAULT_VALUE_PROPS],
    whatsappMessage: `Hola, me interesa el servicio "${card.title}" en HaiStore. ¿Podrían brindarme más información?`,
    ...overrides,
  };
}

function buildCatalogFromLanding(landing: ServiceLandingConfig): ServiceCatalogItem[] {
  return landing.cards.map((_, index) => buildItemFromCard(landing, index));
}

function buildFixedSoporteItem(
  cardIndex: number,
  config: {
    basePricePen: number;
    priceVariants?: { label: string; pricePen: number }[];
    features: readonly string[];
    inclusions?: readonly string[];
  },
): ServiceCatalogItem {
  return buildItemFromCard(soporteTecnicoLanding, cardIndex, {
    basePricePen: config.basePricePen,
    pricePeriod: 'servicio',
    pricingMode: 'fixed',
    contractTypes: ['unico'],
    plans: FIXED_SERVICE_PLAN,
    planComparison: EMPTY_PLAN_COMPARISON,
    features: config.features,
    inclusions: config.inclusions ?? [
      'Diagnóstico técnico especializado',
      'Repuestos y materiales según alcance del servicio',
      'Informe de trabajo al finalizar',
    ],
    ...(config.priceVariants ? { priceVariants: config.priceVariants } : {}),
    valueProps: [
      {
        id: 'precio',
        title: 'Precio fijo',
        description: 'Tarifa cerrada por intervención, sin sorpresas.',
      },
      {
        id: 'tecnicos',
        title: 'Técnicos certificados',
        description: 'Personal especializado en equipos Ricoh y multifuncionales.',
      },
      {
        id: 'rapida',
        title: 'Atención ágil',
        description: 'Coordinación de visita o sesión remota en Lima y provincias.',
      },
      {
        id: 'calidad',
        title: 'Repuestos originales',
        description: 'Componentes de calidad según el alcance del servicio contratado.',
      },
    ],
    conditions: [
      'Precio en soles (PEN) por intervención.',
      'Cobertura en Lima Metropolitana; provincias con costo adicional de traslado.',
      'El precio puede variar según modelo y complejidad del equipo (cotización previa si aplica).',
    ],
    faq: [
      {
        question: '¿Cuánto demora la atención?',
        answer: 'La mayoría de servicios se coordinan en 24 a 72 horas hábiles tras confirmar la solicitud.',
      },
      {
        question: '¿El precio incluye repuestos?',
        answer: 'Depende del servicio. Firmware y reparación electrónica incluyen piezas indicadas; mantenimiento incluye insumos de limpieza estándar.',
      },
    ],
  });
}

function buildSoporteTecnicoCatalog(): ServiceCatalogItem[] {
  const cards = soporteTecnicoLanding.cards;
  const indexById = Object.fromEntries(cards.map((card, index) => [card.id, index]));

  return cards.map((card, index) => {
    switch (card.id) {
      case 'preventivo':
        return buildFixedSoporteItem(index, {
          basePricePen: 150,
          priceVariants: [{ label: 'Color', pricePen: 200 }],
          features: [
            'Revisiones programadas para evitar fallas',
            'Limpieza y ajuste de componentes críticos',
            'B/N S/ 150 · Color S/ 200',
          ],
          inclusions: [
            'Inspección de componentes mecánicos y ópticos',
            'Limpieza interna y lubricación según fabricante',
            'Prueba de impresión B/N o color según equipo',
          ],
        });
      case 'correctivo':
        return buildFixedSoporteItem(index, {
          basePricePen: 120,
          priceVariants: [{ label: 'Color', pricePen: 180 }],
          features: [
            'Diagnóstico preciso de fallas',
            'Reparación con repuestos originales',
            'B/N S/ 120 · Color S/ 180',
          ],
          inclusions: [
            'Diagnóstico en sitio o remoto según incidencia',
            'Mano de obra especializada',
            'Prueba funcional posterior a la reparación',
          ],
        });
      case 'general':
        return buildFixedSoporteItem(index, {
          basePricePen: 350,
          features: [
            'Servicio integral de revisión y limpieza',
            'Ajuste de componentes críticos',
            'Precio fijo S/ 350 por intervención',
          ],
          inclusions: [
            'Revisión completa del equipo',
            'Limpieza profunda de bandeja, fusor y óptica',
            'Calibración y prueba de impresión',
          ],
        });
      case 'instalacion-config-capacitacion':
        return buildFixedSoporteItem(index, {
          basePricePen: 120,
          features: [
            'Instalación física y conexión del equipo',
            'Configuración de red e impresoras',
            'Capacitación al personal de uso',
          ],
          inclusions: [
            'Puesta en marcha del multifuncional',
            'Configuración de drivers y cola de impresión',
            'Sesión de capacitación básica para usuarios',
          ],
        });
      case 'soporte-remoto':
        return buildFixedSoporteItem(index, {
          basePricePen: 80,
          features: [
            'Asistencia técnica a distancia',
            'Configuración y resolución de incidencias',
            'Precio fijo S/ 80 por sesión',
          ],
          inclusions: [
            'Conexión remota segura al equipo',
            'Diagnóstico y ajustes de configuración',
            'Registro de acciones realizadas',
          ],
        });
      case 'actualizacion-firmware':
        return buildFixedSoporteItem(index, {
          basePricePen: 180,
          features: [
            'Actualización de firmware oficial',
            'Respaldo de configuración previa',
            'Firmware incluido en el precio',
          ],
          inclusions: [
            'Descarga e instalación de firmware oficial',
            'Verificación de funcionamiento post-actualización',
            'Licencia o paquete de firmware incluido',
          ],
        });
      case 'reparacion-fuente-tarjetas':
        return buildFixedSoporteItem(index, {
          basePricePen: 250,
          features: [
            'Reparación de fuente de poder y tarjetas',
            'Piezas electrónicas de cambio incluidas',
            'Precio fijo S/ 250 por intervención',
          ],
          inclusions: [
            'Diagnóstico de placa de alimentación y tarjetas',
            'Reemplazo de componentes electrónicos dañados',
            'Prueba eléctrica y funcional del equipo',
          ],
        });
      default:
        return buildItemFromCard(soporteTecnicoLanding, indexById[card.id] ?? index);
    }
  });
}

export const SERVICES_CATALOG_ITEMS: readonly ServiceCatalogItem[] = [
  ...buildCatalogFromLanding(alquilerLanding),
  ...buildSoporteTecnicoCatalog(),
  ...buildCatalogFromLanding(outsourcingLanding),
  ...buildCatalogFromLanding(serviciosCorporativosLanding),
];

export const SERVICES_CATALOG_CATEGORIES: readonly ServiceCatalogCategory[] = [
  {
    id: 'alquiler',
    label: 'Alquiler de equipos',
    stripLabel: 'Alquiler de equipos',
    icon: Printer,
    filterCategoryIds: ['alquiler'],
  },
  {
    id: 'servicio-tecnico',
    label: 'Soporte técnico',
    stripLabel: 'Soporte técnico',
    icon: Headphones,
    filterCategoryIds: ['servicio-tecnico'],
  },
  {
    id: 'locales-eventos',
    label: 'Locales para eventos',
    stripLabel: 'Locales para eventos',
    icon: Building2,
    filterCategoryIds: ['locales-eventos', 'servicios-corporativos'],
  },
  {
    id: 'outsourcing',
    label: 'Servicios empresariales',
    stripLabel: 'Servicios empresariales',
    icon: Users,
    filterCategoryIds: ['outsourcing'],
  },
  {
    id: 'paquetes-corporativos',
    label: 'Paquetes corporativos',
    stripLabel: 'Paquetes corporativos',
    icon: Gift,
    filterCategoryIds: ['paquetes-corporativos', 'servicios-corporativos'],
  },
];

export function getServiceBySlug(slug: string): ServiceCatalogItem | undefined {
  return SERVICES_CATALOG_ITEMS.find((item) => item.slug === slug);
}

export function listServices(): readonly ServiceCatalogItem[] {
  return SERVICES_CATALOG_ITEMS;
}

export function getCategoryLabel(categoryId: ServiceCatalogCategoryId): string {
  const fromStrip = SERVICES_CATALOG_CATEGORIES.find((c) => c.id === categoryId);
  if (fromStrip) return fromStrip.label;
  const labels: Record<ServiceCatalogCategoryId, string> = {
    alquiler: 'Alquiler de equipos',
    'servicio-tecnico': 'Soporte técnico',
    outsourcing: 'Servicios empresariales',
    'servicios-corporativos': 'Servicios corporativos',
    'locales-eventos': 'Locales para eventos',
    'paquetes-corporativos': 'Paquetes corporativos',
  };
  return labels[categoryId] ?? categoryId;
}

export function getCategoryCounts(): Record<ServiceCatalogCategoryId, number> {
  const counts: Record<string, number> = {};
  for (const item of SERVICES_CATALOG_ITEMS) {
    counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
    if (item.isPackage) {
      counts['paquetes-corporativos'] = (counts['paquetes-corporativos'] ?? 0) + 1;
    }
    if (item.eventCapacity) {
      counts['locales-eventos'] = (counts['locales-eventos'] ?? 0) + 1;
    }
  }
  return counts as Record<ServiceCatalogCategoryId, number>;
}

export function getCatalogPriceBounds(): { min: number; max: number } {
  const prices = SERVICES_CATALOG_ITEMS.map((item) => item.basePricePen);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function getPlanPrice(
  item: ServiceCatalogItem,
  planId: ServicePlanId,
  durationId: string,
): number {
  if (item.pricingMode === 'fixed') {
    return item.basePricePen;
  }
  const plan = item.plans.find((p) => p.id === planId) ?? item.plans[0];
  if (plan.fixedPricePen != null) {
    return plan.fixedPricePen;
  }
  const duration =
    SERVICE_CONTRACT_DURATIONS.find((d) => d.id === durationId) ?? SERVICE_CONTRACT_DURATIONS[0];
  return Math.round(item.basePricePen * plan.priceMultiplier * duration.discountFactor);
}

export function getPlanPriceNote(item: ServiceCatalogItem, planId: ServicePlanId): string | undefined {
  const plan = item.plans.find((p) => p.id === planId);
  return plan?.priceNote;
}

export function formatServicePrice(amountPen: number, period: ServicePricePeriod): string {
  const formatted = `S/ ${amountPen.toLocaleString('es-PE')}`;
  if (period === 'servicio') return formatted;
  const periodLabel = period === 'mes' ? '/mes' : period === 'evento' ? '/evento' : '/día';
  return `${formatted}${periodLabel}`;
}

export function getServiceCardPriceLabel(item: ServiceCatalogItem): string {
  if (item.pricingMode === 'fixed') {
    const base = formatServicePrice(item.basePricePen, item.pricePeriod);
    if (item.priceVariants?.length) {
      const colorVariant = item.priceVariants.find((variant) => variant.label === 'Color');
      if (colorVariant) {
        return `${base} B/N · Color ${formatServicePrice(colorVariant.pricePen, item.pricePeriod)}`;
      }
      const variants = item.priceVariants
        .map((variant) => `${variant.label} ${formatServicePrice(variant.pricePen, item.pricePeriod)}`)
        .join(' · ');
      return `${base} · ${variants}`;
    }
    return base;
  }

  const fromPrice = getPlanPrice(item, 'basico', SERVICE_CONTRACT_DURATIONS[0].id);
  return `Desde ${formatServicePrice(fromPrice, item.pricePeriod)}`;
}

export function isFixedPriceService(item: ServiceCatalogItem): boolean {
  return item.pricingMode === 'fixed';
}

export function filterServices(filters: ServiceCatalogFilters): ServiceCatalogItem[] {
  return SERVICES_CATALOG_ITEMS.filter((item) => {
    if (filters.categories.length > 0) {
      const stripCategory = SERVICES_CATALOG_CATEGORIES.find((c) =>
        filters.categories.includes(c.id),
      );
      if (stripCategory) {
        const matchesStrip = stripCategory.filterCategoryIds.some((catId) => {
          if (catId === 'paquetes-corporativos') return item.isPackage === true;
          if (catId === 'locales-eventos') return Boolean(item.eventCapacity);
          return item.categoryId === catId;
        });
        if (!matchesStrip) return false;
      } else if (!filters.categories.includes(item.categoryId)) {
        return false;
      }
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

    if (filters.eventCapacities.length > 0) {
      if (!item.eventCapacity) return false;
      const matchesCapacity = filters.eventCapacities.some((cap) => item.eventCapacity! >= cap);
      if (!matchesCapacity) return false;
    }

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const haystack = `${item.title} ${item.description} ${getCategoryLabel(item.categoryId)}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function serviceDetailPath(slug: string): string {
  return `/servicios/${slug}`;
}

export function mapHubSectionToCategory(section: string): ServiceCatalogCategoryId | null {
  const map: Record<string, ServiceCatalogCategoryId> = {
    alquiler: 'alquiler',
    'servicio-tecnico': 'servicio-tecnico',
    outsourcing: 'outsourcing',
    'servicios-corporativos': 'servicios-corporativos',
  };
  return map[section] ?? null;
}
