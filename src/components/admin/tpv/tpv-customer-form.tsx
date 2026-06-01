import { useEffect, useId, useMemo, useState } from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTpvCustomerSearch } from '@/hooks/use-tpv-customers';
import {
  customerDisplayLabel,
  storeCustomerToTpvCustomer,
} from '@/lib/tpv-customer';
import { cn } from '@/lib/utils';
import { PRICE_ROLE_LABELS, PRICE_ROLES, type PriceRole } from '@/types/product';
import type { TpvCurrency, TpvCustomer } from '@/types/tpv';
import type { StoreCustomerSearchResult } from '@/types/store-customer';

interface TpvCustomerFormProps {
  customer: TpvCustomer;
  onChange: (customer: TpvCustomer) => void;
}

export function TpvCustomerForm({ customer, onChange }: TpvCustomerFormProps) {
  const listId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const { data: suggestions = [], isFetching } = useTpvCustomerSearch(searchQuery);

  const activeQuery = useMemo(() => {
    const razon = customer.razonSocial.trim();
    const doc = customer.documento.trim();
    if (doc.length >= 2) return doc;
    if (razon.length >= 2) return razon;
    return '';
  }, [customer.documento, customer.razonSocial]);

  useEffect(() => {
    setSearchQuery(activeQuery);
  }, [activeQuery]);

  const applyCustomer = (row: StoreCustomerSearchResult) => {
    onChange({ ...customer, ...storeCustomerToTpvCustomer(row) });
    setSuggestionsOpen(false);
    setSearchQuery('');
  };

  const showSuggestions =
    suggestionsOpen && searchQuery.trim().length >= 2 && (suggestions.length > 0 || isFetching);

  return (
    <div className="space-y-3">
      <div className="relative space-y-1.5">
        <Label htmlFor="tpv-razon">Razón social / Nombre</Label>
        <Input
          id="tpv-razon"
          value={customer.razonSocial}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showSuggestions}
          onChange={(event) => {
            const value = event.target.value;
            onChange({ ...customer, razonSocial: value, storeCustomerId: null });
            setSearchQuery(value);
            setSuggestionsOpen(true);
          }}
          onFocus={() => setSuggestionsOpen(true)}
          onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 150)}
        />
      </div>

      <div className="relative space-y-1.5">
        <Label htmlFor="tpv-doc">RUC / DNI</Label>
        <Input
          id="tpv-doc"
          value={customer.documento}
          inputMode="numeric"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          onChange={(event) => {
            const value = event.target.value;
            onChange({ ...customer, documento: value, storeCustomerId: null });
            setSearchQuery(value);
            setSuggestionsOpen(true);
          }}
          onFocus={() => setSuggestionsOpen(true)}
          onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 150)}
        />

        {showSuggestions && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
          >
            {isFetching && suggestions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">Buscando…</li>
            ) : null}
            {suggestions.map((row) => (
              <li key={row.id} role="option">
                <button
                  type="button"
                  className={cn(
                    'flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applyCustomer(row)}
                >
                  <span className="font-medium">{customerDisplayLabel(row)}</span>
                  {row.email && (
                    <span className="text-xs text-muted-foreground">{row.email}</span>
                  )}
                </button>
              </li>
            ))}
            {!isFetching && suggestions.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Sin coincidencias. Puede ingresar los datos manualmente.
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="tpv-price-list">Lista de precio</Label>
          <Select
            value={customer.priceList}
            onValueChange={(value) =>
              onChange({ ...customer, priceList: value as PriceRole })
            }
          >
            <SelectTrigger id="tpv-price-list" className="w-full">
              <SelectValue placeholder="Seleccionar lista" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {PRICE_ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tpv-currency">Moneda</Label>
          <Select
            value={customer.currency}
            onValueChange={(value) =>
              onChange({ ...customer, currency: value as TpvCurrency })
            }
          >
            <SelectTrigger id="tpv-currency" className="w-full">
              <SelectValue placeholder="Moneda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PEN">Soles (PEN)</SelectItem>
              <SelectItem value="USD">Dólares (USD)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="tpv-atencion">Atención</Label>
          <Input
            id="tpv-atencion"
            value={customer.atencion}
            onChange={(event) => onChange({ ...customer, atencion: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tpv-cel">Celular</Label>
          <Input
            id="tpv-cel"
            value={customer.celular}
            onChange={(event) => onChange({ ...customer, celular: event.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tpv-dir">Dirección</Label>
        <Input
          id="tpv-dir"
          value={customer.direccion}
          onChange={(event) => onChange({ ...customer, direccion: event.target.value })}
        />
      </div>
    </div>
  );
}
