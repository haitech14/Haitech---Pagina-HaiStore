const KNOWN_BRAND_DISPLAY: Record<string, string> = {
  ricoh: 'Ricoh',
  hp: 'HP',
  canon: 'Canon',
  epson: 'Epson',
  brother: 'Brother',
  konica: 'Konica',
  'konica minolta': 'Konica Minolta',
  minolta: 'Minolta',
  kyocera: 'Kyocera',
  xerox: 'Xerox',
  lexmark: 'Lexmark',
  samsung: 'Samsung',
  pantum: 'Pantum',
  intercopy: 'Intercopy',
  lanier: 'Lanier',
  teros: 'Teros',
  'tp-link': 'TP-Link',
  ugreen: 'Ugreen',
  lenovo: 'Lenovo',
  lg: 'LG',
};

const MODEL_PATTERNS: RegExp[] = [
  /\bIM\s+C\s*\d{3,4}[A-Z]?\b/gi,
  /\bIM\s*\d{3,4}[A-Z]{0,3}(?:\s*SPDF)?\b/gi,
  /\bMP\s+C\s*\d{3,4}[A-Z]?\b/gi,
  /\bMP\s*[A-Z]?\s*\d{3,4}[A-Z+]*\b/gi,
  /\bSP\s+C\s*\d{3,4}[A-Z]?\b/gi,
  /\bSP\s*\d{3,4}[A-Z]?\b/gi,
  /\b(?:M|P)\s+C\s*\d{3,4}[A-Z]{0,3}\b/gi,
  /\b(?:M|P)\s+C\s*\d{3,4}\s+[A-Z]\b/gi,
  /\b(?:M|P)\s*\d{3,4}[A-Z]{0,3}\b/gi,
  /\bBIZHUB\s+[A-Z]?\d{3,4}[A-Z]?\b/gi,
  /\bAFICIO\s+SP\s+C\s*\d{3,4}[A-Z]?\b/gi,
  /\bimageRUNNER(?:\s+ADVANCE)?\s+[\w-]+/gi,
  /\bTASKALFA\s*\d{3,5}\b/gi,
  /\bECOSYS\s*[A-Z]?\d{3,5}\b/gi,
  /\bWORKCENTRE\s*\d{3,5}\b/gi,
  /\bVERSALINK\s*[A-Z]?\d{3,5}\b/gi,
  /\bDF\d{3,4}\b/gi,
  /\bGPR-\d{2,3}\b/gi,
  /\bTN\d{2,4}\+?\b/gi,
  /\b[A-Z]{1,3}\d{3,5}[A-Z]{0,3}\b/g,
];

const LITERAL_PATTERNS: RegExp[] = [/\bB\/N\b/g, /\b(?:110|220|100|240)V\b/gi];

const SPANISH_PRODUCT_ACCENT_WORDS: Record<string, string> = {
  toner: 'tóner',
  monocromatico: 'monocromático',
  monocromatica: 'monocromática',
  laser: 'láser',
  separacion: 'separación',
  imagen: 'imagen',
  revelado: 'revelado',
  cilindro: 'cilindro',
  termica: 'térmica',
  electrica: 'eléctrica',
  mecanica: 'mecánica',
  tecnica: 'técnica',
  original: 'original',
};

type ProtectedSpan = {
  start: number;
  end: number;
  text: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type ProductNameBrandDisplay = 'title' | 'uppercase';

function resolveBrandDisplay(brand: string, display: ProductNameBrandDisplay = 'title'): string {
  const trimmed = brand.trim();
  if (!trimmed) return trimmed;
  if (display === 'uppercase') return trimmed.toUpperCase();
  const mapped = KNOWN_BRAND_DISPLAY[trimmed.toLowerCase()];
  return mapped ?? trimmed;
}

function normalizeModelDisplay(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toUpperCase();
}

function addSpan(spans: ProtectedSpan[], start: number, end: number, text: string): void {
  if (start < 0 || end <= start || !text) return;
  spans.push({ start, end, text });
}

function collectBrandSpans(
  text: string,
  brand: string | null | undefined,
  spans: ProtectedSpan[],
  brandDisplay: ProductNameBrandDisplay,
): void {
  const candidates = new Set<string>();

  if (brand?.trim()) {
    candidates.add(brand.trim());
    candidates.add(resolveBrandDisplay(brand, brandDisplay));
  }

  for (const display of Object.values(KNOWN_BRAND_DISPLAY)) {
    candidates.add(display);
    if (brandDisplay === 'uppercase') {
      candidates.add(display.toUpperCase());
    }
  }

  for (const candidate of candidates) {
    const pattern = new RegExp(`\\b${escapeRegExp(candidate).replace(/\s+/g, '\\s+')}\\b`, 'gi');
    for (const match of text.matchAll(pattern)) {
      if (match.index == null) continue;
      addSpan(
        spans,
        match.index,
        match.index + match[0].length,
        resolveBrandDisplay(match[0], brandDisplay),
      );
    }
  }
}

function collectPatternSpans(
  text: string,
  patterns: RegExp[],
  spans: ProtectedSpan[],
  mapMatch: (value: string) => string,
): void {
  for (const pattern of patterns) {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const globalPattern = new RegExp(pattern.source, flags);
    for (const match of text.matchAll(globalPattern)) {
      if (match.index == null) continue;
      addSpan(spans, match.index, match.index + match[0].length, mapMatch(match[0]));
    }
  }
}

function mergeProtectedSpans(spans: ProtectedSpan[]): ProtectedSpan[] {
  if (spans.length === 0) return [];

  const sorted = [...spans].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - b.start - (a.end - a.start);
  });

  const merged: ProtectedSpan[] = [];

  for (const span of sorted) {
    const previous = merged[merged.length - 1];
    if (!previous) {
      merged.push(span);
      continue;
    }

    if (span.start >= previous.end) {
      merged.push(span);
      continue;
    }

    if (span.end > previous.end) {
      previous.end = span.end;
      if (span.text.length > previous.text.length) {
        previous.text = span.text;
      }
    }
  }

  return merged;
}

function restoreSpanishProductAccents(text: string): string {
  return text.replace(/\b([a-záéíóúñ]+)\b/gi, (word) => {
    const mapped = SPANISH_PRODUCT_ACCENT_WORDS[word.toLowerCase()];
    if (!mapped) return word;
    if (word === word.toUpperCase()) return mapped.toUpperCase();
    if (word[0] === word[0]?.toUpperCase()) {
      return mapped.charAt(0).toUpperCase() + mapped.slice(1);
    }
    return mapped;
  });
}

/** Primera letra en mayúscula; resto en minúsculas salvo marcas y códigos de modelo. */
export function formatProductNameSentenceCase(
  name: string,
  options?: { brand?: string | null; brandDisplay?: ProductNameBrandDisplay },
): string {
  const trimmed = name.trim().replace(/\s{2,}/g, ' ');
  if (!trimmed) return trimmed;

  const brandDisplay = options?.brandDisplay ?? 'title';
  const spans: ProtectedSpan[] = [];
  collectBrandSpans(trimmed, options?.brand, spans, brandDisplay);
  collectPatternSpans(trimmed, MODEL_PATTERNS, spans, normalizeModelDisplay);
  collectPatternSpans(trimmed, LITERAL_PATTERNS, spans, (value) => value.toUpperCase());

  const merged = mergeProtectedSpans(spans);
  const placeholders: string[] = [];
  let cursor = 0;
  let masked = '';

  for (const span of merged) {
    masked += trimmed.slice(cursor, span.start);
    const token = `\u0000${placeholders.length}\u0000`;
    placeholders.push(span.text);
    masked += token;
    cursor = span.end;
  }
  masked += trimmed.slice(cursor);

  let result = masked.toLocaleLowerCase('es');
  if (result.length > 0) {
    result = result.charAt(0).toLocaleUpperCase('es') + result.slice(1);
  }

  placeholders.forEach((placeholder, index) => {
    result = result.replace(`\u0000${index}\u0000`, placeholder);
  });

  return restoreSpanishProductAccents(result).replace(/\s{2,}/g, ' ').trim();
}
