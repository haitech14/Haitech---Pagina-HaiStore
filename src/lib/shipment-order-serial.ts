const STORAGE_KEY = 'haistore-shipment-order-serial';
const ORDER_PREFIX = 'OE01';

function readNextNumber(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number.parseInt(raw, 10) : 1;
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
  } catch {
    return 1;
  }
}

function writeNextNumber(value: number): void {
  localStorage.setItem(STORAGE_KEY, String(value));
}

export function formatShipmentOrderRef(sequence: number): string {
  return `${ORDER_PREFIX}-${String(sequence).padStart(3, '0')}`;
}

/** Siguiente N.º de pedido (OE01-001, OE01-002, …). */
export function nextShipmentOrderRef(): string {
  const next = readNextNumber();
  writeNextNumber(next + 1);
  return formatShipmentOrderRef(next);
}

export function peekShipmentOrderRef(): string {
  return formatShipmentOrderRef(readNextNumber());
}
