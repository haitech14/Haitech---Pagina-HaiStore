import { Link } from 'react-router-dom';

import { RentalCategoriesCarousel } from '@/components/rental-categories-carousel';
import {
  findRentalCategoryBySlug,
  RENTAL_PARENT_SLUG,
} from '@/data/rental-categories';
import { categoryPath } from '@/lib/category-path';

interface RentalCategoryGridProps {
  activeSubSlug?: string | null;
}

export function RentalCategoryGrid({ activeSubSlug }: RentalCategoryGridProps) {
  const active = activeSubSlug ? findRentalCategoryBySlug(activeSubSlug) : null;

  if (active) {
    const Icon = active.icon;
    return (
      <div className="rounded-xl border border-border/70 bg-muted/20 p-6 sm:p-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span
            className="flex size-14 items-center justify-center rounded-full border-2 border-primary bg-background"
            aria-hidden="true"
          >
            <Icon className="size-7 text-primary" />
          </span>
          <h2 className="text-balance text-xl font-bold text-foreground sm:text-2xl">{active.title}</h2>
          <p className="text-pretty text-sm text-muted-foreground sm:text-base">{active.description}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/contacto?servicio=${encodeURIComponent(active.title)}`}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Solicitar cotización
            </Link>
            <Link
              to={categoryPath(RENTAL_PARENT_SLUG)}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-semibold text-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver todos los alquileres
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground sm:text-base">
        Selecciona el tipo de equipo que necesitas alquilar. Todos los planes incluyen asesoría,
        instalación y soporte Haitech.
      </p>
      <RentalCategoriesCarousel />
    </div>
  );
}
