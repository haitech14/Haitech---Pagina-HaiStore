import { addressFromCustomer } from '@/lib/crm-lead-address';
import { isUserRole } from '@/types/product';
import type { CrmLeadEmailEntry, CrmLeadPhoneEntry, CrmNewLeadFormValues } from '@/types/crm-lead-form';
import type { CrmPipelineStageId } from '@/types/crm-pipeline';
import type { StoreCustomerSearchResult } from '@/types/store-customer';

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

export function createInitialCrmLeadForm(
  stageId: CrmPipelineStageId,
  ownerId: string,
  ownerLabel: string,
): CrmNewLeadFormValues {
  return {
    contactName: '',
    organization: '',
    address: '',
    district: '',
    city: 'Lima',
    province: 'Lima',
    title: '',
    productName: '',
    lineItems: [],
    valueAmount: '',
    currency: 'PEN',
    customerRole: 'public',
    contactEmail: '',
    website: '',
    tags: 'ninguna',
    ownerId,
    ownerLabel,
    expectedCloseDate: '',
    sourceChannel: '',
    visibility: 'proyecto',
    phones: [newPhoneEntry()],
    emails: [newEmailEntry()],
    notes: '',
    stageId,
  };
}

export function applyCustomerToCrmLeadForm(
  form: CrmNewLeadFormValues,
  customer: StoreCustomerSearchResult,
): CrmNewLeadFormValues {
  const contact = customer.full_name?.trim() ?? '';
  const organization =
    customer.company_name?.trim() || customer.full_name?.trim() || '';
  const email = customer.email?.trim() ?? '';
  const phoneDigits = (customer.phone ?? '').replace(/\D/g, '');

  const title =
    form.title.trim() || (organization ? `Compra — ${organization}` : '');

  const role =
    customer.profile_role && isUserRole(customer.profile_role)
      ? customer.profile_role
      : form.customerRole;

  const addr = addressFromCustomer(customer);

  return {
    ...form,
    contactName: contact || form.contactName,
    organization: organization || form.organization,
    address: addr.address || form.address,
    district: addr.district || form.district,
    city: addr.city || form.city,
    province: addr.province || form.province,
    title,
    customerRole: role,
    contactEmail: email || form.contactEmail,
    phones:
      phoneDigits.length > 0
        ? form.phones.map((p, i) => (i === 0 ? { ...p, number: phoneDigits } : p))
        : form.phones,
    emails:
      email.length > 0
        ? form.emails.map((e, i) => (i === 0 ? { ...e, address: email } : e))
        : form.emails,
    sourceChannel: form.sourceChannel || 'web',
  };
}
