import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
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

interface WhatsAppContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<WhatsAppContact> | null;
  onSubmit: (contact: WhatsAppContact) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function WhatsAppContactDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isSubmitting = false,
}: WhatsAppContactDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name?.trim() ?? '');
    setPhone(initial?.phone?.trim() ?? '');
    setCity(initial?.city?.trim() ?? '');
    setError(null);
  }, [open, initial?.name, initial?.phone, initial?.city]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const contact: WhatsAppContact = {
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
    };

    if (!contact.name || !contact.phone || !contact.city) {
      setError('Completa nombre, celular y ciudad.');
      return;
    }

    if (contact.phone.replace(/\D/g, '').length < 9) {
      setError('Introduce un celular válido.');
      return;
    }

    try {
      await onSubmit(contact);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo continuar.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Consulta por WhatsApp</DialogTitle>
          <DialogDescription>
            Indica tus datos para enviar el mensaje con el producto y el precio a nuestro equipo de
            ventas.
          </DialogDescription>
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
            <Label htmlFor="wa-contact-phone">Celular</Label>
            <Input
              id="wa-contact-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              placeholder="Ej. 999 888 777"
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
              {isSubmitting ? 'Abriendo…' : 'Abrir WhatsApp'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
