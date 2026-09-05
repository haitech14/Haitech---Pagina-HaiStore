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
          Distribuidor Autorizado Ricoh — fotocopiadoras, impresoras, tóner y repuestos en Perú
        </h2>
        <p className="mt-1.5 text-pretty text-[0.6875rem] leading-relaxed text-white/50 sm:text-xs">
          En HaiTech, <strong className="font-medium text-white/65">Distribuidor Autorizado Ricoh</strong>,
          encontrarás{' '}
          <Link to={categoryLandingPath('multifuncionales')} className={linkClass}>
            Multifuncionales
          </Link>
          ,{' '}
          <Link to={categoryLandingPath('impresoras')} className={linkClass}>
            Impresoras
          </Link>
          ,{' '}
          <Link to="/toner-ricoh" className={linkClass}>
            Tóner
          </Link>{' '}
          y{' '}
          <Link to={categoryLandingPath('repuestos')} className={linkClass}>
            Repuestos
          </Link>
          . Cotiza venta o{' '}
          <Link to="/alquiler-fotocopiadoras-lima" className={linkClass}>
            Alquiler
          </Link>{' '}
          y{' '}
          <Link to={serviceHubPath('servicio-tecnico')} className={linkClass}>
            Servicio técnico
          </Link>
          . Conoce{' '}
          <Link to="/sobre-nosotros" className={linkClass}>
            Sobre Nosotros
          </Link>
          ,{' '}
          <Link to="/tienda" className={linkClass}>
            Nuestros Productos
          </Link>
          , nuestro{' '}
          <Link to="/distribuidor-autorizado-ricoh" className={linkClass}>
            Distribuidor Autorizado Ricoh
          </Link>
          ,{' '}
          <Link to="/fotocopiadoras-peru" className={linkClass}>
            Fotocopiadoras Perú
          </Link>
          ,{' '}
          <Link to="/fotocopiadoras-ricoh" className={linkClass}>
            Fotocopiadoras
          </Link>
          ,{' '}
          <Link to="/preguntas-frecuentes" className={linkClass}>
            Preguntas frecuentes
          </Link>
          ,{' '}
          <Link to="/contacto" className={linkClass}>
            Contacto
          </Link>
          ,{' '}
          <Link to="/guias" className={linkClass}>
            Guías
          </Link>
          ,{' '}
          <Link to="/modelos" className={linkClass}>
            Modelos
          </Link>
          ,{' '}
          <Link to="/privacidad" className={linkClass}>
            Políticas
          </Link>
          ,{' '}
          <Link to="/descargas" className={linkClass}>
            Descargas
          </Link>
          ,{' '}
          <Link to="/software" className={linkClass}>
            Software
          </Link>
          ,{' '}
          <Link to="/haiprotect" className={linkClass}>
            HaiProtect
          </Link>
          ,{' '}
          <Link to="/foro" className={linkClass}>
            Foro
          </Link>
          ,{' '}
          <Link to="/terminos" className={linkClass}>
            Términos
          </Link>
          ,{' '}
          <Link to="/por-que-comprar-con-nosotros" className={linkClass}>
            Por qué comprar
          </Link>
          ,{' '}
          <Link to={serviceHubPath('outsourcing')} className={linkClass}>
            Outsourcing
          </Link>
          ,{' '}
          <Link to={categoryLandingPath('accesorios')} className={linkClass}>
            Accesorios
          </Link>
          ,{' '}
          <Link to={categoryLandingPath('formato-ancho')} className={linkClass}>
            Formato ancho
          </Link>{' '}
          y{' '}
          <Link to={categoryLandingPath('escaneres')} className={linkClass}>
            Escáneres
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
