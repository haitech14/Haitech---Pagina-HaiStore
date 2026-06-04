import { useState } from 'react';

import { MarketingChannelsPanel } from '@/components/admin/marketing/marketing-channels-panel';
import { MarketingConversationList } from '@/components/admin/marketing/marketing-conversation-list';
import { MarketingHelpBanner } from '@/components/admin/marketing/marketing-help-banner';
import { MarketingInboxNav } from '@/components/admin/marketing/marketing-inbox-nav';

export function MarketingInboxView() {
  const [activeSection, setActiveSection] = useState('inbox');
  const [inboxView, setInboxView] = useState('assigned');

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      <MarketingHelpBanner />
      <div className="flex min-h-0 flex-1">
        <MarketingInboxNav
          activeSection={activeSection}
          activeInboxView={inboxView}
          onSectionChange={setActiveSection}
          onInboxViewChange={setInboxView}
        />
        <MarketingConversationList inboxView={inboxView} />
        <MarketingChannelsPanel />
      </div>
    </div>
  );
}
