import { AccountDropdown } from '@/components/layout/account-dropdown';
import { cn } from '@/lib/utils';

interface AdminTopBarUserMenuProps {
  className?: string;
}

export function AdminTopBarUserMenu({ className }: AdminTopBarUserMenuProps) {
  return (
    <AccountDropdown
      triggerVariant="profile"
      tone="light"
      className={cn('flex items-center', className)}
    />
  );
}
