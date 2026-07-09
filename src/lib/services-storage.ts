import {
  DEFAULT_SERVICE_CATEGORIES,
  DEFAULT_SERVICE_PRICE_LIST,
  DEMO_SERVICE_ORDERS,
  createDefaultServicePriceItem,
} from '@/data/services-defaults';
import { ensureFullPrices } from '@/lib/roles';
import type {
  ServiceCategory,
  ServiceOrder,
  ServiceOrderStatus,
  ServicePriceItem,
} from '@/types/service';
import type { ProductRolePrices } from '@/lib/roles';

const ORDERS_KEY = 'haistore-service-orders';
const CATEGORIES_KEY = 'haistore-service-categories';
const PRICE_LIST_KEY = 'haistore-service-price-list';
const PRICE_LIST_CHANGE_EVENT = 'haistore-service-price-list-change';

export function subscribeServicePriceList(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener(PRICE_LIST_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(PRICE_LIST_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function getServicePriceListSnapshot(): ServicePriceItem[] {
  return loadServicePriceList();
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadServiceCategories(): ServiceCategory[] {
  return loadJson(CATEGORIES_KEY, DEFAULT_SERVICE_CATEGORIES);
}

export function saveServiceCategories(categories: ServiceCategory[]): void {
  saveJson(CATEGORIES_KEY, categories);
}

export function loadServiceOrders(): ServiceOrder[] {
  return loadJson(ORDERS_KEY, DEMO_SERVICE_ORDERS);
}

export function saveServiceOrders(orders: ServiceOrder[]): void {
  saveJson(ORDERS_KEY, orders);
}

export function generateServiceCode(): string {
  const year = new Date().getFullYear();
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `SV-${year}-${suffix}`;
}

export interface NewServiceOrderInput {
  customerName: string;
  customerPhone?: string | null;
  categoryId: string;
  scheduledAt: string;
  description: string;
  technician?: string | null;
  address?: string | null;
}

export function createServiceOrder(input: NewServiceOrderInput): ServiceOrder[] {
  const row: ServiceOrder = {
    id: `svc-${Date.now()}`,
    code: generateServiceCode(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone?.trim() || null,
    categoryId: input.categoryId,
    scheduledAt: input.scheduledAt,
    description: input.description.trim(),
    technician: input.technician?.trim() || null,
    address: input.address?.trim() || null,
  };
  const next = [row, ...loadServiceOrders()];
  saveServiceOrders(next);
  return next;
}

export function updateServiceOrderStatus(
  id: string,
  status: ServiceOrderStatus,
): ServiceOrder[] {
  const next = loadServiceOrders().map((row) => (row.id === id ? { ...row, status } : row));
  saveServiceOrders(next);
  return next;
}

export function deleteServiceOrder(id: string): ServiceOrder[] {
  const next = loadServiceOrders().filter((row) => row.id !== id);
  saveServiceOrders(next);
  return next;
}

export function updateServiceCategory(
  id: string,
  patch: Partial<Pick<ServiceCategory, 'name' | 'description' | 'active'>>,
): ServiceCategory[] {
  const next = loadServiceCategories().map((cat) =>
    cat.id === id ? { ...cat, ...patch } : cat,
  );
  saveServiceCategories(next);
  return next;
}

function normalizeServicePriceItem(
  row: Partial<ServicePriceItem>,
  index = 0,
): ServicePriceItem {
  const fallbackCategory =
    DEFAULT_SERVICE_PRICE_LIST[0]?.categoryId ?? 'cat-mantenimiento';
  const normalized: ServicePriceItem = {
    id: row.id ?? `sp-fallback-${index}`,
    code: row.code ?? '',
    name: row.name ?? '',
    categoryId: row.categoryId ?? fallbackCategory,
    description: row.description ?? '',
    prices: ensureFullPrices(row.prices),
    active: row.active !== false,
  };

  if (row.modalidad !== undefined) normalized.modalidad = row.modalidad;
  if (row.cobertura !== undefined) normalized.cobertura = row.cobertura;
  if (row.tipo !== undefined) normalized.tipo = row.tipo;
  if (row.estado !== undefined) normalized.estado = row.estado;
  if (row.responsableName !== undefined) normalized.responsableName = row.responsableName;
  if (row.responsableTitle !== undefined) normalized.responsableTitle = row.responsableTitle;
  if (row.createdAt !== undefined) normalized.createdAt = row.createdAt;

  return normalized;
}

export function loadServicePriceList(): ServicePriceItem[] {
  try {
    const rows = loadJson<unknown>(PRICE_LIST_KEY, DEFAULT_SERVICE_PRICE_LIST);
    if (!Array.isArray(rows)) {
      return DEFAULT_SERVICE_PRICE_LIST.map((row, i) => normalizeServicePriceItem(row, i));
    }
    const normalized = rows
      .filter((row): row is Partial<ServicePriceItem> => row != null && typeof row === 'object')
      .map((row, index) => normalizeServicePriceItem(row, index));
    return normalized.length > 0
      ? normalized
      : DEFAULT_SERVICE_PRICE_LIST.map((row, i) => normalizeServicePriceItem(row, i));
  } catch {
    return DEFAULT_SERVICE_PRICE_LIST.map((row, i) => normalizeServicePriceItem(row, i));
  }
}

export function saveServicePriceList(items: ServicePriceItem[]): void {
  saveJson(PRICE_LIST_KEY, items);
  window.dispatchEvent(new Event(PRICE_LIST_CHANGE_EVENT));
}

export function createServicePriceItem(
  categoryId: string,
  name: string,
): ServicePriceItem[] {
  const row = createDefaultServicePriceItem(categoryId, name);
  const next = [row, ...loadServicePriceList()];
  saveServicePriceList(next);
  return next;
}

export function updateServicePriceItem(
  id: string,
  patch: Partial<
    Pick<
      ServicePriceItem,
      | 'code'
      | 'name'
      | 'categoryId'
      | 'description'
      | 'active'
      | 'modalidad'
      | 'cobertura'
      | 'tipo'
      | 'estado'
      | 'responsableName'
      | 'responsableTitle'
      | 'createdAt'
    > & {
      prices?: Partial<ProductRolePrices>;
    }
  >,
): ServicePriceItem[] {
  const next = loadServicePriceList().map((row) => {
    if (row.id !== id) return row;
    return {
      ...row,
      ...patch,
      prices: patch.prices ? ensureFullPrices({ ...row.prices, ...patch.prices }) : row.prices,
    };
  });
  saveServicePriceList(next);
  return next;
}

export function deleteServicePriceItem(id: string): ServicePriceItem[] {
  const next = loadServicePriceList().filter((row) => row.id !== id);
  saveServicePriceList(next);
  return next;
}
