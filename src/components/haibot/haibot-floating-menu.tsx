import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { HaibotAgentAvatar } from '@/components/haibot/haibot-agent-avatar';
import { HaibotChatPanel } from '@/components/haibot/haibot-chat-panel';
import { mobileBottomOffsetStyle, useMobileBottomInset } from '@/context/mobile-bottom-inset-context';
import { cn } from '@/lib/utils';

type HaibotFloatingMenuProps = {
  /** Coloca Haibot a la izquierda para coexistir con el FAB de WhatsApp. */
  side?: 'left' | 'right';
};

export function HaibotFloatingMenu({ side = 'left' }: HaibotFloatingMenuProps) {
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
      className={cn(
        'fixed z-50 flex flex-col gap-3',
        side === 'left'
          ? 'left-4 items-start sm:left-6'
          : 'right-4 items-end sm:right-6',
      )}
      style={mobileBottomOffsetStyle(bottomInset, 1.25)}
    >
      {chatOpen ? <HaibotChatPanel onClose={closeChat} /> : null}

      <div className="group relative flex items-center justify-end">
        {!chatOpen ? (
          <span
            role="tooltip"
            className={cn(
              'pointer-events-none absolute z-10 max-w-[min(12.5rem,calc(100vw-6rem))] rounded-2xl bg-white px-3 py-2',
              'shadow-[0_8px_24px_rgba(15,31,61,0.14)] ring-1 ring-black/5',
              'opacity-0 transition-opacity duration-200',
              'group-hover:opacity-100 group-focus-within:opacity-100',
              'motion-reduce:transition-none',
              side === 'right'
                ? 'bottom-[calc(100%+0.5rem)] right-0 rounded-br-md text-right'
                : 'left-[calc(100%+0.625rem)] top-1/2 -translate-y-1/2 rounded-bl-md text-left',
            )}
          >
            <p className="text-xs font-bold leading-tight text-[#111111] sm:text-[0.8125rem]">
              ¿Necesitas una cotización?
            </p>
            <p className="mt-0.5 text-[0.6875rem] font-semibold leading-snug text-[#25D366] sm:text-xs">
              Te asesoramos aquí
            </p>
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
              : 'Abrir chat para cotizar: ¿Necesitas una cotización?'
          }
          className={cn(
            'relative flex size-12 items-center justify-center rounded-full transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-14',
            chatOpen
              ? 'bg-[#25d366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:bg-[#20bd5a] scale-105'
              : 'border-0 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.14)] hover:bg-white',
          )}
        >
          {chatOpen ? (
            <X className="size-7 text-white" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <HaibotAgentAvatar
              size="sm"
              showWhatsAppBadge
              className="pointer-events-none size-11 shrink-0 sm:size-12"
            />
          )}
        </button>
      </div>
    </div>
  );
}
