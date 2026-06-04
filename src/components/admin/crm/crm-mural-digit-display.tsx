import { cn } from '@/lib/utils';

/** Segmento de texto o dígitos para réplica visual tipo Mural. */
type Segment = { type: 'text'; value: string } | { type: 'digits'; value: string };

function tokenizeForMuralDigits(raw: string): Segment[] {
  const segments: Segment[] = [];
  const re = /(\d[\d\s.,\-/]*\d|\d+)/g;
  let last = 0;
  for (const match of raw.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) {
      segments.push({ type: 'text', value: raw.slice(last, index) });
    }
    segments.push({ type: 'digits', value: match[0] });
    last = index + match[0].length;
  }
  if (last < raw.length) {
    segments.push({ type: 'text', value: raw.slice(last) });
  }
  return segments.length > 0 ? segments : [{ type: 'text', value: raw }];
}

interface CrmMuralDigitDisplayProps {
  value: string;
  className?: string;
  digitClassName?: string;
}

export function CrmMuralDigitDisplay({
  value,
  className,
  digitClassName,
}: CrmMuralDigitDisplayProps) {
  const segments = tokenizeForMuralDigits(value);

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-0.5', className)}>
      {segments.map((segment, index) =>
        segment.type === 'text' ? (
          <span key={`${index}-t`} className="whitespace-pre-wrap">
            {segment.value}
          </span>
        ) : (
          <span
            key={`${index}-d`}
            className="inline-flex flex-wrap gap-px"
            aria-label={segment.value.replace(/\s/g, '')}
          >
            {segment.value.split('').map((char, charIndex) =>
              /\d/.test(char) ? (
                <span
                  key={charIndex}
                  className={cn(
                    'inline-flex min-w-[1.05rem] items-center justify-center rounded-sm bg-sky-600 px-0.5 py-px text-[0.65rem] font-bold leading-none text-white tabular-nums',
                    digitClassName,
                  )}
                >
                  {char}
                </span>
              ) : (
                <span key={charIndex} className="px-px text-muted-foreground">
                  {char}
                </span>
              ),
            )}
          </span>
        ),
      )}
    </span>
  );
}

interface CrmMuralPriceBadgesProps {
  priceLabel: string;
  className?: string;
}

/** Precios tipo "$ 900 o S/ 4,000" en pastillas azules como Mural. */
export function CrmMuralPriceBadges({ priceLabel, className }: CrmMuralPriceBadgesProps) {
  const parts = priceLabel.split(/\s+o\s+/i).map((p) => p.trim());

  if (parts.length <= 1) {
    return (
      <p className={cn('mt-2', className)}>
        <span className="inline-flex rounded-md bg-sky-600 px-2 py-1 text-xs font-bold text-white tabular-nums">
          {priceLabel}
        </span>
      </p>
    );
  }

  return (
    <p className={cn('mt-2 flex flex-wrap items-center gap-1.5', className)}>
      {parts.map((part, index) => (
        <span key={part} className="inline-flex items-center gap-1.5">
          {index > 0 ? <span className="text-xs font-medium text-muted-foreground">o</span> : null}
          <span className="inline-flex rounded-md bg-sky-600 px-2 py-1 text-xs font-bold text-white tabular-nums">
            {part}
          </span>
        </span>
      ))}
    </p>
  );
}
