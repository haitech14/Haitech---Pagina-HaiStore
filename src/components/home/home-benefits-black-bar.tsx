import { HOME_LANDING_BLACK_BENEFITS } from '@/data/home-landing-sections';
import { cn } from '@/lib/utils';

type HomeBenefitsBlackBarProps = {
  className?: string;
};

export function HomeBenefitsBlackBar({ className }: HomeBenefitsBlackBarProps) {
  return (
    <section aria-label="Ventajas de compra HaiStore" className={cn('home-landing-sans bg-[#111111] text-white', className)}>
      <div className="container py-6 sm:py-7">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0 lg:divide-x lg:divide-white/15">
          {HOME_LANDING_BLACK_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <li
                key={benefit.id}
                className="flex items-center gap-3 px-0 lg:px-5 lg:first:pl-0 lg:last:pr-0"
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-red-600 text-red-600 sm:size-11"
                  aria-hidden="true"
                >
                  <Icon className="size-5" strokeWidth={1.75} fill="none" />
                </span>
                <div className="min-w-0">
                  <p className="text-pretty text-[0.6875rem] font-bold uppercase leading-snug tracking-wide text-white sm:text-xs">
                    {benefit.title}
                  </p>
                  <p className="mt-1 text-pretty text-[0.6875rem] leading-relaxed text-white/75 sm:text-xs">
                    {benefit.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
