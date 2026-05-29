import { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <section
      aria-labelledby="newsletter-titulo"
      className="relative overflow-hidden rounded-2xl bg-red-600 px-6 py-10 text-white sm:px-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl"
      />
      <div className="relative flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
        <div className="flex items-center gap-4 text-center lg:text-left">
          <span
            className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 sm:flex"
            aria-hidden="true"
          >
            <Mail className="size-6" />
          </span>
          <div>
            <h2 id="newsletter-titulo" className="text-xl font-bold sm:text-2xl">
              Recibe novedades y ofertas exclusivas
            </h2>
            <p className="text-sm text-white/80">
              Sé el primero en enterarte de nuestras promociones.
            </p>
          </div>
        </div>

        {done ? (
          <p role="status" className="flex items-center gap-2 font-semibold">
            <CheckCircle2 aria-hidden="true" />
            ¡Gracias por suscribirte!
          </p>
        ) : (
          <form
            className="flex w-full max-w-md items-stretch gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setDone(true);
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Correo electrónico
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Ingresa tu correo electrónico"
              className="h-11 w-full rounded-md border-0 bg-white px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-white"
            />
            <Button
              type="submit"
              className="h-11 shrink-0 bg-black px-6 text-white hover:bg-black/80 focus-visible:ring-white focus-visible:ring-offset-red-600"
            >
              Suscribirme
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
