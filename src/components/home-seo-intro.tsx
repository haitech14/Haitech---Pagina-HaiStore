import { Link } from 'react-router-dom';

import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';

export function HomeSeoIntro() {
  return (
    <section
      aria-labelledby="home-seo-intro-heading"
      className="border-b border-border/60 bg-muted/20 py-8 sm:py-10"
    >
      <div className="container max-w-3xl px-4 text-center sm:px-6">
        <h2
          id="home-seo-intro-heading"
          className="text-balance text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          Fotocopiadoras Ricoh — venta y alquiler en Perú
        </h2>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          En Haitech, Distribuidor Autorizado Ricoh, encontrarás{' '}
          <Link to={categoryLandingPath('multifuncionales')} className="font-medium text-primary underline-offset-4 hover:underline">
            fotocopiadoras y multifuncionales
          </Link>
          ,{' '}
          <Link to={categoryLandingPath('impresoras')} className="font-medium text-primary underline-offset-4 hover:underline">
            impresoras láser
          </Link>
          ,{' '}
          <Link to={categoryLandingPath('toner-suministros')} className="font-medium text-primary underline-offset-4 hover:underline">
            tóner, tintas y suministros
          </Link>{' '}
          y{' '}
          <Link to={categoryLandingPath('repuestos')} className="font-medium text-primary underline-offset-4 hover:underline">
            repuestos originales y compatibles
          </Link>
          . Cotiza venta o{' '}
          <Link to={serviceHubPath('alquiler')} className="font-medium text-primary underline-offset-4 hover:underline">
            alquiler de equipos
          </Link>{' '}
          con envío a todo el Perú y soporte técnico especializado.
        </p>
      </div>
    </section>
  );
}
