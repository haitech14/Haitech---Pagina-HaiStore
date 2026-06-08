import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Gift, Mail, PartyPopper, Phone, Shield, User, X } from 'lucide-react';
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
import {
  computeRuletaSpinDeltaDeg,
  formatPremioLabel,
  getPremioByIndex,
  pickRandomPremioIndex,
  type RuletaPremio,
} from '@/config/subscription-ruleta-premios';
import { submitSupportTicket, SupportTicketError } from '@/lib/support-ticket';
import { cn } from '@/lib/utils';

const SESSION_KEY = 'subscription_popup_shown';
const OPEN_DELAY_MS = 2000;
/** Giro horario (hacia la derecha) en reposo. */
const IDLE_STEP_DEG = 0.45;
const IDLE_INTERVAL_MS = 32;

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
  const { pathname } = useLocation();
  const titleId = useId();
  const revealTimerRef = useRef<number | null>(null);
  const spinFallbackTimerRef = useRef<number | null>(null);
  const spinCompletedRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<FormPhase>('idle');
  const [diskRotation, setDiskRotation] = useState(0);
  const [isSpinAnimating, setIsSpinAnimating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [wonPremio, setWonPremio] = useState<RuletaPremio | null>(null);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);

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

  const handleSpinComplete = useCallback(() => {
    if (spinCompletedRef.current) return;
    spinCompletedRef.current = true;

    if (spinFallbackTimerRef.current) {
      window.clearTimeout(spinFallbackTimerRef.current);
      spinFallbackTimerRef.current = null;
    }
    setIsSpinAnimating(false);
    setPhase('landed');
    scheduleFelicidades();
  }, [scheduleFelicidades]);

  const handleClose = useCallback(() => {
    if (phase === 'spinning' || phase === 'landed') return;
    setOpen(false);
    setPhase('idle');
    setWonPremio(null);
    setWinningIndex(null);
    setIsSpinAnimating(false);
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    if (spinFallbackTimerRef.current) window.clearTimeout(spinFallbackTimerRef.current);
  }, [phase]);

  const runSpin = useCallback(
    (prizeIndex: number, premio: RuletaPremio) => {
      const delta = computeRuletaSpinDeltaDeg(prizeIndex);

      spinCompletedRef.current = false;
      setWonPremio(premio);
      setWinningIndex(prizeIndex);
      setPhase('spinning');
      setIsSpinAnimating(true);

      if (spinFallbackTimerRef.current) window.clearTimeout(spinFallbackTimerRef.current);
      spinFallbackTimerRef.current = window.setTimeout(() => {
        handleSpinComplete();
      }, SPIN_DURATION_MS + 120);

      if (prefersReducedMotion) {
        setDiskRotation((current) => current + delta);
        window.requestAnimationFrame(() => handleSpinComplete());
        return;
      }

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setDiskRotation((current) => current + delta);
        });
      });
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
          'z-[101] max-h-[95dvh] w-[calc(100%-1rem)] max-w-[960px] overflow-y-auto border-0 bg-[#F5F5F5] p-0',
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
        <DialogTitle className="sr-only">Suscripción — Ruleta del Color</DialogTitle>

        <div className="relative flex flex-col md:flex-row">
          {/* Columna izquierda — ruleta (~46%) */}
          <div
            className={cn(
              'relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden px-4 py-8 md:min-h-[520px] md:w-[46%] md:shrink-0 md:py-10',
              'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900',
              phase === 'landed' && 'md:w-[52%]',
              (phase === 'spinning' || phase === 'landed') && 'md:min-h-[560px]',
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(220,38,38,0.22),transparent_42%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_78%,rgba(37,99,235,0.18),transparent_45%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.12),transparent_50%)]"
            />

            <SubscriptionRuletaWheel
              diskRotation={diskRotation}
              isSpinAnimating={isSpinAnimating}
              highlightIndex={showWheelHighlight ? winningIndex : null}
              onSpinComplete={handleSpinComplete}
              className="relative z-10"
            />

            {phase === 'landed' && wonPremio ? (
              <p
                className="relative z-10 mt-4 max-w-[18rem] animate-in fade-in slide-in-from-bottom-2 text-center text-sm font-semibold text-white duration-500 sm:text-base"
                role="status"
                aria-live="polite"
              >
                ¡Premio seleccionado!{' '}
                <span className="block text-amber-300">{formatPremioLabel(wonPremio)}</span>
              </p>
            ) : null}
          </div>

          {/* Columna derecha — formulario o estado de giro */}
          <div
            className={cn(
              'relative flex-1 bg-[#F5F5F5] px-5 py-7 sm:px-8 sm:py-8',
              phase === 'landed' && 'hidden md:flex md:max-w-[48%] md:flex-col md:justify-center',
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
            <div className="mb-6 flex items-start gap-3 pr-10">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-600/10 text-red-600">
                <Gift className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id={titleId}
                  className="text-lg font-bold leading-tight text-foreground sm:text-xl"
                >
                  ¡Suscríbete y obtén un giro en la{' '}
                  <span className="text-red-600">Ruleta del Color</span>!
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Al registrarte participas por un giro en la{' '}
                  <span className="font-medium text-red-600">Ruleta del Color</span>.
                </p>
              </div>
            </div>

            <form
              onSubmit={(event) => void handleSubmit(onSubmit)(event)}
              className="flex flex-col gap-4"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sub-name">Nombre</Label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="sub-name"
                    placeholder="Nombre"
                    className="h-11 pl-10"
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
                <Label htmlFor="sub-email">E-mail</Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="sub-email"
                    type="email"
                    autoComplete="email"
                    placeholder="E-mail"
                    className="h-11 pl-10"
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
                <Label htmlFor="sub-phone">Celular</Label>
                <div className="flex overflow-hidden rounded-lg border border-input shadow-sm focus-within:ring-2 focus-within:ring-ring">
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
                          className="h-11 w-[7.5rem] shrink-0 rounded-none border-0 border-r shadow-none focus:ring-0"
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
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="sub-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="Celular"
                      className="h-11 rounded-none border-0 pl-10 shadow-none focus-visible:ring-0"
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
                <Label htmlFor="sub-terms" className="text-xs leading-snug text-muted-foreground">
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
                className="h-12 w-full gap-2 bg-red-600 text-base font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
              >
                {phase === 'submitting'
                  ? 'Registrando…'
                  : phase === 'spinning'
                    ? 'Girando la ruleta…'
                    : 'Regístrate y gira la ruleta'}
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
            </>
            )}
          </div>

          {phase === 'won' && wonPremio ? (
            <div
              className={cn(
                'absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-6 py-10 sm:px-10 sm:py-12',
                'animate-in fade-in zoom-in-95 duration-500',
                'bg-gradient-to-b from-[#F5F5F5]/75 via-[#F5F5F5]/88 to-[#F5F5F5]/95 backdrop-blur-[1px]',
              )}
              role="status"
              aria-live="polite"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(220,38,38,0.12),transparent_55%)]"
              />
              <span className="relative z-10 flex size-16 items-center justify-center rounded-full bg-red-600/10 text-red-600">
                <PartyPopper className="size-8" aria-hidden="true" />
              </span>
              <div className="relative z-10 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  ¡Felicidades!
                </h2>
                <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                  Has ganado un premio en la{' '}
                  <span className="font-semibold text-red-600">Ruleta del Color</span>
                </p>
              </div>
              <RuletaCouponCard premio={wonPremio} className="relative z-10" />
              <p className="relative z-10 max-w-sm text-center text-sm text-muted-foreground">
                <Mail className="mb-1 inline size-4 text-blue-500" aria-hidden="true" />{' '}
                Te enviaremos el cupón a tu correo en las próximas 48 a 72 horas.
              </p>
              <Button
                type="button"
                onClick={handleClose}
                className="relative z-10 h-12 min-w-[200px] bg-red-600 text-base font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
              >
                Entendido
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
