import { Icon } from '@mdi/react';
import { mdiWhatsapp } from '@mdi/js';

import { HAIBOT_AGENT_AVATAR, HAIBOT_AGENT_AVATAR_ALT } from '@/data/haibot-agent';
import { cn } from '@/lib/utils';

interface HaibotAgentAvatarProps {
  size?: 'xs' | 'sm' | 'lg';
  showWhatsAppBadge?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'size-8',
  sm: 'size-10',
  lg: 'size-14',
} as const;

const badgeSizeClasses = {
  xs: 'size-3.5 [&_svg]:scale-[0.65]',
  sm: 'size-4 [&_svg]:scale-75',
  lg: 'size-5',
} as const;

const badgeIconScale = {
  xs: 0.42,
  sm: 0.55,
  lg: 0.55,
} as const;

export function HaibotAgentAvatar({
  size = 'sm',
  showWhatsAppBadge = false,
  className,
}: HaibotAgentAvatarProps) {
  return (
    <span
      className={cn('relative inline-flex shrink-0', sizeClasses[size], className)}
    >
      <img
        src={HAIBOT_AGENT_AVATAR}
        alt={HAIBOT_AGENT_AVATAR_ALT}
        className="size-full rounded-full border-0 object-cover object-[center_15%] shadow-sm"
        loading="lazy"
      />
      {showWhatsAppBadge ? (
        <span
          aria-hidden="true"
          className={cn(
            'absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-[#25d366] text-white ring-2 ring-white',
            badgeSizeClasses[size],
          )}
        >
          <Icon path={mdiWhatsapp} size={badgeIconScale[size]} />
        </span>
      ) : null}
    </span>
  );
}
