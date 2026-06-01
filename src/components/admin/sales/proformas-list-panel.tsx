import { useMemo, useState } from 'react';
import {
  Copy,
  FileDown,
  MessageCircle,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { ProformaEditDialog } from '@/components/admin/sales/proforma-edit-dialog';
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
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useAdminProformas, useProformaMutations } from '@/hooks/use-admin-proformas';
import {
  buildProformaWhatsAppMessage,
  buildWhatsAppShareUrl,
} from '@/lib/proforma-whatsapp-message';
import { downloadProformaPdf } from '@/lib/regenerate-proforma-pdf';
import { formatTpvMoney } from '@/lib/tpv-pricing';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import { PRICE_ROLE_LABELS, isPriceRole } from '@/types/product';
import {
  PROFORMA_FOLLOW_UP_LABELS,
  type ProformaFollowUpStatus,
  type ProformaRecord,
  type UpdateProformaPayload,
} from '@/types/proforma';

const ALL_STATUS = 'all' as const;
const ALL_SELLERS = 'all' as const;

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

function clientTypeLabel(proforma: ProformaRecord): string {
  if (proforma.source === 'product') return 'Cotización web';
  if (proforma.priceList && isPriceRole(proforma.priceList)) {
    return PRICE_ROLE_LABELS[proforma.priceList];
  }
  return 'Mostrador';
}

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

interface ProformasListPanelProps {
  isLoading?: boolean;
}

export function ProformasListPanel({ isLoading: externalLoading }: ProformasListPanelProps) {
  const { data: proformas = [], isLoading: queryLoading } = useAdminProformas();
  const { data: companySettings } = useCompanySettings();
  const { updateProforma, deleteProforma } = useProformaMutations();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProformaFollowUpStatus | typeof ALL_STATUS>(
    ALL_STATUS,
  );
  const [sellerFilter, setSellerFilter] = useState<string>(ALL_SELLERS);
  const [editing, setEditing] = useState<ProformaRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isLoading = externalLoading ?? queryLoading;
  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;

  const sellers = useMemo(() => {
    const names = new Set(proformas.map((entry) => entry.sellerName).filter(Boolean));
    return [...names].sort((a, b) => a.localeCompare(b, 'es'));
  }, [proformas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return proformas.filter((proforma) => {
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
  }, [proformas, query, sellerFilter, statusFilter]);

  const handleSave = async (payload: UpdateProformaPayload) => {
    if (!editing) return;
    await updateProforma.mutateAsync({ id: editing.id, payload });
  };

  const handleDelete = async (proforma: ProformaRecord) => {
    if (!window.confirm(`¿Eliminar la proforma ${proforma.documentNumber}?`)) return;
    setBusyId(proforma.id);
    try {
      await deleteProforma.mutateAsync(proforma.id);
      toast.success('Proforma eliminada');
    } catch {
      toast.error('No se pudo eliminar la proforma');
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

  if (isLoading) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
        <span className="sr-only">Cargando proformas…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[12rem] flex-1 space-y-2">
          <Label htmlFor="proformas-search" className="text-xs font-medium uppercase tracking-wide">
            Buscar
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="proformas-search"
              type="search"
              placeholder="Nº, cliente, vendedor…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-full space-y-2 sm:w-44">
          <Label htmlFor="pf-filter-status" className="text-xs font-medium uppercase tracking-wide">
            Seguimiento
          </Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ProformaFollowUpStatus | typeof ALL_STATUS)}
          >
            <SelectTrigger id="pf-filter-status">
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
          <Label htmlFor="pf-filter-seller" className="text-xs font-medium uppercase tracking-wide">
            Vendedor
          </Label>
          <Select value={sellerFilter} onValueChange={setSellerFilter}>
            <SelectTrigger id="pf-filter-seller">
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
      </div>

      {proformas.length === 0 ? (
        <AdminEmptyState
          title="Sin proformas registradas"
          description="Las proformas generadas desde el punto de venta o desde la ficha de producto aparecerán aquí para hacer seguimiento."
        />
      ) : filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Ninguna proforma coincide con los filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº proforma</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Tipo cliente</TableHead>
                <TableHead>Seguimiento</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[11rem] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((proforma) => {
                const busy = busyId === proforma.id;
                return (
                  <TableRow key={proforma.id}>
                    <TableCell className="font-semibold tabular-nums">
                      {proforma.documentNumber}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{proforma.customer.razonSocial || '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {proforma.customer.atencion || proforma.customer.celular || '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{proforma.sellerName}</p>
                      {proforma.sellerEmail ? (
                        <p className="text-xs text-muted-foreground">{proforma.sellerEmail}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal whitespace-nowrap">
                        {clientTypeLabel(proforma)}
                      </Badge>
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
                          aria-label="Editar proforma"
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
                          aria-label="Eliminar proforma"
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
            {filtered.length} proforma{filtered.length === 1 ? '' : 's'} mostrada
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
