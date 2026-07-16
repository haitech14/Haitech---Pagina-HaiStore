import { Link } from 'react-router-dom';

import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';
import { cn } from '@/lib/utils';

interface FooterSeoTextProps {
  className?: string;
}

/** Bloque SEO indexable (misma copy que antes en home): keywords + enlaces internos. */
export function FooterSeoText({ className }: FooterSeoTextProps) {
  const linkClass =
    'font-medium text-white/75 underline-offset-2 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:text-white';

  return (
    <section
      aria-labelledby="footer-seo-heading"
      className={cn('border-t border-white/10 bg-[#0d0d0d]', className)}
    >
      <div className="container max-w-4xl py-4 sm:py-5">
        <h2
          id="footer-seo-heading"
          className="text-pretty text-xs font-semibold text-white/85 sm:text-sm"
        >
          Fotocopiadoras Ricoh — venta y alquiler en Perú
        </h2>
        <p className="mt-1.5 text-pretty text-[0.6875rem] leading-relaxed text-white/50 sm:text-xs">
          En Haitech, Distribuidor Autorizado Ricoh, encontrarás{' '}
          <Link to={categoryLandingPath('multifuncionales')} className={linkClass}>
            fotocopiadoras y multifuncionales
          </Link>
          ,{' '}
          <Link to={categoryLandingPath('impresoras')} className={linkClass}>
            impresoras láser
          </Link>
          ,{' '}
          <Link to={categoryLandingPath('toner-suministros')} className={linkClass}>
            tóner, tintas y suministros
          </Link>{' '}
          y{' '}
          <Link to={categoryLandingPath('repuestos')} className={linkClass}>
            repuestos originales y compatibles
          </Link>
          . Cotiza venta o{' '}
          <Link to={serviceHubPath('alquiler')} className={linkClass}>
            alquiler de equipos
          </Link>{' '}
          con envío a todo el Perú y soporte técnico especializado. Conoce{' '}
          <Link to="/por-que-comprar-con-nosotros" className={linkClass}>
            por qué comprar con nosotros
          </Link>{' '}
          o lee las{' '}
          <Link to="/preguntas-frecuentes" className={linkClass}>
            preguntas frecuentes
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
