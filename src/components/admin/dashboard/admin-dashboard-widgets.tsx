import { useState, type ReactNode } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CircleCheck,
  Headset,
  Package,
  ShoppingBag,
  UserPlus,
} from 'lucide-react';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ADMIN_DASHBOARD_MAX_TECHNICIAN_LOAD,
  ADMIN_DASHBOARD_MONTHLY_SALES,
  ADMIN_DASHBOARD_PENDING_TASKS,
  ADMIN_DASHBOARD_PRIORITY_DISTRIBUTION,
  ADMIN_DASHBOARD_RECENT_ACTIVITY,
  ADMIN_DASHBOARD_SLA_CURRENT,
  ADMIN_DASHBOARD_STATUS_DISTRIBUTION,
  ADMIN_DASHBOARD_STATUS_TOTAL,
  ADMIN_DASHBOARD_TECHNICIAN_LOAD,
  ADMIN_DASHBOARD_TOP_CLIENTS,
  ADMIN_DASHBOARD_TOP_PRODUCTS,
  ADMIN_DASHBOARD_WEEKLY_SLA,
  formatDashboardCurrency,
} from '@/data/admin-dashboard-data';
import { cn } from '@/lib/utils';
import type {
  AdminDashboardActivityType,
  AdminDashboardPriority,
} from '@/types/admin-dashboard';

const statusChartConfig = {
  pendiente: { label: 'Pendiente', color: '#3B82F6' },
  en_proceso: { label: 'En proceso', color: '#F59E0B' },
  resuelto: { label: 'Resuelto', color: '#22C55E' },
  cancelado: { label: 'Cancelado', color: '#94A3B8' },
};

const salesChartConfig = {
  value: { label: 'Ventas', color: 'hsl(var(--admin-accent))' },
};

const weeklySlaChartConfig = {
  value: { label: 'SLA', color: 'hsl(var(--admin-accent))' },
};

const priorityStyles: Record<AdminDashboardPriority, string> = {
  alta: 'bg-red-50 text-red-700 ring-red-200/60',
  media: 'bg-amber-50 text-amber-700 ring-amber-200/60',
  baja: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
};

const priorityLabels: Record<AdminDashboardPriority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

const activityIcons: Record<AdminDashboardActivityType, typeof Headset> = {
  'ticket-new': Headset,
  order: ShoppingBag,
  'ticket-resolved': CircleCheck,
  'client-new': UserPlus,
  'product-updated': Package,
};

const activityIconStyles: Record<AdminDashboardActivityType, string> = {
  'ticket-new': 'bg-blue-50 text-blue-600',
  order: 'bg-emerald-50 text-emerald-600',
  'ticket-resolved': 'bg-green-50 text-green-600',
  'client-new': 'bg-violet-50 text-violet-600',
  'product-updated': 'bg-amber-50 text-amber-600',
};

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
      className={cn(
        'rounded-xl border border-border/60 bg-card p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function formatSalesTick(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

export function AdminDashboardChartsRow() {
  const [salesPeriod, setSalesPeriod] = useState('year');

  const donutData = ADMIN_DASHBOARD_STATUS_DISTRIBUTION.map((item) => ({
    name: item.label,
    value: item.count,
    fill: item.color,
    key: item.status,
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      <WidgetCard
        title="Ventas mensuales"
        className="xl:col-span-2"
        action={
          <Select value={salesPeriod} onValueChange={setSalesPeriod}>
            <SelectTrigger className="h-8 w-[7.5rem] bg-background text-xs" aria-label="Periodo de ventas">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year">Este año</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        <ChartContainer config={salesChartConfig} className="h-[13rem] w-full">
          <AreaChart data={ADMIN_DASHBOARD_MONTHLY_SALES} aria-label="Ventas mensuales del año">
            <defs>
              <linearGradient id="dashboardSalesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--admin-accent))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--admin-accent))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={formatSalesTick}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--admin-accent))"
              strokeWidth={2}
              fill="url(#dashboardSalesFill)"
              dot={{ r: 3, fill: 'hsl(var(--admin-accent))' }}
              name="value"
            />
          </AreaChart>
        </ChartContainer>
      </WidgetCard>

      <WidgetCard title="Distribución por estado">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="relative mx-auto w-full max-w-[9.5rem]">
            <ChartContainer config={statusChartConfig} className="mx-auto aspect-square h-[9.5rem]">
              <PieChart aria-label="Distribución de tickets por estado">
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={44}
                  outerRadius={68}
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
              <span className="text-xl font-bold text-foreground">{ADMIN_DASHBOARD_STATUS_TOTAL}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>

          <ul className="min-w-0 flex-1 space-y-2">
            {ADMIN_DASHBOARD_STATUS_DISTRIBUTION.map((item) => (
              <li key={item.status} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-muted-foreground">{item.label}</span>
                </div>
                <div className="shrink-0 text-right text-xs">
                  <span className="font-semibold text-foreground">{item.count}</span>
                  <span className="ml-1.5 text-muted-foreground">{item.percent}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </WidgetCard>

      <WidgetCard
        title="Rendimiento semanal (SLA)"
        action={
          <span className="text-lg font-bold text-[hsl(var(--admin-accent))]">
            {ADMIN_DASHBOARD_SLA_CURRENT}%
          </span>
        }
      >
        <ChartContainer config={weeklySlaChartConfig} className="h-[13rem] w-full">
          <LineChart data={ADMIN_DASHBOARD_WEEKLY_SLA} aria-label="Rendimiento SLA semanal">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              domain={[85, 100]}
              tickLine={false}
              axisLine={false}
              width={32}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--admin-accent))"
              strokeWidth={2}
              dot={{ r: 3, fill: 'hsl(var(--admin-accent))' }}
              name="value"
            />
          </LineChart>
        </ChartContainer>
      </WidgetCard>
    </div>
  );
}

export function AdminDashboardMiddleRow() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <WidgetCard title="Tickets por prioridad">
        <ul className="space-y-4">
          {ADMIN_DASHBOARD_PRIORITY_DISTRIBUTION.map((item) => (
            <li key={item.priority}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{item.count}</span>{' '}
                  <span className="text-xs">({item.percent}%)</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard
        title="Técnicos con más carga"
        action={
          <button
            type="button"
            className="text-sm font-medium text-[hsl(var(--admin-accent))] hover:underline"
          >
            Ver todos
          </button>
        }
      >
        <ul className="space-y-3">
          {ADMIN_DASHBOARD_TECHNICIAN_LOAD.map((tech) => (
            <li key={tech.name} className="flex items-center gap-3">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground"
                aria-hidden="true"
              >
                {tech.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{tech.name}</p>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    {tech.tickets}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--admin-accent))]"
                    style={{
                      width: `${(tech.tickets / ADMIN_DASHBOARD_MAX_TECHNICIAN_LOAD) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard title="Actividad reciente">
        <ul className="space-y-3">
          {ADMIN_DASHBOARD_RECENT_ACTIVITY.map((activity) => {
            const Icon = activityIcons[activity.type];
            return (
              <li key={activity.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    activityIconStyles[activity.type],
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 border-l border-border pl-3">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </WidgetCard>
    </div>
  );
}

export function AdminDashboardBottomRow() {
  const [clientsPeriod, setClientsPeriod] = useState('month');
  const [productsPeriod, setProductsPeriod] = useState('month');
  const [tasks, setTasks] = useState(ADMIN_DASHBOARD_PENDING_TASKS);

  const toggleTask = (taskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <WidgetCard title="Tareas pendientes">
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-3">
              <Checkbox
                id={`dashboard-task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="mt-0.5"
                aria-label={task.title}
              />
              <div className="min-w-0 flex-1">
                <label
                  htmlFor={`dashboard-task-${task.id}`}
                  className={cn(
                    'block text-sm font-medium text-foreground',
                    task.completed && 'text-muted-foreground line-through',
                  )}
                >
                  {task.title}
                </label>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset',
                      priorityStyles[task.priority],
                    )}
                  >
                    {priorityLabels[task.priority]}
                  </span>
                  <span className="text-xs text-muted-foreground">{task.dueLabel}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard
        title="Top clientes (ventas)"
        action={
          <Select value={clientsPeriod} onValueChange={setClientsPeriod}>
            <SelectTrigger className="h-8 w-[7.5rem] bg-background text-xs" aria-label="Periodo clientes">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        <ol className="space-y-3">
          {ADMIN_DASHBOARD_TOP_CLIENTS.map((client) => (
            <li key={client.rank} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {client.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{client.name}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {formatDashboardCurrency(client.amount)}
              </span>
            </li>
          ))}
        </ol>
      </WidgetCard>

      <WidgetCard
        title="Top productos (ventas)"
        action={
          <Select value={productsPeriod} onValueChange={setProductsPeriod}>
            <SelectTrigger className="h-8 w-[7.5rem] bg-background text-xs" aria-label="Periodo productos">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        <ol className="space-y-3">
          {ADMIN_DASHBOARD_TOP_PRODUCTS.map((product) => (
            <li key={product.rank} className="flex items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-bold text-white"
                style={{ backgroundColor: product.imageColor }}
                aria-hidden="true"
              >
                {product.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {formatDashboardCurrency(product.amount)}
              </span>
            </li>
          ))}
        </ol>
      </WidgetCard>
    </div>
  );
}
