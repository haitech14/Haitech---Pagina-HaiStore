export interface HaiSupportEntitySync {
  outbound: boolean;
  inbound: boolean;
  mode: 'shared-db' | 'bridge';
}

export interface HaiSupportIntegrationStatus {
  product: string;
  description: string;
  configured: boolean;
  connection: import('./integrations-health').IntegrationConnectionStatus;
  sharedSupabase: boolean;
  supabaseConfigured: boolean;
  bridge: {
    configured: boolean;
    url: string | null;
    dedicatedApi: boolean;
    clientsTableAvailable: boolean;
    sameProject: boolean;
  };
  outboundSync: boolean;
  webhookConfigured: boolean;
  counts: {
    storeCustomers: number | null;
    linkedCustomers: number | null;
    haisupportClients: number | null;
    serviceRequests: number | null;
    rentalRequests: number | null;
    proformas: number | null;
    rentalPlans: number | null;
    orders: number | null;
    products: number | null;
  };
  entities: Record<string, HaiSupportEntitySync>;
  migrations: string[];
  endpoints: Record<string, string>;
  haisales?: {
    statusUrl: string;
    syncSeedsUrl: string;
    syncDatabaseUrl: string;
  };
}

export interface HaiSupportSyncResult {
  ok: boolean;
  source: string;
  customers: {
    pulled: number;
    updated: number;
    pushed: number;
    linked: number;
    errors: Array<{ id?: string; message: string }>;
  };
}

export interface IntegrationsSyncAllResult {
  ok: boolean;
  syncedAt: string;
  haisales?: {
    remoteMirror: { copied: boolean; persona: number; ventas: number } | null;
    database: import('./haisales-integration').HaiSalesDatabaseSyncResult;
  };
  haisupport?: HaiSupportSyncResult;
}
