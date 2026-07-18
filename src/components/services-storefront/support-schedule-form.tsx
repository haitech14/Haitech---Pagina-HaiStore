import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Wrench } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getServiceCardPriceLabel,
  SERVICES_CATALOG_ITEMS,
} from '@/data/services-catalog';
import { submitSupportTicket, SupportTicketError } from '@/lib/support-ticket';
import { cn } from '@/lib/utils';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

/** Ancho alineado al cotizador de alquiler del hero (~380–420 px). */
export const SUPPORT_SCHEDULE_FORM_WIDTH_CLASS =
  'w-full max-w-[420px] min-w-0 sm:w-[380px] lg:w-[400px]';

const URGENCY_OPTIONS = [
  { id: 'hoy', label: 'Hoy / urgente' },
  { id: 'esta-semana', label: 'Esta semana' },
  { id: 'programar', label: 'Programar visita' },
] as const;

interface SupportScheduleFormProps {
  className?: string;
}

/** Formulario compacto para agendar soporte en el hero (precios del catálogo). */
export function SupportScheduleForm({ className }: SupportScheduleFormProps) {
  const serviceOptions = useMemo(
    () =>
      SERVICES_CATALOG_ITEMS.filter((item) => item.categoryId === 'servicio-tecnico').map(
        (item) => ({
          id: item.slug,
          title: item.title,
          priceLabel: getServiceCardPriceLabel(item),
          basePricePen: item.basePricePen,
        }),
      ),
    [],
  );

  const defaultServiceId = serviceOptions.find((o) => o.id.includes('correctivo'))?.id
    ?? serviceOptions[0]?.id
    ?? '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceId, setServiceId] = useState(defaultServiceId);
  const [urgency, setUrgency] = useState<(typeof URGENCY_OPTIONS)[number]['id']>('esta-semana');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const selectedService = serviceOptions.find((option) => option.id === serviceId) ?? serviceOptions[0];
  const serviceLabel = selectedService?.title ?? 'Soporte técnico';
  const priceLabel = selectedService?.priceLabel ?? '';
  const urgencyLabel =
    URGENCY_OPTIONS.find((option) => option.id === urgency)?.label ?? 'Esta semana';

  const whatsappHref = useMemo(() => {
    return buildHaitechWhatsAppUrl(
      [
        'Hola, quiero agendar soporte técnico:',
        `• Nombre: ${name.trim() || '(por confirmar)'}`,
        `• Teléfono: ${phone.trim() || '(por confirmar)'}`,
        `• Servicio: ${serviceLabel}`,
        priceLabel ? `• Precio referencial: ${priceLabel}` : null,
        `• Disponibilidad: ${urgencyLabel}`,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }, [name, phone, priceLabel, serviceLabel, urgencyLabel]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      toast.error('Indica tu nombre.');
      return;
    }
    if (phone.trim().length < 7) {
      toast.error('Indica un teléfono válido.');
      return;
    }

    setSubmitting(true);
    try {
      await submitSupportTicket({
        name: name.trim(),
        email: `${phone.trim().replace(/\D/g, '') || 'soporte'}@whatsapp.local`,
        phone: phone.trim(),
        message: [
          'Solicitud de agenda de soporte técnico desde el hero de servicios.',
          `Servicio: ${serviceLabel}`,
          priceLabel ? `Precio referencial: ${priceLabel}` : null,
          `Disponibilidad: ${urgencyLabel}`,
        ]
          .filter(Boolean)
          .join('\n'),
        type: 'contact',
        metadata: {
          channel: 'services-support-hero',
          serviceId,
          urgency,
          priceLabel,
          basePricePen: selectedService?.basePricePen ?? 0,
        },
      });
      setSent(true);
      toast.success('Solicitud enviada. Te contactaremos pronto.');
    } catch (error) {
      const message =
        error instanceof SupportTicketError
          ? error.message
          : 'No se pudo enviar. Usa WhatsApp para agendar.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border/70 bg-white p-4',
          'shadow-[0_12px_36px_-18px_rgba(15,31,61,0.45)]',
          SUPPORT_SCHEDULE_FORM_WIDTH_CLASS,
          className,
        )}
      >
        <div className="flex flex-col items-center gap-2 py-3 text-center">
          <CheckCircle2 className="size-8 text-emerald-600" aria-hidden />
          <p className="text-sm font-bold text-[#0f1f3d]">Solicitud registrada</p>
          <p className="text-xs text-muted-foreground">
            Un asesor te contactará para confirmar la visita.
          </p>
          <Button asChild className="mt-2 h-9 w-full bg-red-600 text-sm text-white hover:bg-red-700">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              Continuar por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border/70 bg-white',
        'shadow-[0_12px_36px_-18px_rgba(15,31,61,0.45)]',
        SUPPORT_SCHEDULE_FORM_WIDTH_CLASS,
        className,
      )}
    >
      <div className="border-b border-border/50 px-3 py-2">
        <p className="text-[0.5625rem] font-bold uppercase tracking-[0.08em] text-red-600">
          Soporte técnico
        </p>
        <h2 className="mt-0.5 flex items-center gap-1 text-sm font-bold tracking-tight text-[#0f1f3d]">
          <CalendarClock className="size-3.5 shrink-0 text-red-600" strokeWidth={1.75} aria-hidden />
          Agendar soporte técnico
        </h2>
      </div>

      <form className="space-y-2 p-2.5 sm:p-3" onSubmit={(event) => void onSubmit(event)}>
        <label className="block">
          <span className="text-[0.6875rem] font-semibold text-[#0f1f3d]">Nombre</span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Tu nombre"
            className="mt-1 h-8 text-sm"
            autoComplete="name"
            required
          />
        </label>

        <label className="block">
          <span className="text-[0.6875rem] font-semibold text-[#0f1f3d]">Teléfono / WhatsApp</span>
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="999 999 999"
            className="mt-1 h-8 text-sm"
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </label>

        <label className="block">
          <span className="text-[0.6875rem] font-semibold text-[#0f1f3d]">Tipo de servicio</span>
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger
              className={cn(
                'mt-1 h-8 gap-1 px-2.5 text-[0.6875rem] sm:text-xs',
                '[&>span]:line-clamp-1 [&>span]:text-[0.6875rem] [&>span]:leading-tight sm:[&>span]:text-xs',
              )}
            >
              <SelectValue placeholder="Selecciona un servicio" />
            </SelectTrigger>
            <SelectContent className="max-w-[min(100vw-2rem,24rem)]">
              {serviceOptions.map((option) => (
                <SelectItem
                  key={option.id}
                  value={option.id}
                  textValue={`${option.title} — ${option.priceLabel}`}
                  className="py-1.5 text-[0.6875rem] leading-snug sm:text-xs"
                >
                  <span className="flex min-w-0 flex-col gap-0.5 pr-2">
                    <span className="truncate font-medium text-foreground">{option.title}</span>
                    <span className="text-[0.625rem] font-semibold tabular-nums text-red-700">
                      {option.priceLabel}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {priceLabel ? (
            <p className="mt-1 text-[0.625rem] font-semibold tabular-nums text-red-700">
              Precio referencial: {priceLabel}
            </p>
          ) : null}
        </label>

        <fieldset>
          <legend className="text-[0.6875rem] font-semibold text-[#0f1f3d]">Disponibilidad</legend>
          <div className="mt-1 flex gap-1">
            {URGENCY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setUrgency(option.id)}
                aria-pressed={urgency === option.id}
                className={cn(
                  'h-7 flex-1 rounded-md border px-1 text-[0.625rem] font-semibold transition-colors sm:text-[0.6875rem]',
                  urgency === option.id
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-border bg-white text-foreground hover:bg-muted/40',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <Button
          type="submit"
          disabled={submitting}
          className="h-9 w-full gap-1.5 bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
        >
          <Wrench className="size-3.5" aria-hidden />
          {submitting ? 'Enviando…' : 'Agendar soporte'}
        </Button>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center text-[0.6875rem] font-semibold text-red-700 hover:text-red-800"
        >
          O escribir por WhatsApp
        </a>
      </form>
    </div>
  );
}
