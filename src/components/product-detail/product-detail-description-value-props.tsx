import { Cog, Leaf, Package, ShieldCheck, Truck, Users } from 'lucide-react';

import { cn } from '@/lib/utils';

export type ProductDetailValuePropsVariant = 'equipment' | 'supply' | 'laptop';

const VALUE_PROPS: Record<
  ProductDetailValuePropsVariant,
  readonly { id: string; icon: typeof Cog; title: string; description: string }[]
> = {
  equipment: [
    {
      id: 'productividad',
      icon: Cog,
      title: 'Mayor productividad para tu empresa',
      description:
        'Optimiza los flujos documentales con equipos confiables y de alto rendimiento para equipos exigentes.',
    },
    {
      id: 'sostenibilidad',
      icon: Leaf,
      title: 'Tecnología eficiente y sostenible',
      description:
        'Reduce consumo energético y costos operativos sin sacrificar calidad de impresión ni velocidad.',
    },
    {
      id: 'soluciones',
      icon: Users,
      title: 'Soluciones de impresión para un mejor futuro',
      description:
        'Conectividad inteligente, seguridad avanzada y soporte técnico especializado en todo el Perú.',
    },
  ],
  supply: [
    {
      id: 'calidad',
      icon: ShieldCheck,
      title: 'Calidad certificada',
      description:
        'Tóner y repuestos originales o compatibles verificados para proteger tu equipo y la calidad de impresión.',
    },
    {
      id: 'stock',
      icon: Package,
      title: 'Stock y entrega rápida',
      description:
        'Abastecimiento confiable con despacho a Lima y provincias para que tu operación no se detenga.',
    },
    {
      id: 'soporte',
      icon: Truck,
      title: 'Asesoría por modelo',
      description:
        'Te ayudamos a elegir el consumible correcto según tu equipo, volumen de impresión y presupuesto.',
    },
  ],
  laptop: [
    {
      id: 'productividad',
      icon: Cog,
      title: 'Productividad móvil',
      description:
        'Equipos listos para trabajo híbrido, reuniones y tareas exigentes con rendimiento estable.',
    },
    {
      id: 'seguridad',
      icon: ShieldCheck,
      title: 'Seguridad y confiabilidad',
      description:
        'Opciones empresariales con respaldo de garantía y soporte técnico especializado.',
    },
    {
      id: 'despliegue',
      icon: Users,
      title: 'Despliegue para equipos',
      description:
        'Cotización por volumen, configuración y entrega coordinada para oficinas y proyectos.',
    },
  ],
};

interface ProductDetailDescriptionValuePropsProps {
  variant?: ProductDetailValuePropsVariant;
  className?: string;
}

export function ProductDetailDescriptionValueProps({
  variant = 'equipment',
  className,
}: ProductDetailDescriptionValuePropsProps) {
  const items = VALUE_PROPS[variant];

  return (
    <div
      className={cn(
        'grid gap-3 rounded-xl bg-neutral-50 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4',
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article
            key={item.id}
            className="flex min-w-0 flex-col items-center rounded-lg bg-white px-3 py-4 text-center shadow-sm"
          >
            <span className="mb-2.5 inline-flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
              <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h3 className="text-pretty text-xs font-bold leading-snug text-[#0f1f3d] sm:text-sm">
              {item.title}
            </h3>
            <p className="mt-1.5 text-pretty text-[0.6875rem] leading-relaxed text-neutral-500">
              {item.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
