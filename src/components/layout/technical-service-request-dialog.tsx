import { useEffect, useState } from 'react';
import { CheckCircle2, Copy, Headphones } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  buildHaibotServiceOrderMessage,
  emptyHaibotSupportForm,
  generateHaibotServiceOrderCode,
  validateHaibotSupportFormBase,
  type HaibotSupportFormValues,
} from '@/lib/haibot-service-order';
import { submitSupportTicket, SupportTicketError } from '@/lib/support-ticket';
import { cn } from '@/lib/utils';

function validateStorefrontSupportForm(form: HaibotSupportFormValues): string | null {
  const baseError = validateHaibotSupportFormBase(form);
  if (baseError) return baseError;
  if (!form.email.trim()) return 'Indica un correo de contacto.';
  if (!form.phone.trim()) return 'Indica un teléfono de contacto.';
  return null;
}

type TechnicalServiceRequestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TechnicalServiceRequestDialog({
  open,
  onOpenChange,
}: TechnicalServiceRequestDialogProps) {
  const [form, setForm] = useState<HaibotSupportFormValues>(emptyHaibotSupportForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ code: string; message: string; demo?: boolean } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) return;
    setForm(emptyHaibotSupportForm());
    setError(null);
    setIsSubmitting(false);
    setResult(null);
    setCopied(false);
  }, [open]);

  const patch = (partial: Partial<HaibotSupportFormValues>) => {
    setForm((current) => ({ ...current, ...partial }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationError = validateStorefrontSupportForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const code = generateHaibotServiceOrderCode();
    const orderMessage = buildHaibotServiceOrderMessage(form, code);
    setIsSubmitting(true);
    setError(null);

    try {
      const ticket = await submitSupportTicket({
        name: form.contactName.trim() || form.clientName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: orderMessage,
        type: 'contact',
        metadata: {
          channel: 'header-soporte',
          serviceOrderCode: code,
          company: form.clientName.trim(),
          equipment: form.equipment.trim(),
          city: form.city.trim(),
        },
      });

      setResult({
        code,
        message: orderMessage,
        ...(ticket.demo ? { demo: true } : {}),
      });
      setForm(emptyHaibotSupportForm());
    } catch (err) {
      setError(
        err instanceof SupportTicketError
          ? err.message
          : 'No se pudo registrar la solicitud. Intenta de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('No se pudo copiar al portapapeles.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-600/10 text-red-600">
              <Headphones className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <DialogTitle>Agendar Servicio Técnico</DialogTitle>
              <DialogDescription className="mt-1">
                Completa los datos de tu equipo y te contactaremos para coordinar la visita.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div
              role="status"
              className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">Solicitud {result.code} registrada</p>
                <p className="mt-1 text-xs text-emerald-800/90">
                  {result.demo
                    ? 'Modo demo: el ticket se guardó localmente. Nuestro equipo revisará tu solicitud.'
                    : 'Recibimos tu solicitud. Te contactaremos a la brevedad para confirmar la visita.'}
                </p>
              </div>
            </div>

            <pre className="max-h-40 overflow-y-auto rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
              {result.message}
            </pre>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="gap-1.5" onClick={() => void handleCopy()}>
                <Copy className="size-4" aria-hidden="true" />
                {copied ? 'Copiado' : 'Copiar resumen'}
              </Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setResult(null);
                  onOpenChange(false);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="svc-client">Empresa o cliente</Label>
                <Input
                  id="svc-client"
                  value={form.clientName}
                  onChange={(event) => patch({ clientName: event.target.value })}
                  disabled={isSubmitting}
                  placeholder="Ej. ACME S.A.C."
                  autoComplete="organization"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="svc-contact">Persona de contacto</Label>
                <Input
                  id="svc-contact"
                  value={form.contactName}
                  onChange={(event) => patch({ contactName: event.target.value })}
                  disabled={isSubmitting}
                  autoComplete="name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="svc-phone">Teléfono</Label>
                <Input
                  id="svc-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => patch({ phone: event.target.value })}
                  disabled={isSubmitting}
                  autoComplete="tel"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="svc-email">Correo</Label>
                <Input
                  id="svc-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => patch({ email: event.target.value })}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="svc-city">Ciudad</Label>
                <Input
                  id="svc-city"
                  value={form.city}
                  onChange={(event) => patch({ city: event.target.value })}
                  disabled={isSubmitting}
                  autoComplete="address-level2"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="svc-address">Dirección</Label>
                <Input
                  id="svc-address"
                  value={form.address}
                  onChange={(event) => patch({ address: event.target.value })}
                  disabled={isSubmitting}
                  autoComplete="street-address"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="svc-equipment">Modelo del equipo</Label>
                <Input
                  id="svc-equipment"
                  value={form.equipment}
                  onChange={(event) => patch({ equipment: event.target.value })}
                  disabled={isSubmitting}
                  placeholder="Ej. Ricoh IM C3000"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="svc-problem">Problema o servicio solicitado</Label>
                <Textarea
                  id="svc-problem"
                  value={form.problem}
                  onChange={(event) => patch({ problem: event.target.value })}
                  disabled={isSubmitting}
                  rows={4}
                  className="min-h-[6rem] resize-y"
                  placeholder="Describe el fallo, código de error o mantenimiento requerido."
                />
              </div>
            </div>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn('bg-red-600 hover:bg-red-700')}
              >
                {isSubmitting ? 'Enviando…' : 'Agendar servicio'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
