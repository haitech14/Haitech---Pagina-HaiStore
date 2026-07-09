import { useState } from 'react';

import { BandejaConversationPanel } from '@/components/admin/bandeja/bandeja-conversation-panel';
import { BandejaKpis } from '@/components/admin/bandeja/bandeja-kpis';
import { BandejaPageHeader } from '@/components/admin/bandeja/bandeja-page-header';
import { BandejaTablePanel } from '@/components/admin/bandeja/bandeja-table-panel';
import { BandejaWidgets } from '@/components/admin/bandeja/bandeja-widgets';
import { BANDEJA_CONVERSATIONS } from '@/data/bandeja-mock';

export function BandejaDashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(BANDEJA_CONVERSATIONS[0]?.id ?? null);

  return (
    <div className="space-y-3">
      <BandejaPageHeader onSelectConversation={setSelectedId} />
      <BandejaKpis />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)_15rem]">
        <BandejaTablePanel selectedId={selectedId} onSelect={setSelectedId} />
        <BandejaConversationPanel conversationId={selectedId} />
        <BandejaWidgets />
      </div>
    </div>
  );
}
