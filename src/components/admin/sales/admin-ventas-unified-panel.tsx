import { useRef, useState } from 'react';
import { ArrowLeft, FileUp, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { SalesUnifiedListPanel } from '@/components/admin/sales/sales-unified-list-panel';
import { Button } from '@/components/ui/button';
import {
  ALL_IMPORTED_MONTHS,
  useImportVentasExcel,
  useImportedSales,
} from '@/hooks/use-admin-imported-sales';
import { useHaiSalesSyncSeeds } from '@/hooks/use-haisales-integration';
import { useAdminOrdersList } from '@/hooks/use-admin-orders';
import { useAdminProformas } from '@/hooks/use-admin-proformas';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { fileToBase64 } from '@/lib/file-to-base64';

interface AdminVentasUnifiedPanelProps {
  defaultTypeFilter?: 'all' | 'venta' | 'cotizacion' | 'historico';
}

export function AdminVentasUnifiedPanel({
  defaultTypeFilter = 'all',
}: AdminVentasUnifiedPanelProps) {
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
  const syncHaiSales = useHaiSalesSyncSeeds();

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <Button type="button" variant="outline" className="mb-3 min-h-11 gap-2" asChild>
            <Link to={ADMIN_ROUTES.VENTAS}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver a pedidos
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? 'Cargando registros…'
              : `${totalCount} registro${totalCount === 1 ? '' : 's'} (${historicoCount} histórico, ${orders.length} venta${orders.length === 1 ? '' : 's'}, ${proformas.length} cotización${proformas.length === 1 ? '' : 'es'})`}
          </p>
        </div>
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
            disabled={syncHaiSales.isPending}
            onClick={() => {
              void syncHaiSales
                .mutateAsync()
                .then((result) => {
                  const { database } = result;
                  toast.success(
                    `HaiSales: ${database.persona.created + database.persona.updated} clientes, ${database.ventas.created + database.ventas.updated} comprobantes.`,
                  );
                })
                .catch((error) => {
                  toast.error(
                    error instanceof Error ? error.message : 'No se pudo sincronizar HaiSales',
                  );
                });
            }}
          >
            <RefreshCw
              className={`size-4 ${syncHaiSales.isPending ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {syncHaiSales.isPending ? 'Sincronizando…' : 'Sincronizar HaiSales'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 gap-2"
            disabled={importVentasExcel.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="size-4" aria-hidden="true" />
            {importVentasExcel.isPending ? 'Importando…' : 'Importar Excel HaiSales'}
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
          <p className="font-semibold text-foreground">Histórico HaiSales no disponible</p>
          <p className="mt-1 text-muted-foreground">
            {importedPayload?.error ??
              (importedErrorDetail instanceof Error
                ? importedErrorDetail.message
                : 'No se pudo conectar con la tabla de ventas importadas en Supabase.')}
          </p>
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
        defaultTypeFilter={defaultTypeFilter}
      />
    </div>
  );
}
