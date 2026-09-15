/**
 * Pedidos locales cuando Supabase no está disponible (cuota, tabla, etc.).
 */

import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

import { getStoreOrdersPath } from './server-paths.js';

async function ensureFile() {
  const filePath = getStoreOrdersPath();
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ orders: [] }, null, 2));
  }
}

async function readAll() {
  await ensureFile();
  try {
    const raw = await fs.readFile(getStoreOrdersPath(), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.orders) ? parsed.orders : [];
  } catch {
    return [];
  }
}

async function writeAll(orders) {
  await ensureFile();
  await fs.writeFile(getStoreOrdersPath(), JSON.stringify({ orders }, null, 2));
}

export function nextFileOrderNumber() {
  const stamp = new Date();
  const ymd = `${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, '0')}${String(stamp.getDate()).padStart(2, '0')}`;
  return `HT-${ymd}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function saveStoreOrderFile(order) {
  const orders = await readAll();
  const index = orders.findIndex((row) => row?.id === order.id);
  if (index >= 0) {
    orders[index] = { ...orders[index], ...order, updated_at: new Date().toISOString() };
  } else {
    orders.unshift(order);
  }
  await writeAll(orders.slice(0, 400));
  return index >= 0 ? orders[index] : order;
}

export async function getStoreOrderFileById(orderId) {
  const orders = await readAll();
  return orders.find((row) => row?.id === orderId) ?? null;
}

export async function getStoreOrderFileByNumber(orderNumber) {
  const orders = await readAll();
  return orders.find((row) => row?.order_number === orderNumber) ?? null;
}

export async function listStoreOrdersFile() {
  return readAll();
}

export async function updateStoreOrderFile(orderId, patch) {
  const orders = await readAll();
  const index = orders.findIndex((row) => row?.id === orderId);
  if (index < 0) return null;
  orders[index] = {
    ...orders[index],
    ...patch,
    id: orderId,
    updated_at: new Date().toISOString(),
  };
  await writeAll(orders);
  return orders[index];
}
