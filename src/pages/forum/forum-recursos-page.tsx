import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, ExternalLink, FileText } from 'lucide-react';

import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';

const RESOURCES = [
  {
    title: 'Manuales Ricoh IM Series',
    description: 'Documentación técnica y guías de instalación.',
    href: '/contacto?servicio=Descargas',
    icon: FileText,
  },
  {
    title: 'Drivers y utilidades',
    description: 'Enlaces a controladores oficiales y herramientas de diagnóstico.',
    href: '/contacto',
    icon: Download,
  },
  {
    title: 'Blog HaiTech',
    description: 'Artículos, casos de éxito y novedades del sector.',
    href: '/',
    icon: ExternalLink,
  },
] as const;

export function ForumRecursosPage() {
  useEffect(() => {
    document.title = `Recursos | ${FORUM_TITLE_SUFFIX}`;
  }, []);

  return (
    <div className="container px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm">
        <Link to="/foro" className="text-[hsl(var(--forum-muted))] hover:text-[hsl(var(--forum-accent))]">
          ← Foro
        </Link>
      </nav>
      <h1 className="text-2xl font-bold">Recursos</h1>
      <p className="mt-2 text-sm text-[hsl(var(--forum-muted))]">
        Enlaces útiles complementarios al foro.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {RESOURCES.map(({ title, description, href, icon: Icon }) => (
          <li key={title}>
            <Link
              to={href}
              className="flex h-full flex-col gap-3 rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] p-5 transition-colors hover:border-[hsl(var(--forum-accent)/0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forum-accent))]"
            >
              <span
                className="flex size-11 items-center justify-center rounded-lg bg-[hsl(var(--forum-accent)/0.12)] text-[hsl(var(--forum-accent))]"
                aria-hidden="true"
              >
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="mt-1 block text-sm text-[hsl(var(--forum-muted))]">{description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
