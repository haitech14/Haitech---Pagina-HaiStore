import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  megaMenuColumns,
  megaMenuFeatured,
  megaMenuSidebar,
  type MegaMenuSectionId,
} from '@/data/mega-menu';
import { cn } from '@/lib/utils';

export function CategoriesMegaMenu() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MegaMenuSectionId>('impresion');

  const closeMenu = () => setOpen(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-haspopup="true"
          aria-expanded={open}
          className="h-full gap-2 rounded-none bg-red-700 text-white hover:bg-red-800 focus-visible:ring-white/50 data-[state=open]:bg-red-800"
        >
          <Menu aria-hidden="true" />
          Categorías
          <ChevronDown
            aria-hidden="true"
            className={cn('size-4 transition-transform', open && 'rotate-180')}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={0}
        className={cn(
          'z-50 w-[min(960px,calc(100vw-1rem))] overflow-hidden rounded-none border border-border p-0 shadow-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100',
        )}
      >
        <div className="flex min-h-[320px]">
          {/* Sidebar */}
          <aside className="w-[210px] shrink-0 border-r bg-background py-5 pl-4 pr-2">
            <p className="mb-3 px-2 text-sm font-bold text-foreground">Explorar categorías</p>
            <ul className="flex flex-col gap-0.5">
              {megaMenuSidebar.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveSection(item.id)}
                      onFocus={() => setActiveSection(item.id)}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-r-md py-2.5 pl-3 pr-2 text-left text-sm font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
                        isActive
                          ? 'border-l-[3px] border-[#DC2626] bg-red-50 text-[#DC2626]'
                          : 'border-l-[3px] border-transparent text-foreground hover:bg-muted/60',
                      )}
                    >
                      <Icon
                        className={cn('size-4 shrink-0', isActive ? 'text-[#DC2626]' : 'text-foreground')}
                        aria-hidden="true"
                      />
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight className="size-4 shrink-0 opacity-40" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Columnas + destacados */}
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-0 bg-background md:grid-cols-[1fr_1fr_1fr_220px]">
            {megaMenuColumns.map((column) => {
              const isHighlighted = activeSection === column.id;

              return (
                <section
                  key={column.id}
                  aria-labelledby={`mega-col-${column.id}`}
                  onMouseEnter={() => setActiveSection(column.id)}
                  className={cn(
                    'border-r px-5 py-5 transition-colors last:border-r-0',
                    isHighlighted ? 'bg-red-50/40' : 'bg-background',
                  )}
                >
                  <h3
                    id={`mega-col-${column.id}`}
                    className="text-sm font-bold text-foreground"
                  >
                    {column.title}
                  </h3>
                  <span
                    className="mt-1.5 mb-4 block h-0.5 w-8 rounded-full bg-[#DC2626]"
                    aria-hidden="true"
                  />

                  <ul className="flex flex-col gap-3">
                    {column.items.map((item) => {
                      const Icon = item.icon;

                      return (
                        <li key={item.slug}>
                          <Link
                            to={item.href}
                            onClick={closeMenu}
                            className="group flex items-center gap-2.5 rounded-md py-1 text-sm text-foreground transition-colors hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          >
                            <Icon
                              className="size-4 shrink-0 text-[#DC2626]"
                              aria-hidden="true"
                              strokeWidth={1.75}
                            />
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}

            {/* Destacados */}
            <section
              aria-labelledby="mega-featured-title"
              onMouseEnter={() => setActiveSection('destacados')}
              className={cn(
                'flex flex-col px-4 py-5 transition-colors',
                activeSection === 'destacados' ? 'bg-red-50/40' : 'bg-background',
              )}
            >
              <h3 id="mega-featured-title" className="text-sm font-bold text-foreground">
                Destacados
              </h3>

              <div className="mt-3 flex flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-muted/30">
                <div className="p-4">
                  <p className="text-sm font-bold leading-snug text-foreground">
                    {megaMenuFeatured.title}
                  </p>
                  <span
                    className="mt-2 mb-2 block h-0.5 w-8 rounded-full bg-[#DC2626]"
                    aria-hidden="true"
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {megaMenuFeatured.description}
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="mt-3 h-9 bg-[#DC2626] px-4 text-white hover:bg-red-700 focus-visible:ring-red-500"
                  >
                    <Link to={megaMenuFeatured.href} onClick={closeMenu}>
                      {megaMenuFeatured.cta}
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                <div className="relative mt-auto h-28 overflow-hidden bg-gradient-to-t from-muted to-background">
                  <img
                    src={megaMenuFeatured.image}
                    alt={megaMenuFeatured.imageAlt}
                    className="h-full w-full object-cover object-center opacity-90"
                    loading="lazy"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
