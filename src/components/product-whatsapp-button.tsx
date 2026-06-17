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
  /** Muestra texto junto al icono (p. ej. «Cotizar ahora»). */
  label?: string;
  quantity?: number;
  /** Estilo del botón cuando hay etiqueta. */
  accent?: 'solid' | 'outline';
}

export function ProductWhatsAppButton({
  product,
  className,
  stopPropagation = true,
  label,
  quantity,
  accent = 'solid',
}: ProductWhatsAppButtonProps) {
  const { contact, saveContact, isSaving } = useWhatsAppContact();
  const [dialogOpen, setDialogOpen] = useState(false);

  const detailPath = product.id ? productPath(product.id) : null;
  const resolvedProductUrl =
    product.productUrl ??
    (typeof window !== 'undefined' && detailPath
      ? `${window.location.origin}${detailPath}`
      : null);
  const lineItem: ProductWhatsAppLineItem = {
    ...product,
    ...(resolvedProductUrl ? { productUrl: resolvedProductUrl } : {}),
    ...(quantity != null && quantity > 0 ? { quantity } : {}),
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
        variant={label ? 'default' : 'outline'}
        size={label ? 'default' : 'icon'}
        className={cn(
          label
            ? accent === 'outline'
              ? 'min-h-11 gap-2 border border-[#25D366] bg-white px-3 text-sm font-bold uppercase tracking-wide text-[#25D366] hover:bg-[#25D366]/5 focus-visible:ring-[#25D366]'
              : 'min-h-9 gap-1.5 bg-[#25D366] px-2 text-xs font-semibold text-white hover:bg-[#20bd5a] focus-visible:ring-[#25D366]'
            : 'size-10 min-h-11 shrink-0 rounded-lg border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 focus-visible:ring-[#25D366]',
          className,
        )}
        aria-label={
          label
            ? `${label} — ${product.name}`
            : `Consultar ${product.name} por WhatsApp`
        }
        onClick={handleClick}
      >
        <Icon path={mdiWhatsapp} size={0.95} aria-hidden="true" />
        {label ? <span className="truncate">{label}</span> : null}
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
