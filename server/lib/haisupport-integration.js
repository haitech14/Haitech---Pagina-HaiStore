import { shouldUseSharedSupabaseData } from './data-source.js';
import {
  clientsTableAvailable,
  pullHaiSupportClientsToStore,
  pushStoreCustomersToHaiSupport,
} from './haisupport-bridge-outbound.js';
import { listHaiSupportClients } from './haisupport-customers.js';
import {
  getHaiSupportSupabaseAdmin,
  getHaiSupportSupabaseUrl,
  isHaiSupportSupabaseConfigured,
} from './haisupport-supabase.js';
import { isOutboundSyncEnabled } from './haisupport-sync.js';
import { getSupabaseAdmin } from './supabase-auth.js';
import {
  isDedicatedRestApi,
  isHaiSupportConfigured,
  probeHaiSupportConnection,
} from './haitech-integrations-config.js';

function isDedicatedHaiSupportApi() {
  const url = getHaiSupportSupabaseUrl() ?? '';
  return isDedicatedRestApi(url);
}

async function countTable(table) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true });
  if (error) {
    if (error.code === 'PGRST205') return { count: null, missing: true };
    return { count: null, missing: false, error: error.message };
  }
  return { count: count ?? 0, missing: false };
}

/** Estado detallado de la integración HaiSupport ↔ HaiStore. */
export async function getHaiSupportIntegrationStatus() {
  const supabase = getSupabaseAdmin();
  const bridgeReady = isHaiSupportSupabaseConfigured();
  const clientsTable = bridgeReady ? await clientsTableAvailable() : false;

  const [
    customers,
    serviceRequests,
    rentalRequests,
    proformas,
    rentalPlans,
    orders,
    products,
  ] = await Promise.all([
    countTable('store_customers'),
    countTable('store_service_requests'),
    countTable('store_rental_requests'),
    countTable('store_proformas'),
    countTable('store_rental_plans'),
    countTable('store_orders'),
    countTable('products'),
  ]);

  let haisupportClientsCount = null;
  if (bridgeReady && clientsTable) {
    try {
      const hsClients = await listHaiSupportClients();
      haisupportClientsCount = hsClients.length;
    } catch {
      haisupportClientsCount = null;
    }
  }

  const linkedCustomers =
    supabase && customers && !customers.missing
      ? await supabase
          .from('store_customers')
          .select('id', { count: 'exact', head: true })
          .not('haisupport_client_id', 'is', null)
          .then(({ count, error }) => (error ? null : count ?? 0))
      : null;

  const migrations = [];
  if (serviceRequests?.missing || rentalRequests?.missing) {
    migrations.push('supabase/migrations/008_haisupport_sync_entities.sql');
  }

  const connection = await probeHaiSupportConnection(
    getHaiSupportSupabaseAdmin(),
    getSupabaseAdmin(),
  );

  return {
    product: 'HaiSupport',
    description: 'Soporte técnico, servicios y alquileres — sincronizado con HaiStore',
    configured: isHaiSupportConfigured(),
    connection,
    sharedSupabase: shouldUseSharedSupabaseData(),
    supabaseConfigured: Boolean(supabase),
    bridge: {
      configured: bridgeReady,
      url: getHaiSupportSupabaseUrl(),
      dedicatedApi: isDedicatedHaiSupportApi(),
      clientsTableAvailable: clientsTable,
      sameProject: bridgeReady && !isDedicatedHaiSupportApi(),
    },
    outboundSync: isOutboundSyncEnabled(),
    webhookConfigured: Boolean(process.env.HAISUPPORT_WEBHOOK_SECRET?.trim()),
    counts: {
      storeCustomers: customers?.count ?? null,
      linkedCustomers,
      haisupportClients: haisupportClientsCount,
      serviceRequests: serviceRequests?.count ?? null,
      rentalRequests: rentalRequests?.count ?? null,
      proformas: proformas?.count ?? null,
      rentalPlans: rentalPlans?.count ?? null,
      orders: orders?.count ?? null,
      products: products?.count ?? null,
    },
    entities: {
      products: { outbound: true, inbound: true, mode: 'shared-db' },
      customers: { outbound: true, inbound: true, mode: clientsTable ? 'bridge' : 'shared-db' },
      proformas: { outbound: true, inbound: true, mode: 'shared-db' },
      rental_plans: { outbound: true, inbound: true, mode: 'shared-db' },
      service_requests: { outbound: true, inbound: true, mode: 'bridge' },
      rental_requests: { outbound: true, inbound: true, mode: 'bridge' },
      orders: { outbound: true, inbound: true, mode: 'shared-db' },
    },
    migrations,
    endpoints: {
      status: '/api/integrations/haisupport/status',
      sync: '/api/integrations/haisupport/sync',
      webhook: '/api/integrations/haisupport/webhook',
    },
  };
}

/**
 * Sincronización bidireccional de clientes HaiStore ↔ HaiSupport.
 * Las demás entidades comparten tablas store_* vía Supabase Realtime.
 */
export async function syncHaiSupportFromDatabase() {
  if (!shouldUseSharedSupabaseData()) {
    throw new Error('Supabase compartido no configurado en HaiStore');
  }

  const pull = await pullHaiSupportClientsToStore();
  const push = await pushStoreCustomersToHaiSupport();

  return {
    source: isDedicatedHaiSupportApi() ? 'dedicated-api' : 'shared-supabase',
    customers: {
      pulled: pull.pulled,
      updated: pull.updated,
      pushed: push.pushed,
      linked: push.linked,
      errors: [...pull.errors, ...push.errors],
    },
  };
}
