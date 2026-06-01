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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CUSTOMER_EDIT_ROLES, roleBadgeLabel } from '@/lib/customers-by-role';
import type { StoreCustomerWithRole } from '@/types/store';

export interface CustomerEditFormValues {
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  tax_id: string;
  notes: string;
  profile_role: string;
}

interface CustomerEditDialogProps {
  customer: StoreCustomerWithRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CustomerEditFormValues) => Promise<void>;
  isSaving: boolean;
}

function toFormValues(customer: StoreCustomerWithRole): CustomerEditFormValues {
  return {
    full_name: customer.full_name ?? '',
    email: customer.email,
    phone: customer.phone ?? '',
    company_name: customer.company_name ?? '',
    tax_id: customer.tax_id ?? '',
    notes: customer.notes ?? '',
    profile_role: customer.profile_role ?? 'public',
  };
}

export function CustomerEditDialog({
  customer,
  open,
  onOpenChange,
  onSubmit,
  isSaving,
}: CustomerEditDialogProps) {
  const [form, setForm] = useState<CustomerEditFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && customer) {
      setForm(toFormValues(customer));
      setError(null);
    }
  }, [open, customer]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
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
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            {hasAccount
              ? `Cuenta vinculada · tipo actual: ${roleBadgeLabel(customer)}`
              : 'Cliente sin perfil de acceso; el tipo de cliente no aplica hasta vincular una cuenta.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customer-full-name">Nombre</Label>
              <Input
                id="customer-full-name"
                value={form.full_name}
                onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customer-email">Correo</Label>
              <Input
                id="customer-email"
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone">Teléfono</Label>
              <Input
                id="customer-phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-company">Empresa</Label>
              <Input
                id="customer-company"
                value={form.company_name}
                onChange={(event) => setForm({ ...form, company_name: event.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customer-tax-id">RUC / documento</Label>
              <Input
                id="customer-tax-id"
                value={form.tax_id}
                onChange={(event) => setForm({ ...form, tax_id: event.target.value })}
              />
            </div>
          </div>

          {hasAccount ? (
            <div className="space-y-2">
              <Label htmlFor="customer-role">Tipo de cliente</Label>
              <Select
                value={form.profile_role}
                onValueChange={(value) => setForm({ ...form, profile_role: value })}
              >
                <SelectTrigger id="customer-role" aria-label="Tipo de cliente">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_EDIT_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define la lista de precios que verá en la tienda.
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="customer-notes">Notas internas</Label>
            <textarea
              id="customer-notes"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              rows={3}
              className={cn(
                'flex min-h-[4.5rem] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              )}
            />
          </div>

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
