import { AccountDropdown } from '@/components/layout/account-dropdown';
import { cn } from '@/lib/utils';

interface AdminSidebarProfileProps {
  className?: string;
}

export function AdminSidebarProfile({ className }: AdminSidebarProfileProps) {
  return (
    <div className={cn('border-t border-[hsl(var(--admin-sidebar-border))]/50 px-3 py-2', className)}>
      <AccountDropdown
        triggerVariant="sidebar"
        tone="light"
        menuSide="top"
        menuAlign="start"
      />
    </div>
  );
}
