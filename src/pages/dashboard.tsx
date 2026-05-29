import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const salesData = [
  { month: 'Ene', ventas: 4200 },
  { month: 'Feb', ventas: 3800 },
  { month: 'Mar', ventas: 5100 },
  { month: 'Abr', ventas: 4700 },
  { month: 'May', ventas: 6200 },
  { month: 'Jun', ventas: 5800 },
];

const stats = [
  { label: 'Ventas del mes', value: '5.800 €' },
  { label: 'Pedidos', value: '142' },
  { label: 'Ticket medio', value: '40,8 €' },
];

export function DashboardPage() {
  return (
    <div className="container flex flex-col gap-6 py-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Panel</h1>
        <p className="text-muted-foreground">Resumen de actividad de la tienda.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ventas por mes</CardTitle>
          <CardDescription>Evolución del primer semestre (€).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
                <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
