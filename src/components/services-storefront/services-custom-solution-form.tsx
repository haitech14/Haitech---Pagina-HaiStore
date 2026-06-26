import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, CheckCircle2, Headphones, Lock, Send } from 'lucide-react';
import { z } from 'zod';

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
import { Textarea } from '@/components/ui/textarea';
import { useServicesQuoteOptional } from '@/context/services-quote-context';
import {
  SERVICES_LANDING_FORM_ID,
  servicesLandingFormBenefits,
  servicesLandingFormCopy,
  servicesLandingFormServiceOptions,
} from '@/data/services-landing';
import { submitSupportTicket, SupportTicketError } from '@/lib/support-ticket';
import { cn } from '@/lib/utils';

const quoteFormSchema = z.object({
  name: z.string().min(2, 'Introduce al menos 2 caracteres.'),
  company: z.string().min(2, 'Introduce el nombre de la empresa.'),
  phone: z.string().min(7, 'Introduce un teléfono válido.'),
  email: z.string().email('Introduce un correo válido.'),
  service: z.string().min(1, 'Selecciona un servicio.'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

interface ServicesCustomSolutionFormProps {
  className?: string;
}

export function ServicesCustomSolutionForm({ className }: ServicesCustomSolutionFormProps) {
  const quote = useServicesQuoteOptional();
  const [sent, setSent] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: '',
      company: '',
      phone: '',
      email: '',
      service: '',
      message: '',
    },
  });

  useEffect(() => {
    if (!quote?.selectedLineView) return;
    const line = quote.selectedLineView;
    setValue(
      'message',
      `Necesito una solución a medida. Servicio seleccionado: ${line.title} (${line.planLabel}, ${line.durationLabel}). Precio estimado S/ ${quote.subtotalPen.toLocaleString('es-PE')}${line.pricePeriod}.`,
    );
  }, [quote?.selectedLineView, quote?.subtotalPen, setValue]);

  const onSubmit = async (values: QuoteFormValues) => {
    setSubmitError(null);
    const serviceLabel =
      servicesLandingFormServiceOptions.find((option) => option.value === values.service)?.label ??
      values.service;

    try {
      const ticket = await submitSupportTicket({
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: values.message,
        type: 'contact',
        metadata: {
          channel: 'services-landing',
          company: values.company,
          service: serviceLabel,
        },
      });
      setIsDemo(ticket.demo === true);
      setSent(true);
    } catch (error) {
      setSubmitError(
        error instanceof SupportTicketError
          ? error.message
          : 'No se pudo enviar la solicitud. Comprueba tu conexión e intenta de nuevo.',
      );
    }
  };

  return (
    <section
      id={SERVICES_LANDING_FORM_ID}
      aria-labelledby="servicios-custom-form-titulo"
      className={cn('scroll-mt-20 bg-white py-10 sm:py-14', className)}
    >
      <div className="container px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-border/60 shadow-[0_12px_40px_-24px_rgba(15,31,61,0.25)] lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="bg-neutral-950 px-6 py-8 text-white sm:px-8 sm:py-10">
            <Headphones className="size-10 text-red-500" aria-hidden="true" />
            <h2 id="servicios-custom-form-titulo" className="mt-4 text-2xl font-bold sm:text-3xl">
              ¿Necesitas una solución a medida?
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
              {servicesLandingFormCopy.panelDescription}
            </p>

            <ul className="mt-8 space-y-4">
              {servicesLandingFormBenefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <li key={benefit.id} className="flex items-center gap-3 text-sm font-medium sm:text-base">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-400"
                      aria-hidden="true"
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                    </span>
                    {benefit.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="bg-card px-6 py-8 sm:px-8 sm:py-10">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-8 text-center" role="status">
                <CheckCircle2 className="size-12 text-emerald-600" aria-hidden="true" />
                <p className="mt-4 text-lg font-semibold">{servicesLandingFormCopy.successMessage}</p>
                {isDemo ? (
                  <p className="mt-2 text-sm text-amber-700">Modo demo activo.</p>
                ) : null}
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                  {servicesLandingFormCopy.formTitle}
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="custom-name">Nombre completo</Label>
                      <Input id="custom-name" className="mt-1" {...register('name')} aria-invalid={!!errors.name} />
                      {errors.name ? (
                        <p className="mt-1 text-xs text-destructive" role="alert">{errors.name.message}</p>
                      ) : null}
                    </div>
                    <div>
                      <Label htmlFor="custom-company">Empresa</Label>
                      <Input id="custom-company" className="mt-1" {...register('company')} aria-invalid={!!errors.company} />
                      {errors.company ? (
                        <p className="mt-1 text-xs text-destructive" role="alert">{errors.company.message}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="custom-phone">Teléfono</Label>
                      <Input id="custom-phone" className="mt-1" {...register('phone')} aria-invalid={!!errors.phone} />
                      {errors.phone ? (
                        <p className="mt-1 text-xs text-destructive" role="alert">{errors.phone.message}</p>
                      ) : null}
                    </div>
                    <div>
                      <Label htmlFor="custom-email">Correo electrónico</Label>
                      <Input id="custom-email" type="email" className="mt-1" {...register('email')} aria-invalid={!!errors.email} />
                      {errors.email ? (
                        <p className="mt-1 text-xs text-destructive" role="alert">{errors.email.message}</p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="custom-service">Selecciona un servicio</Label>
                    <Controller
                      control={control}
                      name="service"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="custom-service" className="mt-1" aria-invalid={!!errors.service}>
                            <SelectValue placeholder="Elige un servicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {servicesLandingFormServiceOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.service ? (
                      <p className="mt-1 text-xs text-destructive" role="alert">{errors.service.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <Label htmlFor="custom-message">Mensaje</Label>
                    <Textarea id="custom-message" className="mt-1 min-h-28" {...register('message')} aria-invalid={!!errors.message} />
                    {errors.message ? (
                      <p className="mt-1 text-xs text-destructive" role="alert">{errors.message.message}</p>
                    ) : null}
                  </div>

                  {submitError ? (
                    <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
                      <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
                      {submitError}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-11 w-full gap-2 bg-red-600 font-semibold hover:bg-red-700"
                  >
                    <Send className="size-4" aria-hidden="true" />
                    {isSubmitting ? 'Enviando…' : servicesLandingFormCopy.submitLabel}
                  </Button>

                  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3.5" aria-hidden="true" />
                    {servicesLandingFormCopy.privacyNote}
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
