import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CUSTOMER_EDIT_ROLES } from '@/lib/customers-by-role';
import { PERSONA_REPORT_COLUMNS } from '@/lib/persona-report-columns';
import type { PersonaCustomerFormValues } from '@/lib/persona-customer-payload';
import type { PersonaDataKey } from '@/lib/persona-report-columns';

interface PersonaCustomerFormFieldsProps {
  values: PersonaCustomerFormValues;
  onChange: (values: PersonaCustomerFormValues) => void;
  idPrefix?: string;
  showProfileRole?: boolean;
}

export function PersonaCustomerFormFields({
  values,
  onChange,
  idPrefix = 'persona',
  showProfileRole = true,
}: PersonaCustomerFormFieldsProps) {
  const patch = (key: PersonaDataKey | 'profile_role', value: string) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="grid max-h-[min(70vh,640px)] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
      {showProfileRole ? (
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-profile-role`}>Tipo de cliente (lista de precios)</Label>
          <Select value={values.profile_role} onValueChange={(v) => patch('profile_role', v)}>
            <SelectTrigger id={`${idPrefix}-profile-role`}>
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
        </div>
      ) : null}

      {PERSONA_REPORT_COLUMNS.map((column) => (
        <div key={column.key} className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-${column.key}`}>{column.label}</Label>
          <Input
            id={`${idPrefix}-${column.key}`}
            value={values[column.key] ?? ''}
            onChange={(event) => patch(column.key, event.target.value)}
            className={column.key === 'direccion' || column.key === 'observaciones' ? 'sm:col-span-2' : undefined}
          />
        </div>
      ))}
    </div>
  );
}
