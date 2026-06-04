import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Bot, Send, X } from 'lucide-react';

import {
  createHaibotMessage,
  getHaibotAssistantReply,
  type HaibotChatMessage,
} from '@/lib/haibot-assistant';
import { HAIBOT_WELCOME_MESSAGE } from '@/lib/haibot-messages';
import {
  getHaibotQuickActionReply,
  getHaibotQuickActionUserMessage,
  HAIBOT_QUICK_ACTIONS,
  type HaibotQuickAction,
} from '@/lib/haibot-quick-actions';
import { cn } from '@/lib/utils';

function HaibotTypingBubble() {
  return (
    <div className="mr-auto flex max-w-[85%] flex-col gap-1">
      <div className="rounded-lg rounded-tl-sm bg-white px-3 py-2.5 shadow-sm">
        <div className="flex items-center gap-1" aria-hidden="true">
          <span className="size-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
          <span className="size-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
          <span className="size-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
        </div>
      </div>
      <span className="sr-only">Haibot está escribiendo</span>
    </div>
  );
}

function ChatBubble({ message }: { message: HaibotChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn('flex max-w-[88%] flex-col gap-0.5', isUser ? 'ml-auto items-end' : 'mr-auto items-start')}
    >
      <div
        className={cn(
          'whitespace-pre-wrap px-3 py-2 text-[0.8125rem] leading-relaxed shadow-sm',
          isUser
            ? 'rounded-lg rounded-tr-sm bg-[#d9fdd3] text-[#111b21]'
            : 'rounded-lg rounded-tl-sm bg-white text-[#111b21]',
        )}
      >
        {message.content}
      </div>
      <time
        className="px-1 text-[0.65rem] text-[#667781]"
        dateTime={message.time}
      >
        {message.time}
      </time>
    </div>
  );
}

interface HaibotChatPanelProps {
  open: boolean;
  onClose: () => void;
  onQuickAction: (action: HaibotQuickAction) => void;
}

export function HaibotChatPanel({ open, onClose, onQuickAction }: HaibotChatPanelProps) {
  const formId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<HaibotChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMessages([createHaibotMessage('assistant', HAIBOT_WELCOME_MESSAGE)]);
    setDraft('');
    setIsThinking(false);
  }, [open]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, isThinking, open]);

  const pushExchange = (userText: string, reply: string, afterReply?: () => void) => {
    setMessages((prev) => [...prev, createHaibotMessage('user', userText)]);
    setIsThinking(true);

    window.setTimeout(() => {
      setMessages((prev) => [...prev, createHaibotMessage('assistant', reply)]);
      setIsThinking(false);
      afterReply?.();
    }, 550);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isThinking) return;

    setDraft('');
    pushExchange(text, getHaibotAssistantReply(text));
  };

  const handleQuickAction = (action: HaibotQuickAction) => {
    if (isThinking) return;

    const userText = getHaibotQuickActionUserMessage(action.id);
    const reply = getHaibotQuickActionReply(action.id);

    pushExchange(userText, reply, () => {
      window.setTimeout(() => onQuickAction(action), 320);
    });
  };

  if (!open) return null;

  return (
    <section
      aria-label="Chat con Haibot"
      className="flex h-[min(70vh,32rem)] w-[min(calc(100vw-2rem),22rem)] flex-col overflow-hidden rounded-2xl bg-[#efeae2] shadow-[0_12px_40px_rgba(15,23,42,0.22)]"
    >
      <header className="flex shrink-0 items-center gap-3 bg-[#075e54] px-3 py-3 text-white">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
          <Bot className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Haibot</p>
          <p className="truncate text-xs text-white/80">
            {isThinking ? 'escribiendo…' : 'en línea · asistente HaiStore'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Cerrar chat con Haibot"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-3"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.04) 1px, transparent 0)',
          backgroundSize: '12px 12px',
        }}
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {isThinking ? <HaibotTypingBubble /> : null}
      </div>

      <div className="shrink-0 bg-[#f0f2f5] px-2 pb-2 pt-1">
        <div
          className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Opciones rápidas"
        >
          {HAIBOT_QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const isWhatsApp = action.accent === 'whatsapp';

            return (
              <button
                key={action.id}
                type="button"
                disabled={isThinking}
                onClick={() => handleQuickAction(action)}
                className={cn(
                  'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border bg-white px-3 text-xs font-medium shadow-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54] disabled:opacity-50',
                  isWhatsApp
                    ? 'border-green-200 text-green-800 hover:bg-green-50'
                    : 'border-neutral-200 text-[#111b21] hover:bg-neutral-50',
                )}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                {action.label}
              </button>
            );
          })}
        </div>

        <form id={formId} onSubmit={handleSubmit} className="flex items-end gap-2">
          <label htmlFor={`${formId}-input`} className="sr-only">
            Escribe un mensaje
          </label>
          <textarea
            id={`${formId}-input`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Mensaje"
            rows={1}
            disabled={isThinking}
            className="max-h-24 min-h-10 flex-1 resize-none rounded-3xl border-0 bg-white px-4 py-2.5 text-sm text-[#111b21] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54] disabled:opacity-60"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || isThinking}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#075e54] text-white transition-colors hover:bg-[#128c7e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54] focus-visible:ring-offset-2 disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            <Send className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
