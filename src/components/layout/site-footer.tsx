import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiFacebook, mdiInstagram, mdiTwitter, mdiYoutube } from '@mdi/js';

const columns = [
  {
    title: 'Comprar',
    links: ['Productos', 'Ofertas', 'Novedades', 'Marcas', 'Accesorios'],
  },
  {
    title: 'Información',
    links: ['Sobre nosotros', 'Blog', 'Políticas de envío', 'Términos y condiciones'],
  },
  {
    title: 'Ayuda',
    links: ['Centro de ayuda', 'Estado de pedido', 'Garantía', 'Contacto'],
  },
] as const;

const socials = [
  { path: mdiFacebook, label: 'Facebook' },
  { path: mdiInstagram, label: 'Instagram' },
  { path: mdiTwitter, label: 'Twitter' },
  { path: mdiYoutube, label: 'YouTube' },
] as const;

const payments = ['VISA', 'Mastercard', 'PayPal', 'Apple Pay'] as const;

export function SiteFooter() {
  return (
    <footer className="bg-black text-white/70">
      <div className="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-5">
        {/* Marca */}
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center" aria-label="Haitech, inicio">
            <img src="/logoclaro.ico" alt="Haitech" className="h-10 w-auto" />
          </Link>
          <p className="mt-4 max-w-xs text-sm">
            Tecnología que impulsa tu mundo. Calidad y tecnología para mejorar tu
            experiencia.
          </p>
          <ul className="mt-5 flex gap-3">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href="#"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <Icon path={social.path} size={0.7} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Columnas de enlaces */}
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              {column.title}
            </h2>
            <ul className="flex flex-col gap-2 text-sm">
              {column.links.map((link) => (
                <li key={link}>
                  <Link
                    to="/tienda"
                    className="transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Contacto */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
            Contacto
          </h2>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-red-500" aria-hidden="true" />
              info@haitech.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-red-500" aria-hidden="true" />
              +1 (555) 123-4567
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden="true" />
              123 Tech Street, Miami, FL, EE. UU.
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 text-sm sm:flex-row">
          <p>© {new Date().getFullYear()} Haitech. Todos los derechos reservados.</p>
          <ul className="flex items-center gap-2">
            {payments.map((payment) => (
              <li
                key={payment}
                className="rounded-md bg-white/10 px-3 py-1 text-xs font-semibold text-white"
              >
                {payment}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
