import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { AlertTriangle, CheckCircle2, MapPin, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FOOTER_ADDRESS,
  FOOTER_SALES_PHONE_DISPLAY,
  FOOTER_SALES_WHATSAPP_LINK,
  FOOTER_SUPPORT_PHONE_DISPLAY,
  FOOTER_SUPPORT_PHONE_TEL,
} from '@/data/site-footer';
import { submitSupportTicket, SupportTicketError } from '@/lib/support-ticket';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

const CONTACT_WHATSAPP_URL = buildHaitechWhatsAppUrl(
  'Hola, vengo desde la página de Contacto de HaiStore. Necesito asesoría.',
);

const contactSchema = z.object({
  name: z.string().min(2, 'Introduce al menos 2 caracteres.'),
  email: z.string().email('Introduce un correo válido.'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
});

type ContactValues = z.infer<typeof contactSchema>;

const SERVICE_PREFILL_MESSAGE =
  'Solicito programar un servicio técnico. Modelo del equipo: ___ | Ciudad: ___ | Detalle del problema: ___';

const QUOTE_PREFILL_MESSAGE =
  'Solicito cotización de equipos.\n\nModelo o necesidad: ___ | Cantidad: ___ | Ciudad: ___ | Compra o alquiler: ___';

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const [sent, setSent] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  useEffect(() => {
    const servicio = searchParams.get('servicio')?.trim();
    if (servicio) {
      setValue(
        'message',
        `Solicito cotización de alquiler: ${servicio}.\n\nDetalle del proyecto (duración, cantidad de equipos, ciudad): ___`,
        { shouldDirty: true },
      );
      return;
    }
    const tema = searchParams.get('tema');
    if (tema === 'cotizacion') {
      setValue('message', QUOTE_PREFILL_MESSAGE, { shouldDirty: true });
      return;
    }
    if (tema !== 'servicio') return;
    setValue('message', SERVICE_PREFILL_MESSAGE, { shouldDirty: true });
  }, [searchParams, setValue]);

  const onSubmit = async (values: ContactValues) => {
    setSubmitError(null);

    try {
      const ticket = await submitSupportTicket({
        name: values.name,
        email: values.email,
        message: values.message,
        type: 'contact',
        metadata: { channel: 'contact-page' },
      });
      setIsDemo(ticket.demo === true);
      setSent(true);
    } catch (error) {
      setSubmitError(
        error instanceof SupportTicketError
          ? error.message
          : 'No se pudo enviar el mensaje. Comprueba tu conexión e intenta de nuevo.',
      );
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
          <CardDescription>
            ¿Tienes una pregunta? Habla con un asesor o déjanos un mensaje.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{FOOTER_ADDRESS}</span>
          </p>

          <div className="mb-5 grid gap-2 sm:grid-cols-2">
            <Button asChild className="min-h-11 gap-2 bg-[#25D366] text-white hover:bg-[#20bd5a]">
              <a href={CONTACT_WHATSAPP_URL || FOOTER_SALES_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Icon path={mdiWhatsapp} size={0.85} aria-hidden="true" />
                WhatsApp ventas {FOOTER_SALES_PHONE_DISPLAY}
              </a>
            </Button>
            <Button asChild variant="outline" className="min-h-11 gap-2">
              <a href={FOOTER_SUPPORT_PHONE_TEL}>
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                Llamar {FOOTER_SUPPORT_PHONE_DISPLAY}
              </a>
            </Button>
          </div>

          {sent ? (
            <div className="flex flex-col gap-3">
              <div role="status" className="flex items-center gap-2 text-primary">
                <CheckCircle2 aria-hidden="true" />
                <p>¡Gracias! Hemos recibido tu mensaje.</p>
              </div>
              {isDemo && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>
                    Modo demo: HaiSupport no está conectado. Configura{' '}
                    <code className="text-xs">HAISUPPORT_API_URL</code> y{' '}
                    <code className="text-xs">HAISUPPORT_API_KEY</code> para enviar tickets reales.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={(event) => void handleSubmit(onSubmit)(event)}
              className="flex flex-col gap-4"
              noValidate
            >
              {submitError && (
                <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {submitError}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  {...register('name')}
                />
                {errors.name && (
                  <p id="name-error" role="alert" className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="message">Mensaje</Label>
                <textarea
                  id="message"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  {...register('message')}
                />
                {errors.message && (
                  <p id="message-error" role="alert" className="text-sm text-destructive">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
