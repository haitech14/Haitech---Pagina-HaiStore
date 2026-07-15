import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Clock, Gift, Mail, PartyPopper, Phone, Shield, Tag, User, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  REVEAL_DELAY_MS,
  SPIN_DURATION_MS,
  SubscriptionRuletaWheel,
} from '@/components/subscription-ruleta-wheel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RuletaCouponCard } from '@/components/ruleta-coupon-card';
import { isRuletaRedeemablePremio } from '@/config/ruleta-coupon-premios';
import {
  computeRuletaSpinDeltaDeg,
  formatPremioLabel,
  getPremioByIndex,
  pickRandomPremioIndex,
  type RuletaPremio,
} from '@/config/subscription-ruleta-premios';
import { useCreateRuletaCoupon } from '@/hooks/use-discount-coupon';
import { submitSupportTicket, SupportTicketError } from '@/lib/support-ticket';
import { cn } from '@/lib/utils';

const SESSION_KEY = 'subscription_popup_shown';
const RULETA_COUPON_KEY = 'haistore_ruleta_coupon';
const OPEN_DELAY_MS = 2000;
/** Giro horario (hacia la derecha) en reposo. */
const IDLE_STEP_DEG = 0.45;
const IDLE_INTERVAL_MS = 32;

/**
 * Flag temporal: la ruleta «Gira y Gana» queda oculta en toda la tienda.
 * Volver a `true` para reactivarla.
 */
export const SUBSCRIPTION_RULETA_POPUP_ENABLED = false;

const STORE_PATHS = ['/', '/tienda'] as const;

const countryOptions = [
  { code: 'PE', flag: '🇵🇪', dial: '+51', label: 'Perú' },
  { code: 'CL', flag: '🇨🇱', dial: '+56', label: 'Chile' },
  { code: 'CO', flag: '🇨🇴', dial: '+57', label: 'Colombia' },
  { code: 'MX', flag: '🇲🇽', dial: '+52', label: 'México' },
  { code: 'US', flag: '🇺🇸', dial: '+1', label: 'Estados Unidos' },
] as const;

const subscriptionSchema = z.object({
  name: z.string().min(2, 'Introduce al menos 2 caracteres.'),
  email: z.string().email('Introduce un correo válido.'),
  country: z.enum(['PE', 'CL', 'CO', 'MX', 'US']),
  phone: z.string().optional(),
  terms: z.boolean().refine((value) => value, {
    message: 'Debes aceptar los términos y condiciones.',
  }),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

type FormPhase = 'idle' | 'submitting' | 'spinning' | 'landed' | 'won';

function isStoreRoute(pathname: string): boolean {
  if (STORE_PATHS.includes(pathname as (typeof STORE_PATHS)[number])) return true;
  return pathname.startsWith('/tienda/');
}

function markPopupShown(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* storage no disponible */
  }
}

function wasPopupShown(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function SubscriptionPopup() {
  if (!SUBSCRIPTION_RULETA_POPUP_ENABLED) return null;
  return <SubscriptionPopupInner />;
}

function SubscriptionPopupInner() {
  const { pathname } = useLocation();
  const titleId = useId();
  const revealTimerRef = useRef<number | null>(null);
  const spinFallbackTimerRef = useRef<number | null>(null);
  const spinCompletedRef = useRef(false);
  const phaseRef = useRef<FormPhase>('idle');
  const diskRotationRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<FormPhase>('idle');
  const [diskRotation, setDiskRotation] = useState(0);
  const [isSpinAnimating, setIsSpinAnimating] = useState(false);
  const [spinDeltaDeg, setSpinDeltaDeg] = useState<number | null>(null);
  const [spinToken, setSpinToken] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [wonPremio, setWonPremio] = useState<RuletaPremio | null>(null);
  const [wonCouponCode, setWonCouponCode] = useState<string | null>(null);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const createRuletaCoupon = useCreateRuletaCoupon();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      email: '',
      country: 'PE',
      phone: '',
      terms: false,
    },
  });

  const isBusy = phase === 'submitting' || phase === 'spinning' || phase === 'landed';
  const showWheelHighlight = phase === 'landed' || phase === 'won';
  const onStorePage = isStoreRoute(pathname);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    diskRotationRef.current = diskRotation;
  }, [diskRotation]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!onStorePage || wasPopupShown()) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      markPopupShown();
    }, OPEN_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [onStorePage, pathname]);

  useEffect(() => {
    if (!open || phase !== 'idle' || prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      if (phaseRef.current !== 'idle') return;
      setDiskRotation((current) => current + IDLE_STEP_DEG);
    }, IDLE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [open, phase, prefersReducedMotion]);

  useEffect(
    () => () => {
      if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
      if (spinFallbackTimerRef.current) window.clearTimeout(spinFallbackTimerRef.current);
    },
    [],
  );

  const scheduleFelicidades = useCallback(() => {
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    revealTimerRef.current = window.setTimeout(() => {
      setPhase('won');
    }, REVEAL_DELAY_MS);
  }, []);

  const handleSpinComplete = useCallback((finalRotationDeg: number) => {
    if (spinCompletedRef.current) return;
    spinCompletedRef.current = true;

    if (spinFallbackTimerRef.current) {
      window.clearTimeout(spinFallbackTimerRef.current);
      spinFallbackTimerRef.current = null;
    }

    setDiskRotation(finalRotationDeg);
    setSpinDeltaDeg(null);
    setIsSpinAnimating(false);
    setPhase('landed');
    scheduleFelicidades();
  }, [scheduleFelicidades]);

  const handleClose = useCallback(() => {
    if (phase === 'spinning' || phase === 'landed') return;
    setOpen(false);
    setPhase('idle');
    setWonPremio(null);
    setWonCouponCode(null);
    setWinningIndex(null);
    setIsSpinAnimating(false);
    setSpinDeltaDeg(null);
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    if (spinFallbackTimerRef.current) window.clearTimeout(spinFallbackTimerRef.current);
  }, [phase]);

  const runSpin = useCallback(
    (prizeIndex: number, premio: RuletaPremio) => {
      const startRotation = diskRotationRef.current;
      const delta = computeRuletaSpinDeltaDeg(prizeIndex, startRotation);

      spinCompletedRef.current = false;
      setWonPremio(premio);
      setWinningIndex(prizeIndex);
      setPhase('spinning');

      if (prefersReducedMotion) {
        const finalRotation = startRotation + delta;
        setDiskRotation(finalRotation);
        setSpinDeltaDeg(null);
        setIsSpinAnimating(false);
        window.requestAnimationFrame(() => handleSpinComplete(finalRotation));
        return;
      }

      setSpinDeltaDeg(delta);
      setSpinToken((token) => token + 1);
      setIsSpinAnimating(true);

      if (spinFallbackTimerRef.current) window.clearTimeout(spinFallbackTimerRef.current);
      spinFallbackTimerRef.current = window.setTimeout(() => {
        handleSpinComplete(startRotation + delta);
      }, SPIN_DURATION_MS + 200);
    },
    [handleSpinComplete, prefersReducedMotion],
  );

  const onSubmit = async (values: SubscriptionFormValues) => {
    setPhase('submitting');
    const dial =
      countryOptions.find((country) => country.code === values.country)?.dial ?? '+51';
    const prizeIndex = pickRandomPremioIndex();
    const premio = getPremioByIndex(prizeIndex);
    const premioLabel = formatPremioLabel(premio);

    try {
      const ticket = await submitSupportTicket({
        name: values.name,
        email: values.email,
        message: `Suscripción Ruleta del Color — premio asignado: ${premioLabel}`,
        ...(values.phone?.trim() ? { phone: `${dial} ${values.phone.trim()}` } : {}),
        country: values.country,
        type: 'subscription_ruleta',
        metadata: {
          campaign: 'ruleta-del-color',
          countryCode: values.country,
          phoneDial: dial,
          prizeLabel: premioLabel,
        },
      });

      if (ticket.demo) {
        toast.warning('Modo demo HaiSupport', {
          description: 'El registro no llegó a soporte real. Configura HAISUPPORT_API_URL en el servidor.',
        });
      }

      if (isRuletaRedeemablePremio(premio.id)) {
        try {
          const couponResult = await createRuletaCoupon.mutateAsync({
            premioId: premio.id,
            email: values.email,
            participantName: values.name,
          });
          if (couponResult.coupon?.code) {
            setWonCouponCode(couponResult.coupon.code);
            try {
              sessionStorage.setItem(RULETA_COUPON_KEY, couponResult.coupon.code);
            } catch {
              /* storage no disponible */
            }
          }
        } catch {
          toast.message('Premio registrado', {
            description: 'Tu cupón se enviará por correo en las próximas 48 a 72 horas.',
          });
        }
      }

      window.requestAnimationFrame(() => {
        runSpin(prizeIndex, premio);
      });
    } catch (error) {
      setPhase('idle');
      toast.error('No se pudo registrar tu participación', {
        description:
          error instanceof SupportTicketError
            ? error.message
            : 'Comprueba tu conexión e intenta de nuevo.',
      });
    }
  };

  if (!onStorePage) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
        else setOpen(true);
      }}
    >
      <DialogContent
        overlayClassName="z-[100] bg-black/60 backdrop-blur-sm"
        className={cn(
          'z-[101] max-h-[95dvh] w-[calc(100%-1rem)] max-w-[980px] overflow-y-auto border-0 bg-white p-0',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
          'sm:rounded-2xl [&>button]:hidden',
        )}
        aria-labelledby={titleId}
        aria-describedby={undefined}
        aria-busy={isBusy}
        onInteractOutside={(event) => {
          if (phase === 'spinning' || phase === 'landed' || phase === 'won') event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (phase === 'spinning' || phase === 'landed') event.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">Gira y Gana — Ruleta promocional</DialogTitle>

        <div className="relative flex min-h-0 flex-col md:flex-row">
          {/* Columna izquierda — ruleta */}
          <div
            className={cn(
              'relative flex min-h-[420px] flex-col justify-between overflow-hidden px-5 py-6 md:min-h-[580px] md:w-[44%] md:shrink-0 md:px-6 md:py-8',
              'bg-[#121212]',
              phase === 'landed' && 'md:w-[48%]',
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(220,38,38,0.14),transparent_55%)]"
            />

            <header className="relative z-10 flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-600/40 bg-red-600/10 text-red-500">
                <Gift className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  ¡Gira y Gana!
                </p>
                <p className="mt-0.5 text-sm text-neutral-400">
                  Premios increíbles te esperan
                </p>
              </div>
            </header>

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-4">
              <SubscriptionRuletaWheel
                diskRotation={diskRotation}
                isSpinAnimating={isSpinAnimating}
                spinDeltaDeg={spinDeltaDeg}
                spinToken={spinToken}
                highlightIndex={showWheelHighlight ? winningIndex : null}
                onSpinComplete={handleSpinComplete}
                isSpinning={phase === 'spinning' || phase === 'submitting'}
                className="w-full"
              />

              {phase === 'landed' && wonPremio ? (
                <p
                  className="mt-3 max-w-[18rem] animate-in fade-in slide-in-from-bottom-2 text-center text-sm font-semibold text-white duration-500"
                  role="status"
                  aria-live="polite"
                >
                  ¡Premio seleccionado!{' '}
                  <span className="block text-amber-300">{formatPremioLabel(wonPremio)}</span>
                </p>
              ) : null}
            </div>

            <div className="relative z-10 rounded-xl border border-neutral-700/80 bg-neutral-900/90 px-4 py-3.5">
              <div className="flex items-start gap-3">
                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-600/15 text-red-500">
                  <Shield className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Tus datos están seguros con nosotros</p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    No compartimos tu información con terceros
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha — formulario */}
          <div
            className={cn(
              'relative flex-1 bg-white px-5 py-7 sm:px-8 sm:py-9',
              phase === 'landed' && 'hidden md:flex md:max-w-[52%] md:flex-col md:justify-center',
            )}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={phase === 'spinning' || phase === 'landed'}
              aria-label="Cerrar ventana de suscripción"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <X className="size-4" aria-hidden="true" />
            </button>

            {phase === 'landed' && wonPremio ? (
              <div
                className="flex flex-col items-center justify-center gap-4 px-2 py-6 text-center md:py-0"
                aria-hidden="true"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-red-600/10 text-red-600">
                  <Gift className="size-7" aria-hidden="true" />
                </span>
                <p className="text-lg font-bold text-foreground">¡Buena elección!</p>
                <p className="text-sm text-muted-foreground">
                  El puntero se detuvo en{' '}
                  <span className="font-semibold text-red-600">{formatPremioLabel(wonPremio)}</span>
                </p>
              </div>
            ) : (
            <>
            <div className="mb-7 pr-10">
              <h2
                id={titleId}
                className="text-balance text-2xl font-bold tracking-tight text-neutral-900 sm:text-[1.75rem]"
              >
                Gana recompensas{' '}
                <span className="font-bold text-red-600">exclusivas</span> al instante
              </h2>
              <p className="mt-2 text-sm text-neutral-500 sm:text-base">
                Regístrate en segundos y obtén tu giro 🎉
              </p>
            </div>

            <form
              onSubmit={(event) => void handleSubmit(onSubmit)(event)}
              className="flex flex-col gap-4"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sub-name" className="text-sm font-semibold text-neutral-800">
                  Nombre
                </Label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="sub-name"
                    placeholder="Ingresa tu nombre"
                    className="h-11 border-neutral-200 bg-neutral-50 pl-10"
                    disabled={isBusy}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'sub-name-error' : undefined}
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p id="sub-name-error" role="alert" className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sub-email" className="text-sm font-semibold text-neutral-800">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="sub-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Ingresa tu e-mail"
                    className="h-11 border-neutral-200 bg-neutral-50 pl-10"
                    disabled={isBusy}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'sub-email-error' : undefined}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p id="sub-email-error" role="alert" className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sub-phone" className="text-sm font-semibold text-neutral-800">
                  Celular
                </Label>
                <div className="flex overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 shadow-sm focus-within:ring-2 focus-within:ring-red-600/30">
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isBusy}
                      >
                        <SelectTrigger
                          className="h-11 w-[7.75rem] shrink-0 rounded-none border-0 border-r border-neutral-200 bg-neutral-50 shadow-none focus:ring-0"
                          aria-label="País del celular"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryOptions.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.flag} {country.dial}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <div className="relative min-w-0 flex-1">
                    <Phone
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
                      aria-hidden="true"
                    />
                    <Input
                      id="sub-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="Tu número de celular"
                      className="h-11 rounded-none border-0 bg-neutral-50 pl-10 shadow-none focus-visible:ring-0"
                      disabled={isBusy}
                      {...register('phone')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="sub-terms"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      disabled={isBusy}
                      aria-invalid={!!errors.terms}
                      aria-describedby={errors.terms ? 'sub-terms-error' : undefined}
                    />
                  )}
                />
                <Label htmlFor="sub-terms" className="text-xs leading-snug text-neutral-600">
                  Acepto los{' '}
                  <Link to="/terminos" className="font-semibold text-red-600 hover:underline">
                    términos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link to="/privacidad" className="font-semibold text-red-600 hover:underline">
                    política de privacidad
                  </Link>
                  .
                </Label>
              </div>
              {errors.terms && (
                <p id="sub-terms-error" role="alert" className="text-xs text-destructive">
                  {errors.terms.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={isBusy}
                className="h-12 w-full gap-3 rounded-xl bg-red-600 font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
              >
                {phase === 'submitting'
                  ? 'Registrando…'
                  : phase === 'spinning'
                    ? 'Girando la ruleta…'
                    : 'Registrar y girar la ruleta'}
                <span className="flex size-7 items-center justify-center rounded-full bg-white text-red-600">
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </Button>

              <div className="flex items-center gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                <Clock className="size-4 shrink-0 text-red-600" aria-hidden="true" />
                <p className="font-medium leading-snug">
                  ¡Es por tiempo limitado! Cupón válido por 48 horas.
                </p>
              </div>

              <ul className="grid gap-3 pt-1 sm:grid-cols-3">
                {[
                  { icon: Tag, label: 'Ofertas exclusivas' },
                  { icon: Gift, label: 'Premios al instante' },
                  { icon: Shield, label: 'Compra 100% segura' },
                ].map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex flex-col items-center gap-2 rounded-xl bg-red-50/60 px-2 py-3 text-center"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-[0.68rem] font-semibold leading-tight text-neutral-700 sm:text-xs">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </form>
            </>
            )}
          </div>

          {phase === 'won' && wonPremio ? (
            <div
              className={cn(
                'absolute inset-0 z-20 flex items-center justify-center overflow-y-auto',
                'bg-background/90 p-4 backdrop-blur-md sm:p-6',
              )}
              role="status"
              aria-live="polite"
            >
              <div
                className={cn(
                  'relative my-auto w-full max-w-md animate-in fade-in zoom-in-95 duration-500',
                  'rounded-2xl border border-border bg-card px-5 py-8 shadow-2xl sm:px-8 sm:py-10',
                )}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_55%)]"
                />
                <div className="relative flex flex-col items-center gap-5 sm:gap-6">
                  <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <PartyPopper className="size-8" aria-hidden="true" />
                  </span>
                  <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                      ¡Felicidades!
                    </h2>
                    <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                      Has ganado un premio en la{' '}
                      <span className="font-semibold text-primary">Ruleta del Color</span>
                    </p>
                  </div>
                  <RuletaCouponCard
                    premio={wonPremio}
                    couponCode={wonCouponCode}
                    notchBackgroundClassName="bg-card"
                    className="w-full shadow-md"
                  />
                  <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
                    {wonCouponCode ? (
                      <>
                        Copia el código y aplícalo en el checkout antes de que expire.
                      </>
                    ) : (
                      <>
                        <Mail className="mb-0.5 inline size-4 text-primary" aria-hidden="true" />{' '}
                        Te enviaremos el cupón a tu correo en las próximas 48 a 72 horas.
                      </>
                    )}
                  </p>
                  <Button
                    type="button"
                    onClick={handleClose}
                    className="h-12 w-full min-w-[200px] max-w-xs bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary"
                  >
                    Entendido
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
