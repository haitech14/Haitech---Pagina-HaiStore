import { useEffect, useId, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WhatsAppContact } from '@/lib/whatsapp-contact';

export interface WhatsAppContactSubmitOptions {
  generateQuote: boolean;
}

interface WhatsAppContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<WhatsAppContact> | null;
  onSubmit: (contact: WhatsAppContact, options: WhatsAppContactSubmitOptions) => void | Promise<void>;
  isSubmitting?: boolean;
  showQuoteCheckbox?: boolean;
  /** Valor inicial del checkbox «Generar cotización». */
  defaultGenerateQuote?: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
}

export function WhatsAppContactDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isSubmitting = false,
  showQuoteCheckbox = true,
  defaultGenerateQuote = true,
  title = 'Comprar por WhatsApp',
  description = 'Completa tus datos para enviar el mensaje con el producto y el precio a nuestro equipo de ventas.',
  submitLabel = 'Enviar por WhatsApp',
}: WhatsAppContactDialogProps) {
  const quoteCheckboxId = useId();
  const [name, setName] = useState('');
  const [companyOrRuc, setCompanyOrRuc] = useState('');
  const [city, setCity] = useState('');
  const [generateQuote, setGenerateQuote] = useState(defaultGenerateQuote);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name?.trim() ?? '');
    setCompanyOrRuc(initial?.companyOrRuc?.trim() ?? '');
    setCity(initial?.city?.trim() ?? '');
    setGenerateQuote(defaultGenerateQuote);
    setError(null);
  }, [open, initial?.name, initial?.companyOrRuc, initial?.city, defaultGenerateQuote]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const contact: WhatsAppContact = {
      name: name.trim(),
      companyOrRuc: companyOrRuc.trim(),
      city: city.trim(),
    };

    if (!contact.name || !contact.companyOrRuc || !contact.city) {
      setError('Completa nombre, RUC/empresa y ciudad.');
      return;
    }

    try {
      await onSubmit(contact, { generateQuote: showQuoteCheckbox && generateQuote });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo continuar.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="wa-contact-name">Nombre</Label>
            <Input
              id="wa-contact-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa-contact-company">RUC/Empresa</Label>
            <Input
              id="wa-contact-company"
              value={companyOrRuc}
              onChange={(event) => setCompanyOrRuc(event.target.value)}
              autoComplete="organization"
              placeholder="Ej. 20123456789 o Mi Empresa SAC"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa-contact-city">Ciudad</Label>
            <Input
              id="wa-contact-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              autoComplete="address-level2"
              placeholder="Ej. Lima"
              required
            />
          </div>

          {showQuoteCheckbox ? (
            <div className="flex items-start gap-3 rounded-md border border-border/70 bg-muted/30 p-3">
              <Checkbox
                id={quoteCheckboxId}
                checked={generateQuote}
                onCheckedChange={(checked) => setGenerateQuote(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label htmlFor={quoteCheckboxId} className="cursor-pointer font-medium leading-snug">
                  Generar cotización
                </Label>
                <p className="text-xs text-muted-foreground">
                  Se creará el PDF con tus datos y se abrirá WhatsApp con el mensaje del producto.
                </p>
              </div>
            </div>
          ) : null}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#25D366] text-white hover:bg-[#20BD5A] focus-visible:ring-[#25D366]"
            >
              {isSubmitting
                ? generateQuote
                  ? 'Generando…'
                  : 'Abriendo…'
                : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
