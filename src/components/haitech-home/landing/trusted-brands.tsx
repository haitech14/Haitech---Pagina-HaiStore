import {
  HAITECH_LANDING_COLORS,
  HAITECH_LANDING_TRUSTED_BRANDS,
} from '@/data/haitech-home-landing-section';
import { cn } from '@/lib/utils';

export function TrustedBrands({ className }: { className?: string }) {
  return (
    <section className={cn('w-full', className)} aria-labelledby="trusted-brands-heading">
      <h2
        id="trusted-brands-heading"
        className="mb-6 text-center text-[13px] font-bold uppercase tracking-[0.08em]"
        style={{ color: '#444' }}
      >
        Marcas en las que confiamos
      </h2>
      <ul className="flex items-center justify-start gap-8 overflow-x-auto pb-1 sm:justify-center sm:gap-10 md:gap-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {HAITECH_LANDING_TRUSTED_BRANDS.map((brand) => (
          <li key={brand.name} className="shrink-0">
            <img
              src={brand.logo}
              alt={brand.name}
              width={120}
              height={45}
              className="max-h-[45px] w-auto object-contain opacity-90"
              loading="lazy"
              decoding="async"
            />
          </li>
        ))}
      </ul>
      <span className="sr-only" style={{ color: HAITECH_LANDING_COLORS.textSecondary }}>
        Marcas aliadas
      </span>
    </section>
  );
}
