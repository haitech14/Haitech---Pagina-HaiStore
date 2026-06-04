import { useState } from 'react';
import { MessageCircle, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MARKETING_CHANNELS, MARKETING_ONBOARDING } from '@/data/marketing-inbox-mock';
import { cn } from '@/lib/utils';
import type { MarketingChannel } from '@/types/marketing-inbox';

export function MarketingChannelsPanel() {
  const [connectOpen, setConnectOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<MarketingChannel | null>(null);

  const openConnect = (channel: MarketingChannel) => {
    if (!channel.available) return;
    setSelectedChannel(channel);
    setConnectOpen(true);
  };

  return (
    <>
      <section
        className="relative flex min-w-0 flex-1 flex-col bg-background"
        aria-label="Conectar canales de mensajería"
      >
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
          <div className="w-full max-w-2xl text-center">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {MARKETING_ONBOARDING.title}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {MARKETING_ONBOARDING.description}
            </p>
          </div>

          <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            {MARKETING_CHANNELS.map((channel) => (
              <button
                key={channel.id}
                type="button"
                disabled={!channel.available}
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  channel.available
                    ? 'hover:border-blue-200 hover:bg-blue-50/40'
                    : 'cursor-not-allowed opacity-70',
                )}
                onClick={() => openConnect(channel)}
              >
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    channel.brandClass,
                  )}
                  aria-hidden="true"
                >
                  {channel.monogram}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{channel.name}</span>
                  <span className="block text-xs text-muted-foreground">{channel.subtitle}</span>
                </span>
              </button>
            ))}
          </div>

          <Button
            type="button"
            className="mt-8 gap-2 bg-blue-600 px-6 text-white hover:bg-blue-500"
            onClick={() => {
              const first = MARKETING_CHANNELS.find((c) => c.available);
              if (first) openConnect(first);
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            Conecta tu primer canal
          </Button>
        </div>

        <Button
          type="button"
          size="icon"
          className="absolute bottom-6 right-6 size-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 focus-visible:ring-blue-600"
          aria-label="Abrir chat de ayuda"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
        </Button>
      </section>

      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Conectar {selectedChannel?.name ?? 'canal'}
            </DialogTitle>
            <DialogDescription>
              La integración con {selectedChannel?.name ?? 'este canal'} se configurará en una
              próxima versión. Mientras tanto puedes explorar la bandeja y el inbox.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConnectOpen(false)}>
              Cerrar
            </Button>
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-500"
              onClick={() => setConnectOpen(false)}
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
