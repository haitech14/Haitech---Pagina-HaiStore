import { MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function AdminSidebarHelpCard() {
  return (
    <div className="mx-3 mb-2 rounded-xl border border-[hsl(var(--admin-sidebar-border))]/80 bg-[hsl(var(--admin-sidebar-hover))]/40 p-3">
      <MessageCircle
        className="size-4 text-[hsl(var(--admin-sidebar-fg-muted))]"
        aria-hidden="true"
      />
      <p className="mt-2 text-sm font-semibold text-[hsl(var(--admin-sidebar-fg))]">¿Necesitas ayuda?</p>
      <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--admin-sidebar-fg-muted))]">
        Nuestro equipo está disponible para ti.
      </p>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="mt-3 h-8 w-full border-[hsl(var(--admin-sidebar-border))] bg-transparent text-xs font-medium text-[hsl(var(--admin-sidebar-fg))] hover:bg-[hsl(var(--admin-sidebar-hover))]"
      >
        <a href="https://wa.me/51915149290" target="_blank" rel="noopener noreferrer">
          Contactar soporte
        </a>
      </Button>
    </div>
  );
}
