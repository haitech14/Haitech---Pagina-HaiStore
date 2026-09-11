import { BarChart3 } from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { NovaCard } from '@/components/tiendanova/NovaCard';
import { SizedResponsiveContainer } from '@/components/ui/chart';
import { TIENDANOVA_SALES } from '@/data/tiendanova/dashboard';

function money(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.[0]) return null;
  const value = Number(payload[0].value ?? 0);
  return (
    <div className="rounded-xl bg-slate-900 px-3 py-2 text-white shadow-lg">
      <p className="text-[13px] font-bold">{money(value)}</p>
      <p className="text-[11px] text-slate-300">{label}</p>
    </div>
  );
}

export function SalesChart() {
  return (
    <NovaCard className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-slate-400" aria-hidden="true" />
          <h2 className="text-[15px] font-semibold text-slate-800">Ventas últimos 30 días</h2>
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-[12px] font-medium text-slate-500">Últimos 30 días</span>
      </div>
      <div className="h-[260px] w-full sm:h-[280px]">
        <SizedResponsiveContainer>
          <ComposedChart data={[...TIENDANOVA_SALES]} margin={{ top: 12, right: 12, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="tiendanovaSalesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16A34A" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#16A34A" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              tickFormatter={(value) => `$${Number(value).toLocaleString('en-US')}`}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={58}
              domain={[0, 25000]}
              ticks={[0, 5000, 10000, 15000, 20000, 25000]}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#CBD5E1', strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="value" stroke="none" fill="url(#tiendanovaSalesFill)" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#16A34A"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#16A34A', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#16A34A', stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </SizedResponsiveContainer>
      </div>
    </NovaCard>
  );
}
