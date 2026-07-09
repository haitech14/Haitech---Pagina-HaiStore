import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Clock,
  Lock,
  Mail,
  MapPin,
  Shield,
} from 'lucide-react';
import { Icon } from '@mdi/react';
import {
  mdiFacebook,
  mdiInstagram,
  mdiWhatsapp,
  mdiYoutube,
} from '@mdi/js';

import {
  FOOTER_ADDRESS,
  FOOTER_DESCRIPTION,
  FOOTER_HOURS,
  FOOTER_NAV_LINKS,
  FOOTER_RUC,
  FOOTER_SALES_EMAIL,
  FOOTER_SALES_PHONE_DISPLAY,
  FOOTER_SALES_WHATSAPP_LINK,
  FOOTER_SOCIAL_LINKS,
  FOOTER_SUPPORT_EMAIL,
  FOOTER_SUPPORT_PHONE_DISPLAY,
  FOOTER_SUPPORT_PHONE_TEL,
  FOOTER_VALUE_PROPS,
  type FooterLink,
} from '@/data/site-footer';
import { FooterLogoImage } from '@/components/layout/site-logo';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import { cn } from '@/lib/utils';

const { companyName, legalName } = DEFAULT_COMPANY_SETTINGS;

function FooterHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div className="mb-2.5">
      <h2
        id={id}
        className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-white sm:text-[0.6875rem]"
      >
        {children}
      </h2>
      <span className="mt-1.5 block h-0.5 w-6 bg-red-600" aria-hidden="true" />
    </div>
  );
}

function FooterNavLinks({ links, ariaLabel }: { links: FooterLink[]; ariaLabel: string }) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex flex-col gap-1.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.external || link.href.startsWith('http') ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1 text-xs text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white sm:text-[0.8125rem]"
              >
                <ChevronRight
                  className="size-2.5 shrink-0 text-red-600 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                {link.label}
              </a>
            ) : (
              <Link
                to={link.href}
                className="group flex items-center gap-1 text-xs text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white sm:text-[0.8125rem]"
              >
                <ChevronRight
                  className="size-2.5 shrink-0 text-red-600 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.4 2.48-6.4 5.83 0 3.45 2.76 5.7 6.2 5.7 3.45 0 6.2-2.76 6.2-6.2V8.43a7.35 7.35 0 0 0 4.3 1.38V6.56a4.28 4.28 0 0 1-1-.74z" />
    </svg>
  );
}

function SocialIcon({ label }: { label: string }) {
  switch (label) {
    case 'Facebook':
      return <Icon path={mdiFacebook} size={0.75} aria-hidden="true" />;
    case 'Instagram':
      return <Icon path={mdiInstagram} size={0.75} aria-hidden="true" />;
    case 'YouTube':
      return <Icon path={mdiYoutube} size={0.75} aria-hidden="true" />;
    case 'TikTok':
      return <TikTokIcon />;
    default:
      return null;
  }
}

function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div className="min-w-0">
      <h3 className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-white sm:text-[0.6875rem]">
        Newsletter
      </h3>

      {done ? (
        <p role="status" className="mt-2 text-xs font-semibold text-white sm:text-sm">
          ¡Gracias por suscribirte!
        </p>
      ) : (
        <form
          className="mt-2 flex items-stretch gap-0 overflow-hidden rounded-md border border-white/10 bg-neutral-900"
          onSubmit={(event) => {
            event.preventDefault();
            setDone(true);
          }}
        >
          <label htmlFor="footer-newsletter-email" className="sr-only">
            Ingresa tu correo electrónico
          </label>
          <input
            id="footer-newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Tu correo electrónico"
            className="min-w-0 flex-1 border-0 bg-transparent px-2.5 py-2 text-xs text-white outline-none placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-red-600 sm:text-sm"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center justify-center bg-red-600 px-3 text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            aria-label="Suscribirse al newsletter"
          >
            <Mail className="size-3.5" aria-hidden="true" />
          </button>
        </form>
      )}
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto bg-[#111111] text-white/70">
      <div className="container py-8 sm:py-9">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link
              to="/"
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              aria-label={`${companyName}, inicio`}
            >
              <FooterLogoImage
                heightClass="h-9 sm:h-10"
                width={200}
                height={44}
                loading="lazy"
              />
            </Link>

            <p className="mt-2.5 max-w-xs text-xs leading-relaxed text-white/55 sm:text-sm">
              {FOOTER_DESCRIPTION}
            </p>

            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {FOOTER_VALUE_PROPS.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5 text-xs text-white/70">
                  <item.icon className="size-3.5 shrink-0 text-red-600" aria-hidden="true" />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <FooterHeading id="footer-nav-titulo">Enlaces</FooterHeading>
            <FooterNavLinks links={FOOTER_NAV_LINKS} ariaLabel="Enlaces del sitio" />
          </div>

          <div className="lg:col-span-3">
            <FooterHeading id="footer-contacto-titulo">Contáctanos</FooterHeading>
            <ul className="flex flex-col gap-2 text-xs sm:text-[0.8125rem]">
              <li>
                <div className="flex items-start gap-2">
                  <Icon
                    path={mdiWhatsapp}
                    size={0.65}
                    className="mt-0.5 size-3.5 shrink-0 text-red-600"
                    aria-hidden="true"
                  />
                  <span className="text-white/55">
                    <a
                      href={FOOTER_SALES_WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                    >
                      Ventas {FOOTER_SALES_PHONE_DISPLAY}
                    </a>
                    <span className="text-white/35"> · </span>
                    <a
                      href={FOOTER_SUPPORT_PHONE_TEL}
                      className="text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                    >
                      Soporte {FOOTER_SUPPORT_PHONE_DISPLAY}
                    </a>
                  </span>
                </div>
              </li>
              <li className="flex items-center gap-2 text-white/55">
                <Clock className="size-3.5 shrink-0 text-red-600" aria-hidden="true" />
                <span>{FOOTER_HOURS}</span>
              </li>
              <li>
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 size-3.5 shrink-0 text-red-600" aria-hidden="true" />
                  <span className="text-white/55">
                    <a
                      href={`mailto:${FOOTER_SALES_EMAIL}`}
                      className="transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                    >
                      {FOOTER_SALES_EMAIL}
                    </a>
                    <span className="text-white/35"> · </span>
                    <a
                      href={`mailto:${FOOTER_SUPPORT_EMAIL}`}
                      className="transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                    >
                      {FOOTER_SUPPORT_EMAIL}
                    </a>
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2 text-white/55">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-red-600" aria-hidden="true" />
                <span>{FOOTER_ADDRESS}</span>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <FooterHeading id="footer-social-titulo">Síguenos</FooterHeading>
            <ul className="mb-3 flex items-center gap-1.5">
              {FOOTER_SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-8 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    <SocialIcon label={social.label} />
                  </a>
                </li>
              ))}
            </ul>

            <Link
              to="/contacto"
              className={cn(
                'inline-flex w-full max-w-[13.5rem] items-center gap-1.5 rounded-lg border border-white/10 bg-white px-2 py-1.5',
                'transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
              )}
              aria-label="Libro de reclamaciones"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded bg-red-600 text-[0.5rem] font-bold leading-none text-white">
                LR
              </span>
              <span className="min-w-0 flex-1 text-[0.5625rem] font-bold uppercase leading-tight tracking-wide text-neutral-900">
                Libro de reclamaciones
              </span>
              <ChevronRight className="size-3.5 shrink-0 text-red-600" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#0d0d0d]">
        <div className="container flex flex-col gap-4 py-5 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
            <div className="min-w-0">
              <h3 className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-white sm:text-[0.6875rem]">
                Métodos de pago
              </h3>
              <img
                src="/mediosdepago2.png"
                alt="Visa, Mastercard, American Express, Yape, Plin, PagoEfectivo y otros medios de pago"
                className="mt-1.5 h-6 w-auto max-w-full object-contain object-left opacity-95 sm:h-7"
                loading="lazy"
              />
            </div>

            <div className="flex items-center gap-2 border-l border-white/10 pl-3 sm:pl-4">
              <span
                className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_3px_12px_rgba(220,38,38,0.3)]"
                aria-hidden="true"
              >
                <Shield className="size-4" strokeWidth={1.75} />
                <Lock className="absolute size-2.5 translate-x-0.5 translate-y-0.5" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-white sm:text-xs">
                  Compra segura
                </p>
                <p className="text-[0.625rem] text-white/55 sm:text-xs">Encriptación SSL</p>
              </div>
            </div>
          </div>

          <div className="min-w-0 lg:max-w-xs lg:flex-1 xl:max-w-sm">
            <FooterNewsletter />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-3">
        <p className="container text-center text-[0.625rem] leading-relaxed text-white/45 sm:text-[0.6875rem]">
          © {year} {companyName}. Todos los derechos reservados. / RUC {FOOTER_RUC} / Razón Social:{' '}
          {legalName}
        </p>
      </div>
    </footer>
  );
}
