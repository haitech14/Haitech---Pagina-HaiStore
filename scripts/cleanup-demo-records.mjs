/**
 * Elimina registros demo identificables en Supabase (una sola ejecución).
 * Uso: node scripts/cleanup-demo-records.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  const raw = readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

const DEMO_ORDER_NUMBERS = ['HS-2026-1042', 'HS-2026-0997'];
const DEMO_CUSTOMER_EMAIL = 'demo@haitech.pe';
const DEMO_FORUM_THREAD_SLUGS = [
  'gpt-4o-soporte-tecnico',
  'integracion-apis-ricoh-erp',
  'comparativa-im-c3010-c4010',
  'impresion-segura-politicas',
  'error-e3-im-c3010-red',
  'tutorial-driver-ricoh-windows',
  'firmware-1-12-im-c4010-notas',
];
const DEMO_FORUM_EVENT_TITLES = [
  'Webinar: IA en flotas de impresión',
  'Taller Ricoh IM C Series',
  'Meetup distribuidores HaiTech',
];

async function rest(baseUrl, key, method, path, body) {
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: method === 'DELETE' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const error = new Error(`${method} ${path} -> ${response.status}: ${text.slice(0, 300)}`);
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

function isMissingTableError(error) {
  return error?.status === 404 && error?.payload?.code === 'PGRST205';
}

async function selectByFilter(baseUrl, key, table, filter, columns = 'id') {
  try {
    return await rest(baseUrl, key, 'GET', `${table}?${filter}&select=${columns}`);
  } catch (error) {
    if (isMissingTableError(error)) {
      console.log(`Tabla ${table} no existe en Supabase; se omite.`);
      return [];
    }
    throw error;
  }
}

async function deleteByFilter(baseUrl, key, table, filter) {
  try {
    return await rest(baseUrl, key, 'DELETE', `${table}?${filter}`);
  } catch (error) {
    if (isMissingTableError(error)) {
      console.log(`Tabla ${table} no existe en Supabase; se omite.`);
      return [];
    }
    throw error;
  }
}

async function main() {
  const env = loadEnv();
  const baseUrl = env.SUPABASE_URL?.trim();
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!baseUrl || !key) {
    throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  }

  const summary = {
    demoShipmentsLocal: 'N/A (solo frontend localStorage)',
    orders: 0,
    orderItems: 0,
    customers: 0,
    forumThreads: 0,
    forumEvents: 0,
    demoShipmentIds: 0,
  };

  // Pedidos demo por número de orden
  for (const orderNumber of DEMO_ORDER_NUMBERS) {
    const orders = await selectByFilter(
      baseUrl,
      key,
      'store_orders',
      `order_number=eq.${encodeURIComponent(orderNumber)}`,
      'id,order_number',
    );
    if (!Array.isArray(orders) || orders.length === 0) continue;

    for (const order of orders) {
      const items = await deleteByFilter(baseUrl, key, 'store_order_items', `order_id=eq.${order.id}`);
      summary.orderItems += Array.isArray(items) ? items.length : 0;
      const deletedOrders = await deleteByFilter(baseUrl, key, 'store_orders', `id=eq.${order.id}`);
      summary.orders += Array.isArray(deletedOrders) ? deletedOrders.length : 0;
      console.log(`Eliminado pedido demo ${order.order_number}`);
    }
  }

  // Cliente demo (solo si coincide email exacto)
  const customers = await selectByFilter(
    baseUrl,
    key,
    'store_customers',
    `email=eq.${encodeURIComponent(DEMO_CUSTOMER_EMAIL)}`,
    'id,email,full_name',
  );
  if (Array.isArray(customers)) {
    for (const customer of customers) {
      const remainingOrders = await selectByFilter(
        baseUrl,
        key,
        'store_orders',
        `customer_id=eq.${customer.id}`,
        'id',
      );
      if (Array.isArray(remainingOrders) && remainingOrders.length > 0) {
        console.log(`Cliente demo ${customer.email} conservado: tiene otros pedidos`);
        continue;
      }
      await deleteByFilter(baseUrl, key, 'store_customers', `id=eq.${customer.id}`);
      summary.customers += 1;
      console.log(`Eliminado cliente demo ${customer.email}`);
    }
  }

  // Hilos demo del foro por slug
  for (const slug of DEMO_FORUM_THREAD_SLUGS) {
    const deleted = await deleteByFilter(
      baseUrl,
      key,
      'forum_threads',
      `slug=eq.${encodeURIComponent(slug)}`,
    );
    const count = Array.isArray(deleted) ? deleted.length : 0;
    if (count > 0) {
      summary.forumThreads += count;
      console.log(`Eliminado hilo demo foro: ${slug}`);
    }
  }

  // Eventos demo del foro por título
  for (const title of DEMO_FORUM_EVENT_TITLES) {
    const deleted = await deleteByFilter(
      baseUrl,
      key,
      'forum_events',
      `title=eq.${encodeURIComponent(title)}`,
    );
    const count = Array.isArray(deleted) ? deleted.length : 0;
    if (count > 0) {
      summary.forumEvents += count;
      console.log(`Eliminado evento demo foro: ${title}`);
    }
  }

  console.log('\nResumen Supabase:', JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
