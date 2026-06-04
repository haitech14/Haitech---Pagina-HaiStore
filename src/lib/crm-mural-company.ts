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

/** Tarjetas del mural con cuentas bancarias sincronizadas desde configuración. */
export function buildMuralCardsWithCompany(
  company: CompanySettings = DEFAULT_COMPANY_SETTINGS,
): CrmMuralCard[] {
  const accounts = parseBankAccountsText(company.bankAccountsText);

  return CRM_MURAL_CARDS.map((card) => {
    if (card.kind !== 'accounts' || card.id !== 'c1') return card;
    return {
      ...card,
      title: company.legalName.toUpperCase(),
      accounts: accounts.length > 0 ? accounts : card.accounts,
    };
  });
}
