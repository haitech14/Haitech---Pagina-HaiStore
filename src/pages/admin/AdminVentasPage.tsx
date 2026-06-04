import { useRef, useState } from 'react';
import { ArrowLeft, FileUp, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AdminModuleLayout } from '@/components/admin/admin-module-layout';
import { SalesUnifiedListPanel } from '@/components/admin/sales/sales-unified-list-panel';
import { TpvPanel } from '@/components/admin/tpv/tpv-panel';
import { Button } from '@/components/ui/button';
import {
  ALL_IMPORTED_MONTHS,
  useImportVentasExcel,
  useImportedSales,
} from '@/hooks/use-admin-imported-sales';
import { useAdminOrdersList } from '@/hooks/use-admin-orders';
import { useAdminProformas } from '@/hooks/use-admin-proformas';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { fileToBase64 } from '@/lib/file-to-base64';

function isTpvView(searchParams: URLSearchParams) {
  return searchParams.get('vista') === 'tpv' || searchParams.get('nuevo') === '1';
}

export function AdminVentasPage() {
  const [searchParams] = useSearchParams();
  const showTpv = isTpvView(searchParams);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(ALL_IMPORTED_MONTHS);

  const { data: orders = [], isLoading: ordersLoading } = useAdminOrdersList();
  const { data: proformas = [], isLoading: proformasLoading } = useAdminProformas();
  const {
    data: importedPayload,
    isLoading: importedLoading,
    isError: importedError,
    error: importedErrorDetail,
  } = useImportedSales(selectedMonth);
  const importVentasExcel = useImportVentasExcel();

  const importedDocuments = importedPayload?.documents ?? [];
  const months = importedPayload?.months ?? [];
  const importedSetupRequired =
    importedPayload?.code === 'IMPORTED_SALES_TABLE_MISSING' ||
    importedPayload?.source === 'migration-required';

  const isLoading = ordersLoading || proformasLoading || importedLoading;
  const historicoCount = importedDocuments.length;
  const totalCount = orders.length + proformas.length + historicoCount;

  const handleImportFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    try {
      const files = await Promise.all(
        Array.from(fileList).map(async (file) => ({
          fileBase64: await fileToBase64(file),
          filename: file.name,
        })),
      );
      const result = await importVentasExcel.mutateAsync(files);
      toast.success(
        `Importación: ${result.created} nuevos, ${result.updated} actualizados${result.errors.length ? `, ${result.errors.length} errores` : ''}.`,
      );
      if (result.errors.length > 0) {
        console.warn('[ventas-import]', result.errors);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo importar el Excel');
    }
  };

  if (showTpv) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" className="min-h-11 gap-2" asChild>
            <Link to={ADMIN_ROUTES.VENTAS}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver al listado
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Punto de venta — emite cotización, factura o boleta en PDF. Las cotizaciones quedan
            registradas para seguimiento.
          </p>
        </div>
        <TpvPanel />
      </div>
    );
  }

  return (
    <AdminModuleLayout
      title="Ventas"
      description="Histórico ERP, ventas de tienda y cotizaciones en un solo listado."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? 'Cargando registros…'
            : `${totalCount} registro${totalCount === 1 ? '' : 's'} (${historicoCount} histórico, ${orders.length} venta${orders.length === 1 ? '' : 's'}, ${proformas.length} cotización${proformas.length === 1 ? '' : 'es'})`}
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            className="sr-only"
            onChange={(event) => {
              void handleImportFiles(event.target.files);
              event.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="min-h-11 gap-2"
            disabled={importVentasExcel.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="size-4" aria-hidden="true" />
            {importVentasExcel.isPending ? 'Importando…' : 'Importar Excel'}
          </Button>
          <Button
            asChild
            className="min-h-11 gap-2 bg-red-600 hover:bg-red-500 focus-visible:ring-red-600"
          >
            <Link to={ADMIN_ROUTES.TPV}>
              <Plus className="size-4" aria-hidden="true" />
              Nueva cotización (TPV)
            </Link>
          </Button>
        </div>
      </div>

      {(importedSetupRequired || importedError) && (
        <div
          role="alert"
          className={
            importedSetupRequired
              ? 'rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm'
              : 'rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm'
          }
        >
          <p className="font-semibold text-foreground">Histórico ERP no disponible</p>
          <p className="mt-1 text-muted-foreground">
            {importedPayload?.error ??
              (importedErrorDetail instanceof Error
                ? importedErrorDetail.message
                : 'No se pudo conectar con la tabla de ventas importadas en Supabase.')}
          </p>
          {importedSetupRequired ? (
            <p className="mt-2 text-muted-foreground">
              Aplica la migración en Supabase y, si tienes Excel en{' '}
              <code className="rounded bg-muted px-1">data/seeds/ventas</code>, ejecuta{' '}
              <code className="rounded bg-muted px-1">
                node scripts/apply-supabase-migration.mjs
                supabase/migrations/011_imported_sale_documents.sql
              </code>{' '}
              y luego <code className="rounded bg-muted px-1">node scripts/import-ventas-reports.mjs</code>. Necesitas{' '}
              <code className="rounded bg-muted px-1">SUPABASE_ACCESS_TOKEN</code> o{' '}
              <code className="rounded bg-muted px-1">SUPABASE_DB_URL</code> en <code>.env</code>.
            </p>
          ) : null}
        </div>
      )}

      <SalesUnifiedListPanel
        orders={orders}
        proformas={proformas}
        importedDocuments={importedDocuments}
        months={months}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        isLoading={ordersLoading || proformasLoading}
        importedLoading={importedLoading}
      />
    </AdminModuleLayout>
  );
}
