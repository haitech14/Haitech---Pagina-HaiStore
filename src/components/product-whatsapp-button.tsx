import { useState, type MouseEvent } from 'react';
import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';

import { WhatsAppContactDialog } from '@/components/whatsapp-contact-dialog';
import { Button } from '@/components/ui/button';
import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import { openProductWhatsAppChat, type ProductWhatsAppLineItem } from '@/lib/product-whatsapp-message';
import { isCompleteWhatsAppContact } from '@/lib/whatsapp-contact';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';

interface ProductWhatsAppButtonProps {
  product: ProductWhatsAppLineItem;
  className?: string;
  /** Evita activar el enlace padre de la tarjeta. */
  stopPropagation?: boolean;
}

export function ProductWhatsAppButton({
  product,
  className,
  stopPropagation = true,
}: ProductWhatsAppButtonProps) {
  const { contact, saveContact, isSaving } = useWhatsAppContact();
  const [dialogOpen, setDialogOpen] = useState(false);

  const detailPath = product.id ? productPath(product.id) : null;
  const lineItem: ProductWhatsAppLineItem = {
    ...product,
    productUrl:
      product.productUrl ??
      (typeof window !== 'undefined' && detailPath
        ? `${window.location.origin}${detailPath}`
        : undefined),
  };

  const launchWhatsApp = async (nextContact: Parameters<typeof saveContact>[0]) => {
    await saveContact(nextContact);
    const opened = openProductWhatsAppChat(lineItem, nextContact);
    if (!opened) {
      throw new Error('No se pudo abrir WhatsApp. Verifica el número de contacto.');
    }
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (isCompleteWhatsAppContact(contact)) {
      void launchWhatsApp(contact).catch(() => {
        setDialogOpen(true);
      });
      return;
    }

    setDialogOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          'size-10 shrink-0 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 focus-visible:ring-[#25D366]',
          className,
        )}
        aria-label={`Consultar ${product.name} por WhatsApp`}
        onClick={handleClick}
      >
        <Icon path={mdiWhatsapp} size={0.95} aria-hidden="true" />
      </Button>

      <WhatsAppContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={contact}
        isSubmitting={isSaving}
        onSubmit={launchWhatsApp}
      />
    </>
  );
}
