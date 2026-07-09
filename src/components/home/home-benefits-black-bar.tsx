import { HOME_LANDING_BLACK_BENEFITS } from '@/data/home-landing-sections';
import { cn } from '@/lib/utils';

type HomeBenefitsBlackBarProps = {
  className?: string;
};

export function HomeBenefitsBlackBar({ className }: HomeBenefitsBlackBarProps) {
  return (
    <section
      aria-label="Ventajas de compra HaiStore"
      className={cn('font-landing bg-[#111111] text-white', className)}
    >
      <div className="container py-7 sm:py-8">
        <ul className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/12">
          {HOME_LANDING_BLACK_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <li
                key={benefit.id}
                className="flex items-center gap-4 px-0 lg:px-6 lg:first:pl-0 lg:last:pr-0"
              >
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-[#E30613] sm:size-14"
                  aria-hidden="true"
                >
                  <Icon
                    className="size-5 text-white sm:size-6"
                    strokeWidth={1.75}
                    fill="none"
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-pretty text-[0.6875rem] font-extrabold uppercase leading-snug tracking-[0.06em] text-white sm:text-xs sm:tracking-[0.08em]">
                    {benefit.title}
                  </p>
                  <p className="mt-1.5 text-pretty text-[0.6875rem] font-medium leading-relaxed text-white/78 sm:text-xs">
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
