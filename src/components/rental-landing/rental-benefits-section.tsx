import { Banknote, Clock3, Headphones, Settings2, Droplets } from 'lucide-react';

const BENEFITS = [
  {
    id: 'inversion',
    title: 'Sin inversión inicial',
    text: 'Conserva tu capital para hacer crecer tu negocio.',
    icon: Banknote,
  },
  {
    id: 'toner',
    title: 'Tóner y repuestos',
    text: 'Consumibles según el plan que elijas.',
    icon: Droplets,
  },
  {
    id: 'entrega',
    title: 'Entrega rápida',
    text: 'Instalación en menos de 72 horas.',
    icon: Clock3,
  },
  {
    id: 'soporte',
    title: 'Soporte técnico especializado',
    text: 'Asesoría y atención personalizada.',
    icon: Headphones,
  },
  {
    id: 'planes',
    title: 'Planes flexibles',
    text: 'De 6 a 36 meses, según la modalidad.',
    icon: Settings2,
  },
] as const;

export function RentalBenefitsSection() {
  return (
    <section aria-label="Beneficios del alquiler" className="border-y border-[#EEE] bg-[#FAFAFA] py-10">
      <ul className="container grid gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        {BENEFITS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="text-center lg:text-left">
              <Icon className="mx-auto size-7 text-[#E30613] lg:mx-0" strokeWidth={1.6} aria-hidden="true" />
              <h3 className="mt-3 text-sm font-bold text-[#111111]">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">{item.text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
