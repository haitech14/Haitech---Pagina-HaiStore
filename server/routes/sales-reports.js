import { Router } from 'express';

import {
  IMPORTED_SALE_ADMIN_SELECT,
  importVentasDocumentRows,
  parseVentasWorkbook,
} from '../lib/ventas-excel.js';
import { getSupabaseAdmin } from '../lib/supabase-auth.js';
import { requireAdmin } from '../lib/auth-store.js';

export const salesReportsRouter = Router();

/** @param {{ code?: string; message?: string } | null | undefined} error */
function isMissingImportedSalesTable(error) {
  if (!error) return false;
  if (error.code === 'PGRST205') return true;
  const message = String(error.message ?? '').toLowerCase();
  return message.includes('imported_sale_documents') && message.includes('schema cache');
}

const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/**
 * @param {string} monthKey YYYY-MM-DD (first day of month)
 */
function formatMonthLabel(monthKey) {
  const match = String(monthKey).match(/^(\d{4})-(\d{2})/);
  if (!match) return monthKey;
  const year = match[1];
  const monthIndex = Number(match[2]) - 1;
  const name = MONTH_LABELS[monthIndex] ?? match[2];
  return `${name} ${year}`;
}

/**
 * @param {Array<{ report_period_month: string; total: number; currency: string }>} rows
 */
function buildMonthsSummary(rows) {
  /** @type {Map<string, { count: number; totalUsd: number; totalPen: number }>} */
  const byMonth = new Map();

  for (const row of rows) {
    const month = row.report_period_month;
    if (!month) continue;
    const entry = byMonth.get(month) ?? { count: 0, totalUsd: 0, totalPen: 0 };
    entry.count += 1;
    const amount = Number(row.total) || 0;
    if (row.currency === 'PEN') {
      entry.totalPen += amount;
    } else {
      entry.totalUsd += amount;
    }
    byMonth.set(month, entry);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, stats]) => ({
      month,
      label: formatMonthLabel(month),
      count: stats.count,
      totalUsd: Math.round(stats.totalUsd * 100) / 100,
      totalPen: Math.round(stats.totalPen * 100) / 100,
    }));
}

salesReportsRouter.get('/admin', requireAdmin, async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.json({ documents: [], months: [], source: 'unavailable' });
    }

    const month = typeof req.query.month === 'string' ? req.query.month : null;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const limit = Math.min(Math.max(Number(req.query.limit) || 500, 1), 1000);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    let listQuery = supabase
      .from('imported_sale_documents')
      .select(IMPORTED_SALE_ADMIN_SELECT)
      .order('invoice_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (month && month !== 'all') {
      const periodMonth = month.length === 7 ? `${month}-01` : month;
      listQuery = listQuery.eq('report_period_month', periodMonth);
    }

    const { data: documents, error: listError } = await listQuery;
    if (listError) {
      console.error('[sales-reports] list error:', listError);
      if (isMissingImportedSalesTable(listError)) {
        return res.status(503).json({
          error:
            'Falta la tabla de ventas históricas en Supabase. Aplica la migración 011_imported_sale_documents.sql.',
          code: 'IMPORTED_SALES_TABLE_MISSING',
          migration: 'supabase/migrations/011_imported_sale_documents.sql',
          documents: [],
          months: [],
          source: 'migration-required',
        });
      }
      return res.status(500).json({ error: 'No se pudieron cargar las ventas importadas' });
    }

    let filtered = documents ?? [];
    if (q) {
      const needle = q.toLowerCase();
      filtered = filtered.filter((doc) => {
        const haystack = [
          doc.serie,
          doc.numero,
          doc.document_type,
          doc.tax_id,
          doc.customer_name,
          doc.seller_name,
          doc.related_doc,
          doc.customer?.full_name,
          doc.customer?.company_name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      });
    }

    const { data: monthRows, error: monthsError } = await supabase
      .from('imported_sale_documents')
      .select('report_period_month, total, currency');

    if (monthsError) {
      console.error('[sales-reports] months error:', monthsError);
      if (isMissingImportedSalesTable(monthsError)) {
        return res.status(503).json({
          error:
            'Falta la tabla de ventas históricas en Supabase. Aplica la migración 011_imported_sale_documents.sql.',
          code: 'IMPORTED_SALES_TABLE_MISSING',
          migration: 'supabase/migrations/011_imported_sale_documents.sql',
          documents: [],
          months: [],
          source: 'migration-required',
        });
      }
      return res.status(500).json({ error: 'No se pudieron cargar los meses' });
    }

    res.json({
      documents: filtered,
      months: buildMonthsSummary(monthRows ?? []),
      source: 'supabase',
    });
  } catch (error) {
    next(error);
  }
});

salesReportsRouter.post('/admin/import-ventas', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    /** @type {Array<{ buffer: Buffer; filename: string }>} */
    const files = [];

    if (Array.isArray(body.files)) {
      for (const entry of body.files) {
        if (entry?.fileBase64 && typeof entry.fileBase64 === 'string') {
          files.push({
            buffer: Buffer.from(entry.fileBase64, 'base64'),
            filename: typeof entry.filename === 'string' ? entry.filename : 'import.xlsx',
          });
        }
      }
    } else if (body.fileBase64 && typeof body.fileBase64 === 'string') {
      files.push({
        buffer: Buffer.from(body.fileBase64, 'base64'),
        filename: typeof body.filename === 'string' ? body.filename : 'import.xlsx',
      });
    } else {
      return res.status(400).json({
        error: 'Envía `fileBase64` o `files` (array con fileBase64 y filename).',
      });
    }

    if (files.length === 0) {
      return res.status(400).json({ error: 'No se recibieron archivos válidos.' });
    }

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

    res.json({
      created,
      updated,
      skipped,
      total,
      filesProcessed: files.length,
      errors,
    });
  } catch (error) {
    next(error);
  }
});
