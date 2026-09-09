import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

const FAQS = [
  {
    id: 'incluye',
    question: '¿Qué incluye el alquiler?',
    answer:
      'El plan puede incluir el equipo, tóner y repuestos, instalación, capacitación y soporte técnico según la configuración que elijas en la calculadora.',
  },
  {
    id: 'cambio',
    question: '¿Puedo cambiar de equipo durante el contrato?',
    answer:
      'Sí. Evaluamos un upgrade o cambio de modelo si tu volumen de impresión cambia. La nueva cuota se cotiza de forma referencial y queda sujeta a evaluación comercial.',
  },
  {
    id: 'empresas',
    question: '¿Atienden empresas y oficinas?',
    answer:
      'Sí. Atendemos empresas, oficinas, gobierno y educación en Lima y a nivel nacional, con instalación y soporte especializado.',
  },
  {
    id: 'toner',
    question: '¿La cuota incluye tóner?',
    answer:
      'Puedes incluir tóner y repuestos en la calculadora. Si los desactivas, la cuota estimada se ajusta en tiempo real.',
  },
  {
    id: 'leasing',
    question: '¿En qué se diferencia leasing de alquiler?',
    answer:
      'Leasing es para equipos nuevos, con plazo obligatorio de 24 o 36 meses. Alquiler es para equipos seminuevos, de 6 a 36 meses. En ambos casos eliges formato A4 o A3, volumen y tipo de impresión.',
  },
] as const;

export function RentalFaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);

  return (
    <section aria-labelledby="rental-faq-title" className="bg-[#F7F7F7] py-12 sm:py-16">
      <div className="container max-w-3xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="rental-faq-title" className="text-2xl font-bold text-[#111111] sm:text-3xl">
            Preguntas frecuentes
          </h2>
          <Link to="/preguntas-frecuentes" className="text-sm font-semibold text-[#E30613] hover:underline">
            Ver todas
          </Link>
        </div>
        <ul className="mt-6 divide-y divide-[#E7E7E7] rounded-2xl border border-[#E7E7E7] bg-white">
          {FAQS.map((item) => {
            const open = openId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold text-[#111111]"
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  {item.question}
                  <ChevronDown
                    className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')}
                    aria-hidden="true"
                  />
                </button>
                {open ? (
                  <p className="px-4 pb-4 text-sm leading-relaxed text-[#6B7280]">{item.answer}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
