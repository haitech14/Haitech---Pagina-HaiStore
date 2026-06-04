import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiFacebook, mdiInstagram, mdiWhatsapp, mdiYoutube } from '@mdi/js';

import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import { cn } from '@/lib/utils';

const WHATSAPP_LINK = 'https://wa.me/51915149290';
const { companyName, legalName, ruc, phone, email } = DEFAULT_COMPANY_SETTINGS;

const sobreNosotrosLinks = [
  { label: '¿Quiénes somos?', to: '/contacto' },
  { label: 'Canales de atención', to: '/contacto' },
  { label: 'Compra fácil y seguro', to: '/tienda' },
  { label: 'Métodos de pago', to: '/contacto#pagos' },
] as const;

const teInformamosLinks = [
  { label: 'Nuestras tiendas', to: '/contacto' },
  { label: 'Cobertura de delivery', to: '/contacto' },
  { label: 'Certificado de garantía', to: '/contacto' },
  { label: 'Términos y condiciones', to: '/terminos' },
  { label: 'Políticas de privacidad', to: '/privacidad' },
  { label: 'Políticas de cambios y devoluciones', to: '/terminos' },
] as const;

const serviciosClienteLinks = [
  { label: 'Factura electrónica', to: '/contacto' },
  { label: 'Ventas corporativas', to: '/contacto' },
  { label: 'Servicio técnico', to: '/contacto' },
  { label: 'Alquiler de equipos', to: '/contacto' },
] as const;

const destacadosLinks = [
  { label: 'Mis compras', to: '/mi-cuenta' },
  { label: 'Tienda en línea', to: '/tienda' },
  { label: 'Multifuncionales', to: '/categoria/multifuncionales' },
  { label: 'Consumibles y tóner', to: '/categoria/toner-suministros' },
  { label: 'Repuestos', to: '/categoria/repuestos' },
] as const;

type FooterContactItem =
  | { kind: 'mdi'; icon: string; label: string; href: string }
  | { kind: 'lucide'; icon: typeof Phone; label: string; href: string }
  | { kind: 'lucide'; icon: typeof Clock; label: string; href: null };

const contactItems: FooterContactItem[] = [
  {
    kind: 'mdi',
    icon: mdiWhatsapp,
    label: 'Atención por WhatsApp',
    href: WHATSAPP_LINK,
  },
  { kind: 'lucide', icon: Phone, label: phone, href: 'tel:+51915149290' },
  { kind: 'lucide', icon: Clock, label: 'Lun - Sáb 9:00 am a 6:00 pm', href: null },
  { kind: 'lucide', icon: Mail, label: email, href: `mailto:${email}` },
  {
    kind: 'lucide',
    icon: Mail,
    label: 'servicioalcliente@haitech.pe',
    href: 'mailto:servicioalcliente@haitech.pe',
  },
];

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com/', path: mdiFacebook },
  { label: 'Instagram', href: 'https://instagram.com/', path: mdiInstagram },
  { label: 'YouTube', href: 'https://youtube.com/', path: mdiYoutube },
  { label: 'TikTok', href: 'https://tiktok.com/', path: null as string | null },
] as const;

const quickLinks = [
  { label: 'Mis compras', to: '/mi-cuenta' },
  { label: 'Nuestras tiendas', to: '/contacto' },
  { label: 'Canales de atención', to: '/contacto' },
] as const;

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h2 className="mb-3 text-sm font-bold text-white">{title}</h2>
      {children}
    </div>
  );
}

function FooterNavLinks({ links }: { links: readonly { label: string; to: string }[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {links.map((link) => (
        <li key={link.label}>
          <Link
            to={link.to}
            className="text-sm text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ContactIcon({ item }: { item: FooterContactItem }) {
  if (item.kind === 'mdi') {
    return (
      <Icon path={item.icon} size={0.7} className="size-4 shrink-0 text-white/80" aria-hidden="true" />
    );
  }
  const LucideIcon = item.icon;
  return <LucideIcon className="size-4 shrink-0 text-white/80" aria-hidden="true" />;
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.4 2.48-6.4 5.83 0 3.45 2.76 5.7 6.2 5.7 3.45 0 6.2-2.76 6.2-6.2V8.43a7.35 7.35 0 0 0 4.3 1.38V6.56a4.28 4.28 0 0 1-1-.74z" />
    </svg>
  );
}

function FooterCollapseTab({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-full">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls="footer-main-content"
        className="flex min-h-9 items-center gap-1.5 rounded-t-md border border-b-0 border-white/10 bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        {expanded ? 'Resumir información' : 'Ver información'}
        {expanded ? (
          <ChevronDown className="size-3.5" aria-hidden="true" />
        ) : (
          <ChevronUp className="size-3.5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export function SiteFooter() {
  const [expanded, setExpanded] = useState(true);
  const year = new Date().getFullYear();

  return (
    <>
      <footer className="relative mt-auto bg-neutral-950 text-white/70">
        <FooterCollapseTab expanded={expanded} onToggle={() => setExpanded((v) => !v)} />

        <div
          id="footer-main-content"
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-out',
            expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="container py-10 sm:py-12">
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                {/* Columna marca + contacto */}
                <div className="lg:col-span-4">
                  <Link
                    to="/"
                    className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    aria-label={`${companyName}, inicio`}
                  >
                    <img src="/logo.png" alt={companyName} className="h-9 w-auto brightness-0 invert" />
                  </Link>

                  <h2 className="mb-3 mt-6 text-sm font-bold text-white">Contáctanos</h2>
                  <ul className="flex flex-col gap-2.5">
                    {contactItems.map((item) => {
                      const row = (
                        <span className="flex items-start gap-2.5 text-sm text-white/65">
                          <ContactIcon item={item} />
                          <span>{item.label}</span>
                        </span>
                      );

                      if (item.href === null) {
                        return <li key={item.label}>{row}</li>;
                      }

                      return (
                        <li key={item.label}>
                          <a
                            href={item.href}
                            target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                          >
                            {row}
                          </a>
                        </li>
                      );
                    })}
                  </ul>

                  <Link
                    to="/contacto"
                    className="mt-5 inline-flex items-center gap-2 rounded border border-white/15 bg-white px-2.5 py-1.5 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    aria-label="Libro de reclamaciones"
                  >
                    <span className="flex size-8 items-center justify-center rounded bg-neutral-100 text-[0.5rem] font-bold leading-none text-neutral-800">
                      LR
                    </span>
                    <span className="text-[0.65rem] font-semibold uppercase leading-tight text-neutral-800">
                      Libro de
                      <br />
                      reclamaciones
                    </span>
                  </Link>
                </div>

                <nav className="lg:col-span-2" aria-label="Sobre nosotros">
                  <FooterColumn title="Sobre nosotros">
                    <FooterNavLinks links={sobreNosotrosLinks} />
                  </FooterColumn>
                </nav>

                <nav className="lg:col-span-2" aria-label="Te informamos">
                  <FooterColumn title="Te informamos">
                    <FooterNavLinks links={teInformamosLinks} />
                  </FooterColumn>
                </nav>

                <nav className="lg:col-span-2" aria-label="Servicios al cliente">
                  <FooterColumn title="Servicios al cliente">
                    <FooterNavLinks links={serviciosClienteLinks} />
                  </FooterColumn>
                </nav>

                <nav className="lg:col-span-2" aria-label="Destacados">
                  <FooterColumn title="Destacados">
                    <FooterNavLinks links={destacadosLinks} />
                  </FooterColumn>
                </nav>
              </div>
            </div>

            {/* Barra métodos de pago */}
            <div className="border-t border-white/10 bg-neutral-900/80">
              <div className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <span className="shrink-0 text-sm font-semibold text-white">Métodos de pago</span>
                  <img
                    src="/mediosdepago2.png"
                    alt="Visa, Mastercard, American Express y otros medios de pago"
                    className="h-7 w-auto max-w-full object-contain object-left opacity-90"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-white/75">
                  <span>Realiza tus compras de forma segura</span>
                  <ShieldCheck className="size-5 shrink-0 text-green-500" aria-hidden="true" />
                  <span className="rounded border border-white/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white/90">
                    SSL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Redes + enlaces rápidos */}
        <div className="border-t border-white/10">
          <div className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    {social.path ? (
                      <Icon path={social.path} size={0.85} aria-hidden="true" />
                    ) : (
                      <TikTokIcon />
                    )}
                  </a>
                </li>
              ))}
            </ul>

            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/75 underline decoration-white/40 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 py-5">
          <p className="container text-center text-xs leading-relaxed text-white/50 sm:text-[0.8rem]">
            © {year} {companyName}. Todos los derechos reservados. / RUC: {ruc} / Razón Social:{' '}
            {legalName}
          </p>
        </div>
      </footer>
    </>
  );
}
