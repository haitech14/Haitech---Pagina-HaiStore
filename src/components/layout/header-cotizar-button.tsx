import { lazy, Suspense, useState } from 'react';
import { ClipboardList } from 'lucide-react';

import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import { openHeroQuoteWhatsApp } from '@/lib/hero-whatsapp-message';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';
import { cn } from '@/lib/utils';

const WhatsAppContactDialog = lazy(() =>
  import('@/components/whatsapp-contact-dialog').then((m) => ({
    default: m.WhatsAppContactDialog,
  })),
);

type HeaderCotizarButtonProps = {
  className?: string;
};

export function HeaderCotizarButton({ className }: HeaderCotizarButtonProps) {
  const [open, setOpen] = useState(false);
  const { contact, saveContact, isSaving } = useWhatsAppContact();

  const handleSubmit = async (nextContact: WhatsAppContact) => {
    await saveContact(nextContact);
    const opened = openHeroQuoteWhatsApp(nextContact, { campaign: 'header-cotizar' });
    if (!opened) {
      throw new Error('No se pudo abrir WhatsApp. Inténtalo de nuevo.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#E30613] px-3.5 py-2 text-sm font-medium text-white shadow-sm',
          'transition-colors hover:bg-[#c90511] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]',
          className,
        )}
      >
        <ClipboardList className="size-4" aria-hidden="true" />
        Cotizar ahora
      </button>

      {open ? (
        <Suspense fallback={null}>
          <WhatsAppContactDialog
            open={open}
            onOpenChange={setOpen}
            initial={contact ?? undefined}
            isSubmitting={isSaving}
            showQuoteCheckbox={false}
            title="Solicitar cotización"
            description="Completa tus datos y te llevaremos a WhatsApp con el mensaje listo para enviar a nuestro equipo de ventas."
            submitLabel="Continuar a WhatsApp"
            onSubmit={handleSubmit}
          />
        </Suspense>
      ) : null}
    </>
  );
}
