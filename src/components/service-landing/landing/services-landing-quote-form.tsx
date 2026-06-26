import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
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

interface ServicesLandingQuoteFormProps {
  className?: string;
}

export function ServicesLandingQuoteForm({ className }: ServicesLandingQuoteFormProps) {
  const [sent, setSent] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
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
      aria-labelledby="servicios-landing-form-titulo"
      className={cn('scroll-mt-20 bg-white py-10 sm:py-14', className)}
    >
      <div className="container px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-border/60 shadow-[0_12px_40px_-24px_rgba(15,31,61,0.25)] lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="bg-primary px-6 py-8 text-primary-foreground sm:px-8 sm:py-10">
            <h2 id="servicios-landing-form-titulo" className="text-2xl font-bold sm:text-3xl">
              {servicesLandingFormCopy.panelTitle}
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-primary-foreground/90 sm:text-base">
              {servicesLandingFormCopy.panelDescription}
            </p>

            <ul className="mt-8 space-y-4">
              {servicesLandingFormBenefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <li key={benefit.id} className="flex items-center gap-3 text-sm font-medium sm:text-base">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15"
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

          <div className="bg-white px-6 py-8 sm:px-8 sm:py-10">
            <h3 className="text-lg font-bold text-[#0f1f3d] sm:text-xl">
              {servicesLandingFormCopy.formTitle}
            </h3>

            {sent ? (
              <div className="mt-6 flex flex-col gap-3">
                <div role="status" className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
                  <p>{servicesLandingFormCopy.successMessage}</p>
                </div>
                {isDemo ? (
                  <div
                    role="status"
                    className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <p>
                      Modo demo: HaiSupport no está conectado. Configura las variables de entorno para
                      enviar tickets reales.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <form
                onSubmit={(event) => void handleSubmit(onSubmit)(event)}
                className="mt-6 grid gap-4 sm:grid-cols-2"
                noValidate
              >
                {submitError ? (
                  <p
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive sm:col-span-2"
                  >
                    {submitError}
                  </p>
                ) : null}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="services-quote-name">Nombre completo</Label>
                  <Input
                    id="services-quote-name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'services-quote-name-error' : undefined}
                    {...register('name')}
                  />
                  {errors.name ? (
                    <p id="services-quote-name-error" role="alert" className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="services-quote-company">Empresa</Label>
                  <Input
                    id="services-quote-company"
                    aria-invalid={!!errors.company}
                    aria-describedby={errors.company ? 'services-quote-company-error' : undefined}
                    {...register('company')}
                  />
                  {errors.company ? (
                    <p id="services-quote-company-error" role="alert" className="text-sm text-destructive">
                      {errors.company.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="services-quote-phone">Teléfono</Label>
                  <Input
                    id="services-quote-phone"
                    type="tel"
                    autoComplete="tel"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'services-quote-phone-error' : undefined}
                    {...register('phone')}
                  />
                  {errors.phone ? (
                    <p id="services-quote-phone-error" role="alert" className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="services-quote-email">Correo electrónico</Label>
                  <Input
                    id="services-quote-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'services-quote-email-error' : undefined}
                    {...register('email')}
                  />
                  {errors.email ? (
                    <p id="services-quote-email-error" role="alert" className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="services-quote-service">Servicio de interés</Label>
                  <Controller
                    control={control}
                    name="service"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id="services-quote-service"
                          aria-invalid={!!errors.service}
                          aria-describedby={errors.service ? 'services-quote-service-error' : undefined}
                        >
                          <SelectValue placeholder="Selecciona un servicio" />
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
                    <p id="services-quote-service-error" role="alert" className="text-sm text-destructive">
                      {errors.service.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="services-quote-message">Mensaje</Label>
                  <Textarea
                    id="services-quote-message"
                    rows={4}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'services-quote-message-error' : undefined}
                    {...register('message')}
                  />
                  {errors.message ? (
                    <p id="services-quote-message-error" role="alert" className="text-sm text-destructive">
                      {errors.message.message}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <Button type="submit" className="min-h-11 w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando…' : servicesLandingFormCopy.submitLabel}
                  </Button>
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                    {servicesLandingFormCopy.privacyNote}
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
