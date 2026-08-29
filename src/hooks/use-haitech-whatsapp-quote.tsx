import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import { WhatsAppContactDialog } from '@/components/whatsapp-contact-dialog';
import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import {
  openHaitechSalesWhatsApp,
  type HaitechWhatsAppQuoteContext,
} from '@/lib/haitech-whatsapp-quote';
import { isCompleteWhatsAppContact, type WhatsAppContact } from '@/lib/whatsapp-contact';
import type { WebLeadChannel } from '@/lib/submit-web-lead';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

export type HaitechWhatsAppQuoteRequest = HaitechWhatsAppQuoteContext & {
  messageBuilder?: (contact: WhatsAppContact) => string;
  /** Siempre muestra el formulario aunque el contacto ya esté completo. */
  requireDialog?: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
};

type UseHaitechWhatsAppQuoteOptions = {
  channel?: WebLeadChannel;
  campaign?: string;
  createProforma?: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
};

const DEFAULT_COPY = {
  title: 'Solicitar cotización',
  description:
    'Completa tus datos y te llevaremos a WhatsApp con el mensaje listo para enviar a nuestro equipo de ventas.',
  submitLabel: 'Continuar a WhatsApp',
};

export function useHaitechWhatsAppQuote({
  channel = 'whatsapp-home',
  campaign,
  createProforma = true,
  title = DEFAULT_COPY.title,
  description = DEFAULT_COPY.description,
  submitLabel = DEFAULT_COPY.submitLabel,
}: UseHaitechWhatsAppQuoteOptions = {}) {
  const { contact, saveContact, isSaving } = useWhatsAppContact(channel);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogCopy, setDialogCopy] = useState(DEFAULT_COPY);
  const pendingRequestRef = useRef<HaitechWhatsAppQuoteRequest>({});

  const submitQuote = useCallback(
    async (nextContact: WhatsAppContact, request: HaitechWhatsAppQuoteRequest = {}) => {
      setIsProcessing(true);
      try {
        await saveContact(nextContact, { channel, createProforma });
        const context: HaitechWhatsAppQuoteContext = {
          campaign: request.campaign ?? campaign,
          extraLines: request.extraLines,
        };

        if (request.messageBuilder) {
          const url = buildHaitechWhatsAppUrl(request.messageBuilder(nextContact));
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          openHaitechSalesWhatsApp(nextContact, context);
        }

        setDialogOpen(false);
      } catch {
        toast.error('No se pudo abrir WhatsApp. Inténtalo de nuevo.');
        throw new Error('whatsapp-open-failed');
      } finally {
        setIsProcessing(false);
      }
    },
    [campaign, channel, createProforma, saveContact],
  );

  const requestQuote = useCallback(
    (request: HaitechWhatsAppQuoteRequest = {}) => {
      pendingRequestRef.current = request;
      setDialogCopy({
        title: request.title ?? title,
        description: request.description ?? description,
        submitLabel: request.submitLabel ?? submitLabel,
      });
      if (!request.requireDialog && isCompleteWhatsAppContact(contact)) {
        void submitQuote(contact, request);
        return;
      }
      setDialogOpen(true);
    },
    [contact, description, submitLabel, submitQuote, title],
  );

  const quoteDialog = (
    <WhatsAppContactDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      initial={contact}
      onSubmit={async (nextContact) => submitQuote(nextContact, pendingRequestRef.current)}
      isSubmitting={isSaving || isProcessing}
      title={dialogCopy.title}
      description={dialogCopy.description}
      submitLabel={dialogCopy.submitLabel}
      showQuoteCheckbox={false}
    />
  );

  return {
    requestQuote,
    quoteDialog,
    contact,
  };
}

type HaitechWhatsAppQuoteContextValue = ReturnType<typeof useHaitechWhatsAppQuote>;

const HaitechWhatsAppQuoteContext = createContext<HaitechWhatsAppQuoteContextValue | null>(null);

export function HaitechWhatsAppQuoteProvider({ children }: { children: ReactNode }) {
  const quote = useHaitechWhatsAppQuote();

  return (
    <HaitechWhatsAppQuoteContext.Provider value={quote}>
      {children}
      {quote.quoteDialog}
    </HaitechWhatsAppQuoteContext.Provider>
  );
}

export function useHaitechWhatsAppQuoteContext(): HaitechWhatsAppQuoteContextValue {
  const context = useContext(HaitechWhatsAppQuoteContext);
  if (!context) {
    throw new Error('useHaitechWhatsAppQuoteContext debe usarse dentro de HaitechWhatsAppQuoteProvider');
  }
  return context;
}
