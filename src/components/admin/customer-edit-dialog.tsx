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
import { roleBadgeLabel } from '@/lib/customers-by-role';
import {
  customerToPersonaForm,
  type PersonaCustomerFormValues,
} from '@/lib/persona-customer-payload';
import type { StoreCustomerWithRole } from '@/types/store';

export type CustomerEditFormValues = PersonaCustomerFormValues;

interface CustomerEditDialogProps {
  customer: StoreCustomerWithRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CustomerEditFormValues) => Promise<void>;
  isSaving: boolean;
}

export function CustomerEditDialog({
  customer,
  open,
  onOpenChange,
  onSubmit,
  isSaving,
}: CustomerEditDialogProps) {
  const [form, setForm] = useState<PersonaCustomerFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && customer) {
      setForm(customerToPersonaForm(customer));
      setError(null);
    }
  }, [open, customer]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
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
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cliente');
    }
  };

  if (!customer || !form) return null;

  const hasAccount = Boolean(customer.profile_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            {hasAccount
              ? `Cuenta vinculada · tipo actual: ${roleBadgeLabel(customer)}`
              : 'Datos del reporte Persona. El tipo de cliente define la lista de precios en tienda.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PersonaCustomerFormFields
            values={form}
            onChange={setForm}
            idPrefix="edit-customer"
            showProfileRole={hasAccount}
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
