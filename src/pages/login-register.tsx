import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Shield, User } from 'lucide-react';

import { FooterLogoImage } from '@/components/layout/site-logo';
import { useAuth } from '@/context/auth-context';

export function LoginRegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      await signUp(email, password, fullName);
      setInfo('Cuenta creada. Revisa tu correo si se requiere confirmación y luego inicia sesión.');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-printcore relative flex min-h-dvh flex-col items-center justify-center overflow-x-hidden bg-black px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="login-glow-orb login-glow-orb--left" />
        <div className="login-glow-orb login-glow-orb--right" />
      </div>

      <section className="login-card-glow relative z-10 w-full max-w-md rounded-2xl border border-red-600/40 p-6 sm:p-8">
        <Link to="/" className="mb-6 flex items-center justify-center" aria-label="Haitech, inicio">
          <FooterLogoImage heightClass="h-10" />
        </Link>

        <div className="mb-4 flex justify-center">
          <Shield className="size-8 text-red-600" aria-hidden="true" />
        </div>

        <h1 className="text-center text-2xl font-bold">
          <span className="text-white">Crear </span>
          <span className="text-red-600">cuenta</span>
        </h1>
        <p className="mt-2 text-center text-sm text-white/50">
          Regístrate para acceder a precios según tu rol asignado.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35"
              aria-hidden="true"
            />
            <input
              id="register-name"
              type="text"
              placeholder="Nombre completo"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="login-input w-full"
            />
          </div>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35"
              aria-hidden="true"
            />
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="login-input w-full"
            />
          </div>
          <div className="relative">
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="login-input w-full pl-3.5"
            />
          </div>

          {error && (
            <p role="alert" className="text-center text-sm text-red-400">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="text-center text-sm text-white/60">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-60"
          >
            {isSubmitting ? 'Creando…' : 'Crear cuenta'}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-red-600 hover:text-red-500">
            Iniciar sesión
          </Link>
        </p>
      </section>
    </div>
  );
}
