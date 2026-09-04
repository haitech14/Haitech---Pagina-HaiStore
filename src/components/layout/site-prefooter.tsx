import { Link } from 'react-router-dom';

import { SITE_PREFOOTER_ITEMS, SITE_PREFOOTER_SEO_LINKS } from '@/data/site-prefooter';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

const BRAND = '#E30613';

/** Prefooter de confianza — fondo negro, acentos rojos + enlaces SEO. */
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
            const body = (
              <>
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
              </>
            );

            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    to={item.href}
                    className="flex items-center gap-3.5 rounded-md outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/40 sm:gap-4"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3.5 sm:gap-4">{body}</div>
                )}
              </li>
            );
          })}
        </ul>

        <nav
          aria-label="Recursos SEO HaiStore"
          className="mt-5 border-t border-white/10 pt-4 sm:mt-6 sm:pt-5"
        >
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] sm:text-[13px]">
            {SITE_PREFOOTER_SEO_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="font-medium text-white/70 underline-offset-2 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
