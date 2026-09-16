import { GState, jsPDF } from 'jspdf';
import QRCode from 'qrcode';

import { amountToWordsEs } from '@/lib/amount-to-words-es';
import { buildEquipmentQuoteWarrantyLine } from '@/lib/build-product-quote-short-description';
import { ESTABILIZADOR_2KVA_PRODUCT_ID, ESTABILIZADOR_QUOTE_CODE } from '@/lib/equipment-config-catalog';
import { normalizePdfProductCode, pdfTableAmountColumnRight } from '@/lib/pdf-product-code';
import { imageBasePath } from '@/lib/responsive-image';
import { formatPenFromUsd, formatStorefrontUsd, penToUsd } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';
import type { ProductHeroSpecBullet } from '@/types/product-detail';
import type { Product } from '@/types/product';

export interface QuoteClientData {
  razonSocial: string;
  ruc: string;
  atencion: string;
  celular: string;
  direccion: string;
  ciudad: string;
}

export interface QuoteProductData {
  name: string;
  sku: string;
  brand: string;
  pricePen: number;
  /** Precio unitario USD (IGV incluido). Si falta, se deriva de pricePen. */
  priceUsd?: number;
  quantity?: number;
  imageUrl?: string | null;
  /** Descripción breve del producto (debajo del título en DESCRIPCIÓN). */
  shortDescription?: string | null;
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
  summaryNotes?: string[];
}

export interface GeneratedTechnicalSheetPdf {
  blob: Blob;
  filename: string;
}

type Rgb = [number, number, number];
type LoadedImage = { dataUrl: string; width: number; height: number };

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 12;
/** Texto de marca y bloque QR (HAITECH, NBN, PROFORMA / COT / RUC). */
const PROFORMA_INK: Rgb = [0, 0, 0];
/** Azul de acento: cajas, cabecera de tabla, recuadro Total y pie. */
const PROFORMA_PRIMARY: Rgb = [30, 74, 140];
/** Cabeceras de sección y fila de columnas en tablas del PDF. */
const PROFORMA_SECTION_HEADER: Rgb = [30, 74, 140];
const QUOTE_LOGO_PATH = '/logo.png';
const DEFAULT_PRINTER_FUNCTIONS = ['Copiadora', 'Impresora', 'Escáner'];
const IMAGE_LOAD_TIMEOUT_MS = 1_500;
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
  /** Convierte el trazo visible del logo a negro sobre fondo transparente. */
  monochromeBlack?: boolean;
  /**
   * Exporta PNG para conservar alpha.
   * Sin esto, el canvas se guarda como JPEG y la transparencia se vuelve negra.
   */
  preferPng?: boolean;
  /** Pinta el canvas en blanco antes de dibujar (jsPDF trata el alpha como negro). */
  compositeOnWhite?: boolean;
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

/** Logo oscuro con fondo transparente para proformas en papel blanco. */
function prepareDarkLogoForPdf(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  stripUniformBackground(context, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] ?? 0;
    if (alpha < 8) continue;
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 255;
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
        if (options.compositeOnWhite) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, width, height);
        }
        context.drawImage(image, 0, 0, width, height);
        if (options.stripBackground) {
          stripUniformBackground(context, width, height);
        }
        if (options.monochromeBlack) {
          prepareDarkLogoForPdf(context, width, height);
        }
        if (options.compositeOnWhite) {
          context.fillStyle = '#ffffff';
          context.globalCompositeOperation = 'destination-over';
          context.fillRect(0, 0, width, height);
          context.globalCompositeOperation = 'source-over';
        }
        const usePng =
          options.stripBackground ||
          options.monochromeBlack ||
          options.preferPng ||
          options.compositeOnWhite;
        resolve({
          dataUrl: usePng
            ? canvas.toDataURL('image/png')
            : canvas.toDataURL('image/jpeg', 0.92),
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

  const fetchUrl = resolveFetchUrl(src);
  const cacheKey = [
    fetchUrl,
    options.stripBackground ? 'nobg' : '',
    options.monochromeBlack ? 'black' : '',
    options.preferPng ? 'png' : '',
    options.compositeOnWhite ? 'white' : '',
  ]
    .filter(Boolean)
    .join('::');
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
        const response = await fetch(fetchUrl, { signal: controller.signal });
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

function productImageCandidateUrls(src: string): string[] {
  const trimmed = src.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('data:')) return [trimmed];

  const path = trimmed.split('?')[0]?.split('#')[0] ?? trimmed;
  const query = trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?')) : '';
  const urls: string[] = [];

  if (
    (path.startsWith('/products/') || path.startsWith('/album/')) &&
    !/-(?:256|512|768|1024|1280|1920|2560)\.webp$/i.test(path)
  ) {
    const base = imageBasePath(path);
    // Preferir resoluciones altas: la celda del PDF amplía la imagen.
    urls.push(`${base}-1024.webp${query}`);
    urls.push(`${base}-512.webp${query}`);
    urls.push(`${base}.webp${query}`);
    urls.push(`${base}-256.webp${query}`);
  }

  urls.push(trimmed);
  return [...new Set(urls)];
}

async function loadProductImageForQuote(src: string): Promise<LoadedImage | null> {
  for (const candidate of productImageCandidateUrls(src)) {
    const stripped = await loadImageDataUrl(candidate, { stripBackground: true });
    if (stripped) return stripped;
    const plain = await loadImageDataUrl(candidate);
    if (plain) return plain;
  }
  return null;
}

export function preloadQuotePdfAssets(imageUrls: Array<string | null | undefined> = []): void {
  void loadImageDataUrl(QUOTE_LOGO_PATH, { preferPng: true, compositeOnWhite: true });
  for (const url of imageUrls) {
    if (url?.trim()) void loadProductImageForQuote(url.trim());
  }
}

function isPlaceholderBankAccounts(text: string): boolean {
  return /194-123456789|0011-0123-456789012345/.test(text);
}

function isLegacyQuoteFooter(text: string): boolean {
  return /Representación impresa con fines informativos|Visita nuestro catálogo completo/i.test(text);
}

type QuoteBankDetail = {
  kind: 'soles' | 'dolares' | 'other';
  account: string;
  cci: string;
};

type QuoteBankBlock = {
  title: string;
  details: QuoteBankDetail[];
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function splitAccountAndCci(raw: string): { account: string; cci: string } {
  const cciMatch = /(?:—|–|\|)?\s*CCI(?:\s*(?:Soles|D[oó]lares))?\s*:?\s*([0-9][0-9\s-]{10,})\s*$/i.exec(
    raw,
  );
  if (!cciMatch) return { account: raw.trim(), cci: '' };
  return {
    account: raw.slice(0, cciMatch.index).replace(/[—–|]\s*$/, '').trim(),
    cci: digitsOnly(cciMatch[1] ?? ''),
  };
}

function inferQuoteBankCci(bank: string, account: string): string {
  const digits = digitsOnly(account);
  if (digits.length === 20) return digits;
  const name = bank.toUpperCase();
  if (name === 'BCP' && digits.length >= 11) {
    const office = digits.slice(0, 3);
    const body = digits.slice(3).padStart(14, '0').slice(-14);
    return `002${office}${body}`;
  }
  if (name === 'BBVA' && digits.length >= 16) {
    const normalized = digits.replace(/^0011/, '011');
    return normalized.padEnd(20, '0').slice(0, 20);
  }
  if (/^INTERBANK$/i.test(name) && digits.length >= 10) {
    const office = digits.slice(0, 3);
    const body = digits.slice(3).padStart(14, '0').slice(-14);
    return `003${office}${body}`;
  }
  return '';
}

function formatQuoteCci(cci: string): string {
  const digits = digitsOnly(cci);
  if (digits.length !== 20) return cci;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function parseQuoteBankDetail(raw: string, bank: string): QuoteBankDetail {
  const kind: QuoteBankDetail['kind'] = /^Soles\b/i.test(raw)
    ? 'soles'
    : /^D[oó]lares\b/i.test(raw)
      ? 'dolares'
      : 'other';
  const withoutKind = raw.replace(/^(Soles|D[oó]lares)\s*:?\s*/i, '').trim();
  const split = splitAccountAndCci(withoutKind);
  const cci = split.cci || inferQuoteBankCci(bank, split.account);
  return { kind, account: split.account, cci };
}

function parseQuoteBankBlocks(text: string): QuoteBankBlock[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const blocks: QuoteBankBlock[] = [];
  let current: QuoteBankBlock | null = null;

  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };

  const bankTitle = (raw: string) => {
    const upper = raw.toUpperCase();
    if (upper === 'INTERBANK') return 'Interbank';
    if (upper === 'YAPE') return 'Yape';
    return upper;
  };

  const pushDetail = (bank: string, raw: string) => {
    if (!current || current.title !== bank) {
      flush();
      current = { title: bank, details: [] };
    }
    current.details.push(parseQuoteBankDetail(raw, bank));
  };

  for (const line of lines) {
    if (/^Yape\b/i.test(line)) {
      flush();
      blocks.push({ title: line, details: [] });
      continue;
    }

    const labeled = /^(BCP|BBVA|Interbank)\s+(SOLES|D[OÓ]LARES)\s*:?\s*(.+)$/i.exec(line);
    if (labeled) {
      const bank = bankTitle(labeled[1] ?? '');
      const kind = /soles/i.test(labeled[2] ?? '') ? 'Soles' : 'Dólares';
      pushDetail(bank, `${kind}: ${labeled[3] ?? ''}`);
      continue;
    }

    const header = /^(BCP|BBVA|Interbank)\b/i.exec(line);
    const isAmountLine = /^(Soles|D[oó]lares)\b/i.test(line);
    if (header && !isAmountLine) {
      flush();
      current = { title: bankTitle(header[1] ?? ''), details: [] };
      const rest = line.slice(header[0].length).replace(/^[:\s]+/, '').trim();
      if (rest) current.details.push(parseQuoteBankDetail(rest, current.title));
      continue;
    }

    if (current && isAmountLine) {
      current.details.push(parseQuoteBankDetail(line.replace(/\s+/g, ' '), current.title));
      continue;
    }

    if (current) {
      current.details.push(parseQuoteBankDetail(line, current.title));
    } else {
      blocks.push({ title: line, details: [] });
    }
  }
  flush();
  return blocks;
}

function isQuoteStabilizerLine(line: QuoteProductData): boolean {
  const hay = `${line.sku} ${line.name}`.toLowerCase();
  return (
    line.sku === ESTABILIZADOR_2KVA_PRODUCT_ID ||
    line.sku === 'ESTAB-2KVA' ||
    (/estabilizador/.test(hay) && /2000|2\s*kva|2kva/.test(hay))
  );
}

function quoteLineDisplayCode(line: QuoteProductData): string {
  if (isQuoteStabilizerLine(line)) return ESTABILIZADOR_QUOTE_CODE;
  return normalizePdfProductCode(line.sku, line.brand);
}

function isQuoteEquipmentLine(line: QuoteProductData): boolean {
  if (isQuoteStabilizerLine(line)) return false;
  const name = line.name.toLowerCase();
  const brief = line.shortDescription?.toLowerCase() ?? '';
  if (/t[oó]ner|cartucho|chip|repuesto|almohadilla|cilindro/.test(name) && !/multifuncional|impresora|fotocopiadora/.test(name)) {
    return false;
  }
  return (
    /multifuncional|impresora|fotocopiadora|copiadora/.test(name) ||
    /condici[oó]n:/.test(brief)
  );
}

function withEquipmentWarranty(line: QuoteProductData, brief: string): string {
  if (!isQuoteEquipmentLine(line) || /garant[ií]a/i.test(brief)) return brief;
  const source = `${line.name}\n${brief}`;
  const warranty = buildEquipmentQuoteWarrantyLine(source);
  if (!brief) return `Garantía:\n• ${warranty}`;
  return `${brief}\n\nGarantía:\n• ${warranty}`;
}

function drawWhatsAppMark(doc: jsPDF, x: number, y: number, size: number, fill: Rgb, cut: Rgb) {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;
  doc.setFillColor(...fill);
  doc.circle(cx, cy, r, 'F');
  doc.setFillColor(...cut);
  doc.circle(cx + r * 0.05, cy - r * 0.08, r * 0.58, 'F');
  doc.setFillColor(...fill);
  doc.circle(cx + r * 0.08, cy - r * 0.12, r * 0.22, 'F');
}

function quoteLineUnitUsd(line: QuoteProductData, exchangeRate: number): number {
  if (line.priceUsd != null && Number.isFinite(line.priceUsd) && line.priceUsd > 0) {
    return Math.round(line.priceUsd * 100) / 100;
  }
  return penToUsd(line.pricePen, exchangeRate);
}

function normalizeQuoteCompany(company: CompanySettings): CompanySettings {
  const bankAccountsText = String(
    company.bankAccountsText ?? DEFAULT_COMPANY_SETTINGS.bankAccountsText,
  ).trim();
  const quoteFooterText = String(
    company.quoteFooterText ?? DEFAULT_COMPANY_SETTINGS.quoteFooterText,
  ).trim();

  return {
    ...DEFAULT_COMPANY_SETTINGS,
    ...company,
    companyName: String(company.companyName ?? DEFAULT_COMPANY_SETTINGS.companyName).trim(),
    legalName: String(company.legalName ?? DEFAULT_COMPANY_SETTINGS.legalName).trim(),
    bankAccountsText: isPlaceholderBankAccounts(bankAccountsText)
      ? DEFAULT_COMPANY_SETTINGS.bankAccountsText
      : bankAccountsText || DEFAULT_COMPANY_SETTINGS.bankAccountsText,
    quoteTermsText: String(company.quoteTermsText ?? DEFAULT_COMPANY_SETTINGS.quoteTermsText).trim(),
    quoteFooterText: isLegacyQuoteFooter(quoteFooterText)
      ? DEFAULT_COMPANY_SETTINGS.quoteFooterText
      : quoteFooterText || DEFAULT_COMPANY_SETTINGS.quoteFooterText,
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

const QUOTE_SALES_EMAIL = 'ventas@haitech.pe';
const QUOTE_CURRENCY_LABEL = 'DÓLARES (USD)';

function formatQuoteUsd(value: number): string {
  return formatStorefrontUsd(value);
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function sanitizePdfFilenamePart(value: string, max = 40): string {
  return value
    .normalize('NFC')
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function formatFilenameDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

function quoteFilenameProductTitle(lines: QuoteProductData[]): string {
  const preferred = lines.find((line) => line.name.trim() && !isQuoteStabilizerLine(line));
  return (preferred ?? lines[0])?.name.trim() || 'producto';
}

/** PROFORMA {código} {título} - {razón social} {atención} {fecha}.pdf */
function buildQuotePdfFilename(input: {
  documentLabel: string;
  quoteNumber: string;
  productTitle: string;
  razonSocial: string;
  atencion: string;
  issueDate: Date;
}): string {
  const label = sanitizePdfFilenamePart(input.documentLabel || 'PROFORMA', 20) || 'PROFORMA';
  const code = sanitizePdfFilenamePart(input.quoteNumber, 28);
  const title = sanitizePdfFilenamePart(input.productTitle, 80) || 'producto';
  const razon = sanitizePdfFilenamePart(input.razonSocial, 50) || 'cliente';
  const atencion = sanitizePdfFilenamePart(input.atencion, 40);
  const date = formatFilenameDate(input.issueDate);
  const clientPart = [razon, atencion].filter(Boolean).join(' ');
  const stem = `${label} ${code} ${title} - ${clientPart} ${date}`.replace(/\s+/g, ' ').trim();
  return `${stem.slice(0, 180)}.pdf`;
}

function imageFormat(dataUrl: string): 'PNG' | 'JPEG' {
  const mime = dataUrl.match(/^data:([^;]+)/i)?.[1]?.toLowerCase() ?? '';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'JPEG';
  return 'PNG';
}

function fitImageToTextHeight(
  width: number,
  height: number,
  maxWidth: number,
  targetHeight: number,
): { width: number; height: number } {
  const ratio = width / Math.max(height, 1);
  let h = Math.max(targetHeight, 1);
  let w = h * ratio;
  if (w > maxWidth) {
    w = maxWidth;
    h = w / ratio;
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
  vAlign: 'center' | 'top' = 'center',
) {
  try {
    const size = fitImageToTextHeight(image.width, image.height, maxWidth, maxHeight);
    const offsetX = x + (maxWidth - size.width) / 2;
    const offsetY = vAlign === 'top' ? y : y + Math.max(0, (maxHeight - size.height) / 2);
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
  const titleH = 5.5;
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, titleH, 1.2, 1.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(title, x + 2.5, y + 3.7);
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
  return QUOTE_LOGO_PATH;
}

async function loadQuoteLogo(
  _company: CompanySettings,
  options: Pick<RasterizeImageOptions, 'stripBackground' | 'monochromeBlack'> = {},
): Promise<LoadedImage | null> {
  // logo.png es negro sobre transparente. jsPDF pinta el alpha como negro
  // (rectángulo sólido): hay que componerlo sobre blanco y exportar PNG.
  const logoOptions: RasterizeImageOptions = {
    stripBackground: options.stripBackground ?? false,
    monochromeBlack: options.monochromeBlack ?? false,
    preferPng: true,
    compositeOnWhite: true,
  };
  const candidates = [QUOTE_LOGO_PATH];

  const seen = new Set<string>();
  const unique = candidates.filter((url) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });

  for (const url of unique) {
    const loaded = await loadImageDataUrl(url, logoOptions);
    if (loaded) return loaded;
  }
  return null;
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

async function drawTechnicalSheetContent(
  doc: jsPDF,
  sheet: QuoteTechnicalSheetData,
  logo: LoadedImage | null,
  primary: Rgb,
  heroImage: LoadedImage | null = null,
) {
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
  const bullets =
    sheet.bullets.length > 0
      ? sheet.bullets
      : ['Consulte especificaciones con nuestro equipo comercial.'];

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

/** PDF separado de ficha técnica (una o varias páginas; no va dentro de la proforma). */
export async function buildTechnicalSheetPdf(
  sheets: QuoteTechnicalSheetData | QuoteTechnicalSheetData[],
  companyInput: CompanySettings,
): Promise<GeneratedTechnicalSheetPdf> {
  const list = (Array.isArray(sheets) ? sheets : [sheets]).filter(Boolean);
  if (list.length === 0) {
    throw new Error('No hay ficha técnica para generar.');
  }

  const company = normalizeQuoteCompany(companyInput);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const primary = PROFORMA_PRIMARY;
  const logo = await loadQuoteLogo(company);

  for (let i = 0; i < list.length; i += 1) {
    if (i > 0) doc.addPage();
    const sheet = list[i]!;
    const heroImage = sheet.imageUrl ? await loadProductImageForQuote(sheet.imageUrl) : null;
    await drawTechnicalSheetContent(doc, sheet, logo, primary, heroImage);
  }

  const first = list[0]!;
  const safeModel = sanitizePdfFilenamePart(first.modelName).toLowerCase().replace(/\s+/g, '-');
  const filename =
    list.length === 1
      ? `ficha-tecnica-${safeModel}.pdf`
      : `fichas-tecnicas-${list.length}-equipos.pdf`;

  return { blob: doc.output('blob'), filename };
}

export async function downloadTechnicalSheetPdf(
  sheets: QuoteTechnicalSheetData | QuoteTechnicalSheetData[],
  companyInput: CompanySettings,
): Promise<GeneratedTechnicalSheetPdf | null> {
  try {
    const generated = await buildTechnicalSheetPdf(sheets, companyInput);
    downloadQuotePdf(generated.blob, generated.filename);
    return generated;
  } catch {
    return null;
  }
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
  const primary = PROFORMA_PRIMARY;
  const tableHeader = PROFORMA_SECTION_HEADER;
  const contentW = PAGE_W - MARGIN * 2;
  const exchangeRate =
    Number(companyInput.usdToPenExchangeRate) || DEFAULT_COMPANY_SETTINGS.usdToPenExchangeRate;

  const issueDate = new Date();
  const expiryDate = new Date(issueDate);
  expiryDate.setDate(expiryDate.getDate() + company.quoteValidityDays);

  const lineTotals = quoteLines.map((line) => {
    const quantity = line.quantity ?? 1;
    const unitUsd = quoteLineUnitUsd(line, exchangeRate);
    return Math.round(unitUsd * quantity * 100) / 100;
  });
  const totalUsd = Math.round(lineTotals.reduce((sum, value) => sum + value, 0) * 100) / 100;
  const gravadaUsd = Math.round((totalUsd / 1.18) * 100) / 100;
  const igvUsd = Math.round((totalUsd - gravadaUsd) * 100) / 100;

  const quoteNumber = buildQuoteNumber(company);
  const qrPayload = `${company.supportUrl}?ref=${encodeURIComponent(quoteNumber)}`;

  const [logo, lineImages, badgeQrDataUrl] = await Promise.all([
    loadQuoteLogo(company, { stripBackground: false }),
    Promise.all(
      quoteLines.map((line) =>
        line.imageUrl?.trim()
          ? loadProductImageForQuote(line.imageUrl.trim())
          : Promise.resolve(null),
      ),
    ),
    withTimeout(
      QRCode.toDataURL(qrPayload, {
        margin: 0,
        width: 160,
        color: { dark: '#000000', light: '#00000000' },
      }),
      1_500,
      '',
    ),
  ]);

  let y = MARGIN;

  const qrSize = 18;
  const logoW = 42;
  const logoH = 16;
  const rucText = `RUC ${company.ruc}`;

  if (logo) {
    addFittedImage(doc, logo, MARGIN, y + 2, logoW, logoH, 'top');
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const labelW = doc.getTextWidth(company.quoteDocumentLabel);
  doc.setFontSize(6.8);
  const codeW = doc.getTextWidth(quoteNumber);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6);
  const rucW = doc.getTextWidth(rucText);
  const clusterW = Math.max(qrSize, labelW, codeW, rucW) + 2;
  const clusterCenterX = PAGE_W - MARGIN - clusterW / 2;
  const qrX = clusterCenterX - qrSize / 2;
  const qrY = y + 1;
  if (badgeQrDataUrl) {
    doc.addImage(badgeQrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  }

  doc.setTextColor(...PROFORMA_INK);
  doc.setFont('helvetica', 'bold');
  let badgeY = qrY + qrSize + 3.4;
  doc.setFontSize(8);
  doc.text(company.quoteDocumentLabel, clusterCenterX, badgeY, { align: 'center' });
  badgeY += 3.2;
  doc.setFontSize(6.8);
  doc.text(quoteNumber, clusterCenterX, badgeY, { align: 'center' });
  badgeY += 3.1;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6);
  doc.text(rucText, clusterCenterX, badgeY, { align: 'center' });

  const clusterX = PAGE_W - MARGIN - clusterW;
  const centerX = MARGIN + logoW + 3;
  const centerW = Math.max(52, clusterX - centerX - 3);
  let centerY = y + 4.5;

  doc.setTextColor(...PROFORMA_INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text(company.companyName, centerX + centerW / 2, centerY, { align: 'center' });
  centerY += 3.8;
  doc.setFontSize(7.8);
  doc.text(company.legalName, centerX + centerW / 2, centerY, { align: 'center' });
  centerY += 3.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const addressLine = company.address.trim();
  const addressLines = doc.splitTextToSize(addressLine, centerW);
  doc.text(addressLines, centerX + centerW / 2, centerY, { align: 'center' });
  centerY += addressLines.length * 2.6 + 0.8;
  const descLines = doc.splitTextToSize(company.businessDescription || company.tagline, centerW);
  doc.text(descLines, centerX + centerW / 2, centerY, { align: 'center' });
  centerY += descLines.length * 2.6 + 0.6;
  doc.setFontSize(6.2);
  doc.setTextColor(23, 23, 23);
  const contactLine = `Ventas: 915 149 290 | Soporte/Alquiler 965 805 873 | ${QUOTE_SALES_EMAIL}`;
  const contactLines = doc.splitTextToSize(contactLine, centerW);
  doc.text(contactLines, centerX + centerW / 2, centerY, { align: 'center' });
  centerY += contactLines.length * 2.5;

  y = Math.max(centerY + 3, badgeY + 4, y + 28);

  const boxGap = 8;
  const boxW = (contentW - boxGap) / 2;
  const clientRows: [string, string][] = [
    ['CLIENTE:', client.razonSocial],
    ['RUC:', client.ruc],
    ['DIRECCIÓN:', client.direccion],
    ['CIUDAD:', client.ciudad],
    ['ATENCIÓN:', client.atencion],
    ['CELULAR:', client.celular],
  ];
  const detailRows: [string, string][] = [
    ['FECHA EMISIÓN:', formatShortDate(issueDate)],
    ['FECHA DE VENC.:', formatShortDate(expiryDate)],
    ['MONEDA:', QUOTE_CURRENCY_LABEL],
    ['TIPO DE CLIENTE:', company.defaultClientType],
  ];
  const fieldLabelW = 18;
  const valueW = boxW - 8;
  const sectionTitleH = 5.5;
  const afterTitleGap = 4.4;
  const clientLineH = 3.15;
  const measureRowBlock = (rows: [string, string][], rowLabelW: number) =>
    rows.reduce((height, [, value]) => {
      const lines = doc.splitTextToSize(value || ' ', valueW - rowLabelW);
      return height + Math.max(Array.isArray(lines) ? lines.length : 1, 1) * clientLineH;
    }, 0);
  const boxH =
    sectionTitleH +
    afterTitleGap +
    Math.max(measureRowBlock(clientRows, fieldLabelW), measureRowBlock(detailRows, 28)) +
    2.4;
  const leftX = MARGIN;
  const rightX = MARGIN + boxW + boxGap;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(leftX, y, boxW, boxH, 2, 2, 'FD');
  doc.roundedRect(rightX, y, boxW, boxH, 2, 2, 'FD');

  drawSectionTitle(doc, leftX, y, boxW, 'DATOS DEL CLIENTE', tableHeader);
  drawSectionTitle(doc, rightX, y, boxW, 'DETALLE DE LA PROFORMA', tableHeader);

  let rowY = y + sectionTitleH + afterTitleGap;
  const labelWInner = 18;
  const valueWInner = boxW - 8;

  clientRows.forEach(([label, value]) => {
    const drawn = drawLabelValue(doc, label, value, leftX + 3, rowY, labelWInner, valueWInner);
    rowY += Math.max(drawn, 1) * clientLineH;
  });

  rowY = y + sectionTitleH + afterTitleGap;
  detailRows.forEach(([label, value]) => {
    const drawn = drawLabelValue(doc, label, value, rightX + 3, rowY, 28, valueWInner);
    rowY += Math.max(drawn, 1) * clientLineH;
  });

  y += boxH + 1.4;

  const tableX = MARGIN;
  const tableW = contentW;
  const col = {
    n: 7,
    code: 18,
    img: 30,
    desc: 54,
    qty: 10,
    um: 16,
    unit: 23,
    amount: 26,
  };
  const amountColRight = pdfTableAmountColumnRight(tableX, tableW);
  const unitColRight = amountColRight - col.amount;

  const headerH = 6;
  doc.setFillColor(...tableHeader);
  doc.roundedRect(tableX, y, tableW, headerH, 1.2, 1.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.6);

  let cx = tableX + 2;
  doc.text('N°', cx + col.n / 2 - 1, y + 4.1, { align: 'center' });
  cx += col.n;
  doc.text('CÓDIGO', cx + col.code / 2 - 1, y + 4.1, { align: 'center' });
  cx += col.code;
  doc.text('IMAGEN', cx + 1, y + 4.1);
  cx += col.img;
  doc.text('DESCRIPCIÓN', cx + 1, y + 4.1);
  cx += col.desc;
  doc.text('CANT.', cx + 2, y + 4.1);
  cx += col.qty;
  doc.text('Unidad', cx + col.um / 2, y + 4.1, { align: 'center' });
  cx += col.um;
  doc.text('P. Unit', unitColRight, y + 4.1, { align: 'right' });
  doc.text('Total', amountColRight, y + 4.1, { align: 'right' });

  y += headerH;
  const baseRowH = 26;
  const descLineHeightFactor = 1.08;
  const titleToBriefGap = 0.25;
  const textStartOffset = 3.2;
  const briefFontSize = 5.8;
  const titleFontSize = 6.4;
  const mmPerPt = 1 / doc.internal.scaleFactor;
  const titleLineH = titleFontSize * mmPerPt * descLineHeightFactor;
  const briefLineH = briefFontSize * mmPerPt * descLineHeightFactor;

  quoteLines.forEach((line, index) => {
    const quantity = line.quantity ?? 1;
    const unitPriceUsd = quoteLineUnitUsd(line, exchangeRate);
    const lineTotalUsd = Math.round(unitPriceUsd * quantity * 100) / 100;
    const rowImage = lineImages[index] ?? null;

    const brief = withEquipmentWarranty(line, line.shortDescription?.trim() || '');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(titleFontSize);
    const titleLines = doc.splitTextToSize(line.name, col.desc - 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(briefFontSize);
    const briefLines: string[] = [];
    if (brief) {
      for (const source of brief.split(/\r?\n/)) {
        const trimmed = source.trim();
        if (!trimmed) {
          if (briefLines.length > 0) briefLines.push(' ');
          continue;
        }
        briefLines.push(...doc.splitTextToSize(trimmed, col.desc - 2));
      }
    }
    const textBlockH =
      titleLines.length * titleLineH +
      (briefLines.length > 0 ? titleToBriefGap + briefLines.length * briefLineH : 0);
    const rowH = Math.max(baseRowH, textStartOffset + textBlockH + 4.5);

    if (y + rowH > PAGE_H - 18) {
      doc.addPage();
      y = MARGIN;
    }

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.rect(tableX, y, tableW, rowH, 'FD');

    let cellX = tableX + 2;
    const midY = y + rowH / 2;
    doc.setTextColor(23, 23, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(String(index + 1), cellX + col.n / 2 - 1, midY, { align: 'center', baseline: 'middle' });
    cellX += col.n;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    const codeLines = doc.splitTextToSize(
      quoteLineDisplayCode(line),
      col.code - 2,
    );
    doc.setLineHeightFactor(descLineHeightFactor);
    doc.text(codeLines, cellX + col.code / 2 - 1, midY, {
      align: 'center',
      baseline: 'middle',
    });
    cellX += col.code;

    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(255, 255, 255);
    const imgPad = 1.2;
    const imgBoxW = col.img - 2;
    const imgBoxH = Math.max(14, rowH - 4);
    doc.roundedRect(cellX + 1, y + 2, imgBoxW, imgBoxH, 1.2, 1.2, 'FD');
    if (rowImage) {
      addFittedImage(
        doc,
        rowImage,
        cellX + 1 + imgPad,
        y + 2 + imgPad,
        imgBoxW - imgPad * 2,
        imgBoxH - imgPad * 2,
        'center',
      );
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184);
      doc.text('S/IMG', cellX + imgBoxW / 2, midY, { align: 'center', baseline: 'middle' });
    }
    cellX += col.img;

    doc.setLineHeightFactor(descLineHeightFactor);
    const textStartY = y + Math.max(2, (rowH - textBlockH) / 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(titleFontSize);
    doc.setTextColor(23, 23, 23);
    doc.text(titleLines, cellX + 1, textStartY, { baseline: 'top' });
    if (briefLines.length > 0) {
      const briefY = textStartY + titleLines.length * titleLineH + titleToBriefGap;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(briefFontSize);
      doc.setTextColor(71, 85, 105);
      doc.text(briefLines, cellX + 1, briefY, { baseline: 'top' });
    }
    cellX += col.desc;

    doc.setLineHeightFactor(1.15);
    doc.setTextColor(23, 23, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text(String(quantity), cellX + col.qty / 2, midY, { align: 'center', baseline: 'middle' });
    cellX += col.qty;

    doc.setFont('helvetica', 'normal');
    doc.text('UNIDAD', cellX + col.um / 2, midY, { align: 'center', baseline: 'middle' });
    cellX += col.um;

    doc.setFont('helvetica', 'bold');
    doc.text(formatQuoteUsd(unitPriceUsd), unitColRight, midY, { align: 'right', baseline: 'middle' });
    doc.text(formatQuoteUsd(lineTotalUsd), amountColRight, midY, { align: 'right', baseline: 'middle' });

    y += rowH;
  });

  if (y + 42 > PAGE_H - 16) {
    doc.addPage();
    y = MARGIN;
  } else {
    y += 0.7;
  }

  const totalsLabelRight = unitColRight - 2;
  const totalUsdText = formatQuoteUsd(totalUsd);
  const lettersW = Math.max(58, totalsLabelRight - 24 - MARGIN);
  const amountWords = amountToWordsEs(totalUsd, 'DÓLARES');
  const lettersBlock = `IMPORTE EN LETRAS: ${amountWords}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  const lettersLines = doc.splitTextToSize(lettersBlock, lettersW);

  const totalsStartY = y;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text('GRAVADA:', totalsLabelRight, y + 2.2, { align: 'right' });
  doc.text(formatQuoteUsd(gravadaUsd), amountColRight, y + 2.2, { align: 'right' });
  y += 4.4;
  doc.text('IGV 18.00 %:', totalsLabelRight, y + 3.2, { align: 'right' });
  doc.text(formatQuoteUsd(igvUsd), amountColRight, y + 3.2, { align: 'right' });
  y += 4.8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const totalBoxPadX = 1.5;
  const totalBoxW = doc.getTextWidth(totalUsdText) + totalBoxPadX * 2;
  const totalBoxX = amountColRight - totalBoxW + totalBoxPadX;
  doc.setFillColor(...tableHeader);
  doc.roundedRect(totalBoxX, y, totalBoxW, 5.4, 1, 1, 'F');
  doc.setTextColor(55, 65, 81);
  doc.text('Total US$', totalsLabelRight, y + 3.8, { align: 'right' });
  doc.setTextColor(255, 255, 255);
  doc.text(totalUsdText, amountColRight, y + 3.8, { align: 'right' });
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(23, 23, 23);
  doc.text(
    `(Soles ${formatPenFromUsd(totalUsd, exchangeRate)})`,
    amountColRight,
    y,
    { align: 'right' },
  );

  doc.setTextColor(...primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setLineHeightFactor(1.2);
  doc.text(lettersLines, MARGIN, totalsStartY + 2.2);
  doc.setLineHeightFactor(1.15);

  const lettersBottom = totalsStartY + 2.2 + lettersLines.length * 3.4;
  y = Math.max(y + 6, lettersBottom + 4);

  const summaryNotes = options?.summaryNotes?.filter((note) => note != null) ?? [];
  if (summaryNotes.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const notesWidth = contentW - 8;
    let notesBoxH = 11;
    summaryNotes.forEach((note) => {
      if (!note.trim()) {
        notesBoxH += 3;
        return;
      }
      notesBoxH += doc.splitTextToSize(note, notesWidth).length * 3.5 + 0.8;
    });
    notesBoxH += 4;

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN, y, contentW, notesBoxH, 2, 2, 'FD');
    drawSectionTitle(doc, MARGIN, y, contentW, 'DETALLE DEL PLAN DE ALQUILER', tableHeader);

    let notesY = y + 9;
    doc.setTextColor(51, 65, 85);
    summaryNotes.forEach((note) => {
      if (!note.trim()) {
        notesY += 3;
        return;
      }
      const wrapped = doc.splitTextToSize(note, notesWidth);
      doc.text(wrapped, MARGIN + 4, notesY);
      notesY += wrapped.length * 3.5 + 0.8;
    });
    y += notesBoxH + 5;
  }

  const bankBlocks = parseQuoteBankBlocks(company.bankAccountsText);
  const termLines = company.quoteTermsText.split('\n').filter(Boolean);
  const banksAfterTitle = 4.8;
  const bankLineH = 2.35;
  const bankBlockGap = 1.15;
  const termLineH = 2.45;
  const termGap = 0.45;
  const footerBoxH = Math.max(
    28,
    5.5 +
      banksAfterTitle +
      bankBlocks.reduce((sum, block) => {
        const titleWrap = /^yape\b/i.test(block.title) ? 2 : 1;
        return sum + titleWrap * bankLineH + block.details.length * bankLineH + bankBlockGap;
      }, 0),
    5.5 + banksAfterTitle + termLines.length * (termLineH + termGap) + 4,
  );

  if (y + footerBoxH + 16 > PAGE_H) {
    doc.addPage();
    y = MARGIN;
  }

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(leftX, y, boxW, footerBoxH, 2, 2, 'FD');
  doc.roundedRect(rightX, y, boxW, footerBoxH, 2, 2, 'FD');
  drawSectionTitle(doc, leftX, y, boxW, 'CUENTAS BANCARIAS', tableHeader);
  drawSectionTitle(doc, rightX, y, boxW, 'TÉRMINOS Y CONDICIONES', tableHeader);

  doc.setTextColor(51, 65, 85);
  let bankY = y + 5.5 + banksAfterTitle;
  const bankLeftW = (boxW - 8) * 0.52;
  const bankRightX = leftX + 3 + bankLeftW;
  bankBlocks.forEach((block) => {
    const isYape = /^yape\b/i.test(block.title);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    if (isYape) {
      const titleLines = doc.splitTextToSize(block.title, boxW - 6);
      doc.text(titleLines, leftX + 3, bankY);
      bankY += titleLines.length * bankLineH + bankBlockGap;
      return;
    }

    doc.text(block.title, leftX + 3, bankY);
    bankY += bankLineH;
    block.details.forEach((detail) => {
      const kindLabel =
        detail.kind === 'soles' ? 'Soles' : detail.kind === 'dolares' ? 'Dólares' : '';
      const leftText = kindLabel ? `${kindLabel}: ${detail.account}` : detail.account;
      const cciLabel =
        detail.kind === 'soles' ? 'CCI Soles' : detail.kind === 'dolares' ? 'CCI Dólares' : 'CCI';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      const leftLines = doc.splitTextToSize(leftText, bankLeftW - 1);
      doc.text(leftLines, leftX + 3, bankY);
      if (detail.cci) {
        const cciLines = doc.splitTextToSize(
          `${cciLabel}: ${formatQuoteCci(detail.cci)}`,
          boxW - 8 - bankLeftW,
        );
        doc.text(cciLines, bankRightX, bankY);
      }
      bankY += Math.max(leftLines.length, 1) * 2.15;
    });
    bankY += bankBlockGap;
  });

  let termY = y + 5.5 + banksAfterTitle;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.9);
  termLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(`• ${line}`, boxW - 6);
    doc.text(wrapped, rightX + 3, termY);
    termY += wrapped.length * termLineH + termGap;
  });

  const barH = 10;
  const barY = PAGE_H - barH;
  doc.setFillColor(...tableHeader);
  doc.rect(0, barY, PAGE_W, barH, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.6);
  const footerLeft = 'Gracias por confiar en HAITECH  |  Conoce más soluciones en: www.haitech.pe';
  const footerRight = '915149290 / 965 805 873   Av. Petit Thouars 1935 - Lince';
  const iconSize = 3.6;
  const iconGap = 1.4;
  const leftW = doc.getTextWidth(footerLeft);
  const rightW = doc.getTextWidth(footerRight);
  const groupW = leftW + iconGap + iconSize + iconGap + rightW;
  const groupX = (PAGE_W - groupW) / 2;
  const footerY = barY + 6.2;
  doc.text(footerLeft, groupX, footerY);
  drawWhatsAppMark(doc, groupX + leftW + iconGap, footerY - iconSize + 0.4, iconSize, [255, 255, 255], tableHeader);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.6);
  doc.text(footerRight, groupX + leftW + iconGap + iconSize + iconGap, footerY);

  const filename = buildQuotePdfFilename({
    documentLabel: company.quoteDocumentLabel,
    quoteNumber,
    productTitle: quoteFilenameProductTitle(quoteLines),
    razonSocial: client.razonSocial,
    atencion: client.atencion,
    issueDate,
  });

  doc.setProperties({
    title: filename.replace(/\.pdf$/i, ''),
    subject: `${company.quoteDocumentLabel} ${quoteNumber}`,
    author: company.legalName,
    creator: company.companyName,
  });

  return {
    blob: doc.output('blob'),
    filename,
    quoteNumber,
  };
}

function sanitizeDownloadFilename(filename: string): string {
  const cleaned = filename.replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
  const withExt = /\.pdf$/i.test(cleaned) ? cleaned : `${cleaned || 'PROFORMA'}.pdf`;
  return withExt.slice(0, 184);
}

export function createNamedPdfFile(blob: Blob, filename: string): File {
  const pdfBlob =
    blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
  return new File([pdfBlob], sanitizeDownloadFilename(filename), {
    type: 'application/pdf',
    lastModified: Date.now(),
  });
}

function triggerNamedPdfDownload(file: File): void {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.rel = 'noopener';
  anchor.type = 'application/pdf';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName?: string;
    types?: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<{
    createWritable: () => Promise<{
      write: (data: Blob) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
};

/** Descarga el PDF con el nombre de la proforma. No abre el visor blob (UUID). */
export function downloadQuotePdf(
  blob: Blob,
  filename: string,
  options?: { skipPicker?: boolean },
): void {
  const file = createNamedPdfFile(blob, filename);
  const picker = options?.skipPicker ? undefined : (window as SaveFilePickerWindow).showSaveFilePicker;

  if (typeof picker === 'function') {
    void picker
      .call(window, {
        suggestedName: file.name,
        types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }],
      })
      .then(async (handle) => {
        const writable = await handle.createWritable();
        await writable.write(file);
        await writable.close();
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        triggerNamedPdfDownload(file);
      });
    return;
  }

  triggerNamedPdfDownload(file);
}

/** Comparte el PDF con el nombre de archivo de la proforma (p. ej. WhatsApp). */
export function shareQuotePdf(blob: Blob, filename: string): void {
  const file = createNamedPdfFile(blob, filename);
  if (
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    void navigator.share({ files: [file], title: file.name, text: file.name }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      triggerNamedPdfDownload(file);
    });
    return;
  }
  triggerNamedPdfDownload(file);
}
