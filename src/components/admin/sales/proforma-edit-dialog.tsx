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
import {
  PROFORMA_FOLLOW_UP_LABELS,
  type ProformaFollowUpStatus,
  type ProformaRecord,
  type UpdateProformaPayload,
} from '@/types/proforma';

interface ProformaEditDialogProps {
  proforma: ProformaRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: UpdateProformaPayload) => Promise<void>;
  isSaving: boolean;
}

export function ProformaEditDialog({
  proforma,
  open,
  onOpenChange,
  onSubmit,
  isSaving,
}: ProformaEditDialogProps) {
  const [form, setForm] = useState<UpdateProformaPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && proforma) {
      setForm({
        customer: { ...proforma.customer },
        followUpStatus: proforma.followUpStatus,
        notes: proforma.notes,
      });
      setError(null);
    }
  }, [open, proforma]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setError(null);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
  };

  if (!proforma || !form?.customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar proforma {proforma.documentNumber}</DialogTitle>
          <DialogDescription>
            Vendedor: {proforma.sellerName}
            {proforma.sellerEmail ? ` · ${proforma.sellerEmail}` : ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pf-status">Seguimiento</Label>
            <Select
              value={form.followUpStatus ?? 'pending'}
              onValueChange={(value) =>
                setForm({ ...form, followUpStatus: value as ProformaFollowUpStatus })
              }
            >
              <SelectTrigger id="pf-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PROFORMA_FOLLOW_UP_LABELS) as ProformaFollowUpStatus[]).map(
                  (status) => (
                    <SelectItem key={status} value={status}>
                      {PROFORMA_FOLLOW_UP_LABELS[status]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="pf-razon">Razón social / nombre</Label>
              <Input
                id="pf-razon"
                value={form.customer.razonSocial ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customer: { ...form.customer!, razonSocial: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-doc">RUC / DNI</Label>
              <Input
                id="pf-doc"
                value={form.customer.documento ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customer: { ...form.customer!, documento: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-atencion">Atención</Label>
              <Input
                id="pf-atencion"
                value={form.customer.atencion ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customer: { ...form.customer!, atencion: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="pf-celular">Celular</Label>
              <Input
                id="pf-celular"
                type="tel"
                value={form.customer.celular ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customer: { ...form.customer!, celular: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-notes">Notas de seguimiento</Label>
            <textarea
              id="pf-notes"
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
