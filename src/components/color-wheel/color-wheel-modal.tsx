import { useCallback, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight,
  Gift,
  Mail,
  Phone,
  Shield,
  User,
  X,
} from 'lucide-react';

import {
  ColorWheel,
  computeWheelRotation,
  getPrizeByIndex,
  pickRandomPrizeIndex,
} from '@/components/color-wheel/color-wheel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WheelPrize } from '@/data/wheel-prizes';
import { cn } from '@/lib/utils';
import {
  dismissWheelSession,
  hasCompletedWheel,
  isWheelDismissedThisSession,
  saveWheelRegistration,
} from '@/lib/wheel-storage';

const wheelFormSchema = z.object({
  name: z.string().min(2, 'Introduce al menos 2 caracteres.'),
  email: z.string().email('Introduce un correo válido.'),
  phone: z
    .string()
    .min(9, 'Introduce un celular válido.')
    .max(9, 'El celular debe tener 9 dígitos.')
    .regex(/^\d+$/, 'Solo números.'),
  terms: z.boolean().refine((value) => value, {
    message: 'Debes aceptar los términos y condiciones.',
  }),
});

type WheelFormValues = z.infer<typeof wheelFormSchema>;

type ModalPhase = 'register' | 'spinning' | 'result';

const OPEN_DELAY_MS = 1500;

function formatPrizeLabel(prize: WheelPrize): string {
  return `${prize.label} ${prize.sublabel}`.trim();
}

export function ColorWheelModal() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<ModalPhase>('register');
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<WheelPrize | null>(null);
  const [canSpinAgain, setCanSpinAgain] = useState(false);
  const [registrationData, setRegistrationData] = useState<WheelFormValues | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WheelFormValues>({
    resolver: zodResolver(wheelFormSchema),
    defaultValues: { name: '', email: '', phone: '', terms: false },
  });

  useEffect(() => {
    if (hasCompletedWheel() || isWheelDismissedThisSession()) {
      return;
    }

    const timer = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const runSpin = useCallback(
    (formValues: WheelFormValues) => {
      const prizeIndex = pickRandomPrizeIndex();
      const prize = getPrizeByIndex(prizeIndex);
      const nextRotation = computeWheelRotation(prizeIndex);

      setPhase('spinning');
      setSpinning(true);
      setRotation((current) => current + nextRotation);

      window.setTimeout(() => {
        setSpinning(false);
        setWonPrize(prize);
        setPhase('result');
        setCanSpinAgain(Boolean(prize.extraSpin));

        if (!prize.extraSpin) {
          saveWheelRegistration({
            name: formValues.name,
            email: formValues.email,
            phone: formValues.phone,
            prizeId: prize.id,
            prizeLabel: formatPrizeLabel(prize),
            completedAt: new Date().toISOString(),
          });
        }
      }, 4600);
    },
    [],
  );

  const onSubmit = (values: WheelFormValues) => {
    setRegistrationData(values);

    void fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        message: `[Ruleta del Color] Celular: +51 ${values.phone}`,
      }),
    }).catch(() => {
      // Demo: el registro persiste en local aunque el API no esté disponible.
    });

    runSpin(values);
  };

  const handleClose = () => {
    if (spinning) return;

    if (phase !== 'result' || !canSpinAgain) {
      if (!hasCompletedWheel()) {
        dismissWheelSession();
      }
    }

    setOpen(false);
  };

  const handleSpinAgain = () => {
    if (!registrationData || !canSpinAgain) return;
    setCanSpinAgain(false);
    setWonPrize(null);
    runSpin(registrationData);
  };

  const handleFinish = () => {
    if (wonPrize && registrationData && !wonPrize.extraSpin) {
      saveWheelRegistration({
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone,
        prizeId: wonPrize.id,
        prizeLabel: formatPrizeLabel(wonPrize),
        completedAt: new Date().toISOString(),
      });
    }
    setOpen(false);
  };

  const isFormDisabled = phase === 'spinning' || phase === 'result';

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
          return;
        }
        setOpen(true);
      }}
    >
      <DialogContent
        className="max-h-[95dvh] w-[calc(100%-1rem)] max-w-4xl overflow-y-auto border-0 p-0 [&>button]:hidden sm:rounded-2xl"
        aria-describedby={undefined}
        onInteractOutside={(event) => {
          if (spinning) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (spinning) event.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">Ruleta del Color — Registro</DialogTitle>

        <div className="grid md:grid-cols-2">
          {/* Panel izquierdo — ruleta */}
          <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] px-4 py-10 sm:px-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_88%,rgba(168,85,247,0.45),transparent_50%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_40%)]"
            />
            <ColorWheel rotation={rotation} spinning={spinning} className="relative z-10" />

            {phase === 'result' && wonPrize && (
              <div
                role="status"
                className="relative mt-6 rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-center text-white backdrop-blur-sm"
              >
                <p className="text-xs uppercase tracking-wide text-white/70">¡Felicidades!</p>
                <p className="mt-1 text-lg font-bold">{formatPrizeLabel(wonPrize)}</p>
                {wonPrize.extraSpin ? (
                  <p className="mt-1 text-xs text-white/70">Tienes un giro adicional.</p>
                ) : (
                  <p className="mt-1 text-xs text-white/70">
                    Cupón enviado a {registrationData?.email}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Panel derecho — formulario */}
          <div className="relative bg-white px-6 py-8 sm:px-8">
            <button
              type="button"
              onClick={handleClose}
              disabled={spinning}
              aria-label="Cerrar"
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <X className="size-4" aria-hidden="true" />
            </button>

            <div className="mb-5 flex items-start gap-3 pr-8">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                <Gift className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold leading-tight text-foreground sm:text-xl">
                  ¡Suscríbete y obtén un giro en la{' '}
                  <span className="text-[#DC2626]">Ruleta del Color</span>!
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Al registrarte participas por un giro en la{' '}
                  <span className="font-medium text-[#DC2626]">Ruleta del Color</span>.
                </p>
              </div>
            </div>

            {phase === 'result' && canSpinAgain ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Ganaste un giro extra. Pulsa el botón para volver a girar.
                </p>
                <Button
                  type="button"
                  onClick={handleSpinAgain}
                  className="h-12 w-full bg-gradient-to-r from-[#DC2626] to-pink-500 text-base font-semibold text-white hover:from-[#b91c1c] hover:to-pink-600"
                >
                  Girar de nuevo
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Button>
              </div>
            ) : phase === 'result' ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Tu premio será enviado por correo y será válido por 48 a 72 horas.
                </p>
                <Button
                  type="button"
                  onClick={handleFinish}
                  className="h-12 w-full bg-gradient-to-r from-[#DC2626] to-pink-500 text-base font-semibold text-white hover:from-[#b91c1c] hover:to-pink-600"
                >
                  Entendido
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(event) => void handleSubmit(onSubmit)(event)}
                className="flex flex-col gap-4"
                noValidate
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="wheel-name">Nombre</Label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="wheel-name"
                      placeholder="Nombre"
                      className="h-11 rounded-lg pl-10"
                      disabled={isFormDisabled}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'wheel-name-error' : undefined}
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p id="wheel-name-error" role="alert" className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="wheel-email">E-mail</Label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="wheel-email"
                      type="email"
                      autoComplete="email"
                      placeholder="E-mail"
                      className="h-11 rounded-lg pl-10"
                      disabled={isFormDisabled}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'wheel-email-error' : undefined}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p id="wheel-email-error" role="alert" className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="wheel-phone">Celular</Label>
                  <div className="flex overflow-hidden rounded-lg border border-input shadow-sm focus-within:ring-1 focus-within:ring-ring">
                    <span className="flex h-11 shrink-0 items-center gap-1.5 border-r bg-muted/40 px-3 text-sm text-muted-foreground">
                      <span aria-hidden="true">🇵🇪</span>
                      +51
                    </span>
                    <div className="relative min-w-0 flex-1">
                      <Phone
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <Input
                        id="wheel-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="Celular"
                        className="h-11 rounded-none border-0 pl-10 shadow-none focus-visible:ring-0"
                        disabled={isFormDisabled}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'wheel-phone-error' : undefined}
                        {...register('phone')}
                      />
                    </div>
                  </div>
                  {errors.phone && (
                    <p id="wheel-phone-error" role="alert" className="text-xs text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <Controller
                    name="terms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="wheel-terms"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        disabled={isFormDisabled}
                        aria-invalid={!!errors.terms}
                        aria-describedby={errors.terms ? 'wheel-terms-error' : undefined}
                      />
                    )}
                  />
                  <Label htmlFor="wheel-terms" className="text-xs leading-snug text-muted-foreground">
                    Acepto los{' '}
                    <a href="/contacto" className="font-semibold text-[#DC2626] hover:underline">
                      términos y condiciones
                    </a>{' '}
                    y la{' '}
                    <a href="/contacto" className="font-semibold text-[#DC2626] hover:underline">
                      política de privacidad
                    </a>
                    .
                  </Label>
                </div>
                {errors.terms && (
                  <p id="wheel-terms-error" role="alert" className="text-xs text-destructive">
                    {errors.terms.message}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isFormDisabled}
                  className={cn(
                    'h-12 w-full gap-2 bg-gradient-to-r from-[#DC2626] to-pink-500 text-base font-semibold text-white',
                    'hover:from-[#b91c1c] hover:to-pink-600 focus-visible:ring-[#DC2626]',
                  )}
                >
                  {phase === 'spinning' ? 'Girando…' : 'Regístrate y gira la ruleta'}
                  <span className="flex size-6 items-center justify-center rounded-full bg-white/20">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </Button>

                <div className="flex gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-[0.7rem] leading-snug text-red-800">
                  <Shield className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>
                    *Premios sujetos a condiciones de la promoción. No acumulable con otras ofertas
                    salvo indicación.
                  </p>
                </div>

                <p className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                  <Mail className="size-3.5 shrink-0 text-blue-500" aria-hidden="true" />
                  Cupón será enviado por correo y será válido por 48 a 72 horas.
                </p>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
