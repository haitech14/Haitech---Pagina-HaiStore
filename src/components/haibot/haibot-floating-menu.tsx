import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';

import { HaibotChatPanel } from '@/components/haibot/haibot-chat-panel';
import { WhatsAppContactDialog } from '@/components/whatsapp-contact-dialog';
import { useWhatsAppContact } from '@/hooks/use-whatsapp-contact';
import { buildHaibotWhatsAppUrl, type HaibotWhatsAppIntent } from '@/lib/haibot-messages';
import type { HaibotQuickAction } from '@/lib/haibot-quick-actions';
import { isCompleteWhatsAppContact } from '@/lib/whatsapp-contact';
import { cn } from '@/lib/utils';

export function HaibotFloatingMenu() {
  const navigate = useNavigate();
  const { contact, saveContact, isSaving } = useWhatsAppContact();
  const panelRef = useRef<HTMLDivElement>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [whatsAppDialogOpen, setWhatsAppDialogOpen] = useState(false);
  const [pendingWhatsAppIntent, setPendingWhatsAppIntent] = useState<HaibotWhatsAppIntent | null>(
    null,
  );

  const closeChat = useCallback(() => setChatOpen(false), []);

  const openWhatsApp = useCallback((intent: HaibotWhatsAppIntent) => {
    const url = buildHaibotWhatsAppUrl(intent);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const launchWhatsAppIntent = useCallback(
    (intent: HaibotWhatsAppIntent) => {
      if (isCompleteWhatsAppContact(contact)) {
        openWhatsApp(intent);
        return;
      }
      setPendingWhatsAppIntent(intent);
      setWhatsAppDialogOpen(true);
    },
    [contact, openWhatsApp],
  );

  const handleQuickAction = useCallback(
    (action: HaibotQuickAction) => {
      if (action.kind === 'navigate') {
        closeChat();
        navigate(action.to);
        return;
      }
      launchWhatsAppIntent(action.intent);
    },
    [closeChat, navigate, launchWhatsAppIntent],
  );

  useEffect(() => {
    if (!chatOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      closeChat();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeChat();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [chatOpen, closeChat]);

  return (
    <>
      <div
        ref={panelRef}
        className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      >
        <HaibotChatPanel
          open={chatOpen}
          onClose={closeChat}
          onQuickAction={handleQuickAction}
        />

        <button
          type="button"
          onClick={() => setChatOpen((open) => !open)}
          aria-expanded={chatOpen}
          aria-haspopup="dialog"
          aria-label={chatOpen ? 'Cerrar chat con Haibot' : 'Abrir chat con Haibot'}
          className={cn(
            'flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] transition-transform hover:bg-[#20bd5a] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25d366] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            chatOpen && 'scale-105',
          )}
        >
          {chatOpen ? (
            <X className="size-7" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <MessageCircle className="size-7" strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
      </div>

      <WhatsAppContactDialog
        open={whatsAppDialogOpen}
        onOpenChange={(open) => {
          setWhatsAppDialogOpen(open);
          if (!open) setPendingWhatsAppIntent(null);
        }}
        {...(contact ? { initial: contact } : {})}
        isSubmitting={isSaving}
        onSubmit={async (nextContact) => {
          await saveContact(nextContact);
          if (pendingWhatsAppIntent) {
            openWhatsApp(pendingWhatsAppIntent);
          }
          setWhatsAppDialogOpen(false);
          setPendingWhatsAppIntent(null);
        }}
      />
    </>
  );
}
