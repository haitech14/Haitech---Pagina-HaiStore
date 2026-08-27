import { useCallback, useState } from 'react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { toast } from 'sonner';

import { WhatsAppContactDialog } from '@/components/whatsapp-contact-dialog';
import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import { HAITECH_HOME_WHATSAPP_URL } from '@/data/haitech-home-shell';
import { isCompleteWhatsAppContact, type WhatsAppContact } from '@/lib/whatsapp-contact';
import { buildWhatsAppMeUrl } from '@/lib/whatsapp-encoding';
import { HAITECH_WHATSAPP_MSISDN } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

function openHomeWhatsApp(contact: WhatsAppContact) {
  const text = [
    'Hola HAITECH, necesito ayuda.',
    `Nombre: ${contact.name}`,
    `Empresa/RUC: ${contact.companyOrRuc}`,
    `Ciudad: ${contact.city}`,
  ].join('\n');

  const href = buildWhatsAppMeUrl(HAITECH_WHATSAPP_MSISDN, text) || HAITECH_HOME_WHATSAPP_URL;
  window.open(href, '_blank', 'noopener,noreferrer');
}

export function HaitechHomeWhatsAppButton({ className }: { className?: string }) {
  const { contact, saveContact, isSaving } = useWhatsAppContact('whatsapp-home');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = useCallback(
    async (nextContact: WhatsAppContact) => {
      setIsProcessing(true);
      try {
        await saveContact(nextContact, { channel: 'whatsapp-home', createProforma: true });
        openHomeWhatsApp(nextContact);
        setDialogOpen(false);
      } catch {
        toast.error('No se pudo abrir WhatsApp. Inténtalo de nuevo.');
      } finally {
        setIsProcessing(false);
      }
    },
    [saveContact],
  );

  const handleClick = () => {
    if (isCompleteWhatsAppContact(contact)) {
      void handleSubmit(contact);
      return;
    }
    setDialogOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="¿Necesitas ayuda? Abrir WhatsApp"
        title="¿Necesitas ayuda?"
        className={cn(
          'group/wa fixed z-[80] inline-flex items-center justify-center bg-[#25D366] text-white',
          'shadow-[0_6px_18px_rgba(0,0,0,0.22)] transition-transform duration-200 hover:scale-[1.03]',
          'right-3 size-14 rounded-full',
          'bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))]',
          'sm:bottom-6 sm:right-[25px] sm:h-[45px] sm:w-[220px] sm:gap-2 sm:rounded-full',
          'text-[14px] font-semibold',
          className,
        )}
      >
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute right-full top-1/2 mr-2.5 -translate-y-1/2 sm:hidden',
            'whitespace-nowrap rounded-lg bg-[#111] px-2.5 py-1.5 text-[12px] font-medium text-white',
            'shadow-[0_6px_16px_rgba(0,0,0,0.28)]',
            'after:absolute after:left-full after:top-1/2 after:-translate-y-1/2',
            'after:border-[6px] after:border-transparent after:border-l-[#111]',
          )}
        >
          ¿Necesitas ayuda?
        </span>

        <Icon path={mdiWhatsapp} size={1.2} className="sm:size-[0.95]" aria-hidden="true" />
        <span className="hidden sm:inline">Comprar por WhatsApp</span>
      </button>

      <WhatsAppContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={contact}
        onSubmit={async (next) => handleSubmit(next)}
        isSubmitting={isSaving || isProcessing}
        title="¿Necesitas ayuda?"
        description="Déjanos tus datos y te atendemos por WhatsApp."
        submitLabel="Continuar a WhatsApp"
        showQuoteCheckbox={false}
      />
    </>
  );
}
