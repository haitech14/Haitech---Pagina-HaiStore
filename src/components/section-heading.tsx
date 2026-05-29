import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeadingProps {
  title: string;
  linkLabel?: string;
  linkTo?: string;
}

export function SectionHeading({ title, linkLabel, linkTo = '/tienda' }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {linkLabel && (
        <Link
          to={linkTo}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          {linkLabel}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}
