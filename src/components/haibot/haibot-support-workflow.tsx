import { useState } from 'react';
import { CheckCircle2, Copy, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getHaiSupportAppUrl } from '@/lib/haibot-integrations';
import {
  buildHaibotServiceOrderMessage,
  emptyHaibotSupportForm,
  generateHaibotServiceOrderCode,
  validateHaibotSupportForm,
  type HaibotSupportFormValues,
} from '@/lib/haibot-service-order';
import { submitSupportTicket, SupportTicketError } from '@/lib/support-ticket';
import { cn } from '@/lib/utils';

interface HaibotSupportWorkflowProps {
  disabled?: boolean;
}

export function HaibotSupportWorkflow({ disabled }: HaibotSupportWorkflowProps) {
  const [form, setForm] = useState<HaibotSupportFormValues>(emptyHaibotSupportForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ code: string; message: string; demo?: boolean } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  const haiSupportUrl = getHaiSupportAppUrl();

  const patch = (partial: Partial<HaibotSupportFormValues>) => {
    setForm((current) => ({ ...current, ...partial }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled || isSubmitting) return;

    const validationError = validateHaibotSupportForm(form);
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
        email: form.email.trim() || 'soporte@haitech.pe',
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        message: orderMessage,
        type: 'contact',
        metadata: {
          channel: 'haibot',
          serviceOrderCode: code,
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

  if (result) {
    return (
      <div className="space-y-3 rounded-xl bg-white p-3 shadow-sm">
        <div role="status" className="flex items-start gap-2 text-[0.8125rem] text-[#075e54]">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Orden {result.code} registrada ✅</p>
            {result.demo ? (
              <p className="mt-1 text-xs text-amber-800">
                Modo demo: HaiSupport no está conectado en el servidor.
              </p>
            ) : (
              <p className="mt-1 text-xs text-[#667781]">
                Solicitud enviada a HaiSupport. Copia el texto para coordinación interna.
              </p>
            )}
          </div>
        </div>

        <pre className="max-h-28 overflow-y-auto rounded-lg bg-[#f0f2f5] p-2 text-[0.65rem] leading-relaxed text-[#111b21] whitespace-pre-wrap">
          {result.message}
        </pre>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="h-9 gap-1.5 bg-[#075e54] hover:bg-[#128c7e]"
            onClick={() => void handleCopy()}
          >
            <Copy className="size-3.5" aria-hidden="true" />
            {copied ? 'Copiado 📋' : 'Copiar orden'}
          </Button>
          {haiSupportUrl ? (
            <Button type="button" size="sm" variant="outline" className="h-9 gap-1.5" asChild>
              <a href={haiSupportUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5" aria-hidden="true" />
                Abrir HaiSupport
              </a>
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9"
            onClick={() => setResult(null)}
          >
            Nueva solicitud
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-2 rounded-xl bg-white p-3 shadow-sm">
      <p className="text-[0.7rem] font-semibold text-[#075e54]">🔧 Registrar orden de servicio</p>

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 space-y-1">
          <Label htmlFor="hb-svc-client" className="text-[0.65rem]">
            Cliente / empresa
          </Label>
          <Input
            id="hb-svc-client"
            value={form.clientName}
            onChange={(e) => patch({ clientName: e.target.value })}
            disabled={disabled || isSubmitting}
            className="h-8 text-xs"
            placeholder="Ej. ACME S.A.C."
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hb-svc-contact" className="text-[0.65rem]">
            Contacto
          </Label>
          <Input
            id="hb-svc-contact"
            value={form.contactName}
            onChange={(e) => patch({ contactName: e.target.value })}
            disabled={disabled || isSubmitting}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hb-svc-phone" className="text-[0.65rem]">
            Teléfono
          </Label>
          <Input
            id="hb-svc-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => patch({ phone: e.target.value })}
            disabled={disabled || isSubmitting}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hb-svc-email" className="text-[0.65rem]">
            Correo
          </Label>
          <Input
            id="hb-svc-email"
            type="email"
            value={form.email}
            onChange={(e) => patch({ email: e.target.value })}
            disabled={disabled || isSubmitting}
            className="h-8 text-xs"
            placeholder="Opcional"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hb-svc-city" className="text-[0.65rem]">
            Ciudad
          </Label>
          <Input
            id="hb-svc-city"
            value={form.city}
            onChange={(e) => patch({ city: e.target.value })}
            disabled={disabled || isSubmitting}
            className="h-8 text-xs"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label htmlFor="hb-svc-equipment" className="text-[0.65rem]">
            Equipo (modelo)
          </Label>
          <Input
            id="hb-svc-equipment"
            value={form.equipment}
            onChange={(e) => patch({ equipment: e.target.value })}
            disabled={disabled || isSubmitting}
            className="h-8 text-xs"
            placeholder="Ej. Ricoh IM C3000"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label htmlFor="hb-svc-problem" className="text-[0.65rem]">
            Problema / detalle
          </Label>
          <Textarea
            id="hb-svc-problem"
            value={form.problem}
            onChange={(e) => patch({ problem: e.target.value })}
            disabled={disabled || isSubmitting}
            rows={2}
            className="min-h-[3.5rem] resize-none text-xs"
            placeholder="Ej. Atasco frecuente, error SC542…"
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-[0.65rem] text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="sm"
        disabled={disabled || isSubmitting}
        className={cn('h-9 w-full bg-[#075e54] text-xs hover:bg-[#128c7e]')}
      >
        {isSubmitting ? 'Registrando…' : 'Generar orden de servicio'}
      </Button>
    </form>
  );
}
