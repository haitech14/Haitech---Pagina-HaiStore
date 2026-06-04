import { MapPin } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CrmNewLeadFormValues } from '@/types/crm-lead-form';

interface CrmLeadAddressFieldsProps {
  values: Pick<CrmNewLeadFormValues, 'address' | 'district' | 'city' | 'province'>;
  onChange: (patch: Partial<Pick<CrmNewLeadFormValues, 'address' | 'district' | 'city' | 'province'>>) => void;
  idPrefix?: string;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
      {children}
    </Label>
  );
}

export function CrmLeadAddressFields({
  values,
  onChange,
  idPrefix = 'crm-lead',
}: CrmLeadAddressFieldsProps) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-border/80 bg-muted/15 p-3">
      <legend className="flex items-center gap-1.5 px-1 text-xs font-semibold text-foreground">
        <MapPin className="size-3.5 text-violet-600" aria-hidden="true" />
        Dirección
      </legend>
      <div>
        <FieldLabel htmlFor={`${idPrefix}-address`}>Calle / av. / referencia</FieldLabel>
        <Input
          id={`${idPrefix}-address`}
          value={values.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Av. Petit Thouars 1931, of. 402"
          className="mt-1"
          autoComplete="street-address"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor={`${idPrefix}-district`}>Distrito</FieldLabel>
          <Input
            id={`${idPrefix}-district`}
            value={values.district}
            onChange={(e) => onChange({ district: e.target.value })}
            placeholder="Lince"
            className="mt-1"
          />
        </div>
        <div>
          <FieldLabel htmlFor={`${idPrefix}-city`}>Ciudad</FieldLabel>
          <Input
            id={`${idPrefix}-city`}
            value={values.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Lima"
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor={`${idPrefix}-province`}>Provincia / departamento</FieldLabel>
        <Input
          id={`${idPrefix}-province`}
          value={values.province}
          onChange={(e) => onChange({ province: e.target.value })}
          placeholder="Lima"
          className="mt-1"
        />
      </div>
    </fieldset>
  );
}
