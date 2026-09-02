import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useSeo } from '@/hooks/use-seo';
import { categoryLandingPath } from '@/lib/category-path';
import { buildAbsoluteUrl } from '@/lib/site-url';

export function NotFoundPage() {
  useSeo({
    title: 'Página no encontrada | HaiStore — Distribuidor Autorizado Ricoh',
    description:
      'La página que buscas no existe. Explora fotocopiadoras, impresoras, tóner y repuestos Ricoh en HaiStore, Distribuidor Autorizado en Perú.',
    canonical: buildAbsoluteUrl('/404'),
    robots: 'noindex,nofollow',
  });

  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-8 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        La página que buscas no existe o se ha movido. Puedes volver al catálogo de fotocopiadoras,
        impresoras, tóner y repuestos Ricoh.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="bg-red-600 hover:bg-red-500">
          <Link to="/tienda">Ver tienda Ricoh</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={categoryLandingPath('multifuncionales')}>Fotocopiadoras</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
