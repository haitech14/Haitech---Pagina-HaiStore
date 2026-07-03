import { HOME_TRUST_BENEFITS } from '@/data/home-trust-benefits';
import { cn } from '@/lib/utils';

type HomeTrustStripProps = {
  /** Integrado al hero — barra blanca superpuesta al borde inferior. */
  embedded?: boolean;
};

export function HomeTrustStrip({ embedded = false }: HomeTrustStripProps) {
  return (
    <section
      aria-label="Beneficios y garantías HaiStore"
      className={cn(
        !embedded && 'container py-0 pb-3 pt-4 sm:pb-4 sm:pt-5',
        embedded &&
          'pointer-events-auto absolute bottom-1 left-1/2 z-30 w-[min(100%-2rem,82%)] max-w-5xl -translate-x-1/2 translate-y-[46%] sm:bottom-1.5 lg:bottom-2',
      )}
    >
      <div
        className={cn(
          'border border-border/60 bg-white px-4 py-3 shadow-[0_12px_40px_rgba(15,31,61,0.12)] sm:px-5 sm:py-3.5',
          embedded ? 'rounded-t-2xl rounded-b-2xl lg:rounded-[1.75rem]' : 'rounded-2xl lg:rounded-[1.25rem]',
        )}
      >
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border/50">
          {HOME_TRUST_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <li
                key={benefit.id}
                className="flex items-center gap-2.5 px-0 sm:px-1 lg:gap-3 lg:px-5 lg:first:pl-0 lg:last:pr-0"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center text-[#E30613] sm:size-10"
                  aria-hidden="true"
                >
                  <Icon className="size-5 sm:size-[1.375rem]" strokeWidth={1.75} />
                </span>

                <p className="min-w-0 text-pretty text-xs leading-snug sm:text-[0.8125rem]">
                  <span className="font-hero font-bold text-[#111111]">{benefit.title}</span>{' '}
                  <span className="font-normal text-[#666666]">{benefit.description}</span>
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
