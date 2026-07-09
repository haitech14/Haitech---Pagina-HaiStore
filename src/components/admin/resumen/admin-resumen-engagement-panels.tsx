import { type ReactNode } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ADMIN_RESUMEN_QUOTE_REQUESTS,
  ADMIN_RESUMEN_VISITORS,
} from '@/data/admin-resumen-data';
import { normalizePeruWhatsAppMsisdn } from '@/lib/whatsapp-sales';
import { encodeWhatsAppText } from '@/lib/whatsapp-encoding';
import { cn } from '@/lib/utils';
import type { AdminResumenQuoteStatus } from '@/types/admin-resumen';

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
  return (
    <SectionCard
      title="Clientes que solicitaron cotización"
      description="Prospectos pendientes de seguimiento. Usa Cotizar por WhatsApp para continuar la conversación."
    >
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
            {ADMIN_RESUMEN_QUOTE_REQUESTS.map((quote) => {
              const status = QUOTE_STATUS_META[quote.status];
              const whatsappUrl = buildClientWhatsAppUrl(
                quote.phone,
                buildQuoteWhatsAppMessage({
                  clientName: quote.clientName,
                  productInterest: quote.productInterest,
                  quoteId: quote.id,
                }),
              );

              return (
                <TableRow key={quote.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{quote.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {quote.company ?? quote.email}
                      </p>
                      <p className="text-[0.6875rem] text-muted-foreground">{quote.id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[14rem]">
                    <p className="truncate text-sm text-foreground">{quote.productInterest}</p>
                    <p className="text-xs capitalize text-muted-foreground">{quote.source}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {format(quote.requestedAt, "d MMM yyyy · HH:mm", { locale: es })}
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
    </SectionCard>
  );
}

export function AdminResumenVisitorsPanel() {
  return (
    <SectionCard
      title="Visitantes de la página"
      description="Registro de visitas: IP, ciudad, identidad, creación de cuenta y productos revisados."
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Productos revisados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ADMIN_RESUMEN_VISITORS.map((visitor) => (
              <TableRow key={visitor.id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {format(visitor.visitedAt, "d MMM · HH:mm", { locale: es })}
                </TableCell>
                <TableCell className="font-mono text-xs text-foreground">{visitor.ip}</TableCell>
                <TableCell className="text-sm text-foreground">{visitor.city}</TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-foreground">
                    {visitor.name ?? 'Anónimo'}
                  </p>
                  <p className="text-[0.6875rem] text-muted-foreground">
                    {visitor.pages} páginas · {visitor.id}
                  </p>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold',
                      visitor.createdAccount
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {visitor.createdAccount ? 'Creó cuenta' : 'Sin cuenta'}
                  </span>
                </TableCell>
                <TableCell className="max-w-[16rem]">
                  <ul className="space-y-0.5">
                    {visitor.productsViewed.map((product) => (
                      <li key={`${visitor.id}-${product.name}`} className="text-xs text-foreground">
                        <span className="font-medium">{product.name}</span>
                        {product.sku ? (
                          <span className="text-muted-foreground"> · {product.sku}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SectionCard>
  );
}
