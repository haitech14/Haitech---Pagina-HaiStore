import { HOME_VALUE_PROPS } from '@/data/home-value-props';
import { cn } from '@/lib/utils';

type HomeValueStripProps = {
  className?: string;
};

export function HomeValueStrip({ className }: HomeValueStripProps) {
  return (
    <section
      aria-label="Ventajas HaiStore"
      className={cn('border-b border-border/40 bg-[#EEEEEE]', className)}
    >
      <div className="container py-3.5 sm:py-4">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {HOME_VALUE_PROPS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex items-start gap-2.5 sm:gap-3">
                <span
                  className="flex size-8 shrink-0 items-center justify-center text-[#666666] sm:size-9"
                  aria-hidden="true"
                >
                  <Icon className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-pretty text-[0.8125rem] font-semibold leading-snug text-[#111111] sm:text-sm">
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className="mt-0.5 text-pretty text-xs leading-snug text-[#666666]">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
