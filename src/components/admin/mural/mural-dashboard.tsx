import { useState } from 'react';

import { MuralFeedPanel } from '@/components/admin/mural/mural-feed-panel';
import { MuralKpis } from '@/components/admin/mural/mural-kpis';
import { MuralPageHeader } from '@/components/admin/mural/mural-page-header';
import { MuralWidgets } from '@/components/admin/mural/mural-widgets';
import { MURAL_BLOG_POSTS } from '@/data/mural-blog-mock';

export function MuralDashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(MURAL_BLOG_POSTS[0]?.id ?? null);

  return (
    <div className="space-y-3">
      <MuralPageHeader onSelectPost={setSelectedId} />
      <MuralKpis />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_15rem]">
        <MuralFeedPanel selectedId={selectedId} onSelect={setSelectedId} />
        <MuralWidgets />
      </div>
    </div>
  );
}
