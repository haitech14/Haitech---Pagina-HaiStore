import { Download, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import type { ForumFirmwareCatalogItem } from '@/types/forum';

interface ForumFirmwareCatalogPanelProps {
  items: ForumFirmwareCatalogItem[];
  isLoading?: boolean;
}

export function ForumFirmwareCatalogPanel({ items, isLoading }: ForumFirmwareCatalogPanelProps) {
  if (isLoading) {
    return (
      <p className="py-8 text-center text-sm text-[hsl(var(--forum-muted))]" role="status">
        Cargando firmware del catálogo…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[hsl(var(--forum-border))] px-4 py-8 text-center text-sm text-[hsl(var(--forum-muted))]">
        No hay firmware publicado en el catálogo todavía. Revisa las notas de la comunidad más abajo
        o contacta a soporte.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[hsl(var(--forum-border))]">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))]">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Equipo
            </th>
            <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">
              Marca
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Archivo
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={`${item.productId}-${item.firmware.url}`}
              className="border-b border-[hsl(var(--forum-border))] last:border-b-0"
            >
              <td className="px-4 py-3">
                <span className="font-medium text-[hsl(var(--forum-fg))]">{item.name}</span>
                {item.category ? (
                  <span className="mt-0.5 block text-xs text-[hsl(var(--forum-muted))]">
                    {item.category}
                  </span>
                ) : null}
              </td>
              <td className="hidden px-4 py-3 text-[hsl(var(--forum-muted))] sm:table-cell">
                {item.brand ?? '—'}
              </td>
              <td className="px-4 py-3 text-[hsl(var(--forum-muted))]">
                {item.firmware.label}
                {item.firmware.fileName ? (
                  <span className="mt-0.5 block text-xs opacity-80">{item.firmware.fileName}</span>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="min-h-9 border-[hsl(var(--forum-border))]"
                  >
                    <a href={item.firmware.url} download rel="noopener noreferrer">
                      <Download className="size-4" aria-hidden="true" />
                      Descargar
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="min-h-9 text-[hsl(var(--forum-accent))]"
                  >
                    <Link to={`/tienda/producto/${item.productId}`}>
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Ficha
                    </Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
