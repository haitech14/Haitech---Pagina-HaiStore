import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import type { SeoCommercialLanding, SeoLandingCta, SeoLandingFaq } from '@/data/seo-commercial-landings';
import { HOME_LANDING_SURFACE_CLASS } from '@/lib/home-landing-layout';
import { cn } from '@/lib/utils';
import { HAITECH_WHATSAPP_URL } from '@/lib/whatsapp-sales';

type SeoContentLandingProps = {
  eyebrow: string;
  h1: string;
  lead: string;
  paragraphs: string[];
  ctas?: SeoLandingCta[];
  relatedLinks?: SeoLandingCta[];
  faq?: SeoLandingFaq[];
  faqHeading?: string;
  className?: string;
};

function CtaButton({ cta, primary }: { cta: SeoLandingCta; primary?: boolean }) {
  if (cta.external || cta.to.startsWith('http')) {
    return (
      <Button asChild variant={primary ? 'default' : 'outline'}>
        <a href={cta.to} target="_blank" rel="noreferrer">
          {cta.label}
        </a>
      </Button>
    );
  }
  return (
    <Button asChild variant={primary ? 'default' : 'outline'}>
      <Link to={cta.to}>{cta.label}</Link>
    </Button>
  );
}

/** Layout compartido para landings comerciales y guías SEO. */
export function SeoContentLanding({
  eyebrow,
  h1,
  lead,
  paragraphs,
  ctas = [],
  relatedLinks = [],
  faq = [],
  faqHeading = 'Preguntas frecuentes',
  className,
}: SeoContentLandingProps) {
  return (
    <div className={cn('flex flex-col', HOME_LANDING_SURFACE_CLASS, className)}>
      <article className="container max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-medium text-red-600">{eyebrow}</p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-[#0f1f3d] sm:text-4xl">
          {h1}
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">{lead}</p>

        <div className="mt-6 space-y-4 text-pretty text-base leading-relaxed text-muted-foreground">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>

        {ctas.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {ctas.map((cta, index) => (
              <CtaButton key={cta.to + cta.label} cta={cta} primary={index === 0} />
            ))}
            <Button asChild variant="outline">
              <a href={HAITECH_WHATSAPP_URL} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </Button>
          </div>
        ) : null}

        {relatedLinks.length > 0 ? (
          <nav className="mt-10" aria-label="Enlaces relacionados">
            <h2 className="text-lg font-semibold text-[#0f1f3d]">También te puede interesar</h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {relatedLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="font-medium text-red-600 underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {faq.length > 0 ? (
          <section className="mt-12" aria-labelledby="seo-landing-faq-heading">
            <h2 id="seo-landing-faq-heading" className="text-xl font-semibold text-[#0f1f3d]">
              {faqHeading}
            </h2>
            <dl className="mt-4 space-y-5">
              {faq.map((item) => (
                <div key={item.id}>
                  <dt className="font-medium text-[#0f1f3d]">{item.question}</dt>
                  <dd className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </article>
    </div>
  );
}

export function SeoCommercialLandingView({ landing }: { landing: SeoCommercialLanding }) {
  return (
    <SeoContentLanding
      eyebrow={landing.eyebrow}
      h1={landing.h1}
      lead={landing.lead}
      paragraphs={landing.paragraphs}
      ctas={landing.ctas}
      relatedLinks={landing.relatedLinks}
      faq={landing.faq}
    />
  );
}
