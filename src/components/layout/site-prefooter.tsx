import { SITE_PREFOOTER_ITEMS } from '@/data/site-prefooter';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

const BRAND = '#E30613';

/** Prefooter de confianza — fondo negro, acentos rojos. */
export function SitePrefooter({ className }: { className?: string }) {
  return (
    <section
      aria-label="Ventajas HAITECH"
      className={cn('w-full bg-black', className)}
    >
      <div
        className="mx-auto px-4 py-6 sm:px-5 sm:py-7 lg:px-6 lg:py-8"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <ul
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
          role="list"
        >
          {SITE_PREFOOTER_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex items-center gap-3.5 sm:gap-4">
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-full sm:size-[3.25rem]"
                  style={{ backgroundColor: BRAND }}
                  aria-hidden="true"
                >
                  <Icon className="size-6 text-white sm:size-[1.625rem]" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold leading-snug text-white sm:text-[15px]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-pretty text-[12px] leading-snug text-white/65 sm:text-[13px]">
                    {item.description}
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
