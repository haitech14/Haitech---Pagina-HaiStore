import { useState, type Dispatch, type SetStateAction } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Inbox,
  Radio,
  Settings,
  Tags,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MARKETING_INBOX_NAV } from '@/data/marketing-inbox-mock';
import { cn } from '@/lib/utils';
import type { MarketingNavIcon, MarketingNavItem } from '@/types/marketing-inbox';

const NAV_ICONS: Record<MarketingNavIcon, typeof Inbox> = {
  inbox: Inbox,
  users: Users,
  channels: Radio,
  attributes: Tags,
  settings: Settings,
};

interface MarketingInboxNavProps {
  activeSection: string;
  activeInboxView: string;
  onSectionChange: (section: string) => void;
  onInboxViewChange: (view: string) => void;
}

export function MarketingInboxNav({
  activeSection,
  activeInboxView,
  onSectionChange,
  onInboxViewChange,
}: MarketingInboxNavProps) {
  const [inboxOpen, setInboxOpen] = useState(true);

  return (
    <nav
      className="flex w-[13.5rem] shrink-0 flex-col border-r border-border bg-card"
      aria-label="Navegación de Marketing"
    >
      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {MARKETING_INBOX_NAV.map((item) => (
          <NavBlock
            key={item.id}
            item={item}
            inboxOpen={inboxOpen}
            setInboxOpen={setInboxOpen}
            activeSection={activeSection}
            activeInboxView={activeInboxView}
            onSectionChange={onSectionChange}
            onInboxViewChange={onInboxViewChange}
          />
        ))}
      </div>
      <div className="border-t border-border p-2">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'h-9 w-full justify-start gap-2 px-2 text-sm font-medium',
            activeSection === 'settings' && 'bg-blue-50 text-blue-700',
          )}
          onClick={() => onSectionChange('settings')}
        >
          <Settings className="size-4 shrink-0" aria-hidden="true" />
          Configuraciones
        </Button>
      </div>
    </nav>
  );
}

function NavBlock({
  item,
  inboxOpen,
  setInboxOpen,
  activeSection,
  activeInboxView,
  onSectionChange,
  onInboxViewChange,
}: {
  item: MarketingNavItem;
  inboxOpen: boolean;
  setInboxOpen: Dispatch<SetStateAction<boolean>>;
  activeSection: string;
  activeInboxView: string;
  onSectionChange: (section: string) => void;
  onInboxViewChange: (view: string) => void;
}) {
  const Icon = NAV_ICONS[item.icon];
  const hasChildren = (item.children?.length ?? 0) > 0;
  const isInbox = item.id === 'inbox';
  const isActiveSection = activeSection === item.id;

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        className={cn(
          'h-9 w-full justify-start gap-2 px-2 text-sm font-medium text-foreground',
          isActiveSection && !hasChildren && 'bg-blue-50 text-blue-700',
        )}
        onClick={() => {
          onSectionChange(item.id);
          if (isInbox) setInboxOpen((prev) => !prev);
        }}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">{item.label}</span>
        {hasChildren ? (
          inboxOpen ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )
        ) : null}
      </Button>
      {hasChildren && inboxOpen ? (
        <ul className="mb-1 ml-2 space-y-0.5 border-l border-border pl-2">
          {item.children?.map((child) => {
            const isActive = isInbox && activeInboxView === child.id;
            return (
              <li key={child.id}>
                <button
                  type="button"
                  className={cn(
                    'flex min-h-9 w-full items-center rounded-md px-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-blue-600 font-medium text-white'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => {
                    onSectionChange('inbox');
                    onInboxViewChange(child.id);
                  }}
                >
                  {child.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
