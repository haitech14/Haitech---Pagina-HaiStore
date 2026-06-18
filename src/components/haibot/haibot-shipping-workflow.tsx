import { useState } from 'react';
import { CheckCircle2, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  buildHaibotShippingOrderMessage,
  emptyHaibotShippingForm,
  validateHaibotShippingForm,
  type HaibotShippingFormValues,
} from '@/lib/haibot-shipping-form';
import { cn } from '@/lib/utils';

interface HaibotShippingWorkflowProps {
  disabled?: boolean;
}

export function HaibotShippingWorkflow({ disabled }: HaibotShippingWorkflowProps) {
  const [form, setForm] = useState<HaibotShippingFormValues>(emptyHaibotShippingForm);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const patch = (partial: Partial<HaibotShippingFormValues>) => {
    setForm((current) => ({ ...current, ...partial }));
    setError(null);
  };

  const handleGenerate = (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled) return;

    const validationError = validateHaibotShippingForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setResultMessage(buildHaibotShippingOrderMessage(form));
    setError(null);
  };

  const handleCopy = async () => {
    if (!resultMessage) return;
    try {
      await navigator.clipboard.writeText(resultMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('No se pudo copiar al portapapeles.');
    }
  };

  if (resultMessage) {
    return (
      <div className="space-y-3 rounded-xl bg-white p-3 shadow-sm">
        <div role="status" className="flex items-start gap-2 text-[0.8125rem] text-[#075e54]">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Orden de envío lista 📦</p>
            <p className="mt-1 text-xs text-[#667781]">
              Copia el texto y pégalo en WhatsApp o tu sistema de logística.
            </p>
          </div>
        </div>

        <pre className="max-h-32 overflow-y-auto rounded-lg bg-[#f0f2f5] p-2 text-[0.65rem] leading-relaxed text-[#111b21] whitespace-pre-wrap">
          {resultMessage}
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
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9"
            onClick={() => setResultMessage(null)}
          >
            Editar datos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleGenerate} className="space-y-2 rounded-xl bg-white p-3 shadow-sm">
      <p className="text-[0.7rem] font-semibold text-[#075e54]">📦 Generar orden de envío</p>

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 space-y-1">
          <Label htmlFor="hb-ship-client" className="text-[0.65rem]">
            Razón social
          </Label>
          <Input
            id="hb-ship-client"
            value={form.razonSocial}
            onChange={(e) => patch({ razonSocial: e.target.value })}
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hb-ship-ruc" className="text-[0.65rem]">
            RUC
          </Label>
          <Input
            id="hb-ship-ruc"
            value={form.taxId}
            onChange={(e) => patch({ taxId: e.target.value })}
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hb-ship-phone" className="text-[0.65rem]">
            Celular
          </Label>
          <Input
            id="hb-ship-phone"
            type="tel"
            value={form.customerPhone}
            onChange={(e) => patch({ customerPhone: e.target.value })}
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label htmlFor="hb-ship-dest" className="text-[0.65rem]">
            Destino
          </Label>
          <Input
            id="hb-ship-dest"
            value={form.destination}
            onChange={(e) => patch({ destination: e.target.value })}
            disabled={disabled}
            className="h-8 text-xs"
            placeholder="Ej. Lima · San Isidro"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label htmlFor="hb-ship-product" className="text-[0.65rem]">
            Producto
          </Label>
          <Input
            id="hb-ship-product"
            value={form.productDescription}
            onChange={(e) => patch({ productDescription: e.target.value })}
            disabled={disabled}
            className="h-8 text-xs"
            placeholder="Ej. Ricoh IM 430F"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hb-ship-price" className="text-[0.65rem]">
            Precio USD
          </Label>
          <Input
            id="hb-ship-price"
            inputMode="decimal"
            value={form.unitPriceUsd}
            onChange={(e) => patch({ unitPriceUsd: e.target.value })}
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hb-ship-qty" className="text-[0.65rem]">
            Cantidad
          </Label>
          <Input
            id="hb-ship-qty"
            inputMode="numeric"
            value={form.quantity}
            onChange={(e) => patch({ quantity: e.target.value })}
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label htmlFor="hb-ship-agency" className="text-[0.65rem]">
            Agencia
          </Label>
          <Input
            id="hb-ship-agency"
            value={form.agencyDetail}
            onChange={(e) => patch({ agencyDetail: e.target.value })}
            disabled={disabled}
            className="h-8 text-xs"
            placeholder="A Domicilio / Shalom…"
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
        disabled={disabled}
        className={cn('h-9 w-full bg-[#075e54] text-xs hover:bg-[#128c7e]')}
      >
        Generar texto de envío
      </Button>
    </form>
  );
}
