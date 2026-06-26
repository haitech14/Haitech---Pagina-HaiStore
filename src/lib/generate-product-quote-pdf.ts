import { GState, jsPDF } from 'jspdf';
import QRCode from 'qrcode';

import { amountToWordsEs } from '@/lib/amount-to-words-es';
import { normalizePdfProductCode, pdfTableAmountColumnRight } from '@/lib/pdf-product-code';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';
import type { ProductHeroSpecBullet } from '@/types/product-detail';
import type { Product } from '@/types/product';

export interface QuoteClientData {
  razonSocial: string;
  ruc: string;
  atencion: string;
  celular: string;
  ciudad: string;
}

export interface QuoteProductData {
  name: string;
  sku: string;
  brand: string;
  pricePen: number;
  quantity?: number;
  imageUrl?: string | null;
}

export interface GeneratedQuotePdf {
  blob: Blob;
  filename: string;
  quoteNumber: string;
}

export interface QuoteTechnicalSheetData {
  categoryLabel: string;
  modelName: string;
  functionLabels: string[];
  imageUrl?: string | null;
  headline: string;
  intro: string;
  bullets: string[];
  detailParagraph: string;
}

export interface BuildProductQuotePdfOptions {
  technicalSheet?: QuoteTechnicalSheetData | null;
}

type Rgb = [number, number, number];
type LoadedImage = { dataUrl: string; width: number; height: number };

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 12;
const PROFORMA_RED: Rgb = [220, 38, 38];
const QUOTE_LOGO_FALLBACK = '/logo.png';
const DEFAULT_PRINTER_FUNCTIONS = ['Copiadora', 'Impresora', 'Escáner'];
const IMAGE_LOAD_TIMEOUT_MS = 4_000;
const MAX_RASTER_EDGE_PX = 720;

const quoteImageCache = new Map<string, LoadedImage | null>();

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      window.setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

type RasterizeImageOptions = {
  /** Quita fondo sólido (negro/blanco) detectado en los bordes. */
  stripBackground?: boolean;
};

function rgbChannelDistance(
  r: number,
  g: number,
  b: number,
  br: number,
  bg: number,
  bb: number,
): number {
  return Math.max(Math.abs(r - br), Math.abs(g - bg), Math.abs(b - bb));
}

function sampleCornerBackground(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): [number, number, number] {
  const points: [number, number][] = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const [x, y] of points) {
    const i = (y * width + x) * 4;
    r += data[i] ?? 0;
    g += data[i + 1] ?? 0;
    b += data[i + 2] ?? 0;
  }
  const count = points.length;
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

/** Flood-fill desde los bordes para quitar fondos uniformes sin tocar el producto. */
function stripUniformBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;
  const [br, bg, bb] = sampleCornerBackground(data, width, height);
  const tolerance = 44;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height * 2);
  let head = 0;
  let tail = 0;

  const tryPush = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    if (rgbChannelDistance(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0, br, bg, bb) > tolerance) {
      return;
    }
    visited[idx] = 1;
    queue[tail++] = x;
    queue[tail++] = y;
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (head < tail) {
    const x = queue[head++] ?? 0;
    const y = queue[head++] ?? 0;
    const idx = y * width + x;
    const i = idx * 4;
    data[i + 3] = 0;
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }

  context.putImageData(imageData, 0, 0);
}

function rasterizeLoadedImage(
  url: string,
  options: RasterizeImageOptions = {},
): Promise<LoadedImage | null> {
  return new Promise<LoadedImage | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    const timeoutId = window.setTimeout(() => resolve(null), IMAGE_LOAD_TIMEOUT_MS);

    image.onload = () => {
      window.clearTimeout(timeoutId);
      try {
        const naturalWidth = image.naturalWidth || image.width;
        const naturalHeight = image.naturalHeight || image.height;
        if (!naturalWidth || !naturalHeight) {
          resolve(null);
          return;
        }

        if (typeof document === 'undefined') {
          resolve({ dataUrl: url, width: naturalWidth, height: naturalHeight });
          return;
        }

        const scale = Math.min(1, MAX_RASTER_EDGE_PX / Math.max(naturalWidth, naturalHeight));
        const width = Math.max(1, Math.round(naturalWidth * scale));
        const height = Math.max(1, Math.round(naturalHeight * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(null);
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        if (options.stripBackground) {
          stripUniformBackground(context, width, height);
        }
        resolve({
          dataUrl: options.stripBackground
            ? canvas.toDataURL('image/png')
            : canvas.toDataURL('image/jpeg', 0.82),
          width,
          height,
        });
      } catch {
        resolve(null);
      }
    };

    image.onerror = () => {
      window.clearTimeout(timeoutId);
      resolve(null);
    };
    image.src = url;
  });
}

async function loadImageDataUrl(
  src: string,
  options: RasterizeImageOptions = {},
): Promise<LoadedImage | null> {
  if (!src) return null;

  const cacheKey = options.stripBackground
    ? `${resolveFetchUrl(src)}::nobg`
    : resolveFetchUrl(src);
  if (quoteImageCache.has(cacheKey)) {
    return quoteImageCache.get(cacheKey) ?? null;
  }

  const loadPromise = (async () => {
    if (src.startsWith('data:')) {
      return rasterizeLoadedImage(src, options);
    }

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), IMAGE_LOAD_TIMEOUT_MS);
      try {
        const response = await fetch(cacheKey.replace(/::nobg$/, ''), { signal: controller.signal });
        if (!response.ok) return null;
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        try {
          return await rasterizeLoadedImage(objectUrl, options);
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    } catch {
      return null;
    }
  })();

  const loaded = await withTimeout(loadPromise, IMAGE_LOAD_TIMEOUT_MS + 250, null);
  quoteImageCache.set(cacheKey, loaded);
  return loaded;
}

async function loadProductImageForQuote(src: string): Promise<LoadedImage | null> {
  return loadImageDataUrl(src, { stripBackground: true });
}

export function preloadQuotePdfAssets(imageUrls: Array<string | null | undefined> = []): void {
  void loadImageDataUrl(QUOTE_LOGO_FALLBACK);
  void loadImageDataUrl('/logoclaro.png');
  for (const url of imageUrls) {
    if (url?.trim()) void loadProductImageForQuote(url.trim());
  }
}

function normalizeQuoteCompany(company: CompanySettings): CompanySettings {
  return {
    ...DEFAULT_COMPANY_SETTINGS,
    ...company,
    companyName: String(company.companyName ?? DEFAULT_COMPANY_SETTINGS.companyName).trim(),
    legalName: String(company.legalName ?? DEFAULT_COMPANY_SETTINGS.legalName).trim(),
    bankAccountsText: String(
      company.bankAccountsText ?? DEFAULT_COMPANY_SETTINGS.bankAccountsText,
    ).trim(),
    quoteTermsText: String(company.quoteTermsText ?? DEFAULT_COMPANY_SETTINGS.quoteTermsText).trim(),
    quoteFooterText: String(
      company.quoteFooterText ?? DEFAULT_COMPANY_SETTINGS.quoteFooterText,
    ).trim(),
    quoteValidityDays: Math.max(
      1,
      Number(company.quoteValidityDays) || DEFAULT_COMPANY_SETTINGS.quoteValidityDays,
    ),
    quoteNextNumber: Math.max(1, Number(company.quoteNextNumber) || 1),
    quoteDocumentLabel: String(
      company.quoteDocumentLabel ?? DEFAULT_COMPANY_SETTINGS.quoteDocumentLabel,
    ).trim(),
    quoteNumberPrefix: String(
      company.quoteNumberPrefix ?? DEFAULT_COMPANY_SETTINGS.quoteNumberPrefix,
    ).trim(),
    currencyLabel: String(company.currencyLabel ?? DEFAULT_COMPANY_SETTINGS.currencyLabel).trim(),
    defaultClientType: String(
      company.defaultClientType ?? DEFAULT_COMPANY_SETTINGS.defaultClientType,
    ).trim(),
    address: String(company.address ?? DEFAULT_COMPANY_SETTINGS.address).trim(),
    city: String(company.city ?? DEFAULT_COMPANY_SETTINGS.city).trim(),
    ruc: String(company.ruc ?? DEFAULT_COMPANY_SETTINGS.ruc).trim(),
    supportUrl: String(company.supportUrl ?? DEFAULT_COMPANY_SETTINGS.supportUrl).trim(),
    tagline: String(company.tagline ?? DEFAULT_COMPANY_SETTINGS.tagline).trim(),
    businessDescription: String(
      company.businessDescription ?? DEFAULT_COMPANY_SETTINGS.businessDescription,
    ).trim(),
  };
}

function resolveFetchUrl(src: string): string {
  if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  if (src.startsWith('/')) {
    return encodeURI(src);
  }
  return src;
}

function formatPen(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function tintRgb([r, g, b]: Rgb, factor: number): Rgb {
  return [
    Math.round(r + (255 - r) * factor),
    Math.round(g + (255 - g) * factor),
    Math.round(b + (255 - b) * factor),
  ];
}

function imageFormat(dataUrl: string): 'PNG' | 'JPEG' {
  const mime = dataUrl.match(/^data:([^;]+)/i)?.[1]?.toLowerCase() ?? '';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'JPEG';
  return 'PNG';
}

function fitImage(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const ratio = width / height;
  let w = maxWidth;
  let h = w / ratio;
  if (h > maxHeight) {
    h = maxHeight;
    w = h * ratio;
  }
  return { width: w, height: h };
}

function addFittedImage(
  doc: jsPDF,
  image: { dataUrl: string; width: number; height: number },
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
) {
  try {
    const size = fitImage(image.width, image.height, maxWidth, maxHeight);
    const offsetX = x + (maxWidth - size.width) / 2;
    const offsetY = y + (maxHeight - size.height) / 2;
    doc.addImage(
      image.dataUrl,
      imageFormat(image.dataUrl),
      offsetX,
      offsetY,
      size.width,
      size.height,
    );
  } catch {
    // Si el formato no es compatible, se omite la imagen sin abortar el PDF.
  }
}

function drawSectionTitle(doc: jsPDF, x: number, y: number, w: number, title: string, color: Rgb) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(title, x + 3, y + 4.8);
}

function drawLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  labelWidth: number,
  maxWidth: number,
) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(55, 65, 81);
  doc.text(label, x, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(23, 23, 23);
  const lines = doc.splitTextToSize(value, maxWidth - labelWidth);
  doc.text(lines, x + labelWidth, y);
  return Array.isArray(lines) ? lines.length : 1;
}

function buildQuoteNumber(company: CompanySettings): string {
  const serial = String(company.quoteNextNumber || 1).padStart(4, '0');
  return `${company.quoteNumberPrefix}-${serial}`;
}

export function resolveQuoteLogoUrl(_company: CompanySettings): string {
  return QUOTE_LOGO_FALLBACK;
}

function isRasterLogoCandidate(url: string): boolean {
  const normalized = url.split('?')[0]?.toLowerCase() ?? '';
  return !normalized.endsWith('.ico') && !normalized.endsWith('.svg');
}

async function loadQuoteLogo(company: CompanySettings): Promise<LoadedImage | null> {
  const candidates = [
    QUOTE_LOGO_FALLBACK,
    '/logoclaro.png',
    '/logo.png',
    company.logoUrl?.trim(),
  ]
    .filter((url): url is string => Boolean(url))
    .filter(isRasterLogoCandidate);

  const seen = new Set<string>();
  const unique = candidates.filter((url) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });

  const results = await Promise.all(unique.map((url) => loadImageDataUrl(url)));
  return results.find((result) => result != null) ?? null;
}

function coverImageRect(
  width: number,
  height: number,
  boxW: number,
  boxH: number,
): { width: number; height: number; offsetX: number; offsetY: number } {
  const ratio = width / height;
  const boxRatio = boxW / boxH;
  if (ratio > boxRatio) {
    const h = boxH;
    return { width: h * ratio, height: h, offsetX: (boxW - h * ratio) / 2, offsetY: 0 };
  }
  const w = boxW;
  return { width: w, height: w / ratio, offsetX: 0, offsetY: (boxH - w / ratio) / 2 };
}

function drawHeroImageCover(
  doc: jsPDF,
  image: LoadedImage,
  x: number,
  y: number,
  boxW: number,
  boxH: number,
) {
  try {
    const cover = coverImageRect(image.width, image.height, boxW, boxH);
    doc.addImage(
      image.dataUrl,
      imageFormat(image.dataUrl),
      x + cover.offsetX,
      y + cover.offsetY,
      cover.width,
      cover.height,
    );
  } catch {
    doc.setFillColor(30, 41, 59);
    doc.rect(x, y, boxW, boxH, 'F');
  }
}

function drawHeroOverlay(doc: jsPDF, x: number, y: number, w: number, h: number) {
  try {
    doc.setGState(new GState({ opacity: 0.58 }));
    doc.setFillColor(15, 23, 42);
    doc.rect(x, y, w, h, 'F');
    doc.setGState(new GState({ opacity: 1 }));
    return;
  } catch {
    doc.setFillColor(30, 41, 59);
    doc.rect(x, y, w, h, 'F');
  }
}

function formatHeroSpecBullet(bullet: ProductHeroSpecBullet): string {
  if (bullet.parts?.length) {
    return bullet.parts.map((part) => `${part.label}: ${part.value}`).join(' · ');
  }
  if (bullet.label && bullet.value) return `${bullet.label}: ${bullet.value}`;
  return bullet.text?.trim() ?? '';
}

function attributeValue(
  attributes: Product['attributes'] | undefined,
  ...names: string[]
): string {
  if (!attributes?.length) return '';
  for (const name of names) {
    const row = attributes.find((entry) => {
      const entryName = entry.name?.trim();
      return entryName ? entryName.toLowerCase().includes(name.toLowerCase()) : false;
    });
    if (row?.value?.trim()) return row.value.trim();
  }
  return '';
}

function parseFunctionLabels(raw: string | undefined): string[] {
  if (!raw?.trim()) return [...DEFAULT_PRINTER_FUNCTIONS];
  const parts = raw
    .split(/[/,|]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (/copia/i.test(part)) return 'Copiadora';
      if (/impres/i.test(part)) return 'Impresora';
      if (/escan/i.test(part)) return 'Escáner';
      if (/fax/i.test(part)) return 'Fax';
      return part.charAt(0).toUpperCase() + part.slice(1);
    });
  return parts.length > 0 ? parts.slice(0, 5) : [...DEFAULT_PRINTER_FUNCTIONS];
}

function resolveFunctionLabelsFromProduct(
  product: Pick<Product, 'attributes' | 'description' | 'category'>,
  override?: string[],
): string[] {
  if (override?.length) return override;
  const fromAttributes = attributeValue(product.attributes, 'funciones', 'función');
  if (fromAttributes) return parseFunctionLabels(fromAttributes);
  const haystack = `${product.description ?? ''} ${product.category ?? ''}`.toLowerCase();
  if (haystack.includes('fax')) return ['Copiadora', 'Impresora', 'Escáner', 'Fax'];
  return [...DEFAULT_PRINTER_FUNCTIONS];
}

type ProductForTechnicalSheet = Pick<
  Product,
  'name' | 'description' | 'image_url' | 'attributes' | 'category' | 'brand'
>;

export function buildQuoteTechnicalSheetFromProduct(
  product: ProductForTechnicalSheet,
  options: {
    displayTitle: string;
    categoryLabel: string;
    heroSpecBullets?: ProductHeroSpecBullet[];
    heroLead?: string;
    heroDescription?: string;
    functionLabels?: string[];
  },
): QuoteTechnicalSheetData {
  const bullets = (options.heroSpecBullets ?? [])
    .map(formatHeroSpecBullet)
    .filter(Boolean)
    .slice(0, 9);

  const intro =
    options.heroLead?.trim() ||
    options.heroDescription?.trim() ||
    product.description?.trim() ||
    'Equipo profesional diseñado para oficinas que buscan productividad, confiabilidad y soporte especializado.';

  const detailParagraph =
    options.heroDescription?.trim() ||
    product.description?.trim() ||
    `${options.displayTitle} combina rendimiento, conectividad y facilidad de uso. Consulte con nuestros asesores la configuración ideal para su operación.`;

  const fallbackBullets = [
    product.brand ? `Marca: ${product.brand}` : null,
    attributeValue(product.attributes, 'velocidad') &&
      `Velocidad: ${attributeValue(product.attributes, 'velocidad')}`,
    attributeValue(product.attributes, 'conectividad') &&
      `Conectividad: ${attributeValue(product.attributes, 'conectividad')}`,
    attributeValue(product.attributes, 'pantalla') &&
      `Pantalla: ${attributeValue(product.attributes, 'pantalla')}`,
  ].filter((line): line is string => Boolean(line));

  return {
    categoryLabel: options.categoryLabel,
    modelName: options.displayTitle,
    functionLabels: resolveFunctionLabelsFromProduct(product, options.functionLabels),
    imageUrl: product.image_url ?? null,
    headline: options.displayTitle,
    intro,
    bullets: bullets.length > 0 ? bullets : fallbackBullets,
    detailParagraph,
  };
}

export function buildQuoteTechnicalSheetFromLine(line: QuoteProductData): QuoteTechnicalSheetData {
  return {
    categoryLabel: 'Equipo',
    modelName: line.name,
    functionLabels: [...DEFAULT_PRINTER_FUNCTIONS],
    imageUrl: line.imageUrl ?? null,
    headline: line.name,
    intro: `${line.brand} — solución profesional para entornos de oficina con soporte Haitech.`,
    bullets: [
      `Marca: ${line.brand}`,
      `Código: ${line.sku}`,
      'Instalación y capacitación básica disponibles en Lima Metropolitana.',
      'Consulte extensiones de garantía y planes de mantenimiento.',
    ],
    detailParagraph: `El modelo ${line.name} ofrece un equilibrio entre productividad y confiabilidad. Nuestro equipo comercial puede ampliar especificaciones técnicas, accesorios compatibles y condiciones comerciales según su volumen de impresión.`,
  };
}

async function drawTechnicalSheetPage(
  doc: jsPDF,
  sheet: QuoteTechnicalSheetData,
  logo: LoadedImage | null,
  primary: Rgb,
  heroImage: LoadedImage | null = null,
) {
  doc.addPage();
  const heroH = 118;
  const resolvedHero =
    heroImage ??
    (sheet.imageUrl ? await loadProductImageForQuote(sheet.imageUrl) : null);

  if (resolvedHero) {
    drawHeroImageCover(doc, resolvedHero, 0, 0, PAGE_W, heroH);
    drawHeroOverlay(doc, 0, 0, PAGE_W, heroH);
  } else {
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, PAGE_W, heroH, 'F');
  }

  const brandX = PAGE_W - MARGIN - 42;
  doc.setTextColor(...primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('HAITECH', brandX + 42, MARGIN + 8, { align: 'right' });
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('Soluciones de impresión y equipos de oficina', brandX + 42, MARGIN + 13, {
    align: 'right',
  });
  if (logo) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(brandX, MARGIN + 9, 42, 18, 1.5, 1.5, 'F');
    addFittedImage(doc, logo, brandX + 2, MARGIN + 11, 38, 14);
  }

  const panelW = 122;
  const panelH = 78;
  const panelX = MARGIN;
  const panelY = MARGIN + 4;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(panelX, panelY, panelW, panelH, 2, 2, 'F');

  doc.setTextColor(...primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(sheet.categoryLabel.toUpperCase(), panelX + 6, panelY + 10);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  const modelLines = doc.splitTextToSize(sheet.modelName, panelW - 12);
  doc.text(modelLines, panelX + 6, panelY + 22);

  let functionY = panelY + 22 + modelLines.length * 8 + 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  sheet.functionLabels.forEach((label) => {
    doc.text(label, panelX + 6, functionY);
    functionY += 5.2;
  });

  let contentY = heroH + 10;
  doc.setTextColor(...primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('FICHA TÉCNICA', MARGIN, contentY);
  contentY += 8;

  doc.setTextColor(23, 23, 23);
  doc.setFontSize(12);
  const headlineLines = doc.splitTextToSize(sheet.headline, PAGE_W - MARGIN * 2);
  doc.text(headlineLines, MARGIN, contentY);
  contentY += headlineLines.length * 5.5 + 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  const introLines = doc.splitTextToSize(sheet.intro, PAGE_W - MARGIN * 2);
  doc.text(introLines, MARGIN, contentY);
  contentY += introLines.length * 4.2 + 6;

  const columnGap = 6;
  const columnW = (PAGE_W - MARGIN * 2 - columnGap) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + columnW + columnGap;
  const bullets = sheet.bullets.length > 0 ? sheet.bullets : ['Consulte especificaciones con nuestro equipo comercial.'];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primary);
  doc.text('Especificaciones destacadas', leftX, contentY);
  doc.text('Descripción del equipo', rightX, contentY);
  contentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(23, 23, 23);
  let bulletY = contentY;
  bullets.forEach((bullet) => {
    const wrapped = doc.splitTextToSize(`• ${bullet}`, columnW);
    doc.text(wrapped, leftX, bulletY);
    bulletY += wrapped.length * 3.8 + 1.2;
  });

  const detailLines = doc.splitTextToSize(sheet.detailParagraph, columnW);
  doc.text(detailLines, rightX, contentY);

  const footerY = PAGE_H - 14;
  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, footerY - 4, PAGE_W - MARGIN, footerY - 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primary);
  doc.text(`Modelo del equipo: ${sheet.modelName}`, MARGIN, footerY);
}

export async function buildProductQuotePdf(
  client: QuoteClientData,
  lines: QuoteProductData[],
  companyInput: CompanySettings,
  options?: BuildProductQuotePdfOptions,
): Promise<GeneratedQuotePdf> {
  const company = normalizeQuoteCompany(companyInput);
  const quoteLines = lines.length > 0 ? lines : [];
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const primary = PROFORMA_RED;
  const primarySoft = tintRgb(primary, 0.88);
  const primaryLight = tintRgb(primary, 0.94);
  const contentW = PAGE_W - MARGIN * 2;

  const issueDate = new Date();
  const expiryDate = new Date(issueDate);
  expiryDate.setDate(expiryDate.getDate() + company.quoteValidityDays);

  const subtotalPen = quoteLines.reduce(
    (sum, line) => sum + line.pricePen * (line.quantity ?? 1),
    0,
  );
  const gravada = Math.round((subtotalPen / 1.18) * 100) / 100;
  const igv = Math.round((subtotalPen - gravada) * 100) / 100;
  const total = subtotalPen;

  const quoteNumber = buildQuoteNumber(company);
  const firstLineImageUrl = quoteLines[0]?.imageUrl ?? null;
  const [logo, productImage] = await Promise.all([
    loadQuoteLogo(company),
    firstLineImageUrl ? loadProductImageForQuote(firstLineImageUrl) : Promise.resolve(null),
  ]);

  let y = MARGIN;

  if (logo) {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN, y, 38, 24, 2, 2, 'FD');
    addFittedImage(doc, logo, MARGIN + 2, y + 2, 34, 20);
  }

  const centerX = MARGIN + 42;
  const centerW = 98;
  doc.setTextColor(...primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(company.companyName, centerX + centerW / 2, y + 7, { align: 'center' });
  doc.setFontSize(8.5);
  doc.text(company.legalName, centerX + centerW / 2, y + 12.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const addressLine = `${company.address}${company.city ? ` — ${company.city}` : ''}`;
  const addressLines = doc.splitTextToSize(addressLine, centerW);
  doc.text(addressLines, centerX + centerW / 2, y + 17, { align: 'center' });
  const descLines = doc.splitTextToSize(company.businessDescription || company.tagline, centerW);
  doc.text(descLines, centerX + centerW / 2, y + 17 + addressLines.length * 3.2, { align: 'center' });

  const badgeW = 48;
  const badgeX = PAGE_W - MARGIN - badgeW;
  doc.setFillColor(...primary);
  doc.roundedRect(badgeX, y, badgeW, 24, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(company.quoteDocumentLabel, badgeX + badgeW / 2, y + 8, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`RUC ${company.ruc}`, badgeX + badgeW / 2, y + 14, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(quoteNumber, badgeX + badgeW / 2, y + 19.5, { align: 'center' });

  y += 30;

  const boxGap = 4;
  const boxW = (contentW - boxGap) / 2;
  const boxH = 36;
  const leftX = MARGIN;
  const rightX = MARGIN + boxW + boxGap;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(leftX, y, boxW, boxH, 2, 2, 'FD');
  doc.roundedRect(rightX, y, boxW, boxH, 2, 2, 'FD');

  drawSectionTitle(doc, leftX, y, boxW, 'DATOS DEL CLIENTE', primary);
  drawSectionTitle(doc, rightX, y, boxW, 'DETALLE DE LA PROFORMA', primary);

  let rowY = y + 11;
  const labelW = 18;
  const valueW = boxW - 8;

  const clientRows: [string, string][] = [
    ['CLIENTE:', client.razonSocial],
    ['RUC:', client.ruc],
    ['DIRECCIÓN:', client.ciudad],
    ['ATENCIÓN:', client.atencion],
    ['CELULAR:', client.celular],
  ];

  clientRows.forEach(([label, value]) => {
    const lines = drawLabelValue(doc, label, value, leftX + 3, rowY, labelW, valueW);
    rowY += Math.max(lines, 1) * 3.8 + 1.2;
  });

  rowY = y + 11;
  const detailRows: [string, string][] = [
    ['FECHA EMISIÓN:', formatShortDate(issueDate)],
    ['FECHA DE VENC.:', formatShortDate(expiryDate)],
    ['MONEDA:', company.currencyLabel],
    ['TIPO DE CLIENTE:', company.defaultClientType],
  ];

  detailRows.forEach(([label, value]) => {
    const lines = drawLabelValue(doc, label, value, rightX + 3, rowY, 24, valueW);
    rowY += Math.max(lines, 1) * 3.8 + 1.2;
  });

  y += boxH + 5;

  const tableX = MARGIN;
  const tableW = contentW;
  const col = {
    n: 8,
    img: 16,
    code: 22,
    desc: 58,
    qty: 12,
    um: 14,
    unit: 24,
    amount: 26,
  };
  const amountColRight = pdfTableAmountColumnRight(tableX, tableW);
  const unitColRight = amountColRight - col.amount;

  const headerH = 8;
  doc.setFillColor(...primary);
  doc.roundedRect(tableX, y, tableW, headerH, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);

  let cx = tableX + 2;
  doc.text('N°', cx + 2, y + 5.2);
  cx += col.n;
  doc.text('IMAGEN', cx + 1, y + 5.2);
  cx += col.img;
  doc.text('CÓDIGO', cx + 1, y + 5.2);
  cx += col.code;
  doc.text('DESCRIPCIÓN', cx + 1, y + 5.2);
  cx += col.desc;
  doc.text('CANT.', cx + 2, y + 5.2);
  cx += col.qty;
  doc.text('UM', cx + 2, y + 5.2);
  cx += col.um;
  doc.text('P/U', unitColRight, y + 5.2, { align: 'right' });
  doc.text('IMPORTE', amountColRight, y + 5.2, { align: 'right' });

  y += headerH;
  const rowH = 18;

  quoteLines.forEach((line, index) => {
    const quantity = line.quantity ?? 1;
    const lineTotal = line.pricePen * quantity;

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.rect(tableX, y, tableW, rowH, 'FD');

    let cx = tableX + 2;
    doc.setTextColor(23, 23, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(String(index + 1), cx + 3, y + 10);
    cx += col.n;

    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cx + 1, y + 3, col.img - 2, rowH - 6, 1, 1, 'FD');
    if (index === 0 && productImage) {
      addFittedImage(doc, productImage, cx + 2, y + 4, col.img - 4, rowH - 8);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184);
      doc.text('S/IMG', cx + 4, y + 10);
    }
    cx += col.img;

    doc.setTextColor(23, 23, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    const codeLines = doc.splitTextToSize(
      normalizePdfProductCode(line.sku, line.brand),
      col.code - 2,
    );
    doc.text(codeLines.slice(0, 2), cx + 1, y + 7);
    cx += col.code;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    const productDesc = doc.splitTextToSize(`${line.name} / ${line.brand}`, col.desc - 2);
    doc.text(productDesc, cx + 1, y + 7);
    cx += col.desc;

    doc.setFont('helvetica', 'bold');
    doc.text(String(quantity), cx + 4, y + 10);
    cx += col.qty;

    doc.setFont('helvetica', 'normal');
    doc.text('UNIDAD', cx + 1, y + 10);
    cx += col.um;

    doc.setFont('helvetica', 'bold');
    doc.text(formatPen(line.pricePen), unitColRight, y + 10, { align: 'right' });
    doc.text(formatPen(lineTotal), amountColRight, y + 10, { align: 'right' });

    y += rowH;
  });

  y += 4;

  const totalsLabelRight = unitColRight - 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text('GRAVADA:', totalsLabelRight, y + 4, { align: 'right' });
  doc.text(formatPen(gravada), amountColRight, y + 4, { align: 'right' });
  y += 6.5;
  doc.text('IGV 18.00 %:', totalsLabelRight, y + 4, { align: 'right' });
  doc.text(formatPen(igv), amountColRight, y + 4, { align: 'right' });
  y += 7.5;

  doc.setFillColor(...primary);
  doc.roundedRect(amountColRight - col.amount - 2, y, col.amount + 4, 8, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL:', totalsLabelRight, y + 5.5, { align: 'right' });
  doc.text(formatPen(total), amountColRight, y + 5.5, { align: 'right' });
  y += 12;

  doc.setFillColor(...primaryLight);
  doc.setDrawColor(...primarySoft);
  doc.roundedRect(MARGIN, y, contentW, 10, 2, 2, 'FD');
  doc.setTextColor(...primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const amountWords = amountToWordsEs(total, 'SOLES');
  doc.text(`IMPORTE EN LETRAS: ${amountWords}`, MARGIN + 4, y + 6.5);
  y += 14;

  const footerBoxH = 42;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(leftX, y, boxW, footerBoxH, 2, 2, 'FD');
  doc.roundedRect(rightX, y, boxW, footerBoxH, 2, 2, 'FD');
  drawSectionTitle(doc, leftX, y, boxW, 'CUENTAS BANCARIAS', primary);
  drawSectionTitle(doc, rightX, y, boxW, 'TÉRMINOS Y CONDICIONES', primary);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  const bankLines = company.bankAccountsText.split('\n').filter(Boolean);
  let bankY = y + 11;
  bankLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(`• ${line}`, boxW - 6);
    doc.text(wrapped, leftX + 3, bankY);
    bankY += wrapped.length * 3.4 + 1;
  });

  const termLines = company.quoteTermsText.split('\n').filter(Boolean);
  let termY = y + 11;
  termLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(`• ${line}`, boxW - 6);
    doc.text(wrapped, rightX + 3, termY);
    termY += wrapped.length * 3.4 + 1;
  });

  y += footerBoxH + 5;

  const barH = 16;
  doc.setFillColor(...primary);
  doc.rect(0, 281 - barH, PAGE_W, barH + (297 - 281), 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const footerText = `${company.quoteDocumentLabel} ${quoteNumber}. ${company.quoteFooterText} ${company.supportUrl}`;
  const footerLines = doc.splitTextToSize(footerText, PAGE_W - MARGIN * 2 - 34);
  doc.text(footerLines, MARGIN, 281 - barH + 5);

  try {
    const qrUrl = `${company.supportUrl}?ref=${encodeURIComponent(quoteNumber)}`;
    const qrDataUrl = await withTimeout(
      QRCode.toDataURL(qrUrl, {
        margin: 0,
        width: 180,
        color: { dark: '#ffffff', light: '#00000000' },
      }),
      1_500,
      '',
    );
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', PAGE_W - MARGIN - 30, 281 - barH + 1, 28, 28);
    }
  } catch {
    // QR opcional si falla la generación.
  }

  const technicalSheet =
    options?.technicalSheet ??
    (quoteLines[0] ? buildQuoteTechnicalSheetFromLine(quoteLines[0]) : null);

  if (technicalSheet) {
    try {
      await drawTechnicalSheetPage(doc, technicalSheet, logo, primary, productImage);
    } catch {
      // La ficha técnica es opcional; no abortar la proforma si falla una imagen o overlay.
    }
  }

  const safeName = client.razonSocial.replace(/[^\w\s-]/g, '').trim().slice(0, 30);
  const filename = `${company.quoteNumberPrefix}-${quoteNumber.split('-').pop()}-${safeName || 'cliente'}.pdf`.toLowerCase();

  return {
    blob: doc.output('blob'),
    filename,
    quoteNumber,
  };
}

export function downloadQuotePdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
