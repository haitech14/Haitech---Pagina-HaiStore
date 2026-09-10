import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { RentalRecommendedModel } from '@/data/rental-landing-models';
import {
  formatRentalPen,
  type RentalCalculatorInput,
} from '@/data/rental-landing-pricing';
import { submitWebLead } from '@/lib/submit-web-lead';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

export interface RentalQuotePayload extends RentalCalculatorInput {
  estimatedMonthlyPrice: number;
  recommendedModel: RentalRecommendedModel;
}

interface RentalQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: RentalQuotePayload;
}

export function RentalQuoteDialog({ open, onOpenChange, quote }: RentalQuoteDialogProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ruc, setRuc] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const modalityLabel =
    quote.modality === 'leasing'
      ? 'Leasing'
      : quote.modality === 'outsourcing'
        ? 'Outsourcing'
        : 'Alquiler';
  const kind = `${quote.paperFormat} · ${quote.printType === 'color' ? 'Color' : 'Blanco y negro'}`;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (trimmedName.length < 2) {
      setError('Ingresa tu nombre.');
      return;
    }
    if (trimmedPhone.length < 6) {
      setError('Ingresa un celular / WhatsApp válido.');
      return;
    }
    setError(null);
    setSending(true);

    const summary = [
      `Modalidad: ${modalityLabel}`,
      `Plazo: ${quote.contractMonths} meses`,
      `Equipo: ${kind}`,
      `Cantidad: ${quote.quantity}`,
      `Volumen: ${quote.monthlyVolume.toLocaleString('es-PE')} pág/mes`,
      `Cuota estimada: ${formatRentalPen(quote.estimatedMonthlyPrice)} / mes`,
      `Modelo sugerido: ${quote.recommendedModel.name}`,
    ].join(' · ');

    await submitWebLead({
      contact: {
        name: trimmedName,
        companyOrRuc: ruc.trim() || company.trim() || '',
        phone: trimmedPhone,
        ...(email.trim() ? { email: email.trim() } : {}),
        city: '',
      },
      channel: 'whatsapp-rental',
      message: summary,
      productName: quote.recommendedModel.name,
      productId: quote.recommendedModel.id,
    });

    const message = [
      `Hola, soy ${trimmedName}${company.trim() ? ` de ${company.trim()}` : ''}.`,
      'Quiero solicitar cotización de alquiler / leasing RICOH:',
      summary,
    ].join('\n');

    window.open(buildHaitechWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    setSending(false);
    onOpenChange(false);
  };

  const fieldClass =
    'h-11 min-h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111111] outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar cotización</DialogTitle>
          <DialogDescription>
            Deja tus datos. Ya tenemos tu configuración; no tendrás que repetirla.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-[#FFF5F5] px-3 py-2.5 text-[12px] leading-relaxed text-[#374151]">
          <p className="font-semibold text-[#111111]">
            {formatRentalPen(quote.estimatedMonthlyPrice)} / mes · {quote.recommendedModel.name}
          </p>
          <p className="mt-1">
            {modalityLabel} · {quote.contractMonths} meses · {kind} · {quote.quantity} equipo
            {quote.quantity === 1 ? '' : 's'} · {quote.monthlyVolume.toLocaleString('es-PE')} pág
          </p>
        </div>

        <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block text-sm font-medium text-[#111111]">
            Nombre
            <input
              className={`mt-1 ${fieldClass}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <label className="block text-sm font-medium text-[#111111]">
            Empresa
            <input
              className={`mt-1 ${fieldClass}`}
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              autoComplete="organization"
            />
          </label>
          <label className="block text-sm font-medium text-[#111111]">
            Celular / WhatsApp
            <input
              className={`mt-1 ${fieldClass}`}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              required
            />
          </label>
          <label className="block text-sm font-medium text-[#111111]">
            Email
            <input
              className={`mt-1 ${fieldClass}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="block text-sm font-medium text-[#111111]">
            RUC <span className="font-normal text-[#6B7280]">(opcional)</span>
            <input
              className={`mt-1 ${fieldClass}`}
              value={ruc}
              onChange={(event) => setRuc(event.target.value)}
              inputMode="numeric"
            />
          </label>
          {error ? <p className="text-sm text-[#B91C1C]">{error}</p> : null}
          <DialogFooter>
            <Button
              type="submit"
              disabled={sending}
              className="h-11 min-h-11 bg-[#E30613] font-semibold text-white hover:bg-[#c40511]"
            >
              {sending ? 'Enviando…' : 'Enviar cotización'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
