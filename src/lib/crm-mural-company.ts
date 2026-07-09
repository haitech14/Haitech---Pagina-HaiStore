import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { CompanySettings } from '@/types/company-settings';
import type { CrmMuralAccountLine, CrmMuralCard } from '@/types/crm-mural';
import { CRM_MURAL_CARDS } from '@/data/crm-mural-mock';

export function parseBankAccountsText(text: string): CrmMuralAccountLine[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(':');
      if (colon === -1) {
        return { bank: line, lines: [] };
      }
      const bank = line.slice(0, colon).trim();
      const rest = line.slice(colon + 1).trim();
      const lines = rest
        .split(/\s*[—–|]\s*/)
        .map((part) => part.trim())
        .filter(Boolean);
      return { bank, lines: lines.length > 0 ? lines : [rest] };
    });
}

function buildCompanyAccountsCard(company: CompanySettings): CrmMuralCard | null {
  const accounts = parseBankAccountsText(company.bankAccountsText);
  if (accounts.length === 0) return null;

  return {
    id: 'company-accounts',
    columnId: 'cuentas',
    kind: 'accounts',
    topBorderClass: 'border-t-blue-600',
    title: company.legalName.toUpperCase(),
    accounts,
  };
}

/** Tarjetas del mural con cuentas bancarias sincronizadas desde configuración. */
export function buildMuralCardsWithCompany(
  company: CompanySettings = DEFAULT_COMPANY_SETTINGS,
): CrmMuralCard[] {
  const accountsCard = buildCompanyAccountsCard(company);
  const seededCards = CRM_MURAL_CARDS.filter((card) => card.kind !== 'accounts');

  if (!accountsCard) return seededCards;
  return [...seededCards, accountsCard];
}
