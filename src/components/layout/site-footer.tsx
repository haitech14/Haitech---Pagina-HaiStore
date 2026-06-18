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
  FOOTER_CATEGORY_LINKS,
  FOOTER_DESCRIPTION,
  FOOTER_HOURS,
  FOOTER_NAV_LINKS,
  FOOTER_SALES_EMAIL,
  FOOTER_SOCIAL_LINKS,
  FOOTER_SUPPORT_EMAIL,
  FOOTER_VALUE_PROPS,
  FOOTER_WHATSAPP_LINK,
  type FooterLink,
} from '@/data/site-footer';
import { FooterLogoImage } from '@/components/layout/site-logo';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import { cn } from '@/lib/utils';

const { companyName, legalName, ruc, phone } = DEFAULT_COMPANY_SETTINGS;

function FooterHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div className="mb-4">
      <h2
        id={id}
        className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white sm:text-xs"
      >
        {children}
      </h2>
      <span className="mt-2 block h-0.5 w-8 bg-red-600" aria-hidden="true" />
    </div>
  );
}

function FooterNavLinks({ links, ariaLabel }: { links: FooterLink[]; ariaLabel: string }) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.external || link.href.startsWith('http') ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
              >
                <ChevronRight
                  className="size-3 shrink-0 text-red-600 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                {link.label}
              </a>
            ) : (
              <Link
                to={link.href}
                className="group flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
              >
                <ChevronRight
                  className="size-3 shrink-0 text-red-600 transition-transform group-hover:translate-x-0.5"
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
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.4 2.48-6.4 5.83 0 3.45 2.76 5.7 6.2 5.7 3.45 0 6.2-2.76 6.2-6.2V8.43a7.35 7.35 0 0 0 4.3 1.38V6.56a4.28 4.28 0 0 1-1-.74z" />
    </svg>
  );
}

function SocialIcon({ label }: { label: string }) {
  switch (label) {
    case 'Facebook':
      return <Icon path={mdiFacebook} size={0.85} aria-hidden="true" />;
    case 'Instagram':
      return <Icon path={mdiInstagram} size={0.85} aria-hidden="true" />;
    case 'YouTube':
      return <Icon path={mdiYoutube} size={0.85} aria-hidden="true" />;
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
      <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-white sm:text-xs">
        Suscríbete a nuestro newsletter
      </h3>
      <p className="mt-1.5 text-sm text-white/55">Recibe ofertas exclusivas y novedades.</p>

      {done ? (
        <p role="status" className="mt-3 text-sm font-semibold text-white">
          ¡Gracias por suscribirte!
        </p>
      ) : (
        <form
          className="mt-3 flex items-stretch gap-0 overflow-hidden rounded-md border border-white/10 bg-neutral-900"
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
            placeholder="Ingresa tu correo electrónico"
            className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-red-600"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center justify-center bg-red-600 px-3.5 text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            aria-label="Suscribirse al newsletter"
          >
            <Mail className="size-4" aria-hidden="true" />
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
      <div className="container py-10 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          <div className="sm:col-span-2 lg:col-span-4 xl:col-span-3">
            <Link
              to="/"
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              aria-label={`${companyName}, inicio`}
            >
              <FooterLogoImage
                heightClass="h-10 sm:h-11"
                width={220}
                height={48}
                loading="lazy"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">{FOOTER_DESCRIPTION}</p>

            <ul className="mt-5 flex flex-col gap-2.5">
              {FOOTER_VALUE_PROPS.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5 text-sm text-white/70">
                  <item.icon className="size-4 shrink-0 text-red-600" aria-hidden="true" />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <FooterHeading id="footer-nav-titulo">Navegación</FooterHeading>
            <FooterNavLinks links={FOOTER_NAV_LINKS} ariaLabel="Navegación del sitio" />
          </div>

          <div className="lg:col-span-2">
            <FooterHeading id="footer-categorias-titulo">Categorías</FooterHeading>
            <FooterNavLinks links={FOOTER_CATEGORY_LINKS} ariaLabel="Categorías de productos" />
          </div>

          <div className="lg:col-span-2">
            <FooterHeading id="footer-contacto-titulo">Contáctanos</FooterHeading>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a
                  href={FOOTER_WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                >
                  <Icon
                    path={mdiWhatsapp}
                    size={0.7}
                    className="mt-0.5 size-4 shrink-0 text-red-600"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-white/85">Atención por WhatsApp</span>
                    <span className="block text-white/55">{phone}</span>
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/55">
                <Clock className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
                <span>{FOOTER_HOURS}</span>
              </li>
              <li>
                <a
                  href={`mailto:${FOOTER_SALES_EMAIL}`}
                  className="flex items-start gap-2.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
                  <span className="text-white/55">{FOOTER_SALES_EMAIL}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${FOOTER_SUPPORT_EMAIL}`}
                  className="flex items-start gap-2.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
                  <span className="text-white/55">{FOOTER_SUPPORT_EMAIL}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/55">
                <MapPin className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
                <span>{FOOTER_ADDRESS}</span>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <FooterHeading id="footer-social-titulo">Síguenos</FooterHeading>
            <ul className="mb-5 flex items-center gap-2">
              {FOOTER_SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    <SocialIcon label={social.label} />
                  </a>
                </li>
              ))}
            </ul>

            <Link
              to="/contacto"
              className={cn(
                'inline-flex w-full max-w-[15rem] items-center gap-2 rounded-lg border border-white/10 bg-white px-2.5 py-2',
                'transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
              )}
              aria-label="Libro de reclamaciones"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded bg-red-600 text-[0.55rem] font-bold leading-none text-white">
                LR
              </span>
              <span className="min-w-0 flex-1 text-[0.625rem] font-bold uppercase leading-tight tracking-wide text-neutral-900">
                Libro de reclamaciones
              </span>
              <ChevronRight className="size-4 shrink-0 text-red-600" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#0d0d0d]">
        <div className="container grid gap-8 py-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6 xl:gap-10">
          <div className="min-w-0">
            <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-white sm:text-xs">
              Métodos de pago
            </h3>
            <img
              src="/mediosdepago2.png"
              alt="Visa, Mastercard, American Express, Yape, Plin, PagoEfectivo y otros medios de pago"
              className="mt-3 h-7 w-auto max-w-full object-contain object-left opacity-95 sm:h-8"
              loading="lazy"
            />
          </div>

          <div className="flex items-center gap-3 lg:justify-center">
            <span
              className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_4px_16px_rgba(220,38,38,0.35)]"
              aria-hidden="true"
            >
              <Shield className="size-6" strokeWidth={1.75} />
              <Lock className="absolute size-3 translate-x-1 translate-y-1" strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
                Compra segura
              </p>
              <p className="mt-0.5 text-xs text-white/55 sm:text-sm">
                Tu información está protegida con encriptación SSL.
              </p>
              <span className="mt-1.5 inline-flex rounded border border-white/20 bg-black px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white">
                SSL
              </span>
            </div>
          </div>

          <div className="min-w-0 lg:justify-self-end lg:max-w-sm lg:w-full xl:max-w-md">
            <FooterNewsletter />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <p className="container text-center text-[0.6875rem] leading-relaxed text-white/45 sm:text-xs">
          © {year} {companyName}. Todos los derechos reservados. / RUC {ruc} / Razón Social:{' '}
          {legalName}
        </p>
      </div>
    </footer>
  );
}
