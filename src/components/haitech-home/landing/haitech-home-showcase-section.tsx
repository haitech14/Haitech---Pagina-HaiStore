import {
  HAITECH_SHOWCASE_ACCENT,
  HAITECH_SHOWCASE_BENEFITS,
  HAITECH_SHOWCASE_BENEFITS_HEADER,
  HAITECH_SHOWCASE_MAX_WIDTH,
} from '@/data/haitech-home-showcase';
import { TwoUpInfoboxCarousel } from '@/components/home/two-up-infobox-carousel';
import { cn } from '@/lib/utils';

function BenefitCard({
  title,
  subtitle,
  iconSrc,
}: {
  title: string;
  subtitle: string;
  iconSrc: string;
}) {
  return (
    <article className="flex h-full flex-col items-center rounded-2xl border border-white/20 bg-white px-2 pb-3.5 pt-4 text-center shadow-[0_8px_28px_rgba(0,0,0,0.18)] sm:px-2.5 sm:pb-4 sm:pt-5 lg:px-2 lg:pt-5 xl:px-3">
      <div className="flex h-[56px] w-full items-center justify-center sm:h-[72px] lg:h-[76px] xl:h-[92px]">
        <img
          src={iconSrc}
          alt=""
          width={156}
          height={136}
          className="max-h-full max-w-[62%] object-contain sm:max-w-[72%]"
          loading="lazy"
          decoding="async"
        />
      </div>
      <h3
        className="mt-2 min-h-[2.75rem] text-[12px] font-extrabold leading-[1.3] sm:min-h-[2.6rem] sm:max-w-[12.5rem] sm:text-[12px] lg:text-[11px] xl:text-[13px]"
        style={{ color: HAITECH_SHOWCASE_ACCENT }}
      >
        {title}
      </h3>
      <p className="mt-1.5 flex-1 text-[10px] leading-[1.4] text-[#5C5C5C] sm:mt-2 sm:max-w-[13rem] sm:text-[11px] lg:text-[10px] xl:text-[12px]">
        {subtitle}
      </p>
      <span
        className="mt-3 block h-[3px] w-8 rounded-sm sm:mt-4 sm:w-9"
        style={{ backgroundColor: HAITECH_SHOWCASE_ACCENT }}
        aria-hidden="true"
      />
    </article>
  );
}

function BenefitsHeader() {
  const header = HAITECH_SHOWCASE_BENEFITS_HEADER;

  return (
    <header className="mb-6 flex flex-col items-center gap-4 text-center sm:mb-8 sm:gap-5 lg:mb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:text-left">
      <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6 sm:text-left lg:gap-8">
        <div className="shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85 sm:text-[12px]">
            {header.eyebrow}
          </p>
          <h2
            id="haitech-benefits-title"
            className="mt-1 font-[family-name:var(--font-infobox)] text-[26px] font-bold leading-tight tracking-tight text-white sm:text-[34px] lg:text-[40px]"
          >
            {header.titleBefore}
            <span className="text-white">{header.titleAccent}</span>
          </h2>
        </div>

        <span className="hidden h-14 w-px shrink-0 bg-white/35 sm:block" aria-hidden="true" />

        <p className="max-w-md text-[13px] leading-relaxed text-white/90 sm:text-[14px] lg:text-[15px]">
          {header.description}
        </p>
      </div>

      <div className="shrink-0 lg:pb-1 lg:text-right">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white sm:text-[11px]">
          {header.tagline}
        </p>
        <span
          className="mx-auto mt-1.5 block h-[3px] w-12 rounded-sm bg-white lg:ml-auto lg:mr-0"
          aria-hidden="true"
        />
      </div>
    </header>
  );
}

function BenefitsBlock() {
  const benefitById = new Map<string, (typeof HAITECH_SHOWCASE_BENEFITS)[number]>(
    HAITECH_SHOWCASE_BENEFITS.map((item) => [item.id, item]),
  );

  return (
    <section
      aria-labelledby="haitech-benefits-title"
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: HAITECH_SHOWCASE_ACCENT }}
    >
      <div
        className="relative z-[1] mx-auto px-3 py-7 sm:px-4 sm:py-8 lg:px-6 lg:py-9 xl:py-10"
        style={{ maxWidth: HAITECH_SHOWCASE_MAX_WIDTH }}
      >
        <BenefitsHeader />

        <div className="lg:hidden">
          <TwoUpInfoboxCarousel
            items={HAITECH_SHOWCASE_BENEFITS}
            ariaLabel="Beneficios HAITECH"
            renderItem={(item) => {
              const benefit = benefitById.get(item.id);
              if (!benefit) return null;
              return (
                <BenefitCard
                  title={benefit.title}
                  subtitle={benefit.subtitle}
                  iconSrc={benefit.iconSrc}
                />
              );
            }}
          />
        </div>

        <ul className="hidden grid-cols-3 gap-3.5 lg:grid lg:gap-3 xl:grid-cols-6 xl:gap-4">
          {HAITECH_SHOWCASE_BENEFITS.map((item) => (
            <li key={item.id} className="min-w-0">
              <BenefitCard title={item.title} subtitle={item.subtitle} iconSrc={item.iconSrc} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Bloque estilo vitrina: beneficios HAITECH. */
export function HaitechHomeShowcaseSection({ className }: { className?: string }) {
  return (
    <div className={cn('w-full', className)} style={{ backgroundColor: HAITECH_SHOWCASE_ACCENT }}>
      <BenefitsBlock />
    </div>
  );
}
