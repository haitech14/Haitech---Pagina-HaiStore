import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CUSTOMER_EDIT_ROLES } from '@/lib/customers-by-role';
import { USER_ROLE_LABELS, type UserRole } from '@/types/product';
import type { StoreCustomerWithRole } from '@/types/store';

interface CustomerListRoleCellProps {
  customer: StoreCustomerWithRole;
  disabled?: boolean;
  onRoleChange: (role: UserRole) => void;
}

export function CustomerListRoleCell({
  customer,
  disabled,
  onRoleChange,
}: CustomerListRoleCellProps) {
  const role = (customer.profile_role ?? customer.tipo_cliente ?? 'public') as UserRole;
  const label =
    role in USER_ROLE_LABELS ? USER_ROLE_LABELS[role as UserRole] : role || 'Sin asignar';

  if (disabled) {
    return <span className="text-xs text-muted-foreground">{label}</span>;
  }

  return (
    <Select value={role} onValueChange={(value) => onRoleChange(value as UserRole)}>
      <SelectTrigger
        className="h-9 min-w-[9rem] max-w-[12rem] text-xs"
        aria-label={`Tipo de cliente de ${customer.full_name ?? customer.email}`}
      >
        <SelectValue placeholder="Seleccionar rol" />
      </SelectTrigger>
      <SelectContent>
        {CUSTOMER_EDIT_ROLES.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
