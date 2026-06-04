export type AdminWorkspaceBrandId = 'haitech' | 'printcore';

export interface AdminWorkspaceBrand {
  id: AdminWorkspaceBrandId;
  companyName: string;
  legalName: string;
  logoUrl: string;
  logoAlt: string;
}

export const ADMIN_WORKSPACE_BRANDS: Record<AdminWorkspaceBrandId, AdminWorkspaceBrand> = {
  haitech: {
    id: 'haitech',
    companyName: 'HAITECH',
    legalName: 'NBN TECNOLOGIA TOTAL S.A.C.',
    logoUrl: '/logoclaro.png',
    logoAlt: 'Haitech',
  },
  printcore: {
    id: 'printcore',
    companyName: 'PRINTCORE',
    legalName: 'SOLUCIONES DE IMPRESIÓN',
    logoUrl: '/logo.png',
    logoAlt: 'Printcore — Soluciones de impresión',
  },
};

export const ADMIN_WORKSPACE_BRAND_LIST = Object.values(ADMIN_WORKSPACE_BRANDS);

export function isAdminWorkspaceBrandId(value: string): value is AdminWorkspaceBrandId {
  return value === 'haitech' || value === 'printcore';
}
