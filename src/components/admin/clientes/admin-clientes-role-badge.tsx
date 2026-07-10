import type { CustomerRoleGroupKey } from '@/lib/customers-by-role';
import { cn } from '@/lib/utils';

const roleStyles: Record<CustomerRoleGroupKey, string> = {
  admin: 'bg-violet-50 text-violet-700 ring-violet-200/60',
  tecnico: 'bg-blue-50 text-blue-700 ring-blue-200/60',
  distribuidor: 'bg-amber-50 text-amber-700 ring-amber-200/60',
  mayorista: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  public: 'bg-sky-50 text-sky-700 ring-sky-200/60',
  guest: 'bg-slate-100 text-slate-600 ring-slate-200/60',
};

const roleLabels: Record<CustomerRoleGroupKey, string> = {
  admin: 'Administrador',
  tecnico: 'Técnico',
  distribuidor: 'Técnico',
  mayorista: 'Mayorista',
  public: 'Público',
  guest: 'Sin cuenta',
};

interface AdminClientesRoleBadgeProps {
  role: CustomerRoleGroupKey;
  className?: string;
}

export function AdminClientesRoleBadge({ role, className }: AdminClientesRoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        roleStyles[role],
        className,
      )}
    >
      {roleLabels[role]}
    </span>
  );
}
