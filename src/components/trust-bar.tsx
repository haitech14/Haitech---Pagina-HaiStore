import { Truck, RotateCcw, Lock, Headset, BadgeCheck } from 'lucide-react';

const items = [
  { icon: Truck, title: 'Envío gratis', text: 'En pedidos superiores a $50' },
  { icon: RotateCcw, title: 'Devoluciones fáciles', text: 'Hasta 30 días para devolver' },
  { icon: Lock, title: 'Pago seguro', text: 'Transacciones 100% protegidas' },
  { icon: Headset, title: 'Atención personalizada', text: 'Te ayudamos en lo que necesites' },
  { icon: BadgeCheck, title: 'Calidad garantizada', text: 'Productos originales' },
] as const;

export function TrustBar() {
  return (
    <section
      aria-label="Garantías de compra"
      className="grid grid-cols-1 gap-6 rounded-2xl border bg-card p-6 sm:grid-cols-2 lg:grid-cols-5"
    >
      {items.map((item) => (
        <div key={item.title} className="flex items-start gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-600"
            aria-hidden="true"
          >
            <item.icon className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
