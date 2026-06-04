import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Building2,
  CircleHelp,
  Plus,
  Upload,
  User,
  UserRound,
  Users,
} from 'lucide-react';

import { CrmLeadAddressFields } from '@/components/admin/crm/crm-lead-address-fields';
import { CrmLeadCustomerAutocompleteField } from '@/components/admin/crm/crm-lead-customer-autocomplete-field';
import { CrmLeadProductsField } from '@/components/admin/crm/crm-lead-products-field';

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
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { CUSTOMER_EDIT_ROLES } from '@/lib/customers-by-role';
import { useCrmPipeline } from '@/context/crm-pipeline-context';
import { createInitialCrmLeadForm } from '@/lib/crm-lead-customer-fill';
import { createPipelineLeadFromForm, parseLeadCurrency, parseLeadValueAmount } from '@/lib/crm-lead-form';
import { formatLeadCreatedAt, formatLeadEquivalentHint } from '@/lib/crm-pipeline-utils';
import type { UserRole } from '@/types/product';
import type {
  CrmLeadEmailEntry,
  CrmLeadPhoneEntry,
  CrmNewLeadFormValues,
} from '@/types/crm-lead-form';
import type { CrmPipelineLead, CrmPipelineStageId } from '@/types/crm-pipeline';

const NOTES_MAX = 15_000;

const SOURCE_CHANNELS = [
  { id: 'web', label: 'Sitio web' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'instagram', label: 'Instagram / DM' },
  { id: 'referido', label: 'Referido' },
  { id: 'feria', label: 'Feria o evento' },
  { id: 'otro', label: 'Otro' },
] as const;

const TAG_OPTIONS = [
  { id: 'ninguna', label: 'Sin etiqueta' },
  { id: 'caliente', label: 'Caliente' },
  { id: 'frio', label: 'Frío' },
  { id: 'reactivacion', label: 'Reactivación' },
] as const;

const VISIBILITY_OPTIONS = [
  { id: 'proyecto', label: 'Grupo de visibilidad del proyecto' },
  { id: 'equipo', label: 'Todo el equipo' },
  { id: 'privado', label: 'Solo yo' },
] as const;

const PHONE_TYPES = [
  { id: 'trabajo', label: 'Trabajo' },
  { id: 'celular', label: 'Celular' },
  { id: 'personal', label: 'Personal' },
] as const;

const EMAIL_TYPES = [
  { id: 'trabajo', label: 'Trabajo' },
  { id: 'personal', label: 'Personal' },
  { id: 'otro', label: 'Otro' },
] as const;

function newPhoneEntry(): CrmLeadPhoneEntry {
  return {
    id: crypto.randomUUID(),
    countryCode: '+51',
    number: '',
    type: 'trabajo',
  };
}

function newEmailEntry(): CrmLeadEmailEntry {
  return {
    id: crypto.randomUUID(),
    address: '',
    type: 'trabajo',
  };
}

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-1 flex items-center gap-1">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
        {children}
      </Label>
      {hint ? (
        <span
          className="inline-flex text-muted-foreground"
          title={hint}
          aria-label={hint}
        >
          <CircleHelp className="size-3.5" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
}

interface CrmAddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStageId?: CrmPipelineStageId;
  editingLead?: CrmPipelineLead | null;
  onSave: (lead: CrmPipelineLead, mode: 'create' | 'update') => void;
}

export function CrmAddLeadDialog({
  open,
  onOpenChange,
  defaultStageId = 'leads',
  editingLead = null,
  onSave,
}: CrmAddLeadDialogProps) {
  const { user } = useAuth();
  const { usdToPenRate } = useCrmPipeline();
  const formId = useId();
  const ownerId = user?.id ?? 'actual';
  const ownerLabel = user?.name ?? user?.email ?? 'Usuario actual';

  const [form, setForm] = useState<CrmNewLeadFormValues>(() =>
    createInitialCrmLeadForm(defaultStageId, ownerId, ownerLabel),
  );
  const [error, setError] = useState<string | null>(null);
  const persistRef = useRef<{ mode: 'create' | 'update'; leadId: string | null }>({
    mode: 'create',
    leadId: null,
  });
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!open) {
      persistRef.current = { mode: 'create', leadId: null };
      isSubmittingRef.current = false;
      return;
    }
    if (editingLead) {
      persistRef.current = { mode: 'update', leadId: editingLead.id };
      const snapshot = editingLead.formSnapshot;
      const base = createInitialCrmLeadForm(editingLead.stageId, ownerId, ownerLabel);
      setForm({
        ...base,
        ...snapshot,
        address: snapshot.address ?? base.address,
        district: snapshot.district ?? base.district,
        city: snapshot.city ?? base.city,
        province: snapshot.province ?? base.province,
        lineItems: snapshot.lineItems ?? editingLead.lineItems ?? [],
      });
    } else {
      persistRef.current = { mode: 'create', leadId: null };
      setForm(createInitialCrmLeadForm(defaultStageId, ownerId, ownerLabel));
    }
    setError(null);
  }, [open, editingLead, defaultStageId, ownerId, ownerLabel]);

  const notesLength = form.notes.length;

  const valueEquivalentHint = useMemo(() => {
    const amount = parseLeadValueAmount(form.valueAmount);
    const currency = parseLeadCurrency(form.currency);
    return formatLeadEquivalentHint(amount, currency, usdToPenRate);
  }, [form.valueAmount, form.currency, usdToPenRate]);

  const ownerOptions = useMemo(
    () => [{ id: ownerId, label: `${ownerLabel} (Tú)` }],
    [ownerId, ownerLabel],
  );

  const patch = (partial: Partial<CrmNewLeadFormValues>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const updatePhone = (id: string, partial: Partial<CrmLeadPhoneEntry>) => {
    setForm((prev) => ({
      ...prev,
      phones: prev.phones.map((p) => (p.id === id ? { ...p, ...partial } : p)),
    }));
  };

  const updateEmail = (id: string, partial: Partial<CrmLeadEmailEntry>) => {
    setForm((prev) => ({
      ...prev,
      emails: prev.emails.map((e) => (e.id === id ? { ...e, ...partial } : e)),
    }));
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setError(null);

    const { mode, leadId } = persistRef.current;
    const formForSave = {
      ...form,
      stageId: editingLead?.stageId ?? form.stageId ?? defaultStageId,
      ownerLabel,
    };
    const lead = createPipelineLeadFromForm(formForSave, leadId ?? crypto.randomUUID(), {
      ...(editingLead?.createdAt ? { createdAt: editingLead.createdAt } : {}),
      sellerName: ownerLabel,
    });
    if (!lead) {
      setError('Indica al menos el título, la empresa o la persona de contacto.');
      isSubmittingRef.current = false;
      return;
    }
    onSave(lead, mode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,900px)] w-[min(98vw,56rem)] max-w-[min(98vw,56rem)] flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-0 border-b px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold">
            {editingLead ? 'Modificar prospecto' : 'Añadir prospecto'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {editingLead
              ? 'Formulario para editar un lead del pipeline de CRM.'
              : 'Formulario para registrar un nuevo lead en el pipeline de CRM.'}
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <UserRound className="size-4 text-violet-600" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Información del prospecto
                  </h3>
                </div>

                <CrmLeadCustomerAutocompleteField
                  id="crm-lead-empresa"
                  label="Empresa"
                  hint="Razón social o nombre comercial"
                  icon={Building2}
                  value={form.organization}
                  form={form}
                  onFormChange={setForm}
                  onValueChange={(organization) => patch({ organization })}
                  autoComplete="organization"
                />

                <CrmLeadCustomerAutocompleteField
                  id="crm-lead-contact"
                  label="Persona de contacto"
                  hint="Nombre de la persona principal"
                  icon={User}
                  value={form.contactName}
                  form={form}
                  onFormChange={setForm}
                  onValueChange={(contactName) => patch({ contactName })}
                  autoComplete="name"
                />

                <div>
                  <FieldLabel htmlFor="crm-lead-title">Título</FieldLabel>
                  <Input
                    id="crm-lead-title"
                    value={form.title}
                    onChange={(e) => patch({ title: e.target.value })}
                  />
                </div>

                <CrmLeadAddressFields
                  values={form}
                  onChange={(addressPatch) => patch(addressPatch)}
                />

                <CrmLeadProductsField
                  lineItems={form.lineItems}
                  customerRole={form.customerRole}
                  currency={form.currency}
                  onChange={(lineItems, sync) =>
                    patch({
                      lineItems,
                      valueAmount: sync.valueAmount,
                      productName: sync.productName,
                    })
                  }
                />

                <div>
                  <FieldLabel
                    htmlFor="crm-lead-value"
                    hint={
                      form.lineItems.length > 0
                        ? 'Total calculado desde productos; puedes ajustarlo'
                        : 'Valor estimado del negocio'
                    }
                  >
                    Valor total
                  </FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="crm-lead-value"
                      type="text"
                      inputMode="decimal"
                      value={form.valueAmount}
                      onChange={(e) => patch({ valueAmount: e.target.value })}
                      className="min-w-0 flex-1"
                      placeholder="0"
                    />
                    <Select
                      value={form.currency}
                      onValueChange={(currency) => patch({ currency })}
                    >
                      <SelectTrigger className="w-[8.5rem] shrink-0" aria-label="Moneda">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PEN">Sol peruano (PEN)</SelectItem>
                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {valueEquivalentHint ? (
                    <p
                      className="mt-1.5 text-xs tabular-nums text-muted-foreground"
                      role="status"
                      aria-live="polite"
                    >
                      {valueEquivalentHint}
                      <span className="text-[0.65rem]">
                        {' '}
                        (TC venta: {usdToPenRate.toLocaleString('es-PE', { maximumFractionDigits: 4 })})
                      </span>
                    </p>
                  ) : null}
                </div>

                <div>
                  <FieldLabel htmlFor="crm-lead-customer-role">Tipo de cliente</FieldLabel>
                  <Select
                    value={form.customerRole}
                    onValueChange={(customerRole) =>
                      patch({ customerRole: customerRole as UserRole })
                    }
                  >
                    <SelectTrigger id="crm-lead-customer-role">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOMER_EDIT_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FieldLabel htmlFor="crm-lead-contact-email">Correo</FieldLabel>
                  <Input
                    id="crm-lead-contact-email"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => patch({ contactEmail: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="crm-lead-website">Página web</FieldLabel>
                  <Input
                    id="crm-lead-website"
                    type="url"
                    value={form.website}
                    onChange={(e) => patch({ website: e.target.value })}
                    placeholder="https://"
                    autoComplete="url"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="crm-lead-tags">Etiquetas</FieldLabel>
                  <Select value={form.tags} onValueChange={(tags) => patch({ tags })}>
                    <SelectTrigger id="crm-lead-tags">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAG_OPTIONS.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FieldLabel htmlFor="crm-lead-owner" hint="Responsable comercial del lead">
                    Vendedor
                  </FieldLabel>
                  <Select
                    value={form.ownerId}
                    onValueChange={(ownerId) => {
                      const option = ownerOptions.find((o) => o.id === ownerId);
                      patch({
                        ownerId,
                        ownerLabel: option?.label.replace(/\s*\(Tú\)\s*$/, '') ?? ownerLabel,
                      });
                    }}
                  >
                    <SelectTrigger id="crm-lead-owner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerOptions.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editingLead ? (
                  <div>
                    <FieldLabel htmlFor="crm-lead-created">Fecha de creación</FieldLabel>
                    <Input
                      id="crm-lead-created"
                      readOnly
                      value={formatLeadCreatedAt(editingLead.createdAt)}
                      className="bg-muted/50"
                      aria-readonly="true"
                    />
                  </div>
                ) : null}

                <div>
                  <FieldLabel htmlFor="crm-lead-close" hint="Fecha estimada de cierre">
                    Fecha prevista de cierre
                  </FieldLabel>
                  <Input
                    id="crm-lead-close"
                    type="date"
                    value={form.expectedCloseDate}
                    onChange={(e) => patch({ expectedCloseDate: e.target.value })}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="crm-lead-source">Canal de la fuente</FieldLabel>
                  <Select
                    value={form.sourceChannel}
                    onValueChange={(sourceChannel) => patch({ sourceChannel })}
                  >
                    <SelectTrigger id="crm-lead-source">
                      <SelectValue placeholder="Seleccionar canal" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_CHANNELS.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          {ch.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FieldLabel htmlFor="crm-lead-visibility">Visible para</FieldLabel>
                  <Select
                    value={form.visibility}
                    onValueChange={(visibility) => patch({ visibility })}
                  >
                    <SelectTrigger id="crm-lead-visibility" className="gap-2">
                      <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIBILITY_OPTIONS.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FieldLabel htmlFor="crm-lead-notes">Notas</FieldLabel>
                  <Textarea
                    id="crm-lead-notes"
                    value={form.notes}
                    maxLength={NOTES_MAX}
                    onChange={(e) => patch({ notes: e.target.value })}
                    rows={3}
                    className="resize-y min-h-[4.5rem]"
                  />
                </div>
              </div>

              <div className="space-y-4 lg:border-l lg:border-border lg:pl-8">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <User className="size-4 text-emerald-600" aria-hidden="true" />
                  <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                    Persona
                  </h3>
                </div>

                <div className="space-y-4">
                  {form.phones.map((phone, index) => (
                    <div key={phone.id} className="space-y-2">
                      {index === 0 ? (
                        <FieldLabel hint="Teléfono principal de contacto">Teléfono</FieldLabel>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">
                          Teléfono adicional
                        </span>
                      )}
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Select
                          value={phone.countryCode}
                          onValueChange={(countryCode) =>
                            updatePhone(phone.id, { countryCode })
                          }
                        >
                          <SelectTrigger
                            className="w-full sm:w-[5.5rem]"
                            aria-label="Código de país"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+51">🇵🇪 +51</SelectItem>
                            <SelectItem value="+1">🇺🇸 +1</SelectItem>
                            <SelectItem value="+52">🇲🇽 +52</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="tel"
                          value={phone.number}
                          onChange={(e) => updatePhone(phone.id, { number: e.target.value })}
                          className="min-w-0 flex-1"
                          aria-label={`Número de teléfono ${index + 1}`}
                          autoComplete="tel"
                        />
                        <Select
                          value={phone.type}
                          onValueChange={(type) =>
                            updatePhone(phone.id, {
                              type: type as CrmLeadPhoneEntry['type'],
                            })
                          }
                        >
                          <SelectTrigger className="w-full sm:w-[7rem]" aria-label="Tipo de teléfono">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PHONE_TYPES.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto gap-1 p-0 text-emerald-700 hover:text-emerald-800"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        phones: [...prev.phones, newPhoneEntry()],
                      }))
                    }
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Añade un número de teléfono
                  </Button>
                </div>

                <div className="space-y-4">
                  {form.emails.map((email, index) => (
                    <div key={email.id} className="space-y-2">
                      {index === 0 ? (
                        <FieldLabel>Correo electrónico</FieldLabel>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">
                          Correo adicional
                        </span>
                      )}
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                          type="email"
                          value={email.address}
                          onChange={(e) => updateEmail(email.id, { address: e.target.value })}
                          placeholder="correo@ejemplo.com"
                          className="min-w-0 flex-1"
                          aria-label={`Correo electrónico ${index + 1}`}
                          autoComplete="email"
                        />
                        <Select
                          value={email.type}
                          onValueChange={(type) =>
                            updateEmail(email.id, {
                              type: type as CrmLeadEmailEntry['type'],
                            })
                          }
                        >
                          <SelectTrigger className="w-full sm:w-[7rem]" aria-label="Tipo de correo">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EMAIL_TYPES.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto gap-1 p-0 text-emerald-700 hover:text-emerald-800"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        emails: [...prev.emails, newEmailEntry()],
                      }))
                    }
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Añade un correo electrónico
                  </Button>
                </div>
              </div>
            </div>

            {error ? (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter className="shrink-0 flex-col gap-3 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="gap-2 self-start sm:self-center"
              disabled
              title="Próximamente"
            >
              <Upload className="size-4" aria-hidden="true" />
              Importar
            </Button>
            <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
              <span
                className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground"
                aria-live="polite"
              >
                {notesLength.toLocaleString('es-PE')}/{NOTES_MAX.toLocaleString('es-PE')}
                <span title="Límite de caracteres en notas">
                  <CircleHelp className="size-3.5" aria-hidden="true" />
                </span>
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form={formId}
                className="bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-600"
              >
                {editingLead ? 'Guardar cambios' : 'Guardar'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
