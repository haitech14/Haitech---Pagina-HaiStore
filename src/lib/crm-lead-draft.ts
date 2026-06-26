import { createPipelineLeadFromForm } from '@/lib/crm-lead-form';
import { randomId } from '@/lib/random-id';
import type { CrmNewLeadFormValues } from '@/types/crm-lead-form';
import type { CrmPipelineLead } from '@/types/crm-pipeline';

export function hasLeadFormDraftContent(form: CrmNewLeadFormValues): boolean {
  if (
    form.organization.trim() ||
    form.contactName.trim() ||
    form.title.trim() ||
    form.notes.trim() ||
    form.productName.trim() ||
    form.valueAmount.trim() ||
    form.contactEmail.trim() ||
    form.address.trim() ||
    form.district.trim()
  ) {
    return true;
  }

  if (form.lineItems.length > 0) return true;

  if (form.phones.some((phone) => phone.number.replace(/\D/g, '').length >= 6)) return true;
  if (form.emails.some((email) => email.address.trim().includes('@'))) return true;
  if (form.tasks.some((task) => task.title.trim())) return true;

  return false;
}

export function createDraftLeadFromForm(
  form: CrmNewLeadFormValues,
  leadId: string | null,
  meta?: { sellerName?: string; createdAt?: string },
): CrmPipelineLead | null {
  if (!hasLeadFormDraftContent(form)) return null;

  const id = leadId ?? randomId();
  const lead = createPipelineLeadFromForm(
    {
      ...form,
      title: form.title.trim() || 'Borrador',
    },
    id,
    meta,
    { allowPartial: true },
  );

  if (!lead) return null;
  return { ...lead, isDraft: true };
}
