import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CheckoutSectionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function CheckoutSectionCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: CheckoutSectionCardProps) {
  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-600"
            aria-hidden="true"
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-pretty">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

interface CheckoutOptionCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description: string;
  badge?: string;
  badgeClassName?: string;
  icon: LucideIcon;
}

export function CheckoutOptionCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  badge,
  badgeClassName,
  icon: Icon,
}: CheckoutOptionCardProps) {
  const inputId = `${name}-${value}`;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors',
        'hover:border-red-600/40 hover:bg-muted/30',
        'focus-within:ring-2 focus-within:ring-red-600 focus-within:ring-offset-2 focus-within:ring-offset-background',
        checked ? 'border-red-600 bg-red-600/5 shadow-sm' : 'border-border bg-background',
      )}
    >
      <input
        id={inputId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="size-4 shrink-0 accent-red-600"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-foreground">{title}</span>
          {badge ? (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                badgeClassName ?? 'bg-emerald-100 text-emerald-800',
              )}
            >
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </label>
  );
}
