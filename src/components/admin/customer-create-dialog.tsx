import { useEffect, useState, type FormEvent } from 'react';

import { PersonaCustomerFormFields } from '@/components/admin/persona-customer-form-fields';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { emptyPersonaCustomerForm, personaFormToApiBody } from '@/lib/persona-customer-payload';

interface CustomerCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (body: ReturnType<typeof personaFormToApiBody>) => Promise<void>;
  isSaving: boolean;
}

export function CustomerCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isSaving,
}: CustomerCreateDialogProps) {
  const [form, setForm] = useState(emptyPersonaCustomerForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(emptyPersonaCustomerForm());
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.nombre_razon_social.trim()) {
      setError('La razón social es obligatoria.');
      return;
    }
    if (!form.numero_documento.trim()) {
      setError('El número de documento es obligatorio.');
      return;
    }
    setError(null);
    try {
      await onSubmit(personaFormToApiBody(form));
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el cliente');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription>
            Registra un cliente con los mismos campos del reporte Persona (Excel).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PersonaCustomerFormFields
            values={form}
            onChange={setForm}
            idPrefix="new-customer"
          />

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-500" disabled={isSaving}>
              {isSaving ? 'Creando…' : 'Crear cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
