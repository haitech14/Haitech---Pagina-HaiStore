import type { ReactNode } from 'react';
import { Cell, Pie, PieChart } from 'recharts';

import { BandejaChannelBadge, BandejaPriorityBadge } from '@/components/admin/bandeja/bandeja-badges';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  BANDEJA_CHANNEL_STATS,
  BANDEJA_CHANNEL_TOTAL,
  BANDEJA_SLA_TARGET,
  BANDEJA_SLA_TEAMS,
  BANDEJA_URGENT_ITEMS,
} from '@/data/bandeja-mock';
import { cn } from '@/lib/utils';

const channelChartConfig = Object.fromEntries(
  BANDEJA_CHANNEL_STATS.map((item) => [
    item.channel,
    { label: item.label, color: item.color },
  ]),
);

function WidgetCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn('rounded-lg border border-border/60 bg-card p-3 shadow-sm', className)}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <h2 className="text-xs font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function BandejaWidgets() {
  const donutData = BANDEJA_CHANNEL_STATS.map((item) => ({
    name: item.label,
    value: item.count,
    fill: item.color,
    key: item.channel,
  }));

  return (
    <div className="space-y-3">
      <WidgetCard title="Mensajes por canal">
        <div className="flex flex-col items-center gap-3">
          <div className="relative mx-auto w-full max-w-[9.5rem]">
            <ChartContainer config={channelChartConfig} className="mx-auto aspect-square h-[9.5rem]">
              <PieChart aria-label="Distribución de mensajes por canal">
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={64}
                  strokeWidth={2}
                  stroke="hsl(var(--card))"
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-foreground">{BANDEJA_CHANNEL_TOTAL}</span>
              <span className="text-[0.625rem] text-muted-foreground">Total</span>
            </div>
          </div>

          <ul className="w-full space-y-2">
            {BANDEJA_CHANNEL_STATS.map((item) => (
              <li key={item.channel} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-muted-foreground">{item.label}</span>
                </div>
                <span className="shrink-0 font-semibold text-foreground">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </WidgetCard>

      <WidgetCard title="SLA por equipo">
        <div className="space-y-3">
          {BANDEJA_SLA_TEAMS.map((team) => (
            <div key={team.team}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{team.team}</span>
                <span className="font-semibold text-foreground">{team.percent}%</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${team.percent}%`, backgroundColor: team.color }}
                />
                <div
                  className="absolute inset-y-0 w-px bg-foreground/30"
                  style={{ left: `${BANDEJA_SLA_TARGET}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
          <p className="text-[0.625rem] text-muted-foreground">Meta SLA: {BANDEJA_SLA_TARGET}%</p>
        </div>
      </WidgetCard>

      <WidgetCard title="Conversaciones urgentes">
        <ul className="space-y-2.5">
          {BANDEJA_URGENT_ITEMS.map((item) => (
            <li key={item.id} className="rounded-md border border-border/50 p-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <BandejaChannelBadge channel={item.channel} showLabel={false} />
                    <span className="truncate text-xs font-medium text-foreground">{item.name}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[0.6875rem] text-muted-foreground">
                    {item.issue}
                  </p>
                  <p className="mt-1 text-[0.625rem] text-muted-foreground">{item.time}</p>
                </div>
                <BandejaPriorityBadge priority={item.priority} />
              </div>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <footer className="flex items-center justify-between px-1 text-[0.625rem] text-muted-foreground">
        <span>Actualizado: hace 1 minuto</span>
        <button type="button" className="font-medium text-[hsl(var(--admin-accent))] hover:underline">
          Actualizar
        </button>
      </footer>
    </div>
  );
}
