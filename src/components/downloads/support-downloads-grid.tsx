import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SupportDownloadItem } from '@/data/support-downloads';
import { cn } from '@/lib/utils';

interface SupportDownloadsGridProps {
  items: SupportDownloadItem[];
  className?: string;
}

export function SupportDownloadsGrid({ items, className }: SupportDownloadsGridProps) {
  return (
    <ul
      className={cn(
        'grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
      aria-label="Utilidades disponibles para descarga"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id}>
            <Card className="flex h-full flex-col border-border/70 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="space-y-3 pb-3">
                <div
                  className={cn(
                    'flex size-12 items-center justify-center rounded-xl',
                    item.accentClass,
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-6" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold">{item.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <Button
                  asChild
                  className="min-h-11 w-full gap-2 bg-foreground text-background hover:bg-foreground/90"
                >
                  <a href={item.href} download={item.fileName}>
                    <Download className="size-4" aria-hidden="true" />
                    Descargar
                  </a>
                </Button>
                <p className="mt-2 truncate text-center text-xs text-muted-foreground">
                  {item.fileName}
                </p>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
