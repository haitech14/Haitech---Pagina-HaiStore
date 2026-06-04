import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

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
import { submitSupportTicket, SupportTicketError } from '@/lib/support-ticket';

const contactSchema = z.object({
  name: z.string().min(2, 'Introduce al menos 2 caracteres.'),
  email: z.string().email('Introduce un correo válido.'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
});

type ContactValues = z.infer<typeof contactSchema>;

const SERVICE_PREFILL_MESSAGE =
  'Solicito programar un servicio técnico. Modelo del equipo: ___ | Ciudad: ___ | Detalle del problema: ___';

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
    if (searchParams.get('tema') !== 'servicio') return;
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
            ¿Tienes una pregunta? Escríbenos y HaiSupport te responderá.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
