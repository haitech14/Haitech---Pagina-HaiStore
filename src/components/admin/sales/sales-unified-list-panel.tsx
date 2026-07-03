import { useMemo, useState } from 'react';
import {
  Copy,
  FileDown,
  FileSpreadsheet,
  MessageCircle,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminOrderStatusBadge } from '@/components/admin/AdminOrderStatusBadge';
import { ImportedSalesErpTable } from '@/components/admin/sales/imported-sales-erp-table';
import { ProformaEditDialog } from '@/components/admin/sales/proforma-edit-dialog';
import { SaleOrderActions } from '@/components/admin/sales/sale-order-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ALL_IMPORTED_MONTHS } from '@/hooks/use-admin-imported-sales';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { formatOrderTotal, mapStoreOrderStatusToBadge } from '@/lib/admin-order-status';
import {
  buildProformaWhatsAppMessage,
  buildWhatsAppShareUrl,
} from '@/lib/proforma-whatsapp-message';
import { downloadProformaPdf } from '@/lib/regenerate-proforma-pdf';
import {
  exportImportedSalesToExcel,
  exportUnifiedVentasToExcel,
} from '@/lib/export-ventas-excel';
import { formatTpvMoney } from '@/lib/tpv-pricing';
import { importedSaleMatchesQuery } from '@/lib/ventas-report-columns';
import { cn } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { ImportedSaleDocument, VentasMonthSummary } from '@/types/imported-sale';
import { PRICE_ROLE_LABELS, isPriceRole } from '@/types/product';
import {
  PROFORMA_FOLLOW_UP_LABELS,
  type ProformaFollowUpStatus,
  type ProformaRecord,
  type UpdateProformaPayload,
} from '@/types/proforma';
import type { StoreOrder } from '@/types/store';

const ALL_STATUS = 'all' as const;
const ALL_SELLERS = 'all' as const;
const ALL_TYPES = 'all' as const;

type RowType = 'venta' | 'cotizacion' | 'historico';

type UnifiedRow =
  | { kind: 'venta'; id: string; sortDate: string; order: StoreOrder }
  | { kind: 'cotizacion'; id: string; sortDate: string; proforma: ProformaRecord }
  | { kind: 'historico'; id: string; sortDate: string; doc: ImportedSaleDocument };

const paymentLabels: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  failed: 'Fallido',
  refunded: 'Reembolsado',
};

const statusVariant: Record<
  ProformaFollowUpStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'secondary',
  contacted: 'outline',
  negotiating: 'default',
  won: 'default',
  lost: 'destructive',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function matchesSelectedMonth(isoDate: string, selectedMonth: string): boolean {
  if (selectedMonth === ALL_IMPORTED_MONTHS) return true;
  const key = selectedMonth.slice(0, 7);
  return isoDate.slice(0, 7) === key;
}

function orderCustomerLabel(order: StoreOrder): string {
  const customer = order.customer;
  return (
    customer?.full_name?.trim() ||
    customer?.company_name?.trim() ||
    customer?.email ||
    'Cliente'
  );
}

function importedCustomerLabel(doc: ImportedSaleDocument): string {
  const linked = doc.customer;
  return (
    linked?.company_name?.trim() ||
    linked?.full_name?.trim() ||
    doc.customer_name ||
    'Cliente'
  );
}

function formatImportedTotal(doc: ImportedSaleDocument): string {
  const amount = Number(doc.total);
  if (doc.currency === 'PEN') {
    return formatTpvMoney(amount, 'PEN');
  }
  return formatTpvMoney(amount, 'USD');
}

function documentBadgeVariant(documentType: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const upper = documentType.toUpperCase();
  if (upper.includes('NOTA') && upper.includes('CREDITO')) return 'destructive';
  if (upper.includes('FACTURA')) return 'default';
  return 'secondary';
}

function cotizacionClientTypeLabel(proforma: ProformaRecord): string {
  if (proforma.source === 'product') return 'Cotización web';
  if (proforma.priceList && isPriceRole(proforma.priceList)) {
    return PRICE_ROLE_LABELS[proforma.priceList];
  }
  return 'Mostrador';
}

function buildRows(
  orders: StoreOrder[],
  proformas: ProformaRecord[],
  importedDocuments: ImportedSaleDocument[],
  selectedMonth: string,
): UnifiedRow[] {
  const ventas: UnifiedRow[] = orders
    .filter((order) => matchesSelectedMonth(order.created_at, selectedMonth))
    .map((order) => ({
      kind: 'venta' as const,
      id: order.id,
      sortDate: order.created_at,
      order,
    }));

  const cotizaciones: UnifiedRow[] = proformas
    .filter((proforma) => matchesSelectedMonth(proforma.createdAt, selectedMonth))
    .map((proforma) => ({
      kind: 'cotizacion' as const,
      id: proforma.id,
      sortDate: proforma.createdAt,
      proforma,
    }));

  const historico: UnifiedRow[] = importedDocuments.map((doc) => ({
    kind: 'historico' as const,
    id: doc.id,
    sortDate: doc.invoice_date,
    doc,
  }));

  return [...ventas, ...cotizaciones, ...historico].sort(
    (a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime(),
  );
}

interface SalesUnifiedListPanelProps {
  orders: StoreOrder[];
  proformas: ProformaRecord[];
  importedDocuments: ImportedSaleDocument[];
  months: VentasMonthSummary[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  isLoading?: boolean;
  importedLoading?: boolean;
  defaultTypeFilter?: RowType | typeof ALL_TYPES;
}

export function SalesUnifiedListPanel({
  orders,
  proformas,
  importedDocuments,
  months,
  selectedMonth,
  onMonthChange,
  isLoading = false,
  importedLoading = false,
  defaultTypeFilter = ALL_TYPES,
}: SalesUnifiedListPanelProps) {
  const { data: companySettings } = useCompanySettings();
  const { updateProforma, deleteProforma } = useProformaMutations();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<RowType | typeof ALL_TYPES>(defaultTypeFilter);
  const [statusFilter, setStatusFilter] = useState<ProformaFollowUpStatus | typeof ALL_STATUS>(
    ALL_STATUS,
  );
  const [sellerFilter, setSellerFilter] = useState<string>(ALL_SELLERS);
  const [editing, setEditing] = useState<ProformaRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
  const rows = useMemo(
    () => buildRows(orders, proformas, importedDocuments, selectedMonth),
    [orders, proformas, importedDocuments, selectedMonth],
  );

  const selectedMonthSummary = useMemo(
    () => months.find((entry) => entry.month === selectedMonth),
    [months, selectedMonth],
  );

  const sellers = useMemo(() => {
    const names = new Set<string>();
    for (const proforma of proformas) {
      if (proforma.sellerName) names.add(proforma.sellerName);
    }
    for (const doc of importedDocuments) {
      if (doc.seller_name) names.add(doc.seller_name);
    }
    return [...names].sort((a, b) => a.localeCompare(b, 'es'));
  }, [proformas, importedDocuments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (typeFilter !== ALL_TYPES && row.kind !== typeFilter) return false;

      if (row.kind === 'venta') {
        if (statusFilter !== ALL_STATUS) return false;
        if (sellerFilter !== ALL_SELLERS) return false;
        if (!q) return true;
        const order = row.order;
        const haystack = [
          order.order_number,
          orderCustomerLabel(order),
          order.customer?.email,
          order.customer?.phone,
          order.payment_method,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      }

      if (row.kind === 'historico') {
        if (statusFilter !== ALL_STATUS) return false;
        const doc = row.doc;
        if (sellerFilter !== ALL_SELLERS && doc.seller_name !== sellerFilter) return false;
        return importedSaleMatchesQuery(doc, q);
      }

      const proforma = row.proforma;
      if (statusFilter !== ALL_STATUS && proforma.followUpStatus !== statusFilter) {
        return false;
      }
      if (sellerFilter !== ALL_SELLERS && proforma.sellerName !== sellerFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        proforma.documentNumber,
        proforma.customer.razonSocial,
        proforma.customer.atencion,
        proforma.customer.celular,
        proforma.customer.documento,
        proforma.sellerName,
        proforma.sellerEmail,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query, sellerFilter, statusFilter, typeFilter]);

  const filteredHistoricoDocs = useMemo(() => {
    const q = query.trim();
    return importedDocuments
      .filter((doc) => matchesSelectedMonth(doc.invoice_date, selectedMonth))
      .filter((doc) => sellerFilter === ALL_SELLERS || doc.seller_name === sellerFilter)
      .filter((doc) => importedSaleMatchesQuery(doc, q))
      .sort(
        (a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime(),
      );
  }, [importedDocuments, selectedMonth, sellerFilter, query]);

  const showErpReportTable = typeFilter === 'historico';

  const handleSave = async (payload: UpdateProformaPayload) => {
    if (!editing) return;
    await updateProforma.mutateAsync({ id: editing.id, payload });
  };

  const handleDelete = async (proforma: ProformaRecord) => {
    if (!window.confirm(`¿Eliminar la cotización ${proforma.documentNumber}?`)) return;
    setBusyId(proforma.id);
    try {
      await deleteProforma.mutateAsync(proforma.id);
      toast.success('Cotización eliminada');
    } catch {
      toast.error('No se pudo eliminar la cotización');
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (proforma: ProformaRecord) => {
    setBusyId(proforma.id);
    try {
      await downloadProformaPdf(proforma, company);
      toast.success('PDF descargado');
    } catch {
      toast.error('No se pudo generar el PDF');
    } finally {
      setBusyId(null);
    }
  };

  const handleWhatsAppCopy = async (proforma: ProformaRecord) => {
    const message = buildProformaWhatsAppMessage(proforma, company);
    try {
      await navigator.clipboard.writeText(message);
      toast.success('Mensaje copiado. Pégalo en WhatsApp 📋', {
        description: proforma.customer.celular
          ? 'También puedes abrir WhatsApp Web si el número está registrado.'
          : undefined,
      });
    } catch {
      toast.error('No se pudo copiar al portapapeles');
    }
  };

  const handleWhatsAppOpen = (proforma: ProformaRecord) => {
    const message = buildProformaWhatsAppMessage(proforma, company);
    const url = buildWhatsAppShareUrl(proforma.customer.celular, message);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    void handleWhatsAppCopy(proforma);
  };

  const handleExportExcel = () => {
    const monthSuffix =
      selectedMonth === ALL_IMPORTED_MONTHS ? 'todos' : selectedMonth.slice(0, 7);

    if (showErpReportTable) {
      if (filteredHistoricoDocs.length === 0) {
        toast.error('No hay comprobantes para exportar con los filtros actuales');
        return;
      }

      const exported = exportImportedSalesToExcel(
        filteredHistoricoDocs,
        `ventas-haisales-${monthSuffix}`,
      );
      if (!exported) {
        toast.error('No se pudo generar el archivo Excel');
        return;
      }

      toast.success(
        `${filteredHistoricoDocs.length} comprobante${filteredHistoricoDocs.length === 1 ? '' : 's'} exportado${filteredHistoricoDocs.length === 1 ? '' : 's'} a Excel`,
      );
      return;
    }

    if (filtered.length === 0) {
      toast.error('No hay registros para exportar con los filtros actuales');
      return;
    }

    const exported = exportUnifiedVentasToExcel(filtered, `ventas-${monthSuffix}`);
    if (!exported) {
      toast.error('No se pudo generar el archivo Excel');
      return;
    }

    toast.success(
      `${filtered.length} registro${filtered.length === 1 ? '' : 's'} exportado${filtered.length === 1 ? '' : 's'} a Excel`,
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
        <span className="sr-only">Cargando ventas y cotizaciones…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {importedLoading ? (
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          Cargando histórico HaiSales…
        </p>
      ) : null}
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full space-y-2 sm:min-w-[14rem] sm:max-w-xs">
            <Label htmlFor="sales-month" className="text-xs font-medium uppercase tracking-wide">
              Mes del reporte
            </Label>
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger id="sales-month">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_IMPORTED_MONTHS}>Todos los meses</SelectItem>
                {months.map((entry) => (
                  <SelectItem key={entry.month} value={entry.month}>
                    {entry.label} ({entry.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedMonthSummary ? (
            <p className="text-sm text-muted-foreground sm:flex-1">
              {selectedMonthSummary.count} comprobante
              {selectedMonthSummary.count === 1 ? '' : 's'} en el periodo · USD{' '}
              {selectedMonthSummary.totalUsd.toLocaleString('es-PE', {
                minimumFractionDigits: 2,
              })}
              {selectedMonthSummary.totalPen !== 0
                ? ` · S/ ${selectedMonthSummary.totalPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                : ''}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[12rem] flex-1 space-y-2">
          <Label htmlFor="sales-search" className="text-xs font-medium uppercase tracking-wide">
            Buscar
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="sales-search"
              type="search"
              placeholder="Nº, cliente, vendedor, RUC…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-full space-y-2 sm:w-44">
          <Label htmlFor="sales-filter-type" className="text-xs font-medium uppercase tracking-wide">
            Origen
          </Label>
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as RowType | typeof ALL_TYPES)}
          >
            <SelectTrigger id="sales-filter-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TYPES}>Todos</SelectItem>
              <SelectItem value="historico">Histórico (HaiSales)</SelectItem>
              <SelectItem value="venta">Ventas tienda</SelectItem>
              <SelectItem value="cotizacion">Cotizaciones</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full space-y-2 sm:w-44">
          <Label htmlFor="sales-filter-status" className="text-xs font-medium uppercase tracking-wide">
            Seguimiento
          </Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ProformaFollowUpStatus | typeof ALL_STATUS)}
          >
            <SelectTrigger id="sales-filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUS}>Todos</SelectItem>
              {(Object.keys(PROFORMA_FOLLOW_UP_LABELS) as ProformaFollowUpStatus[]).map(
                (status) => (
                  <SelectItem key={status} value={status}>
                    {PROFORMA_FOLLOW_UP_LABELS[status]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full space-y-2 sm:w-44">
          <Label htmlFor="sales-filter-seller" className="text-xs font-medium uppercase tracking-wide">
            Vendedor
          </Label>
          <Select value={sellerFilter} onValueChange={setSellerFilter}>
            <SelectTrigger id="sales-filter-seller">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SELLERS}>Todos</SelectItem>
              {sellers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full gap-2 sm:w-auto"
          onClick={handleExportExcel}
          disabled={
            showErpReportTable
              ? filteredHistoricoDocs.length === 0
              : filtered.length === 0
          }
        >
          <FileSpreadsheet className="size-4" aria-hidden="true" />
          Exportar Excel
        </Button>
      </div>

      {showErpReportTable ? (
        importedDocuments.length === 0 ? (
          <AdminEmptyState
            title="Sin histórico HaiSales"
            description="Importa un Reporte de Ventas (.xlsx) para ver las mismas columnas del Excel."
          />
        ) : filteredHistoricoDocs.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            Ningún comprobante coincide con los filtros.
          </p>
        ) : (
          <ImportedSalesErpTable documents={filteredHistoricoDocs} />
        )
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="Sin registros de ventas"
          description="Importa reportes Excel de ventas o registra cotizaciones y pedidos desde el TPV."
        />
      ) : filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Ningún registro coincide con los filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origen</TableHead>
                <TableHead>Nº</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[11rem] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => {
                if (row.kind === 'historico') {
                  const doc = row.doc;
                  const totalNegative = Number(doc.total) < 0;
                  return (
                    <TableRow key={`historico-${doc.id}`}>
                      <TableCell>
                        <Badge
                          variant={documentBadgeVariant(doc.document_type)}
                          className="font-normal whitespace-nowrap"
                        >
                          {doc.document_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">
                        {doc.serie}-{doc.numero}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{importedCustomerLabel(doc)}</p>
                        {doc.tax_id ? (
                          <p className="text-xs text-muted-foreground">RUC {doc.tax_id}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm">{doc.seller_name ?? '—'}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          HaiSales
                          {doc.related_doc?.trim() ? ` · ${doc.related_doc.trim()}` : ''}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(doc.invoice_date)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-medium tabular-nums',
                          totalNegative && 'text-destructive',
                        )}
                      >
                        {formatImportedTotal(doc)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">—</TableCell>
                    </TableRow>
                  );
                }

                if (row.kind === 'venta') {
                  const order = row.order;
                  return (
                    <TableRow key={`venta-${order.id}`}>
                      <TableCell>
                        <Badge variant="default" className="font-normal whitespace-nowrap">
                          Venta
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">{order.order_number}</TableCell>
                      <TableCell>
                        <p className="font-medium">{orderCustomerLabel(order)}</p>
                        {order.customer?.email ? (
                          <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">Tienda en línea</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <AdminOrderStatusBadge status={mapStoreOrderStatusToBadge(order.status)} />
                          <span className="text-xs text-muted-foreground">
                            {paymentLabels[order.payment_status] ?? order.payment_status}
                            {order.payment_method ? ` · ${order.payment_method}` : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatOrderTotal(Number(order.total_usd), order.total_pen, order.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <SaleOrderActions order={order} />
                      </TableCell>
                    </TableRow>
                  );
                }

                const proforma = row.proforma;
                const busy = busyId === proforma.id;

                return (
                  <TableRow key={`cotizacion-${proforma.id}`}>
                    <TableCell>
                      <Badge variant="outline" className="font-normal whitespace-nowrap">
                        Cotización
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {proforma.documentNumber}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{proforma.customer.razonSocial || '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {proforma.customer.atencion || proforma.customer.celular || '—'}
                        {' · '}
                        {cotizacionClientTypeLabel(proforma)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{proforma.sellerName}</p>
                      {proforma.sellerEmail ? (
                        <p className="text-xs text-muted-foreground">{proforma.sellerEmail}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[proforma.followUpStatus]}>
                        {PROFORMA_FOLLOW_UP_LABELS[proforma.followUpStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(proforma.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatTpvMoney(proforma.totalPen, proforma.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9"
                          disabled={busy}
                          aria-label="Editar cotización"
                          onClick={() => setEditing(proforma)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9"
                          disabled={busy}
                          aria-label="Descargar PDF"
                          onClick={() => void handleDownload(proforma)}
                        >
                          <FileDown className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9"
                          disabled={busy}
                          aria-label="Copiar mensaje para WhatsApp"
                          title="Copiar mensaje con emoticones"
                          onClick={() => void handleWhatsAppCopy(proforma)}
                        >
                          <Copy className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9 text-green-700 hover:bg-green-50 hover:text-green-800"
                          disabled={busy}
                          aria-label="Abrir WhatsApp"
                          title="Abrir WhatsApp (o copiar si no hay celular)"
                          onClick={() => handleWhatsAppOpen(proforma)}
                        >
                          <MessageCircle className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9 text-destructive hover:bg-destructive/10"
                          disabled={busy}
                          aria-label="Eliminar cotización"
                          onClick={() => void handleDelete(proforma)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <p className="border-t px-4 py-2 text-xs text-muted-foreground">
            {filtered.length} registro{filtered.length === 1 ? '' : 's'} mostrado
            {filtered.length === 1 ? '' : 's'}
          </p>
        </div>
      )}

      <ProformaEditDialog
        proforma={editing}
        open={editing != null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSubmit={handleSave}
        isSaving={updateProforma.isPending}
      />
    </div>
  );
}
