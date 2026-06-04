import { MarketingInboxView } from '@/components/admin/marketing/marketing-inbox-view';

export function AdminMarketingPage() {
  return (
    <div className="-mx-4 -mt-4 flex min-h-[calc(100dvh-3.5rem)] flex-col sm:-mx-6 sm:-mt-6">
      <MarketingInboxView />
    </div>
  );
}
