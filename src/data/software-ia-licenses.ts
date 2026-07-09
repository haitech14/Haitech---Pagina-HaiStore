import type {
  SoftwareCatalogItem,
  SoftwareContractType,
  SoftwarePricePeriod,
} from '@/types/software-catalog';

export interface IaLicenseProductInput {
  slug: string;
  code: string;
  title: string;
  brand: string;
  publicPen: number;
  techPen: number;
  pricePeriod: SoftwarePricePeriod;
  contractTypes: readonly SoftwareContractType[];
  planLabel: string;
  durationLabel: string;
  profilesLabel: string;
  features: readonly string[];
  provider?: string;
  purchaseCost?: string;
  extraDescription?: string;
}

function buildIaLicenseItem(input: IaLicenseProductInput): SoftwareCatalogItem {
  const providerLine = input.provider ? ` Proveedor: ${input.provider}.` : '';
  const description = [
    input.extraDescription ??
      `${input.title}. ${input.profilesLabel} · ${input.durationLabel}. Activación y soporte HaiStore.${providerLine}`,
  ].join('');

  return {
    slug: input.slug,
    title: input.title,
    description,
    shortDescription: `${input.profilesLabel} · ${input.durationLabel} · facturación legal.`,
    categoryId: 'inteligencia-artificial',
    subcategoryLabel: 'Licencias',
    images: [`/products/${input.slug}.webp`],
    imageAlt: input.title,
    badge: 'disponible',
    rating: 0,
    reviewCount: 0,
    basePricePen: input.publicPen,
    pricesByRole: {
      public: input.publicPen,
      tecnico: input.techPen,
      distribuidor: input.techPen,
      mayorista: input.techPen,
    },
    pricePeriod: input.pricePeriod,
    features: input.features,
    availability: 'disponible',
    contractTypes: input.contractTypes,
    plans: [
      {
        id: 'basico',
        label: input.planLabel,
        description: `${input.profilesLabel} · ${input.durationLabel}`,
        priceMultiplier: 1,
        highlighted: true,
        features: input.features,
      },
    ],
    planComparison: [
      { id: 'perfiles', label: 'Perfiles incluidos', basico: input.profilesLabel, empresarial: '—', premium: '—' },
      { id: 'duracion', label: 'Duración', basico: input.durationLabel, empresarial: '—', premium: '—' },
      { id: 'soporte', label: 'Activación HaiStore', basico: true, empresarial: false, premium: false },
      { id: 'facturacion', label: 'Facturación legal', basico: true, empresarial: false, premium: false },
    ],
    inclusions: [
      input.title,
      'Activación y entrega coordinada por HaiStore',
      'Soporte para configuración inicial',
      'Facturación legal',
    ],
    conditions: [
      `Válido para ${input.profilesLabel.toLowerCase()}.`,
      `Vigencia: ${input.durationLabel}.`,
      'Precio técnico y distribuidor disponible con facturación legal.',
      'Sujeto a disponibilidad del proveedor.',
      ...(input.provider ? [`Proveedor: ${input.provider}.`] : []),
      ...(input.purchaseCost ? [`Costo de compra referencial: ${input.purchaseCost}.`] : []),
    ],
    faq: [
      {
        question: '¿Cómo recibo la licencia?',
        answer:
          'Tras confirmar tu pedido, HaiStore coordina la activación según el tipo de producto (perfil compartido o cuenta completa).',
      },
      {
        question: '¿Cuál es la diferencia entre licencia por perfil y cuenta completa?',
        answer:
          'La licencia por perfil habilita un acceso dentro de una cuenta gestionada; la cuenta completa entrega credenciales de acceso total al servicio contratado.',
      },
    ],
    valueProps: [
      {
        id: 'acceso',
        title: 'Acceso inmediato',
        description: 'Activa herramientas de IA y productividad sin trámites complejos.',
      },
      {
        id: 'soporte',
        title: 'Soporte HaiStore',
        description: 'Te acompañamos en la activación y resolución de incidencias.',
      },
      {
        id: 'precio',
        title: 'Precio competitivo',
        description: 'Tarifas claras para público, técnico y distribuidor.',
      },
      {
        id: 'legal',
        title: 'Facturación legal',
        description: 'Compra con respaldo y documentación en Perú.',
      },
    ],
    whatsappMessage: `Hola, me interesa ${input.title} en HaiStore. ¿Podrían brindarme más información?`,
  };
}

export const SOFTWARE_IA_LICENSE_INPUTS: readonly IaLicenseProductInput[] = [
  {
    slug: 'chatgpt-pro-perfil-1-mes',
    code: 'IA-CHATGPT-PRO-1M',
    title: 'Licencia ChatGPT Pro Perfil X1 Mes',
    brand: 'OpenAI',
    publicPen: 60,
    techPen: 40,
    pricePeriod: 'mes',
    contractTypes: ['mensual'],
    planLabel: '1 mes · 1 perfil',
    durationLabel: '1 mes',
    profilesLabel: '1 perfil',
    features: ['ChatGPT Pro', '1 perfil dedicado', 'Renovación mensual'],
    provider: 'Stream Box',
    purchaseCost: 'USD 2.75',
  },
  {
    slug: 'chatgpt-plus-perfil-1-mes',
    code: 'IA-CHATGPT-PLUS-1M',
    title: 'Licencia ChatGPT Plus Perfil X1 Mes',
    brand: 'OpenAI',
    publicPen: 30,
    techPen: 25,
    pricePeriod: 'mes',
    contractTypes: ['mensual'],
    planLabel: '1 mes · 1 perfil',
    durationLabel: '1 mes',
    profilesLabel: '1 perfil',
    features: ['ChatGPT Plus', '1 perfil dedicado', 'Renovación mensual'],
    provider: 'Streambox',
    purchaseCost: 'USD 2.75',
  },
  {
    slug: 'chatgpt-plus-perfil-3-meses',
    code: 'IA-CHATGPT-PLUS-3M',
    title: 'Licencia ChatGPT Plus X3 Meses',
    brand: 'OpenAI',
    publicPen: 80,
    techPen: 65,
    pricePeriod: 'licencia',
    contractTypes: ['trimestral'],
    planLabel: '3 meses · 1 perfil',
    durationLabel: '3 meses',
    profilesLabel: '1 perfil',
    features: ['ChatGPT Plus', '1 perfil dedicado', 'Paquete trimestral'],
    provider: 'Noddle Store',
    purchaseCost: 'USD 7.50',
  },
  {
    slug: 'chatgpt-plus-cuenta-completa-1-mes',
    code: 'IA-CHATGPT-PLUS-FULL-1M',
    title: 'Cuenta Completa ChatGPT Plus X1 Mes',
    brand: 'OpenAI',
    publicPen: 70,
    techPen: 65,
    pricePeriod: 'mes',
    contractTypes: ['mensual'],
    planLabel: 'Cuenta completa · 1 mes',
    durationLabel: '1 mes',
    profilesLabel: 'Cuenta completa',
    features: ['ChatGPT Plus', 'Cuenta completa', 'Acceso total 1 mes'],
    provider: 'Noddle Store',
    purchaseCost: 'USD 15',
  },
  {
    slug: 'gemini-pro-perfil-1-anio',
    code: 'IA-GEMINI-PRO-1Y',
    title: 'Licencia Gemini Pro / 5 TB Perfil x 1 Año',
    brand: 'Google',
    publicPen: 50,
    techPen: 40,
    pricePeriod: 'licencia',
    contractTypes: ['anual'],
    planLabel: '1 año · 1 perfil',
    durationLabel: '1 año',
    profilesLabel: '1 perfil',
    features: ['Gemini Pro', '5 TB almacenamiento', 'Invitación a tu correo'],
    purchaseCost: 'USD 1.20',
    extraDescription:
      'Licencia Gemini Pro con 5 TB. Invitación a tu correo electrónico. 1 perfil · vigencia 1 año. Activación y soporte HaiStore.',
  },
  {
    slug: 'gemini-pro-cuenta-completa-1-anio',
    code: 'IA-GEMINI-FULL-1Y',
    title: 'Cuenta Completa Gemini Pro / 5 TB x 1 Año',
    brand: 'Google',
    publicPen: 60,
    techPen: 50,
    pricePeriod: 'licencia',
    contractTypes: ['anual'],
    planLabel: 'Cuenta completa · 1 año',
    durationLabel: '1 año',
    profilesLabel: 'Cuenta completa',
    features: ['Gemini Pro', '5 TB almacenamiento', 'Cuenta completa 1 año'],
    purchaseCost: 'USD 7',
  },
  {
    slug: 'super-grok-perfil-1-mes',
    code: 'IA-GROK-1M',
    title: 'Licencia Super Grok X1 Mes',
    brand: 'xAI',
    publicPen: 40,
    techPen: 30,
    pricePeriod: 'mes',
    contractTypes: ['mensual'],
    planLabel: '1 mes · 1 perfil',
    durationLabel: '1 mes',
    profilesLabel: '1 perfil',
    features: ['Super Grok', '1 perfil dedicado', 'Renovación mensual'],
    purchaseCost: 'USD 8',
  },
  {
    slug: 'super-grok-cuenta-completa',
    code: 'IA-GROK-FULL',
    title: 'Cuenta Completa Super Grok',
    brand: 'xAI',
    publicPen: 85,
    techPen: 70,
    pricePeriod: 'licencia',
    contractTypes: ['mensual'],
    planLabel: 'Cuenta completa',
    durationLabel: 'Según plan contratado',
    profilesLabel: 'Cuenta completa',
    features: ['Super Grok', 'Cuenta completa', 'Acceso total al servicio'],
    purchaseCost: 'USD 11.80',
  },
  {
    slug: 'microsoft-365-cuenta-completa-1-anio',
    code: 'IA-M365-FULL-1Y',
    title: 'Cuenta Completa Microsoft 365 x 1 Año',
    brand: 'Microsoft',
    publicPen: 70,
    techPen: 55,
    pricePeriod: 'licencia',
    contractTypes: ['anual'],
    planLabel: '1 año · hasta 15 dispositivos',
    durationLabel: '1 año',
    profilesLabel: 'Hasta 15 dispositivos',
    features: ['Microsoft 365', 'Cuenta completa', 'Hasta 15 dispositivos'],
    provider: 'Luna Streaming',
    purchaseCost: 'USD 6',
  },
  {
    slug: 'microsoft-365-perfil-1-anio',
    code: 'IA-M365-1Y',
    title: 'Licencia Microsoft 365 x 1 Año',
    brand: 'Microsoft',
    publicPen: 30,
    techPen: 20,
    pricePeriod: 'licencia',
    contractTypes: ['anual'],
    planLabel: '1 año · 1 perfil',
    durationLabel: '1 año',
    profilesLabel: '1 perfil',
    features: ['Microsoft 365', '1 perfil', 'Vigencia anual'],
    provider: 'Luna Streaming',
    purchaseCost: 'S/ 4.60',
  },
  {
    slug: 'windows-10-11-licencia-permanente',
    code: 'IA-WIN-PERM',
    title: 'Licencia Windows 10 / Windows 11 Permanente',
    brand: 'Microsoft',
    publicPen: 50,
    techPen: 35,
    pricePeriod: 'licencia',
    contractTypes: ['anual'],
    planLabel: 'Licencia permanente',
    durationLabel: 'Permanente',
    profilesLabel: '1 dispositivo',
    features: ['Windows 10 o Windows 11', '1 dispositivo', 'Licencia permanente'],
    provider: 'Luna Streaming',
    purchaseCost: 'USD 6',
  },
  {
    slug: 'turnitin-reporte-plagio-ia',
    code: 'IA-TURNITIN-1',
    title: 'Licencia Turnitin Reporte (Plagio + IA)',
    brand: 'Turnitin',
    publicPen: 20,
    techPen: 15,
    pricePeriod: 'licencia',
    contractTypes: ['mensual'],
    planLabel: 'Reporte plagio + IA',
    durationLabel: 'Por reporte',
    profilesLabel: '1 uso',
    features: ['Detección de plagio', 'Análisis de contenido con IA', 'Reporte Turnitin'],
    provider: 'JPM Shop',
    purchaseCost: 'USD 2',
  },
  {
    slug: 'nordvpn-surfshark-vpn-1-mes',
    code: 'IA-VPN-NORD-SURF-1M',
    title: 'Licencia Nord VPN y Surfshark VPN X1 Mes',
    brand: 'Nord / Surfshark',
    publicPen: 28,
    techPen: 18,
    pricePeriod: 'mes',
    contractTypes: ['mensual'],
    planLabel: '1 mes',
    durationLabel: '1 mes',
    profilesLabel: '1 perfil',
    features: ['Nord VPN', 'Surfshark VPN', '1 mes de acceso'],
    provider: 'HappyCanchita',
    purchaseCost: 'USD 2.70',
  },
];

export const SOFTWARE_IA_CATALOG_ITEMS: readonly SoftwareCatalogItem[] =
  SOFTWARE_IA_LICENSE_INPUTS.map(buildIaLicenseItem);
