import { useState } from 'react';
import type { ReactNode } from 'react';

import { WhatsAppContactDialog } from '@/components/whatsapp-contact-dialog';
import { headerDarkUtilityButtonClass } from '@/components/layout/header-action-strip';
import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import {
  openHeaderSalesWhatsApp,
  openHeaderSupportWhatsApp,
} from '@/lib/header-whatsapp-message';
import { isCompleteWhatsAppContact, type WhatsAppContact } from '@/lib/whatsapp-contact';
import { cn } from '@/lib/utils';

type HeaderWhatsAppTopic = 'ventas' | 'soporte';

type HeaderWhatsAppContactActionProps = {
  topic: HeaderWhatsAppTopic;
  label: string;
  phoneDisplay: string;
  icon: ReactNode;
  className?: string;
  /** Variante compacta del menú móvil. */
  variant?: 'desktop' | 'mobile';
};

const DIALOG_COPY: Record<
  HeaderWhatsAppTopic,
  { title: string; description: string; submitLabel: string }
> = {
  ventas: {
    title: 'Ventas y alquiler por WhatsApp',
    description:
      'Completa tus datos y te llevaremos a WhatsApp con el mensaje listo para nuestro equipo comercial.',
    submitLabel: 'Continuar a WhatsApp',
  },
  soporte: {
    title: 'Soporte técnico por WhatsApp',
    description:
      'Completa tus datos y te llevaremos a WhatsApp con el mensaje listo para nuestro equipo de soporte.',
    submitLabel: 'Continuar a WhatsApp',
  },
};

function openWhatsAppForTopic(topic: HeaderWhatsAppTopic, contact: WhatsAppContact): boolean {
  return topic === 'ventas' ? openHeaderSalesWhatsApp(contact) : openHeaderSupportWhatsApp(contact);
}

export function HeaderWhatsAppContactAction({
  topic,
  label,
  phoneDisplay,
  icon,
  className,
  variant = 'desktop',
}: HeaderWhatsAppContactActionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { contact, saveContact, isSaving } = useWhatsAppContact();
  const copy = DIALOG_COPY[topic];

  const handleSubmit = async (nextContact: WhatsAppContact) => {
    await saveContact(nextContact);
    const opened = openWhatsAppForTopic(topic, nextContact);
    if (!opened) {
      throw new Error('No se pudo abrir WhatsApp. Inténtalo de nuevo.');
    }
  };

  const handleClick = () => {
    if (isCompleteWhatsAppContact(contact)) {
      void handleSubmit(contact).catch(() => setDialogOpen(true));
      return;
    }
    setDialogOpen(true);
  };

  if (variant === 'mobile') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'inline-flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10',
            className,
          )}
        >
          {icon}
          <span className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left">
            <span>{label}</span>
            <span className="shrink-0 text-xs font-normal tabular-nums text-white/70">
              {phoneDisplay}
            </span>
          </span>
        </button>

        <WhatsAppContactDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={contact}
          isSubmitting={isSaving}
          showQuoteCheckbox={false}
          title={copy.title}
          description={copy.description}
          submitLabel={copy.submitLabel}
          onSubmit={handleSubmit}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={`${label} ${phoneDisplay}`}
        className={cn(headerDarkUtilityButtonClass(), 'h-auto w-full items-center gap-2 py-1.5', className)}
      >
        {icon}
        <span className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left text-[0.8125rem] leading-none">
          <span className="font-semibold">{label}</span>
          <span className="shrink-0 font-normal tabular-nums text-white/75">{phoneDisplay}</span>
        </span>
      </button>

      <WhatsAppContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={contact}
        isSubmitting={isSaving}
        showQuoteCheckbox={false}
        title={copy.title}
        description={copy.description}
        submitLabel={copy.submitLabel}
        onSubmit={handleSubmit}
      />
    </>
  );
}
