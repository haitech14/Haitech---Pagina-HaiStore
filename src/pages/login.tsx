import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';

const demoAccounts = [
  { email: 'admin@haitech.pe', password: 'admin123', label: 'Administrador' },
  { email: 'mayorista@haitech.pe', password: 'demo123', label: 'Mayorista' },
  { email: 'distribuidor@haitech.pe', password: 'demo123', label: 'Distribuidor' },
  { email: 'corporativo@haitech.pe', password: 'demo123', label: 'Corporativo' },
  { email: 'tecnico@haitech.pe', password: 'demo123', label: 'Técnico' },
  { email: 'vip@haitech.pe', password: 'demo123', label: 'VIP' },
];

type AuthMode = 'login' | 'register';

export function LoginPage() {
  const { login, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/tienda';

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      const destination =
        email.trim().toLowerCase() === 'admin@haitech.pe' ? '/panel/inventario' : from;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      await signUp(email, password, fullName);
      setInfo(
        'Cuenta creada. Si Supabase requiere confirmación por correo, revisa tu bandeja. Luego inicia sesión.',
      );
      setMode('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</CardTitle>
          <CardDescription>
            Autenticación con Supabase. Sin sesión verás precios{' '}
            <strong>públicos</strong>; al ingresar, el precio depende de tu rol asignado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <Button
              type="button"
              variant={mode === 'login' ? 'default' : 'outline'}
              className={mode === 'login' ? 'flex-1 bg-red-600 hover:bg-red-500' : 'flex-1'}
              onClick={() => setMode('login')}
            >
              Ingresar
            </Button>
            <Button
              type="button"
              variant={mode === 'register' ? 'default' : 'outline'}
              className={mode === 'register' ? 'flex-1 bg-red-600 hover:bg-red-500' : 'flex-1'}
              onClick={() => setMode('register')}
            >
              Registrarse
            </Button>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={mode === 'login' ? handleLogin : handleRegister}
          >
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="register-name">Nombre completo</Label>
                <Input
                  id="register-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="login-email">Correo</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Contraseña</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {info && (
              <p role="status" className="text-sm text-muted-foreground">
                {info}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500"
              disabled={isSubmitting}
            >
              {mode === 'login' ? (
                <>
                  <LogIn aria-hidden="true" />
                  {isSubmitting ? 'Ingresando…' : 'Ingresar'}
                </>
              ) : (
                <>
                  <UserPlus aria-hidden="true" />
                  {isSubmitting ? 'Registrando…' : 'Crear cuenta'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-2 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Cuentas demo (sin Supabase)</p>
            <ul className="max-h-48 space-y-2 overflow-y-auto text-sm text-muted-foreground">
              {demoAccounts.map((account) => (
                <li key={account.email} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {account.label}: <code className="text-xs">{account.email}</code>
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                      setMode('login');
                    }}
                  >
                    Usar
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/tienda" className="text-red-600 hover:underline">
              Continuar como visitante (precio público)
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
