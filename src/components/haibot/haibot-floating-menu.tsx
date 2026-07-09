import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { HaibotAgentAvatar } from '@/components/haibot/haibot-agent-avatar';
import { HaibotChatPanel } from '@/components/haibot/haibot-chat-panel';
import { mobileBottomOffsetStyle, useMobileBottomInset } from '@/context/mobile-bottom-inset-context';
import { cn } from '@/lib/utils';

export function HaibotFloatingMenu() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const bottomInset = useMobileBottomInset();

  const closeChat = useCallback(() => setChatOpen(false), []);

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
    <div
      ref={panelRef}
      className="fixed right-5 z-50 flex flex-col items-end gap-3 sm:right-6"
      style={mobileBottomOffsetStyle(bottomInset, 1.25)}
    >
      {chatOpen ? <HaibotChatPanel onClose={closeChat} /> : null}

      <div className="group relative flex items-center">
        {!chatOpen ? (
          <span
            role="tooltip"
            className={cn(
              'pointer-events-none absolute right-[calc(100%+0.625rem)] top-1/2 z-10 max-w-[min(16rem,calc(100vw-6rem))] -translate-y-1/2 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold leading-snug text-white shadow-lg',
              'opacity-0 transition-opacity duration-200',
              'group-hover:opacity-100 group-focus-within:opacity-100',
              'motion-reduce:transition-none',
              'after:absolute after:left-full after:top-1/2 after:size-0 after:-translate-y-1/2 after:border-y-[6px] after:border-l-[7px] after:border-y-transparent after:border-l-neutral-900',
            )}
          >
            <span className="sm:hidden">Cotizar</span>
            <span className="hidden sm:inline">¿Necesitas ayuda? Cotiza aquí</span>
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => setChatOpen((open) => !open)}
          aria-expanded={chatOpen}
          aria-haspopup="dialog"
          aria-label={
            chatOpen
              ? 'Cerrar chat con Haibot'
              : 'Abrir chat para cotizar: ¿Necesitas ayuda? Cotiza aquí'
          }
          className={cn(
            'relative flex size-12 items-center justify-center rounded-full transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25d366] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-14',
            chatOpen
              ? 'bg-[#25d366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:bg-[#20bd5a] scale-105'
              : 'bg-[#25d366] shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:bg-[#20bd5a]',
          )}
        >
          {chatOpen ? (
            <X className="size-7 text-white" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <HaibotAgentAvatar size="xs" showWhatsAppBadge className="pointer-events-none shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
}
