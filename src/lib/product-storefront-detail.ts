import type { LucideIcon } from 'lucide-react';
import {
  Cloud,
  Copy,
  FileText,
  Gauge,
  Gift,
  Layers,
  Network,
  Printer,
  ScanLine,
  Smartphone,
  Wifi,
} from 'lucide-react';

import type {
  ProductDescriptionHighlight,
  ProductHeroSpecBullet,
} from '@/types/product-detail';
import type { Product } from '@/types/product';
import type { StoredFeatureBarItem, StoredHeroBullet } from '@/types/product-storefront';

export const STOREFRONT_ICON_KEYS = [
  'Printer',
  'Gauge',
  'Smartphone',
  'FileText',
  'ScanLine',
  'Cloud',
  'Copy',
  'Wifi',
  'Gift',
  'Layers',
  'Network',
] as const;

export type StorefrontIconKey = (typeof STOREFRONT_ICON_KEYS)[number];

export const STOREFRONT_ICON_LABELS: Record<StorefrontIconKey, string> = {
  Printer: 'Impresora',
  Gauge: 'Velocímetro',
  Smartphone: 'Pantalla / móvil',
  FileText: 'Documento',
  ScanLine: 'Escáner',
  Cloud: 'Nube / conectividad',
  Copy: 'Copiadora',
  Wifi: 'Wi-Fi',
  Gift: 'Regalo',
  Layers: 'Capas / volumen',
  Network: 'Red',
};

const ICON_MAP: Record<StorefrontIconKey, LucideIcon> = {
  Printer,
  Gauge,
  Smartphone,
  FileText,
  ScanLine,
  Cloud,
  Copy,
  Wifi,
  Gift,
  Layers,
  Network,
};

export function isStorefrontIconKey(value: string): value is StorefrontIconKey {
  return (STOREFRONT_ICON_KEYS as readonly string[]).includes(value);
}

export function resolveStorefrontIcon(key: string | undefined | null): LucideIcon {
  if (key && isStorefrontIconKey(key)) return ICON_MAP[key];
  return Printer;
}

export function iconKeyFromLucide(Icon: LucideIcon): StorefrontIconKey {
  const entry = (Object.entries(ICON_MAP) as [StorefrontIconKey, LucideIcon][]).find(
    ([, component]) => component === Icon,
  );
  return entry?.[0] ?? 'Printer';
}

function normalizeFeatureBarItem(raw: unknown): StoredFeatureBarItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Partial<StoredFeatureBarItem>;
  const title = item.title?.trim();
  const subtitle = item.subtitle?.trim();
  if (!title || !subtitle) return null;
  const icon = item.icon?.trim();
  return {
    icon: icon && isStorefrontIconKey(icon) ? icon : 'Printer',
    title,
    subtitle,
  };
}

function normalizeHeroBullet(raw: unknown): StoredHeroBullet | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Partial<StoredHeroBullet>;
  const text = item.text?.trim();
  if (!text) return null;
  const icon = item.icon?.trim();
  return {
    icon: icon && isStorefrontIconKey(icon) ? icon : 'Printer',
    text,
  };
}

export function normalizeStorefrontFeatureBar(
  value: StoredFeatureBarItem[] | null | undefined,
): StoredFeatureBarItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeFeatureBarItem)
    .filter((item): item is StoredFeatureBarItem => item !== null)
    .slice(0, 6);
}

export function normalizeStorefrontHeroBullets(
  value: StoredHeroBullet[] | null | undefined,
): StoredHeroBullet[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeHeroBullet)
    .filter((item): item is StoredHeroBullet => item !== null)
    .slice(0, 12);
}

export function storedFeatureBarToHighlights(
  items: StoredFeatureBarItem[],
): ProductDescriptionHighlight[] {
  return normalizeStorefrontFeatureBar(items).map((item) => ({
    icon: resolveStorefrontIcon(item.icon),
    title: item.title,
    subtitle: item.subtitle,
  }));
}

export function storedHeroBulletsToRuntime(
  items: StoredHeroBullet[],
): ProductHeroSpecBullet[] {
  return normalizeStorefrontHeroBullets(items).map((item) => ({
    icon: resolveStorefrontIcon(item.icon),
    text: item.text,
  }));
}

export function highlightsToStoredFeatureBar(
  items: ProductDescriptionHighlight[],
): StoredFeatureBarItem[] {
  return items.map((item) => ({
    icon: iconKeyFromLucide(item.icon),
    title: item.title,
    subtitle: item.subtitle,
  }));
}

export function heroBulletsToStored(items: ProductHeroSpecBullet[]): StoredHeroBullet[] {
  const result: StoredHeroBullet[] = [];
  for (const item of items) {
    const text = item.text?.trim() ?? item.value?.trim() ?? '';
    if (!text) continue;
    result.push({
      icon: item.icon ? iconKeyFromLucide(item.icon) : 'Printer',
      text,
    });
  }
  return result;
}

export function heroBulletsToDescriptionText(bullets: StoredHeroBullet[]): string {
  return normalizeStorefrontHeroBullets(bullets)
    .map((item) => item.text)
    .join('\n');
}

function heroBulletTextForIconInference(bullet: ProductHeroSpecBullet): string {
  if (bullet.text?.trim()) return bullet.text.trim();
  if (bullet.label && bullet.value) return `${bullet.label} ${bullet.value}`;
  if (bullet.parts?.length) {
    return bullet.parts.map((part) => `${part.label} ${part.value}`).join(' ');
  }
  return '';
}

export function resolveHeroBulletIcon(bullet: ProductHeroSpecBullet): LucideIcon {
  const { icon } = bullet;
  if (icon) {
    if (typeof icon === 'string') return resolveStorefrontIcon(icon);
    return icon;
  }
  return resolveStorefrontIcon(inferIconForHeroLine(heroBulletTextForIconInference(bullet)));
}

export function inferIconForHeroLine(text: string): StorefrontIconKey {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (/regalo|toner|envio/.test(normalized)) return 'Gift';
  if (/conectividad|wi-?fi|wifi|ethernet|usb|red\b|lan\b/.test(normalized)) return 'Wifi';
  if (/spdf|alimentador|doble\s*scan|escane|adf|estandar/.test(normalized)) return 'ScanLine';
  if (/formato|a4|a5|a6|carta|bypass/.test(normalized)) return 'FileText';
  if (/produccion|paginas|mes/.test(normalized)) return 'Gauge';
  if (/imprime|ppm/.test(normalized)) return 'Printer';
  if (/copiadora|impresora|fax/.test(normalized)) return 'Copy';
  return 'Printer';
}

export function descriptionTextToHeroBullets(
  description: string | null | undefined,
  fallbackIcons: StoredHeroBullet[] = [],
): StoredHeroBullet[] {
  const lines = (description ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  return lines.map((text, index) => ({
    icon:
      fallbackIcons[index]?.icon ??
      fallbackIcons[fallbackIcons.length - 1]?.icon ??
      inferIconForHeroLine(text),
    text,
  }));
}

export function hasStorefrontOverrides(product: Product): boolean {
  return (
    normalizeStorefrontFeatureBar(product.storefront_feature_bar).length > 0 ||
    normalizeStorefrontHeroBullets(product.storefront_hero_bullets).length > 0
  );
}

export function resolveStoredFeatureBar(
  product: Product,
  fallback: ProductDescriptionHighlight[],
): ProductDescriptionHighlight[] {
  const stored = normalizeStorefrontFeatureBar(product.storefront_feature_bar);
  if (stored.length > 0) return storedFeatureBarToHighlights(stored);
  return fallback;
}

export function resolveStoredHeroBullets(
  product: Product,
  fallback: ProductHeroSpecBullet[],
): ProductHeroSpecBullet[] {
  const stored = normalizeStorefrontHeroBullets(product.storefront_hero_bullets);
  const descriptionLines = (product.description ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const descriptionText = descriptionLines.join('\n');
  const storedText = heroBulletsToDescriptionText(stored);

  if (descriptionLines.length > 1 && (stored.length === 0 || storedText !== descriptionText)) {
    return storedHeroBulletsToRuntime(
      descriptionTextToHeroBullets(product.description, stored),
    );
  }

  if (stored.length > 0) return storedHeroBulletsToRuntime(stored);
  return fallback;
}
