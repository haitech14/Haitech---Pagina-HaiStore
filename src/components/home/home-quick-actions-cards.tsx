import { StorePrefetchLink } from '@/components/store-prefetch-link';
import { cn } from '@/lib/utils';

/** Assets 1916×821; mismo aspecto que el strip principal. */
const QUICK_ACTION_ASPECT_CLASS = 'aspect-[1916/821]';

const HOME_QUICK_ACTIONS = [
  {
    id: 'comprar',
    title: 'Comprar equipo',
    href: '/tienda',
    image: '/home/quick-actions/comprar-equipo.png',
    imageAlt: 'Comprar equipo — Explora impresoras y fotocopiadoras listas para entrega.',
  },
  {
    id: 'alquilar',
    title: 'Alquilar equipo',
    href: '/servicios?seccion=alquiler',
    image: '/home/quick-actions/alquilar-equipo.png',
    imageAlt: 'Alquilar equipo — Planes flexibles para oficina con soporte incluido.',
  },
  {
    id: 'servicio',
    title: 'Servicio técnico',
    href: '/servicios?seccion=servicio-tecnico',
    image: '/home/quick-actions/servicio-tecnico.png',
    imageAlt: 'Servicio técnico — Atención especializada para diagnóstico y mantenimiento.',
  },
] as const;

export function HomeQuickActionsCards() {
  return (
    <section aria-label="Accesos rápidos de servicios" className="home-landing-sans bg-[#F8F9FA]">
      <div className="container pb-1 pt-1 sm:pb-1.5 sm:pt-1.5">
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3" role="list">
          {HOME_QUICK_ACTIONS.map((action) => (
            <li key={action.id} className="min-w-0">
              <StorePrefetchLink
                to={action.href}
                className={cn(
                  QUICK_ACTION_ASPECT_CLASS,
                  'group block overflow-hidden rounded-xl bg-[#F8F9FA]',
                  'transition-transform duration-200 hover:-translate-y-0.5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                )}
                aria-label={action.imageAlt}
              >
                <img
                  src={action.image}
                  alt=""
                  className="h-full w-full rounded-xl object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                />
                <span className="sr-only">{action.title}</span>
              </StorePrefetchLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
