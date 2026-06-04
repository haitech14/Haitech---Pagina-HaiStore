import { useId, useState } from 'react';
import { CircleHelp, type LucideIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTpvCustomerSearch } from '@/hooks/use-tpv-customers';
import { applyCustomerToCrmLeadForm } from '@/lib/crm-lead-customer-fill';
import { customerDisplayLabel } from '@/lib/tpv-customer';
import { cn } from '@/lib/utils';
import type { CrmNewLeadFormValues } from '@/types/crm-lead-form';
import type { StoreCustomerSearchResult } from '@/types/store-customer';

interface CrmLeadCustomerAutocompleteFieldProps {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  value: string;
  form: CrmNewLeadFormValues;
  onFormChange: (next: CrmNewLeadFormValues) => void;
  onValueChange: (value: string) => void;
  autoComplete?: string;
}

export function CrmLeadCustomerAutocompleteField({
  id,
  label,
  hint,
  icon: Icon,
  value,
  form,
  onFormChange,
  onValueChange,
  autoComplete,
}: CrmLeadCustomerAutocompleteFieldProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const searchTerm = value.trim();
  const { data: suggestions = [], isFetching } = useTpvCustomerSearch(searchTerm);

  const showList =
    open && searchTerm.length >= 2 && (isFetching || suggestions.length > 0);

  const pickCustomer = (row: StoreCustomerSearchResult) => {
    onFormChange(applyCustomerToCrmLeadForm(form, row));
    setOpen(false);
  };

  return (
    <div>
      <div className="mb-1 flex items-center gap-1">
        <Label htmlFor={id} className="text-xs font-medium text-foreground">
          {label}
        </Label>
        {hint ? (
          <span className="inline-flex text-muted-foreground" title={hint} aria-label={hint}>
            <CircleHelp className="size-3.5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          value={value}
          autoComplete={autoComplete ?? 'off'}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showList}
          className="pl-9"
          onChange={(event) => {
            onValueChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        />
        {showList ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-50 mt-1 max-h-44 w-full overflow-y-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
          >
            {isFetching && suggestions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">Buscando…</li>
            ) : null}
            {suggestions.map((row) => (
              <li key={row.id} role="option">
                <button
                  type="button"
                  className={cn(
                    'flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pickCustomer(row)}
                >
                  <span className="font-medium">{customerDisplayLabel(row)}</span>
                  {row.email ? (
                    <span className="text-xs text-muted-foreground">{row.email}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
