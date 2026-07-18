import { HOME_STOREFRONT_INFO_STRIP_ITEMS } from '@/data/home-storefront-mockup';
import { cn } from '@/lib/utils';

/** Barra de confianza bajo el hero (flujo normal, no flotante). */
export function HomeStorefrontInfoStrip({ className }: { className?: string }) {
  return (
    <section aria-label="Ventajas HaiTech" className={cn('bg-[#F8F9FA] py-4 sm:py-5', className)}>
      <div className="container">
        <div
          className={cn(
            'w-full rounded-xl border border-black/[0.06] bg-white',
            'shadow-[0_4px_18px_rgba(15,31,61,0.08)]',
          )}
        >
          <ul
            className="grid grid-cols-2 divide-y divide-black/[0.06] lg:grid-cols-4 lg:divide-x lg:divide-y-0"
            role="list"
          >
            {HOME_STOREFRONT_INFO_STRIP_ITEMS.map((item) => {
              const Icon = item.icon;
              const label = `${item.line1} ${item.line2}`;
              return (
                <li key={item.id} className="min-w-0">
                  <div
                    className={cn(
                      'flex min-h-[3.75rem] items-center gap-3 px-4 py-3.5',
                      'sm:min-h-[4.25rem] sm:gap-3.5 sm:px-5 sm:py-4',
                      'lg:justify-center lg:px-6',
                    )}
                  >
                    <Icon
                      className="size-6 shrink-0 text-[#E30613] sm:size-7"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <p className="min-w-0 text-left leading-none text-[#111111]" aria-label={label}>
                      <span className="block text-[0.8125rem] font-bold sm:text-sm">
                        {item.line1}
                      </span>
                      <span className="mt-0.5 block text-[0.6875rem] font-normal text-[#6B7280] sm:text-xs">
                        {item.line2}
                      </span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
