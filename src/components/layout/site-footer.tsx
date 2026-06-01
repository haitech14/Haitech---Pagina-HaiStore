import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiFacebook, mdiInstagram, mdiWhatsapp } from '@mdi/js';

import { cn } from '@/lib/utils';

const WHATSAPP_LINK = 'https://wa.me/51915149290';

const categoryLinks = [
  { label: 'Multifuncionales', to: '/tienda' },
  { label: 'Plotters', to: '/tienda' },
  { label: 'Tintas', to: '/tienda' },
  { label: 'Repuestos', to: '/tienda' },
  { label: 'Consumibles', to: '/tienda' },
] as const;

const infoLinks = [
  { label: 'Sobre Nosotros', to: '/contacto' },
  { label: 'Contacto', to: '/contacto' },
  { label: 'Privacidad', to: '/privacidad' },
  { label: 'Términos', to: '/terminos' },
] as const;

const helpLinks = [
  { label: 'Servicio técnico', to: '/contacto' },
  { label: 'Alquiler de impresoras', to: '/contacto' },
  { label: 'Garantía', to: '/contacto' },
  { label: 'Seguimiento de pedido', to: '/contacto' },
  { label: 'Libro de reclamaciones', to: '/contacto' },
] as const;

const contactItems = [
  { icon: MapPin, label: 'Lima - Perú', href: '/contacto', external: false },
  { icon: Phone, label: '+51 915 149 290', href: 'tel:+51915149290', external: true },
  {
    icon: mdiWhatsapp,
    label: 'WhatsApp',
    href: WHATSAPP_LINK,
    external: true,
    mdi: true,
  },
  {
    icon: Mail,
    label: 'ventas@haitech.pe',
    href: 'mailto:ventas@haitech.pe',
    external: true,
  },
  { icon: Clock, label: '8AM–6PM', href: undefined, external: false },
] as const;

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com/', path: mdiFacebook },
  { label: 'Instagram', href: 'https://instagram.com/', path: mdiInstagram },
  { label: 'WhatsApp', href: WHATSAPP_LINK, path: mdiWhatsapp },
] as const;

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-white">{children}</h2>
      <span className="mt-2 block h-0.5 w-8 bg-red-500" aria-hidden="true" />
    </div>
  );
}

function FooterLinkList({ links }: { links: readonly { label: string; to: string }[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {links.map((link) => (
        <li key={link.label}>
          <Link
            to={link.to}
            className="group flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
          >
            <ChevronRight
              className="size-3 shrink-0 text-red-500 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function WhatsAppFloatButton() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:bottom-6 sm:right-6"
    >
      <Icon path={mdiWhatsapp} size={1.15} aria-hidden="true" />
    </a>
  );
}

export function SiteFooter() {
  return (
    <>
      <footer className="bg-black text-white/70">
        <div className="container py-10 sm:py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link
                to="/"
                className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label="Haitech, inicio"
              >
                <img src="/logo.png" alt="Haitech" className="h-10 w-auto" />
              </Link>
              <p className="mt-2 text-sm font-medium text-white">Soluciones que imprimen valor</p>
              <span className="mt-3 block h-0.5 w-8 bg-red-500" aria-hidden="true" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
                Especialistas en multifuncionales Ricoh y soluciones de impresión para empresas.
              </p>
              <ul className="mt-5 flex gap-2.5">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-red-500/50 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Icon path={social.path} size={0.75} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <nav aria-label="Categorías">
              <FooterHeading>Categorías</FooterHeading>
              <FooterLinkList links={categoryLinks} />
            </nav>

            <nav aria-label="Información">
              <FooterHeading>Información</FooterHeading>
              <FooterLinkList links={infoLinks} />
            </nav>

            <nav aria-label="Ayuda">
              <FooterHeading>Ayuda</FooterHeading>
              <FooterLinkList links={helpLinks} />
            </nav>

            <div>
              <FooterHeading>Contacto</FooterHeading>
              <ul className="flex flex-col gap-3 text-sm">
                {contactItems.map((item) => {
                  const content = (
                    <>
                      {'mdi' in item && item.mdi ? (
                        <Icon
                          path={item.icon as string}
                          size={0.67}
                          className="size-4 shrink-0 text-red-500"
                          aria-hidden="true"
                        />
                      ) : (
                        <item.icon className="size-4 shrink-0 text-red-500" aria-hidden="true" />
                      )}
                      <span>{item.label}</span>
                    </>
                  );

                  if (!item.href) {
                    return (
                      <li key={item.label} className="flex items-center gap-2.5 text-white/60">
                        {content}
                      </li>
                    );
                  }

                  const className = cn(
                    'flex items-center gap-2.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white',
                    item.external ? 'text-white/60' : 'text-white/60',
                  );

                  return (
                    <li key={item.label}>
                      {item.external ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith('http') ? '_blank' : undefined}
                          rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className={className}
                        >
                          {content}
                        </a>
                      ) : (
                        <Link to={item.href} className={className}>
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 sm:mt-12">
            <p className="text-xs text-white/45 sm:text-sm">
              © {new Date().getFullYear()} HAI TECH. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      <WhatsAppFloatButton />
    </>
  );
}
