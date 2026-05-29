import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';

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

const contactSchema = z.object({
  name: z.string().min(2, 'Introduce al menos 2 caracteres.'),
  email: z.string().email('Introduce un correo válido.'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (values: ContactValues) => {
    // Demo: envía al API admin local (server/) que integra HaiSupport.
    try {
      await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
    } catch {
      // En demo ignoramos errores de red; el servidor puede no estar levantado.
    }
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
          <CardDescription>
            ¿Tienes una pregunta? Escríbenos y HaiSupport te responderá.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div role="status" className="flex items-center gap-2 text-primary">
              <CheckCircle2 aria-hidden="true" />
              <p>¡Gracias! Hemos recibido tu mensaje.</p>
            </div>
          ) : (
            <form
              onSubmit={(event) => void handleSubmit(onSubmit)(event)}
              className="flex flex-col gap-4"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  {...register('name')}
                />
                {errors.name && (
                  <p id="name-error" role="alert" className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="message">Mensaje</Label>
                <textarea
                  id="message"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  {...register('message')}
                />
                {errors.message && (
                  <p id="message-error" role="alert" className="text-sm text-destructive">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
