export interface HaiSalesImportResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
  filesProcessed: number;
  errors: Array<{ file: string; row: number; message: string }>;
}

export interface HaiSalesIntegrationStatus {
  product: string;
  description: string;
  configured: boolean;
  connection: import('./integrations-health').IntegrationConnectionStatus;
  supabaseConfigured: boolean;
  haisalesDatabase: {
    configured: boolean;
    url: string | null;
    remote: boolean;
    mirrorPersona: number | null;
    mirrorVentas: number | null;
    migrationRequired: boolean;
  };
  webhookConfigured: boolean;
  seeds: {
    personaFiles: string[];
    ventasFiles: string[];
    personaDir: string;
    ventasDir: string;
  };
  customers: {
    count: number | null;
    withPersona: number | null;
  };
  ventas: {
    count: number | null;
    lastUpdated: string | null;
    migrationRequired: boolean;
  };
  migration: string | null;
  migrations: string[];
  endpoints: Record<string, string>;
}

export interface HaiSalesDatabaseSyncResult {
  source: string;
  tables: { persona: string; ventas: string };
  mirrorCounts: { persona: number; ventas: number };
  persona: {
    created: number;
    updated: number;
    skipped: number;
    total: number;
    errors: Array<{ row: number; message: string }>;
  };
  ventas: HaiSalesImportResult;
}

export interface HaiSalesSyncSeedsResult {
  ok: boolean;
  mirror: { persona: number; ventas: number };
  database: HaiSalesDatabaseSyncResult;
}

export interface HaiSalesSyncDatabaseResult {
  ok: boolean;
  remoteMirror: { copied: boolean; persona: number; ventas: number } | null;
  database: HaiSalesDatabaseSyncResult;
}

export interface HaiSalesResumen {
  available: boolean;
  migrationRequired?: boolean;
  documents: number;
  totalUsd: number;
  totalPen: number;
  months: string[];
}
