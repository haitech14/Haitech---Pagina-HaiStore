import { HOME_STOREFRONT_INFO_STRIP_ITEMS } from '@/data/home-storefront-mockup';
import { cn } from '@/lib/utils';

/** Gris alineado con la franja superior. */
const INFO_STRIP_BG = '#1e1e1e';

export function HomeStorefrontInfoStrip() {
  return (
    <section aria-label="Ventajas HaiTech" style={{ backgroundColor: INFO_STRIP_BG }}>
      <div className="container">
        <ul className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {HOME_STOREFRONT_INFO_STRIP_ITEMS.map((item) => {
            const Icon = item.icon;
            const label = `${item.line1} ${item.line2}`;
            return (
              <li key={item.id} className="min-w-0">
                <div
                  className={cn(
                    'flex min-h-[3.5rem] items-center justify-center gap-3 px-3 py-3',
                    'sm:min-h-[3.75rem] sm:gap-3.5 sm:px-4',
                  )}
                >
                  <Icon
                    className="size-6 shrink-0 text-white sm:size-7"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <p className="min-w-0 text-left leading-none text-white" aria-label={label}>
                    <span className="block text-[0.75rem] font-bold sm:text-[0.8125rem]">
                      {item.line1}
                    </span>
                    <span className="mt-0.5 block text-[0.625rem] font-normal text-white/85 sm:text-[0.6875rem]">
                      {item.line2}
                    </span>
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
