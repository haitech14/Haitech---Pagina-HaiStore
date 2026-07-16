import { type ReactNode } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink, MessageCircle } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { Button } from '@/components/ui/button';import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminProformas } from '@/hooks/use-admin-proformas';
import { normalizePeruWhatsAppMsisdn } from '@/lib/whatsapp-sales';import { encodeWhatsAppText } from '@/lib/whatsapp-encoding';
import { cn } from '@/lib/utils';
import type { AdminResumenQuoteStatus } from '@/types/admin-resumen';
import type { ProformaFollowUpStatus, ProformaRecord } from '@/types/proforma';
const QUOTE_STATUS_META: Record<
  AdminResumenQuoteStatus,
  { label: string; className: string }
> = {
  pendiente: {
    label: 'Pendiente',
    className: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  en_gestion: {
    label: 'En gestión',
    className: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  },
  cotizado: {
    label: 'Cotizado',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  },
  cerrado: {
    label: 'Cerrado',
    className: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  },
};

function buildQuoteWhatsAppMessage(params: {
  clientName: string;
  productInterest: string;
  quoteId: string;
}): string {
  return [
    `Hola ${params.clientName},`,
    `te contactamos de Haitech por tu solicitud de cotización ${params.quoteId}.`,
    `Interés: ${params.productInterest}.`,
    '¿Confirmamos disponibilidad y enviamos la proforma por este medio?',
  ].join(' ');
}

function buildClientWhatsAppUrl(phone: string, text: string): string {
  const msisdn = normalizePeruWhatsAppMsisdn(phone);
  return `https://wa.me/${msisdn}?text=${encodeWhatsAppText(text)}`;
}

function mapProformaStatus(status: ProformaFollowUpStatus): AdminResumenQuoteStatus {
  switch (status) {
    case 'contacted':
    case 'negotiating':
      return 'en_gestion';
    case 'won':
      return 'cotizado';
    case 'lost':
      return 'cerrado';
    default:
      return 'pendiente';
  }
}

function proformaProductInterest(proforma: ProformaRecord): string {
  if (proforma.lineItems.length === 0) return 'Sin productos';
  if (proforma.lineItems.length === 1) return proforma.lineItems[0]!.name;
  return `${proforma.lineItems[0]!.name} (+${proforma.lineItems.length - 1} más)`;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border/60 bg-card p-3 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function AdminResumenQuotesPanel() {
  const { data: proformas = [], isLoading } = useAdminProformas();

  return (
    <SectionCard
      title="Clientes que solicitaron cotización"
      description="Prospectos pendientes de seguimiento. Usa Cotizar por WhatsApp para continuar la conversación."
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Cargando cotizaciones…
        </p>
      ) : proformas.length === 0 ? (
        <AdminEmptyState
          title="Sin cotizaciones registradas"
          description="Las solicitudes del TPV o la tienda aparecerán aquí para seguimiento."
          className="border-0 bg-transparent py-6"
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto / interés</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proformas.map((quote) => {
                const statusKey = mapProformaStatus(quote.followUpStatus);
                const status = QUOTE_STATUS_META[statusKey];
                const whatsappUrl = buildClientWhatsAppUrl(
                  quote.customer.celular,
                  buildQuoteWhatsAppMessage({
                    clientName: quote.customer.atencion || quote.customer.razonSocial,
                    productInterest: proformaProductInterest(quote),
                    quoteId: quote.documentNumber,
                  }),
                );

                return (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {quote.customer.atencion || quote.customer.razonSocial}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {quote.customer.razonSocial}
                        </p>
                        <p className="text-[0.6875rem] text-muted-foreground">
                          {quote.documentNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[14rem]">
                      <p className="truncate text-sm text-foreground">
                        {proformaProductInterest(quote)}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">{quote.source}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {format(quote.createdAt, "d MMM yyyy · HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset',
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        size="sm"
                        className="h-8 gap-1.5 bg-[#25D366] text-xs text-white hover:bg-[#20bd5a]"
                      >
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="size-3.5" aria-hidden="true" />
                          Cotizar por WhatsApp
                          <ExternalLink className="size-3 opacity-80" aria-hidden="true" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}

export function AdminResumenVisitorsPanel() {
  return (
    <SectionCard
      title="Visitantes de la página"
      description="Registro de visitas: IP, ciudad, identidad, creación de cuenta y productos revisados."
    >
      <AdminEmptyState
        title="Sin tracking de visitantes"
        description="Las visitas anonimizadas aparecerán cuando el módulo de analítica esté conectado."
        className="border-0 bg-transparent py-6"
      />
    </SectionCard>
  );
}
