import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Headphones,
  Lock,
  Rocket,
  Shield,
  User,
  Users,
} from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';

const heroFeatures = [
  { icon: Shield, label: 'Seguridad garantizada' },
  { icon: Rocket, label: 'Tecnología innovadora' },
  { icon: Users, label: 'Soporte especializado' },
] as const;

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 21" className={className} aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/tienda';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      const destination =
        email.trim().toLowerCase() === 'admin@haitech.pe' ? '/admin' : from;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-haitech grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <section
        aria-label="Atención y soporte Haitech"
        className="login-haitech__hero relative min-h-[320px] lg:min-h-dvh"
      >
        <img
          src="/login-hero-support.png"
          alt="Asesora de soporte Haitech atendiendo con headset en oficina"
          className="absolute inset-0 size-full object-cover object-center"
          loading="eager"
        />
        <div className="login-haitech__hero-shade absolute inset-0" aria-hidden="true" />

        <div className="login-haitech__hero-footer relative z-10 mt-auto">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
              <Headphones className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-bold text-white sm:text-xl">Estamos para ayudarte</p>
              <p className="mt-0.5 text-sm text-white/70">Soluciones tecnológicas a tu alcance.</p>
            </div>
          </div>

          <ul className="mt-6 grid grid-cols-3 gap-3 sm:gap-6">
            {heroFeatures.map((item) => (
              <li key={item.label} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="flex size-9 items-center justify-center rounded-lg bg-red-600/20 text-red-500">
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
                <span className="mt-2 text-[0.65rem] font-medium leading-snug text-white/90 sm:text-xs">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="login-titulo"
        className="login-haitech__form flex items-center justify-center bg-white px-4 py-10 sm:px-8 lg:min-h-dvh lg:py-12"
      >
        <div className="login-card-white w-full max-w-[420px] rounded-2xl p-6 sm:p-8 lg:p-10">
          <div className="mb-6 flex justify-center">
            <Link
              to="/"
              className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              aria-label="Haitech, inicio"
            >
              <img
                src="/logo.png"
                alt="Haitech Soluciones Tecnológicas"
                className="h-12 w-auto max-w-[260px] object-contain sm:h-14"
                width={260}
                height={56}
              />
            </Link>
          </div>

          <h1 id="login-titulo" className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Bienvenido a <span className="text-red-600">Haitech</span>
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">Inicia sesión para continuar</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-red-600"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@haitech.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'login-error' : undefined}
                  className="login-input login-input--light w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-red-600"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'login-error' : undefined}
                  className="login-input login-input--light w-full pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked === true)}
                  className="border-gray-300 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
                />
                <Label htmlFor="remember" className="cursor-pointer text-sm text-gray-600">
                  Recordarme
                </Label>
              </div>
              <Link
                to="/contacto"
                className="text-sm font-medium text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {error && (
              <p id="login-error" role="alert" className="text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <p className="text-center text-xs text-gray-400">
              Demo local: <span className="font-mono">admin@haitech.pe</span> /{' '}
              <span className="font-mono">admin123</span>
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
              <p className="relative mx-auto w-fit bg-white px-3 text-xs text-gray-400">o continúa con</p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                disabled
                title="Próximamente"
                className="flex size-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Continuar con Microsoft (próximamente)"
              >
                <MicrosoftIcon className="size-5" />
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            © 2024 <span className="font-semibold text-gray-600">Haitech</span>. Todos los derechos
            reservados.
          </p>

          <p className="mt-4 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link
              to="/login/registro"
              className="font-semibold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
