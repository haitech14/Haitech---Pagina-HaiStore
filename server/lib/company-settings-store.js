import fs from 'fs/promises';
import path from 'path';

import { optimizeImageDataUrl } from './optimize-image.js';
import { getCompanySettingsPath } from './server-paths.js';

function settingsPath() {
  return getCompanySettingsPath();
}

const DEFAULT_SETTINGS = {
  companyName: 'HAITECH',
  legalName: 'NBN TECNOLOGIA TOTAL S.A.C.',
  tagline: 'Soluciones de impresión y equipos de oficina',
  businessDescription:
    'Venta y alquiler de equipos de impresión, repuestos, tóner y servicio técnico especializado.',
  ruc: '20612146561',
  address: 'Av. Petit Thouars Nro. — LINCE - LIMA - LIMA',
  city: 'Lima',
  phone: '+51 915 149 290',
  email: 'ventas@haitech.com',
  website: 'www.haitech.com',
  logoUrl: '/logo.png',
  quoteDocumentLabel: 'PROFORMA',
  quoteNumberPrefix: 'COT01',
  quoteNextNumber: 15,
  currencyLabel: 'SOLES (PEN)',
  defaultClientType: 'Corporativo',
  bankAccountsText: [
    'BCP SOLES: 194-123456789-0-12 — CCI 00219400123456789012',
    'BCP DÓLARES: 194-987654321-1-99 — CCI 00219400987654321999',
    'BBVA SOLES: 0011-0123-456789012345 — CCI 0110123001234567890123',
    'BBVA DÓLARES: 0011-0987-654321098765 — CCI 0110123098765432109876',
  ].join('\n'),
  supportUrl: 'https://soporte.haitech.pe/',
  quoteFooterText:
    'Representación impresa con fines informativos. Consulte el enlace de soporte o escanee el código QR para referencia.',
  quoteTermsText: [
    'Validez de la oferta: 3 días calendario o hasta agotar stock.',
    'Los precios pueden variar sin previo aviso por fluctuaciones del proveedor o tipo de cambio.',
    'Instalación y capacitación básica incluidas en Lima Metropolitana, salvo indicación contraria.',
    'Forma de pago: transferencia bancaria o depósito a las cuentas indicadas.',
  ].join('\n'),
  quoteValidityDays: 3,
  primaryColor: '#1e40af',
  usdToPenExchangeRate: 3.7,
  usdToPenPurchaseExchangeRate: 3.7,
};

const DEFAULT_BULK_DISCOUNT_TIERS = [
  { range: '2', discount: '5% dscto.', discountPercent: 5 },
  { range: '3', discount: '10% dscto.', discountPercent: 10 },
  { range: '5', discount: '15% dscto.', discountPercent: 15 },
  { range: '10+', discount: '25% dscto.', discountPercent: 25 },
];

const LEGACY_BULK_DISCOUNT_RANGES = new Set(['1-4', '5-9', '10-14', '15-20']);

function formatBulkDiscountLabel(discountPercent) {
  const percent = Math.round(discountPercent);
  return `${percent}% dscto.`;
}

function normalizeBulkDiscountTier(input) {
  if (!input || typeof input !== 'object') return null;

  const range = String(input.range ?? '').trim();
  const discountPercent = Math.min(100, Math.max(0, Number(input.discountPercent) || 0));

  if (!range || discountPercent <= 0) return null;

  return {
    range,
    discountPercent,
    discount: formatBulkDiscountLabel(discountPercent),
  };
}

function normalizeBulkDiscountTiers(input) {
  if (!Array.isArray(input) || input.length === 0) {
    return DEFAULT_BULK_DISCOUNT_TIERS;
  }

  const tiers = input.map(normalizeBulkDiscountTier).filter(Boolean);
  if (tiers.length === 0) return DEFAULT_BULK_DISCOUNT_TIERS;
  if (
    tiers.length === LEGACY_BULK_DISCOUNT_RANGES.size &&
    tiers.every((tier) => LEGACY_BULK_DISCOUNT_RANGES.has(String(tier.range).trim()))
  ) {
    return DEFAULT_BULK_DISCOUNT_TIERS;
  }
  return tiers;
}

function normalizeExchangeRate(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_SETTINGS.usdToPenExchangeRate;
  }
  return Math.round(parsed * 10000) / 10000;
}

async function ensureSettingsFile() {
  try {
    await fs.access(settingsPath());
  } catch {
    await fs.mkdir(path.dirname(settingsPath()), { recursive: true });
    await fs.writeFile(settingsPath(), JSON.stringify(DEFAULT_SETTINGS, null, 2));
  }
}

function normalizeSettings(input = {}) {
  return {
    companyName: String(input.companyName ?? DEFAULT_SETTINGS.companyName).trim(),
    legalName: String(input.legalName ?? DEFAULT_SETTINGS.legalName).trim(),
    tagline: String(input.tagline ?? DEFAULT_SETTINGS.tagline).trim(),
    businessDescription: String(input.businessDescription ?? DEFAULT_SETTINGS.businessDescription).trim(),
    ruc: String(input.ruc ?? DEFAULT_SETTINGS.ruc).trim(),
    address: String(input.address ?? DEFAULT_SETTINGS.address).trim(),
    city: String(input.city ?? DEFAULT_SETTINGS.city).trim(),
    phone: String(input.phone ?? DEFAULT_SETTINGS.phone).trim(),
    email: String(input.email ?? DEFAULT_SETTINGS.email).trim(),
    website: String(input.website ?? DEFAULT_SETTINGS.website).trim(),
    logoUrl: String(input.logoUrl ?? DEFAULT_SETTINGS.logoUrl).trim(),
    quoteDocumentLabel: String(input.quoteDocumentLabel ?? DEFAULT_SETTINGS.quoteDocumentLabel).trim(),
    quoteNumberPrefix: String(input.quoteNumberPrefix ?? DEFAULT_SETTINGS.quoteNumberPrefix).trim(),
    quoteNextNumber: Math.max(1, Number(input.quoteNextNumber) || DEFAULT_SETTINGS.quoteNextNumber),
    currencyLabel: String(input.currencyLabel ?? DEFAULT_SETTINGS.currencyLabel).trim(),
    defaultClientType: String(input.defaultClientType ?? DEFAULT_SETTINGS.defaultClientType).trim(),
    bankAccountsText: String(input.bankAccountsText ?? DEFAULT_SETTINGS.bankAccountsText).trim(),
    supportUrl: String(input.supportUrl ?? DEFAULT_SETTINGS.supportUrl).trim(),
    quoteFooterText: String(input.quoteFooterText ?? DEFAULT_SETTINGS.quoteFooterText).trim(),
    quoteTermsText: String(input.quoteTermsText ?? DEFAULT_SETTINGS.quoteTermsText).trim(),
    quoteValidityDays: Math.max(1, Number(input.quoteValidityDays) || DEFAULT_SETTINGS.quoteValidityDays),
    primaryColor: String(input.primaryColor ?? DEFAULT_SETTINGS.primaryColor).trim(),
    usdToPenExchangeRate: normalizeExchangeRate(
      input.usdToPenExchangeRate ?? DEFAULT_SETTINGS.usdToPenExchangeRate,
    ),
    usdToPenPurchaseExchangeRate: normalizeExchangeRate(
      input.usdToPenPurchaseExchangeRate ??
        input.usdToPenExchangeRate ??
        DEFAULT_SETTINGS.usdToPenPurchaseExchangeRate,
    ),
    bulkDiscountTiers: normalizeBulkDiscountTiers(input.bulkDiscountTiers),
  };
}

export async function readCompanySettings() {
  await ensureSettingsFile();
  const raw = await fs.readFile(settingsPath(), 'utf-8');
  return normalizeSettings(JSON.parse(raw));
}

export async function writeCompanySettings(input) {
  const settings = normalizeSettings(input);
  if (settings.logoUrl.startsWith('data:image/')) {
    settings.logoUrl =
      (await optimizeImageDataUrl(settings.logoUrl, { maxEdge: 480 })) ?? settings.logoUrl;
  }
  await fs.mkdir(path.dirname(settingsPath()), { recursive: true });
  await fs.writeFile(settingsPath(), JSON.stringify(settings, null, 2));
  return settings;
}
