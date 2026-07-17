import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, X } from 'lucide-react';

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

function HaibotBotChoiceButtons({
  actions,
  onSelect,
}: {
  actions: readonly HaibotQuickAction[];
  onSelect: (action: HaibotQuickAction) => void;
}) {
  return (
    <div
      className="mr-auto flex w-full max-w-[88%] flex-col gap-1"
      role="group"
      aria-label="Opciones de Haibot"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelect(action)}
            className={cn(
              'inline-flex min-h-8 w-full items-center gap-2 rounded-lg border border-[#d1d7db] bg-white px-2.5 py-1.5 text-left text-xs font-semibold text-[#111b21] shadow-sm',
              'transition-colors hover:border-[#075e54]/35 hover:bg-[#f0faf8]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54] focus-visible:ring-offset-1',
            )}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e7f5f3] text-[#075e54]">
              <Icon className="size-3" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">{action.label}</span>
            <span className="text-[0.6875rem] text-[#8696a0]" aria-hidden="true">
              →
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface HaibotChatPanelProps {
  onClose: () => void;
}

export function HaibotChatPanel({ onClose }: HaibotChatPanelProps) {
  const navigate = useNavigate();
  const formId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<HaibotChatMessage[]>(() => [
    createHaibotMessage('assistant', HAIBOT_WELCOME_MESSAGE),
  ]);
  const [searchFocus, setSearchFocus] = useState<HaibotSearchFocus | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<HaibotWorkflowId | null>(null);
  const [showMenu, setShowMenu] = useState(true);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, activeWorkflow, showMenu]);

  const buildReply = async (
    text: string,
  ): Promise<{ reply: string; openWorkflow?: HaibotWorkflowId; openSearch?: HaibotSearchFocus }> => {
    // Citas / soporte técnico tienen prioridad sobre el modo buscador activo.
    const assistantFirst = getHaibotAssistantReply(text);
    if (assistantFirst.openWorkflow === 'support') {
      return assistantFirst;
    }

    const search = resolveHaibotInventorySearch(text, [], searchFocus);
    if (search) {
      try {
        const { products: matches } = await searchCatalogProducts(search.query, { limit: 50 });
        return {
          reply: formatHaibotInventorySearchReply(search.query, matches, search.focus),
        };
      } catch {
        return { reply: 'No pude consultar el inventario en este momento. Inténtalo de nuevo.' };
      }
    }

    return assistantFirst;
  };

  const submitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || activeWorkflow) return;

    setDraft('');
    setShowMenu(false);
    setMessages((prev) => [...prev, createHaibotMessage('user', trimmed)]);

    void buildReply(trimmed).then((result) => {
      setMessages((prev) => [...prev, createHaibotMessage('assistant', result.reply)]);
      if (result.openWorkflow) {
        setActiveWorkflow(result.openWorkflow);
        setSearchFocus(null);
        setShowMenu(false);
      } else if (result.openSearch) {
        setActiveWorkflow(null);
        setSearchFocus(result.openSearch);
        setShowMenu(false);
        inputRef.current?.focus();
      }
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitText(draft);
  };

  const appendActionMessages = (actionId: string) => {
    setMessages((prev) => [
      ...prev,
      createHaibotMessage('user', getHaibotQuickActionUserMessage(actionId)),
      createHaibotMessage('assistant', getHaibotQuickActionReply(actionId)),
    ]);
  };

  const returnToMenu = () => {
    setActiveWorkflow(null);
    setSearchFocus(null);
    setShowMenu(true);
    setMessages((prev) => [
      ...prev,
      createHaibotMessage('assistant', '¿Qué deseas hacer? Elige una opción para continuar:'),
    ]);
  };

  const handleQuickAction = (action: HaibotQuickAction) => {
    if (action.kind === 'navigate') {
      onClose();
      void navigate(action.to);
      return;
    }

    if (action.kind === 'whatsapp') {
      window.open(buildHaibotWhatsAppUrl(action.intent), '_blank', 'noopener,noreferrer');
      appendActionMessages(action.id);
      setShowMenu(false);
      return;
    }

    if (isHaibotWorkflowAction(action)) {
      setActiveWorkflow(action.workflow);
      setSearchFocus(null);
      setShowMenu(false);
      appendActionMessages(action.id);
      return;
    }

    if (isHaibotSearchAction(action)) {
      setActiveWorkflow(null);
      setSearchFocus(action.focus);
      setShowMenu(false);
      appendActionMessages(action.id);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const statusLabel = (() => {
    if (activeWorkflow) return `modo ${WORKFLOW_MODE_LABELS[activeWorkflow]}`;
    if (searchFocus) return `modo ${SEARCH_MODE_LABELS[searchFocus]} · inventario`;
    return 'en línea · asistente HaiStore';
  })();

  const inGuidedMode = Boolean(activeWorkflow || searchFocus);

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

        {showMenu && !inGuidedMode ? (
          <>
            <HaibotBotChoiceButtons
              actions={HAIBOT_PRIMARY_ACTIONS}
              onSelect={handleQuickAction}
            />
            <div className="mr-auto flex max-w-[88%] flex-wrap gap-1.5 pt-0.5">
              {HAIBOT_SECONDARY_ACTIONS.filter((action) => action.accent === 'whatsapp').map(
                (action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleQuickAction(action)}
                      className={cn(
                        'inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#c8f0b4] bg-[#dcf8c6] px-2.5 py-1 text-[0.7rem] font-semibold text-[#075e54]',
                        'transition-colors hover:bg-[#c8f0b4]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54]',
                      )}
                    >
                      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                      {action.label}
                    </button>
                  );
                },
              )}
            </div>
          </>
        ) : null}
      </div>

      <div className="shrink-0 bg-[#f0f2f5] px-2 pb-2 pt-2">
        {inGuidedMode ? (
          <button
            type="button"
            onClick={returnToMenu}
            className="mb-2 inline-flex min-h-8 items-center gap-1 rounded-full px-2 text-xs font-semibold text-[#075e54] transition-colors hover:bg-[#e7f5f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54]"
          >
            <ChevronLeft className="size-3.5" aria-hidden="true" />
            Menú
          </button>
        ) : null}

        {activeWorkflow === 'support' ? (
          <HaibotSupportWorkflow />
        ) : activeWorkflow === 'shipping' ? (
          <HaibotShippingWorkflow />
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
              className="max-h-24 min-h-10 flex-1 resize-none rounded-3xl border-0 bg-white px-4 py-2.5 text-sm text-[#111b21] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54]"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button
              type="submit"
              disabled={!draft.trim()}
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
