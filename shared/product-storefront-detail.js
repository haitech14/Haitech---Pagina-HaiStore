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

const STOREFRONT_ICON_KEYS = [
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
];

function isStorefrontIconKey(value) {
  return STOREFRONT_ICON_KEYS.includes(value);
}

function normalizeFeatureBarItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const title = raw.title?.trim();
  const subtitle = raw.subtitle?.trim();
  if (!title || !subtitle) return null;
  const icon = raw.icon?.trim();
  return {
    icon: icon && isStorefrontIconKey(icon) ? icon : 'Printer',
    title,
    subtitle,
  };
}

function normalizeHeroBullet(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const text = raw.text?.trim();
  if (!text) return null;
  const icon = raw.icon?.trim();
  return {
    icon: icon && isStorefrontIconKey(icon) ? icon : 'Printer',
    text,
  };
}

export function normalizeStorefrontFeatureBar(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeFeatureBarItem)
    .filter(Boolean)
    .slice(0, 6);
}

export function normalizeStorefrontHeroBullets(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeHeroBullet)
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeOptionalTrimmedString(value, maxLen = 80) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, maxLen);
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Normaliza `storefront_ui`. `null`/`undefined`/objeto vacío → `undefined` (usar defaults). */
export function normalizeStorefrontUi(value) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const next = {};

  if (typeof value.showGalleryCopyImage === 'boolean') {
    next.showGalleryCopyImage = value.showGalleryCopyImage;
  }
  if (typeof value.showGalleryCopyText === 'boolean') {
    next.showGalleryCopyText = value.showGalleryCopyText;
  }
  if (typeof value.showTonerCopyActions === 'boolean') {
    next.showTonerCopyActions = value.showTonerCopyActions;
  }

  const tonerSectionTitle = normalizeOptionalTrimmedString(value.tonerSectionTitle);
  if (tonerSectionTitle !== undefined) next.tonerSectionTitle = tonerSectionTitle;

  const tonerOriginalTabLabel = normalizeOptionalTrimmedString(value.tonerOriginalTabLabel);
  if (tonerOriginalTabLabel !== undefined) next.tonerOriginalTabLabel = tonerOriginalTabLabel;

  const tonerCompatibleTabLabel = normalizeOptionalTrimmedString(value.tonerCompatibleTabLabel);
  if (tonerCompatibleTabLabel !== undefined) {
    next.tonerCompatibleTabLabel = tonerCompatibleTabLabel;
  }

  const tonerOriginalCardTitle = normalizeOptionalTrimmedString(value.tonerOriginalCardTitle);
  if (tonerOriginalCardTitle !== undefined) next.tonerOriginalCardTitle = tonerOriginalCardTitle;

  const tonerCompatibleCardTitle = normalizeOptionalTrimmedString(value.tonerCompatibleCardTitle);
  if (tonerCompatibleCardTitle !== undefined) {
    next.tonerCompatibleCardTitle = tonerCompatibleCardTitle;
  }

  return Object.keys(next).length > 0 ? next : undefined;
}

export { STOREFRONT_ICON_KEYS };
