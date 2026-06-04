export type ShipmentLabelFormat = 'a4-landscape' | 'a5' | 'thermal-80mm' | 'sticker';

export interface ShipmentLabelFormatOption {
  id: ShipmentLabelFormat;
  label: string;
  description: string;
}

export const SHIPMENT_LABEL_FORMAT_OPTIONS: ShipmentLabelFormatOption[] = [
  {
    id: 'a4-landscape',
    label: 'A4 horizontal',
    description: '297 × 210 mm — impresora estándar',
  },
  {
    id: 'a5',
    label: 'A5',
    description: '148 × 210 mm — media hoja',
  },
  {
    id: 'thermal-80mm',
    label: '80 mm',
    description: 'Impresora térmica de etiquetas',
  },
  {
    id: 'sticker',
    label: 'Sticker',
    description: '100 × 150 mm — etiqueta adhesiva',
  },
];

export const DEFAULT_SHIPMENT_LABEL_FORMAT: ShipmentLabelFormat = 'a4-landscape';

const FORMAT_STORAGE_KEY = 'haistore-shipment-label-format';

export function loadShipmentLabelFormat(): ShipmentLabelFormat {
  try {
    const raw = localStorage.getItem(FORMAT_STORAGE_KEY);
    if (raw && SHIPMENT_LABEL_FORMAT_OPTIONS.some((o) => o.id === raw)) {
      return raw as ShipmentLabelFormat;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SHIPMENT_LABEL_FORMAT;
}

export function saveShipmentLabelFormat(format: ShipmentLabelFormat): void {
  localStorage.setItem(FORMAT_STORAGE_KEY, format);
}

export interface ShipmentLabelPageSpec {
  width: number;
  height: number;
  margin: number;
  orientation: 'landscape' | 'portrait';
  jsPdfFormat: string | [number, number];
}

export function getShipmentLabelPageSpec(format: ShipmentLabelFormat): ShipmentLabelPageSpec {
  switch (format) {
    case 'a4-landscape':
      return {
        width: 297,
        height: 210,
        margin: 12,
        orientation: 'landscape',
        jsPdfFormat: 'a4',
      };
    case 'a5':
      return {
        width: 148,
        height: 210,
        margin: 10,
        orientation: 'portrait',
        jsPdfFormat: 'a5',
      };
    case 'thermal-80mm':
      return {
        width: 80,
        height: 140,
        margin: 4,
        orientation: 'portrait',
        jsPdfFormat: [80, 140],
      };
    case 'sticker':
      return {
        width: 100,
        height: 150,
        margin: 5,
        orientation: 'portrait',
        jsPdfFormat: [100, 150],
      };
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

export function shipmentLabelFormatSlug(format: ShipmentLabelFormat): string {
  switch (format) {
    case 'a4-landscape':
      return 'a4-h';
    case 'a5':
      return 'a5';
    case 'thermal-80mm':
      return '80mm';
    case 'sticker':
      return 'sticker';
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}
