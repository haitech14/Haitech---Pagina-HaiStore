const STEPS = [
  {
    n: '1',
    title: 'Configura tu plan',
    text: 'Elige modalidad, plazo del contrato, formato A4 o A3, volumen y tipo de impresión.',
  },
  {
    n: '2',
    title: 'Recibe tu cotización',
    text: 'Obtén tu cuota estimada en segundos.',
  },
  {
    n: '3',
    title: 'Instalamos tu equipo',
    text: 'Coordinamos entrega, instalación y puesta en marcha.',
  },
] as const;

export function RentalHowItWorks() {
  return (
    <section aria-labelledby="rental-how-title" className="bg-white py-12 sm:py-16">
      <div className="container px-4 sm:px-6">
        <h2 id="rental-how-title" className="text-2xl font-bold text-[#111111] sm:text-3xl">
          ¿Cómo funciona?
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="rounded-2xl border border-[#E7E7E7] p-5">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#E30613] text-sm font-bold text-white">
                {step.n}
              </span>
              <h3 className="mt-4 text-base font-bold text-[#111111]">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
