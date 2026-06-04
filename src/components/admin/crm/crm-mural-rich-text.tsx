import { Fragment } from 'react';

import { cn } from '@/lib/utils';

type Segment = { type: 'text'; value: string } | { type: 'bold'; value: string };

function parseBoldSegments(raw: string): Segment[] {
  const segments: Segment[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  for (const match of raw.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) {
      segments.push({ type: 'text', value: raw.slice(last, index) });
    }
    segments.push({ type: 'bold', value: match[1] });
    last = index + match[0].length;
  }
  if (last < raw.length) {
    segments.push({ type: 'text', value: raw.slice(last) });
  }
  return segments.length > 0 ? segments : [{ type: 'text', value: raw }];
}

/** Quita marcadores *negrita* para precios y números en pastillas azules. */
export function stripMuralMarkup(raw: string): string {
  return raw.replace(/\*/g, '');
}

interface CrmMuralRichTextProps {
  children: string;
  className?: string;
  as?: 'p' | 'span' | 'h3';
}

/** Texto tipo Mural: *negrita* y emoticones a color (clase text-emoji del contenedor). */
export function CrmMuralRichText({
  children,
  className,
  as: Tag = 'span',
}: CrmMuralRichTextProps) {
  const segments = parseBoldSegments(children);

  return (
    <Tag className={cn('whitespace-pre-wrap', className)}>
      {segments.map((segment, index) =>
        segment.type === 'bold' ? (
          <strong key={index} className="font-bold text-foreground">
            {segment.value}
          </strong>
        ) : (
          <Fragment key={index}>{segment.value}</Fragment>
        ),
      )}
    </Tag>
  );
}
