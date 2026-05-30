import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Sparkles,
} from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <section
      aria-labelledby="newsletter-titulo"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-600 to-red-700 px-5 py-8 text-white shadow-lg sm:px-8 sm:py-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-0 size-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/3 size-48 rounded-full bg-black/10 blur-2xl"
      />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
        {/* Texto + icono */}
        <div className="flex flex-1 items-center gap-4 sm:gap-5">
          <div className="relative shrink-0" aria-hidden="true">
            <Sparkles className="absolute -left-1 top-0 size-3 text-white/70" />
            <Sparkles className="absolute -right-0.5 bottom-1 size-2.5 text-white/60" />
            <span className="flex size-14 items-center justify-center rounded-full bg-red-800/90 shadow-[0_4px_14px_rgba(0,0,0,0.25)] sm:size-16">
              <Mail className="size-7 sm:size-8" strokeWidth={1.75} />
            </span>
          </div>
          <div>
            <h2 id="newsletter-titulo" className="text-xl font-bold leading-tight sm:text-2xl">
              Suscríbete a nuestro Newsletter
            </h2>
            <p className="mt-1 text-sm text-white/90 sm:text-base">
              y recibe noticias y grandes ofertas
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="w-full lg:max-w-xl lg:shrink-0">
          {done ? (
            <p
              role="status"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/15 px-4 py-3 font-semibold"
            >
              <CheckCircle2 className="size-5" aria-hidden="true" />
              ¡Gracias por suscribirte!
            </p>
          ) : (
            <form
              className="flex h-12 w-full items-center overflow-hidden rounded-full bg-white pr-1 shadow-md sm:h-[3.25rem]"
              onSubmit={(event) => {
                event.preventDefault();
                setDone(true);
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Dirección de email
              </label>
              <Mail
                className="pointer-events-none ml-4 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Dirección de email"
                className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-0"
              />
              <button
                type="submit"
                className="flex h-[calc(100%-8px)] shrink-0 items-center justify-center gap-1.5 rounded-full bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600 sm:px-5"
              >
                Suscribirse
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
