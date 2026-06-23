import type { RuletaPremio } from '@/config/subscription-ruleta-premios';
import { formatPremioLabel } from '@/config/subscription-ruleta-premios';
import { cn } from '@/lib/utils';

interface RuletaCouponCardProps {
  premio: RuletaPremio;
  /** Código canjeable en checkout (si aplica). */
  couponCode?: string | null;
  /** Color de fondo detrás de las muescas del ticket (debe coincidir con el panel contenedor). */
  notchBackgroundClassName?: string;
  className?: string;
}

export function RuletaCouponCard({
  premio,
  couponCode,
  notchBackgroundClassName = 'bg-card',
  className,
}: RuletaCouponCardProps) {
  const label = formatPremioLabel(premio);
  const Icon = premio.icon;

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[320px] rounded-xl',
        'border-2 border-dashed border-primary/30 bg-background',
        'shadow-[0_8px_32px_hsl(var(--primary)/0.15)]',
        className,
      )}
      role="img"
      aria-label={`Cupón ganado: ${label}`}
    >
      {/* Muescas laterales tipo ticket */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-0 top-1/2 z-10 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full',
          notchBackgroundClassName,
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'absolute right-0 top-1/2 z-10 size-5 translate-x-1/2 -translate-y-1/2 rounded-full',
          notchBackgroundClassName,
        )}
      />

      <div className="overflow-hidden rounded-t-[10px] border-b border-dashed border-primary/20 bg-primary/5 px-5 py-4 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Ruleta del Color
        </p>
        <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
          Cupón de premio
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 px-5 py-7">
        <span
          className="flex size-16 items-center justify-center rounded-full shadow-lg ring-4 ring-primary/10 sm:size-[4.5rem]"
          style={{ backgroundColor: premio.sectorColor }}
          aria-hidden="true"
        >
          <Icon className="size-8 text-white sm:size-9" strokeWidth={1.75} />
        </span>
        <div className="space-y-1 text-center">
          <p className="text-2xl font-extrabold leading-none tracking-tight text-foreground sm:text-3xl">
            {premio.label}
          </p>
          <p className="text-lg font-bold uppercase tracking-wide text-primary sm:text-xl">
            {premio.sublabel}
          </p>
        </div>
        <p className="max-w-[16rem] text-center text-sm leading-snug text-muted-foreground">
          {couponCode
            ? 'Usa este código en el checkout antes de que expire.'
            : 'Válido por 48 a 72 horas. Te lo enviamos por correo.'}
        </p>
      </div>

      {couponCode ? (
        <div
          className="overflow-hidden border-t border-dashed border-primary/20 bg-background px-5 py-4 text-center"
          aria-label={`Código del cupón: ${couponCode}`}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
            Tu código
          </p>
          <p className="mt-1 font-mono text-xl font-extrabold tracking-wider text-primary sm:text-2xl">
            {couponCode}
          </p>
        </div>
      ) : null}

      <div
        aria-hidden="true"
        className="overflow-hidden rounded-b-[10px] border-t border-dashed border-primary/20 bg-primary/5 px-5 py-3 text-center"
      >
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-primary/70">
          HAISTORE · PROMO 2026
        </p>
      </div>
    </div>
  );
}
