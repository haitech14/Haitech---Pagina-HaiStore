import { Link } from 'react-router-dom';

import { HEADER_FORUM_LABEL, HEADER_FORUM_PATH } from '@/data/site-header';
import { cn } from '@/lib/utils';

type HeaderForumButtonProps = {
  className?: string;
};

export function HeaderForumButton({ className }: HeaderForumButtonProps) {
  return (
    <Link
      to={HEADER_FORUM_PATH}
      className={cn(
        'inline-flex shrink-0 items-center rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm',
        'transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
        className,
      )}
    >
      {HEADER_FORUM_LABEL}
    </Link>
  );
}
