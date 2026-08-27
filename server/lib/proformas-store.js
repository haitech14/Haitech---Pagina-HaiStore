import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

import { shouldUseSharedSupabaseData } from './data-source.js';
import { notifyHaiSupportChange } from './haisupport-sync.js';
import {
  deleteProformaFromSupabase,
  readProformasFromSupabase,
  upsertProformaInSupabase,
  writeProformasToSupabase,
} from './proformas-supabase.js';
import { getProformasPath } from './server-paths.js';

function proformasPath() {
  return getProformasPath();
}

const VALID_STATUSES = new Set(['pending', 'contacted', 'negotiating', 'won', 'lost']);
const VALID_SOURCES = new Set(['tpv', 'product', 'web']);

function normalizeCapture(raw) {
  if (!raw || typeof raw !== 'object') return undefined;
  const channel = typeof raw.channel === 'string' ? raw.channel.trim() : '';
  const channelLabel = typeof raw.channelLabel === 'string' ? raw.channelLabel.trim() : '';
  const ip = typeof raw.ip === 'string' ? raw.ip.trim() : '';
  const userAgent = typeof raw.userAgent === 'string' ? raw.userAgent.trim() : '';
  const referer = typeof raw.referer === 'string' ? raw.referer.trim() : '';
  const path = typeof raw.path === 'string' ? raw.path.trim() : '';
  if (!channel && !ip && !userAgent && !referer && !path) return undefined;
  return {
    ...(channel ? { channel } : {}),
    ...(channelLabel ? { channelLabel } : {}),
    ...(ip ? { ip } : {}),
    ...(userAgent ? { userAgent: userAgent.slice(0, 300) } : {}),
    ...(referer ? { referer: referer.slice(0, 400) } : {}),
    ...(path ? { path: path.slice(0, 200) } : {}),
  };
}

async function ensureFile() {
  try {
    await fs.access(proformasPath());
  } catch {
    await fs.mkdir(path.dirname(proformasPath()), { recursive: true });
    await fs.writeFile(proformasPath(), JSON.stringify({ proformas: [] }, null, 2));
  }
}

function normalizeLineItem(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const name = String(entry.name ?? '').trim();
  if (!name) return null;
  return {
    productId: typeof entry.productId === 'string' ? entry.productId : undefined,
    name,
    sku: String(entry.sku ?? '').trim() || '—',
    brand: String(entry.brand ?? '').trim() || 'Haitech',
    quantity: Math.max(1, Number(entry.quantity) || 1),
    unitPricePen: Math.max(0, Number(entry.unitPricePen) || 0),
    imageUrl: typeof entry.imageUrl === 'string' ? entry.imageUrl : null,
  };
}

function normalizeCustomer(value) {
  const customer = value && typeof value === 'object' ? value : {};
  return {
    razonSocial: String(customer.razonSocial ?? '').trim(),
    documento: String(customer.documento ?? customer.ruc ?? '').trim(),
    atencion: String(customer.atencion ?? '').trim(),
    celular: String(customer.celular ?? '').trim(),
    direccion: customer.direccion ? String(customer.direccion).trim() : undefined,
    ciudad: customer.ciudad ? String(customer.ciudad).trim() : undefined,
    storeCustomerId:
      typeof customer.storeCustomerId === 'string' ? customer.storeCustomerId : null,
  };
}

function normalizeProforma(raw) {
  const lineItems = (Array.isArray(raw.lineItems) ? raw.lineItems : [])
    .map(normalizeLineItem)
    .filter(Boolean);

  const status = VALID_STATUSES.has(raw.followUpStatus) ? raw.followUpStatus : 'pending';
  const source = VALID_SOURCES.has(raw.source) ? raw.source : 'tpv';
  const capture = normalizeCapture(raw.capture);
  const channel =
    typeof raw.channel === 'string' && raw.channel.trim()
      ? raw.channel.trim()
      : capture?.channel;

  return {
    id: String(raw.id ?? randomUUID()),
    documentNumber: String(raw.documentNumber ?? '').trim() || `PRF-${Date.now()}`,
    source,
    documentType: raw.documentType === 'factura' || raw.documentType === 'boleta'
      ? raw.documentType
      : 'proforma',
    customer: normalizeCustomer(raw.customer),
    lineItems,
    currency: raw.currency === 'USD' ? 'USD' : 'PEN',
    priceList: typeof raw.priceList === 'string' ? raw.priceList : undefined,
    subtotalPen: Math.max(0, Number(raw.subtotalPen) || 0),
    totalPen: Math.max(0, Number(raw.totalPen) || 0),
    sellerName: String(raw.sellerName ?? 'Vendedor').trim() || 'Vendedor',
    sellerEmail: String(raw.sellerEmail ?? '').trim(),
    followUpStatus: status,
    notes: String(raw.notes ?? '').trim(),
    validityDays: Math.max(1, Number(raw.validityDays) || 7),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
    ...(channel ? { channel } : {}),
    ...(capture ? { capture } : {}),
  };
}

export async function readProformas() {
  if (shouldUseSharedSupabaseData()) {
    try {
      const remote = await readProformasFromSupabase();
      if (remote) return remote;
    } catch (error) {
      console.warn(
        '[proformas] Lectura Supabase falló, usando JSON local:',
        error instanceof Error ? error.message : error,
      );
    }
  }

  return readProformasFromLocal();
}

async function readProformasFromLocal() {
  await ensureFile();
  const raw = await fs.readFile(proformasPath(), 'utf-8');
  const data = JSON.parse(raw);
  const proformas = (data.proformas ?? [])
    .map(normalizeProforma)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { proformas };
}

async function writeProformasToLocal(proformas) {
  await ensureFile();
  await fs.writeFile(proformasPath(), JSON.stringify({ proformas }, null, 2));
  return proformas;
}

export async function writeProformas(proformas) {
  const normalized = proformas.map(normalizeProforma);

  if (shouldUseSharedSupabaseData()) {
    await writeProformasToSupabase(normalized);
    for (const proforma of normalized) {
      notifyHaiSupportChange('proformas', 'upsert', proforma);
    }
    return normalized;
  }

  await ensureFile();
  await fs.writeFile(proformasPath(), JSON.stringify({ proformas: normalized }, null, 2));
  return normalized;
}

export async function saveProforma(proforma, action = 'upsert') {
  const normalized = normalizeProforma(proforma);

  if (shouldUseSharedSupabaseData()) {
    try {
      await upsertProformaInSupabase(normalized);
    } catch (error) {
      console.warn(
        '[proformas] Supabase no disponible, guardando en JSON local:',
        error instanceof Error ? error.message : error,
      );
      const { proformas } = await readProformasFromLocal();
      const index = proformas.findIndex((entry) => entry.id === normalized.id);
      const next =
        index >= 0
          ? proformas.map((entry, i) => (i === index ? normalized : entry))
          : [normalized, ...proformas];
      await writeProformasToLocal(next);
    }
  } else {
    const { proformas } = await readProformasFromLocal();
    const index = proformas.findIndex((entry) => entry.id === normalized.id);
    const next =
      index >= 0
        ? proformas.map((entry, i) => (i === index ? normalized : entry))
        : [normalized, ...proformas];
    await writeProformasToLocal(next);
  }

  notifyHaiSupportChange('proformas', action, normalized);
  return normalized;
}

export async function removeProforma(id) {
  if (shouldUseSharedSupabaseData()) {
    await deleteProformaFromSupabase(id);
  } else {
    const { proformas } = await readProformas();
    const filtered = proformas.filter((entry) => entry.id !== id);
    await ensureFile();
    await fs.writeFile(proformasPath(), JSON.stringify({ proformas: filtered }, null, 2));
  }

  notifyHaiSupportChange('proformas', 'delete', { id });
}

export function sellerFromRequest(req) {
  const user = req.user ?? {};
  return {
    sellerName: String(user.name ?? user.full_name ?? user.email ?? 'Vendedor').trim(),
    sellerEmail: String(user.email ?? '').trim(),
  };
}

export function createProformaFromBody(body, req) {
  const seller = sellerFromRequest(req);
  const now = new Date().toISOString();
  const lineItems = (Array.isArray(body.lineItems) ? body.lineItems : [])
    .map(normalizeLineItem)
    .filter(Boolean);

  if (lineItems.length === 0) {
    throw new Error('Se requiere al menos un producto en la proforma');
  }

  const subtotalPen = Math.max(
    0,
    Number(body.subtotalPen) ||
      lineItems.reduce((sum, line) => sum + line.unitPricePen * line.quantity, 0),
  );
  const totalPen = Math.max(0, Number(body.totalPen) || subtotalPen);

  return normalizeProforma({
    id: randomUUID(),
    documentNumber: body.documentNumber,
    source: body.source,
    documentType: body.documentType ?? 'proforma',
    customer: body.customer,
    lineItems,
    currency: body.currency,
    priceList: body.priceList,
    subtotalPen,
    totalPen,
    sellerName: body.sellerName ?? seller.sellerName,
    sellerEmail: body.sellerEmail ?? seller.sellerEmail,
    followUpStatus: 'pending',
    notes: body.notes ?? '',
    validityDays: body.validityDays,
    createdAt: now,
    updatedAt: now,
    channel: body.channel,
    capture: body.capture,
  });
}

export function patchProforma(existing, body) {
  const next = { ...existing, updatedAt: new Date().toISOString() };

  if (body.customer && typeof body.customer === 'object') {
    next.customer = normalizeCustomer({ ...existing.customer, ...body.customer });
  }
  if (body.followUpStatus && VALID_STATUSES.has(body.followUpStatus)) {
    next.followUpStatus = body.followUpStatus;
  }
  if (body.notes !== undefined) next.notes = String(body.notes).trim();
  if (Array.isArray(body.lineItems)) {
    next.lineItems = body.lineItems.map(normalizeLineItem).filter(Boolean);
  }
  if (body.subtotalPen !== undefined) next.subtotalPen = Math.max(0, Number(body.subtotalPen) || 0);
  if (body.totalPen !== undefined) next.totalPen = Math.max(0, Number(body.totalPen) || 0);

  return normalizeProforma(next);
}
