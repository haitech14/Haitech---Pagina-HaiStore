import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  countHaiSalesMirrorRows,
  mirrorRemoteHaiSalesToStore,
  syncHaiSalesFromDatabase,
  upsertHaiSalesPersonaMirror,
  upsertHaiSalesVentasMirror,
} from './haisales-db-sync.js';
import {
  HAISALES_SEEDS_DIR,
  HAISALES_VENTAS_SEEDS_DIR,
  listPersonaSeedFiles,
  listVentasSeedFiles,
} from './haisales-config.js';
import { getHaiSalesSupabaseAdmin, getHaiSalesSupabaseUrl, isHaiSalesRemoteDatabase } from './haisales-supabase.js';
import { importPersonaCustomerRows, parsePersonaWorkbook, sanitizePersonaData } from './persona-excel.js';
import { getSupabaseAdmin } from './supabase-auth.js';
import { importVentasDocumentRows, parseVentasWorkbook } from './ventas-excel.js';
import {
  isHaiSalesConfigured,
  probeHaiSalesConnection,
} from './haitech-integrations-config.js';

/** @param {Array<{ buffer: Buffer; filename: string }>} files */
export async function importVentasFromBuffers(files) {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let total = 0;
  /** @type {Array<{ file: string; row: number; message: string }>} */
  const errors = [];

  for (const file of files) {
    const { rows } = parseVentasWorkbook(file.buffer);
    total += rows.length;
    const result = await importVentasDocumentRows(rows, { sourceFilename: file.filename });
    created += result.created;
    updated += result.updated;
    skipped += result.skipped;
    for (const err of result.errors) {
      errors.push({ file: file.filename, row: err.row, message: err.message });
    }
  }

  return {
    created,
    updated,
    skipped,
    total,
    filesProcessed: files.length,
    errors,
  };
}

export async function importPersonaFromSeeds() {
  const filenames = listPersonaSeedFiles();
  if (filenames.length === 0) {
    return {
      created: 0,
      updated: 0,
      skipped: 0,
      total: 0,
      filesProcessed: 0,
      errors: [{ file: 'seeds', row: 0, message: 'No hay Reporte_Persona_*.xlsx en data/seeds' }],
    };
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let total = 0;
  /** @type {Array<{ file: string; row: number; message: string }>} */
  const errors = [];

  for (const filename of filenames) {
    const buffer = readFileSync(join(HAISALES_SEEDS_DIR, filename));
    const rows = parsePersonaWorkbook(buffer);
    total += rows.length;
    const result = await importPersonaCustomerRows(rows);
    created += result.created;
    updated += result.updated;
    skipped += result.skipped;
    for (const err of result.errors) {
      errors.push({ file: filename, row: err.row, message: err.message });
    }
  }

  return {
    created,
    updated,
    skipped,
    total,
    filesProcessed: filenames.length,
    errors,
  };
}

export async function importVentasFromSeeds() {
  const filenames = listVentasSeedFiles();
  if (filenames.length === 0) {
    return {
      created: 0,
      updated: 0,
      skipped: 0,
      total: 0,
      filesProcessed: 0,
      errors: [
        { file: 'seeds/ventas', row: 0, message: 'No hay Reporte_de_Ventas_*.xlsx en data/seeds/ventas' },
      ],
    };
  }

  const files = filenames.map((filename) => ({
    buffer: readFileSync(join(HAISALES_VENTAS_SEEDS_DIR, filename)),
    filename,
  }));

  return importVentasFromBuffers(files);
}

/**
 * Excel → tablas espejo HaiSales (haisales_persona / haisales_ventas) → HaiStore.
 */
export async function syncHaiSalesFromSeeds() {
  const db = getHaiSalesSupabaseAdmin();
  if (!db) {
    throw new Error(
      'Base HaiSales no configurada. Usa SUPABASE_URL o HAISALES_API_URL + HAISALES_API_KEY en .env',
    );
  }

  let mirrorPersonaUpserted = 0;
  let mirrorVentasUpserted = 0;

  for (const filename of listPersonaSeedFiles()) {
    const buffer = readFileSync(join(HAISALES_SEEDS_DIR, filename));
    const rows = parsePersonaWorkbook(buffer).map((row) => sanitizePersonaData(row));
    const { upserted } = await upsertHaiSalesPersonaMirror(db, rows);
    mirrorPersonaUpserted += upserted;
  }

  for (const filename of listVentasSeedFiles()) {
    const buffer = readFileSync(join(HAISALES_VENTAS_SEEDS_DIR, filename));
    const { rows } = parseVentasWorkbook(buffer);
    const { upserted } = await upsertHaiSalesVentasMirror(db, rows, filename);
    mirrorVentasUpserted += upserted;
  }

  const database = await syncHaiSalesFromDatabase();

  return {
    mirror: { persona: mirrorPersonaUpserted, ventas: mirrorVentasUpserted },
    database,
  };
}

function isMissingImportedSalesTable(error) {
  if (!error) return false;
  if (error.code === 'PGRST205') return true;
  const message = String(error.message ?? '').toLowerCase();
  return message.includes('imported_sale_documents') && message.includes('schema cache');
}

/** Estado de la integración HaiSales ↔ HaiStore. */
export async function getHaiSalesIntegrationStatus() {
  const supabase = getSupabaseAdmin();
  const personaFiles = listPersonaSeedFiles();
  const ventasFiles = listVentasSeedFiles();
  const mirror = await countHaiSalesMirrorRows();

  /** @type {{ count: number | null; lastUpdated: string | null; migrationRequired: boolean }} */
  const ventasTable = { count: null, lastUpdated: null, migrationRequired: false };
  /** @type {{ count: number | null; withPersona: number | null }} */
  const customers = { count: null, withPersona: null };

  if (supabase) {
    const { count: customerCount, error: customerError } = await supabase
      .from('store_customers')
      .select('id', { count: 'exact', head: true });

    if (!customerError) {
      customers.count = customerCount ?? 0;
      const { count: personaCount } = await supabase
        .from('store_customers')
        .select('id', { count: 'exact', head: true })
        .not('persona_data', 'is', null);
      customers.withPersona = personaCount ?? 0;
    }

    const { count: docCount, error: docError } = await supabase
      .from('imported_sale_documents')
      .select('id', { count: 'exact', head: true });

    if (docError && isMissingImportedSalesTable(docError)) {
      ventasTable.migrationRequired = true;
    } else if (!docError) {
      ventasTable.count = docCount ?? 0;
      const { data: lastRow } = await supabase
        .from('imported_sale_documents')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      ventasTable.lastUpdated = lastRow?.updated_at ?? null;
    }
  }

  const migrations = [];
  if (mirror.migrationRequired) migrations.push('supabase/migrations/012_haisales_mirror_tables.sql');
  if (ventasTable.migrationRequired) migrations.push('supabase/migrations/011_imported_sale_documents.sql');

  const connection = await probeHaiSalesConnection(getHaiSalesSupabaseAdmin());

  return {
    product: 'HaiSales',
    description: 'ERP Haitech — base espejo Supabase + sincronización a HaiStore',
    configured: isHaiSalesConfigured(),
    connection,
    supabaseConfigured: Boolean(supabase),
    haisalesDatabase: {
      configured: mirror.configured,
      url: getHaiSalesSupabaseUrl(),
      remote: isHaiSalesRemoteDatabase(),
      mirrorPersona: mirror.persona,
      mirrorVentas: mirror.ventas,
      migrationRequired: mirror.migrationRequired,
    },
    webhookConfigured: Boolean(process.env.HAISALES_WEBHOOK_SECRET?.trim()),
    seeds: {
      personaFiles,
      ventasFiles,
      personaDir: HAISALES_SEEDS_DIR,
      ventasDir: HAISALES_VENTAS_SEEDS_DIR,
    },
    customers,
    ventas: ventasTable,
    migration: migrations[0] ?? null,
    migrations,
    endpoints: {
      status: '/api/integrations/haisales/status',
      syncSeeds: '/api/integrations/haisales/sync-seeds',
      syncDatabase: '/api/integrations/haisales/sync-database',
      importPersona: '/api/integrations/haisales/import/persona',
      importVentas: '/api/integrations/haisales/import/ventas',
      ventasList: '/api/sales-reports/admin',
    },
  };
}

/** KPIs agregados para CRM / resumen. */
export async function getHaiSalesResumen(month) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { available: false, documents: 0, totalUsd: 0, totalPen: 0, months: [] };
  }

  let query = supabase
    .from('imported_sale_documents')
    .select('total, currency, report_period_month');

  if (month && month !== 'all') {
    const periodMonth = month.length === 7 ? `${month}-01` : month;
    query = query.eq('report_period_month', periodMonth);
  }

  const { data, error } = await query;

  if (error && isMissingImportedSalesTable(error)) {
    return { available: false, migrationRequired: true, documents: 0, totalUsd: 0, totalPen: 0, months: [] };
  }

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  let totalUsd = 0;
  let totalPen = 0;

  for (const row of rows) {
    const amount = Number(row.total) || 0;
    if (row.currency === 'PEN') totalPen += amount;
    else totalUsd += amount;
  }

  return {
    available: true,
    documents: rows.length,
    totalUsd: Math.round(totalUsd * 100) / 100,
    totalPen: Math.round(totalPen * 100) / 100,
    months: [...new Set(rows.map((r) => r.report_period_month).filter(Boolean))].sort().reverse(),
  };
}

export { syncHaiSalesFromDatabase, mirrorRemoteHaiSalesToStore };
