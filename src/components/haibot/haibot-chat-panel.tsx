import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X } from 'lucide-react';

import { HaibotAgentAvatar } from '@/components/haibot/haibot-agent-avatar';
import { HaibotSalesWorkflow } from '@/components/haibot/haibot-sales-workflow';
import { HaibotShippingWorkflow } from '@/components/haibot/haibot-shipping-workflow';
import { HaibotSupportWorkflow } from '@/components/haibot/haibot-support-workflow';
import {
  createHaibotMessage,
  getHaibotAssistantReply,
  type HaibotChatMessage,
} from '@/lib/haibot-assistant';
import {
  formatHaibotInventorySearchReply,
  getHaibotSearchPlaceholder,
  resolveHaibotInventorySearch,
  type HaibotSearchFocus,
} from '@/lib/haibot-inventory-search';
import { buildHaibotWhatsAppUrl, HAIBOT_WELCOME_MESSAGE } from '@/lib/haibot-messages';
import {
  getHaibotQuickActionReply,
  getHaibotQuickActionUserMessage,
  HAIBOT_PRIMARY_ACTIONS,
  HAIBOT_SECONDARY_ACTIONS,
  isHaibotSearchAction,
  isHaibotWorkflowAction,
  type HaibotQuickAction,
  type HaibotWorkflowId,
} from '@/lib/haibot-quick-actions';
import { searchCatalogProducts } from '@/lib/catalog-search-api';
import { cn } from '@/lib/utils';

const SEARCH_MODE_LABELS: Record<HaibotSearchFocus, string> = {
  all: 'buscar',
  price: 'cotización',
  stock: 'stock',
};

const WORKFLOW_MODE_LABELS: Record<HaibotWorkflowId, string> = {
  support: 'soporte',
  shipping: 'envíos',
  sales: 'ventas',
};

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
}

export function HaibotChatPanel({ open, onClose }: HaibotChatPanelProps) {
  const navigate = useNavigate();
  const formId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<HaibotChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [searchFocus, setSearchFocus] = useState<HaibotSearchFocus | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<HaibotWorkflowId | null>(null);

  useEffect(() => {
    if (!open) return;
    setMessages([createHaibotMessage('assistant', HAIBOT_WELCOME_MESSAGE)]);
    setDraft('');
    setIsThinking(false);
    setSearchFocus(null);
    setActiveWorkflow(null);
  }, [open]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, isThinking, open, activeWorkflow]);

  const replyAfterDelay = (reply: string, delay = 550) => {
    window.setTimeout(() => {
      setMessages((prev) => [...prev, createHaibotMessage('assistant', reply)]);
      setIsThinking(false);
    }, delay);
  };

  const buildReply = async (text: string): Promise<string> => {
    const search = resolveHaibotInventorySearch(text, [], searchFocus);
    if (search) {
      try {
        const { products: matches } = await searchCatalogProducts(search.query, { limit: 50 });
        return formatHaibotInventorySearchReply(search.query, matches, search.focus);
      } catch {
        return 'No pude consultar el inventario en este momento. Inténtalo de nuevo.';
      }
    }

    return getHaibotAssistantReply(text);
  };

  const submitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking || activeWorkflow) return;

    setDraft('');
    setMessages((prev) => [...prev, createHaibotMessage('user', trimmed)]);
    setIsThinking(true);

    const searchIntent = resolveHaibotInventorySearch(trimmed, [], searchFocus);
    const delay = searchIntent ? 320 : 550;
    void buildReply(trimmed).then((reply) => replyAfterDelay(reply, delay));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitText(draft);
  };

  const appendWorkflowHint = (actionId: string) => {
    setMessages((prev) => [
      ...prev,
      createHaibotMessage('user', getHaibotQuickActionUserMessage(actionId)),
      createHaibotMessage('assistant', getHaibotQuickActionReply(actionId)),
    ]);
  };

  const handleQuickAction = (action: HaibotQuickAction) => {
    if (isThinking) return;

    if (action.kind === 'navigate') {
      onClose();
      void navigate(action.to);
      return;
    }

    if (action.kind === 'whatsapp') {
      window.open(buildHaibotWhatsAppUrl(action.intent), '_blank', 'noopener,noreferrer');
      setMessages((prev) => [
        ...prev,
        createHaibotMessage('user', getHaibotQuickActionUserMessage(action.id)),
        createHaibotMessage('assistant', getHaibotQuickActionReply(action.id)),
      ]);
      return;
    }

    if (isHaibotWorkflowAction(action)) {
      const next = activeWorkflow === action.workflow ? null : action.workflow;
      setActiveWorkflow(next);
      setSearchFocus(null);
      if (next) appendWorkflowHint(action.id);
      return;
    }

    if (isHaibotSearchAction(action)) {
      setActiveWorkflow(null);
      setSearchFocus((current) => (current === action.focus ? null : action.focus));
      inputRef.current?.focus();
    }
  };

  const isPrimarySelected = (action: HaibotQuickAction): boolean => {
    if (isHaibotSearchAction(action)) return searchFocus === action.focus && !activeWorkflow;
    if (isHaibotWorkflowAction(action)) return activeWorkflow === action.workflow;
    return false;
  };

  const statusLabel = (() => {
    if (isThinking) return 'escribiendo…';
    if (activeWorkflow) return `modo ${WORKFLOW_MODE_LABELS[activeWorkflow]}`;
    if (searchFocus) return `modo ${SEARCH_MODE_LABELS[searchFocus]} · inventario`;
    return 'en línea · asistente HaiStore';
  })();

  if (!open) return null;

  return (
    <section
      aria-label="Chat con Haibot"
      className="flex h-[min(70vh,32rem)] w-[min(calc(100vw-2rem),22rem)] flex-col overflow-hidden rounded-2xl bg-[#efeae2] shadow-[0_12px_40px_rgba(15,23,42,0.22)]"
    >
      <header className="flex shrink-0 items-center gap-3 bg-[#075e54] px-3 py-3 text-white">
        <HaibotAgentAvatar size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Haibot</p>
          <p className="truncate text-xs text-white/80">{statusLabel}</p>
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

      <div className="shrink-0 bg-[#f0f2f5] px-2 pb-2 pt-2">
        <div
          className="mb-2 overflow-x-auto rounded-xl bg-[#e9edef] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="toolbar"
          aria-label="Acciones rápidas"
        >
          <div className="flex min-w-min items-stretch gap-1">
            <div className="flex gap-1" role="radiogroup" aria-label="Modo de consulta">
              {HAIBOT_PRIMARY_ACTIONS.map((action) => {
                const Icon = action.icon;
                const isSelected = isPrimarySelected(action);

                return (
                  <button
                    key={action.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isThinking}
                    onClick={() => handleQuickAction(action)}
                    className={cn(
                      'inline-flex min-h-10 min-w-[4.25rem] items-center justify-center gap-1 rounded-lg px-2 py-2 text-[0.68rem] font-semibold transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54] focus-visible:ring-offset-1',
                      'disabled:pointer-events-none disabled:opacity-50',
                      isSelected
                        ? 'bg-white text-[#075e54] shadow-sm ring-1 ring-[#075e54]/20'
                        : 'text-[#54656f] hover:bg-white/70 hover:text-[#3b4a54]',
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                    {action.label}
                  </button>
                );
              })}
            </div>

            <div aria-hidden="true" className="my-1.5 w-px shrink-0 self-stretch bg-[#cfd4d8]" />

            {HAIBOT_SECONDARY_ACTIONS.map((action) => {
              const Icon = action.icon;
              const isWhatsapp = action.accent === 'whatsapp';

              return (
                <button
                  key={action.id}
                  type="button"
                  disabled={isThinking}
                  onClick={() => handleQuickAction(action)}
                  className={cn(
                    'inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-[0.7rem] font-semibold transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54] focus-visible:ring-offset-1',
                    'disabled:pointer-events-none disabled:opacity-50',
                    isWhatsapp
                      ? 'bg-[#dcf8c6] text-[#075e54] ring-1 ring-[#25d366]/25 hover:bg-[#c8f0b4]'
                      : 'text-[#54656f] hover:bg-white/70 hover:text-[#3b4a54]',
                  )}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeWorkflow === 'support' ? (
          <HaibotSupportWorkflow disabled={isThinking} />
        ) : activeWorkflow === 'shipping' ? (
          <HaibotShippingWorkflow disabled={isThinking} />
        ) : activeWorkflow === 'sales' ? (
          <HaibotSalesWorkflow onClose={onClose} />
        ) : (
          <form id={formId} onSubmit={handleSubmit} className="flex items-end gap-2">
            <label htmlFor={`${formId}-input`} className="sr-only">
              Escribe un mensaje
            </label>
            <textarea
              ref={inputRef}
              id={`${formId}-input`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={getHaibotSearchPlaceholder(searchFocus)}
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
        )}
      </div>
    </section>
  );
}
