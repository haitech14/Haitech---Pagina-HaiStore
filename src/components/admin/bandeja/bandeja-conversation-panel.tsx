import { useState } from 'react';
import {
  ExternalLink,
  Image,
  Link2,
  Paperclip,
  Phone,
  Send,
  Smile,
  User,
} from 'lucide-react';

import { BandejaChannelBadge } from '@/components/admin/bandeja/bandeja-badges';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BANDEJA_CONVERSATIONS } from '@/data/bandeja-mock';
import { cn } from '@/lib/utils';
import type { BandejaConversation } from '@/types/bandeja';

interface BandejaConversationPanelProps {
  conversationId: string | null;
  conversations?: BandejaConversation[];
}

export function BandejaConversationPanel({
  conversationId,
  conversations = BANDEJA_CONVERSATIONS,
}: BandejaConversationPanelProps) {
  const [replyMode, setReplyMode] = useState<'respuesta' | 'nota'>('respuesta');
  const [draft, setDraft] = useState('');

  const conversation =
    conversations.find((item) => item.id === conversationId) ?? conversations[0] ?? null;

  if (!conversation) {
    return (
      <section className="flex min-h-[28rem] items-center justify-center rounded-lg border border-border/60 bg-card p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Selecciona una conversación para ver el detalle.</p>
      </section>
    );
  }

  return (
    <section className="flex min-h-[28rem] flex-col overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
      <header className="border-b px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-foreground">
                {conversation.senderName}
              </h2>
              {conversation.frequentCustomer ? (
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-amber-700">
                  Cliente frecuente
                </span>
              ) : null}
            </div>
            {conversation.phone ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{conversation.phone}</p>
            ) : (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {conversation.senderContact}
              </p>
            )}
            <div className="mt-2">
              <BandejaChannelBadge channel={conversation.channel} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Llamar">
              <Phone className="size-4" aria-hidden="true" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Ver perfil">
              <User className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Abrir en nueva ventana"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {conversation.orderRef ? (
          <article className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="text-xs font-semibold text-foreground">
              Pedido #{conversation.orderRef.number}
            </p>
            <p className="mt-1 text-[0.6875rem] text-muted-foreground">
              {conversation.orderRef.date} · {conversation.orderRef.total}
            </p>
          </article>
        ) : null}

        {conversation.messages.map((message) => {
          const isAgent = message.author === 'agent';
          return (
            <div
              key={message.id}
              className={cn('flex', isAgent ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
                  isAgent
                    ? 'rounded-br-md bg-sky-100 text-sky-950'
                    : 'rounded-bl-md bg-muted text-foreground',
                )}
              >
                <p>{message.text}</p>
                <p className="mt-1 text-[0.625rem] text-muted-foreground">{message.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="border-t p-3">
        <div className="mb-2 flex gap-1" role="tablist" aria-label="Tipo de mensaje">
          {(['respuesta', 'nota'] as const).map((mode) => {
            const isActive = replyMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[hsl(var(--admin-accent))] text-white'
                    : 'text-muted-foreground hover:bg-muted',
                )}
                onClick={() => setReplyMode(mode)}
              >
                {mode === 'respuesta' ? 'Respuesta' : 'Nota interna'}
              </button>
            );
          })}
        </div>

        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={
            replyMode === 'respuesta' ? 'Escribe tu respuesta…' : 'Escribe una nota interna…'
          }
          className="min-h-[4.5rem] resize-none text-xs"
          aria-label={replyMode === 'respuesta' ? 'Respuesta al cliente' : 'Nota interna'}
        />

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5">
            <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Emoji">
              <Smile className="size-4" aria-hidden="true" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Adjuntar archivo">
              <Paperclip className="size-4" aria-hidden="true" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Insertar enlace">
              <Link2 className="size-4" aria-hidden="true" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Insertar imagen">
              <Image className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <Button
            type="button"
            className="h-8 gap-1.5 bg-[hsl(var(--admin-accent))] px-3 text-xs hover:bg-[hsl(var(--admin-accent-hover))]"
            onClick={() => setDraft('')}
          >
            <Send className="size-3.5" aria-hidden="true" />
            Enviar
          </Button>
        </div>
      </footer>
    </section>
  );
}
