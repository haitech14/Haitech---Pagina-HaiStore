import { CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ForumThreadKind } from '@/types/forum';

const KIND_LABELS: Record<ForumThreadKind, string> = {
  discussion: 'Debate',
  question: 'Pregunta',
  tutorial: 'Tutorial',
  firmware: 'Firmware',
};

const KIND_STYLES: Record<ForumThreadKind, string> = {
  discussion: 'bg-neutral-200 text-neutral-700',
  question: 'bg-red-100 text-red-800',
  tutorial: 'bg-neutral-800 text-white',
  firmware: 'bg-red-700/15 text-red-800',
};

interface ForumThreadKindBadgeProps {
  kind: ForumThreadKind;
  isSolved?: boolean;
  className?: string;
}

export function ForumThreadKindBadge({ kind, isSolved, className }: ForumThreadKindBadgeProps) {
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1.5', className)}>
      {kind !== 'discussion' ? (
        <span
          className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide sm:text-xs',
            KIND_STYLES[kind],
          )}
        >
          {KIND_LABELS[kind]}
        </span>
      ) : null}
      {kind === 'question' && isSolved ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-700 dark:text-emerald-400 sm:text-xs">
          <CheckCircle2 className="size-3" aria-hidden="true" />
          Resuelta
        </span>
      ) : null}
    </span>
  );
}
