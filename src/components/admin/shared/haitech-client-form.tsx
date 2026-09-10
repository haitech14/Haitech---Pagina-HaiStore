import { useId, useMemo, useState } from 'react';

import { SunatRucField } from '@/components/forms/sunat-ruc-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTpvCustomerSearch } from '@/hooks/use-tpv-customers';
import { useApplySunatRuc } from '@/hooks/use-sunat-ruc-lookup';
import {
  EMPTY_HAITECH_CLIENT,
  type HaitechClientFormValues,
} from '@/lib/haitech-client-schema';
import { searchResultToHaitechClient } from '@/lib/haitech-client-mappers';
import { applySunatToClientForm } from '@/lib/sunat-ruc';
import { customerDisplayLabel } from '@/lib/tpv-customer';
import { cn } from '@/lib/utils';
import { PRICE_ROLE_LABELS, PRICE_ROLES } from '@/types/product';

interface HaitechClientFormProps {
  value: HaitechClientFormValues;
  onChange: (value: HaitechClientFormValues) => void;
  idPrefix?: string;
  showEmail?: boolean;
  showNotas?: boolean;
  className?: string;
}

export function HaitechClientForm({
  value,
  onChange,
  idPrefix = 'hc',
  showEmail = false,
  showNotas = false,
  className,
}: HaitechClientFormProps) {
  const listId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const activeQuery = useMemo(() => {
    const doc = value.rucDni.trim();
    const name = value.nombre.trim();
    if (doc.length >= 2) return doc;
    if (name.length >= 2) return name;
    return '';
  }, [value.nombre, value.rucDni]);

  const { data: suggestions = [], isFetching } = useTpvCustomerSearch(
    searchQuery || activeQuery,
  );

  const showSuggestions =
    suggestionsOpen && (searchQuery.trim().length >= 2 || activeQuery.length >= 2) &&
    (suggestions.length > 0 || isFetching);

  const patch = (partial: Partial<HaitechClientFormValues>) => {
    onChange({ ...value, ...partial });
  };

  const sunat = useApplySunatRuc(value.rucDni, (data) => {
    onChange(applySunatToClientForm(value, data));
  });

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative space-y-1.5">
        <Label htmlFor={`${idPrefix}-nombre`}>Razón social</Label>
        <Input
          id={`${idPrefix}-nombre`}
          value={value.nombre}
          autoComplete="organization"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showSuggestions}
          onChange={(event) => {
            patch({ nombre: event.target.value, storeCustomerId: null });
            setSearchQuery(event.target.value);
            setSuggestionsOpen(true);
          }}
          onFocus={() => setSuggestionsOpen(true)}
          onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 150)}
        />
      </div>

      <div className="relative grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-contacto`}>Contacto</Label>
          <Input
            id={`${idPrefix}-contacto`}
            value={value.nombreContacto}
            autoComplete="name"
            onChange={(event) => patch({ nombreContacto: event.target.value })}
          />
        </div>
        <SunatRucField
          id={`${idPrefix}-ruc`}
          label="RUC / DNI"
          documentType="ruc-or-dni"
          placeholder="RUC o DNI"
          value={value.rucDni}
          onValueChange={(rucDni) => {
            patch({ rucDni, storeCustomerId: null });
            setSearchQuery(rucDni);
            setSuggestionsOpen(true);
          }}
          isFetching={sunat.isFetching}
          isSuccess={sunat.isSuccess}
          errorMessage={sunat.error instanceof Error ? sunat.error.message : null}
          aria-controls={listId}
          onFocus={() => setSuggestionsOpen(true)}
          onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 150)}
        />
      </div>

      {showSuggestions ? (
        <ul
          id={listId}
          role="listbox"
          className="max-h-48 overflow-y-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
        >
          {isFetching && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">Buscando…</li>
          ) : null}
          {suggestions.map((row) => (
            <li key={`${row.source ?? 'haistore'}-${row.id}`} role="option">
              <button
                type="button"
                className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(searchResultToHaitechClient(row));
                  setSuggestionsOpen(false);
                  setSearchQuery('');
                }}
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

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-tel`}>Teléfono</Label>
          <Input
            id={`${idPrefix}-tel`}
            type="tel"
            value={value.telefono}
            autoComplete="tel"
            onChange={(event) => patch({ telefono: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-tipo`}>Tipo de cliente</Label>
          <Select
            value={value.tipoCliente}
            onValueChange={(tipo) => patch({ tipoCliente: tipo as HaitechClientFormValues['tipoCliente'] })}
          >
            <SelectTrigger id={`${idPrefix}-tipo`}>
              <SelectValue />
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
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-dir`}>Dirección</Label>
        <Input
          id={`${idPrefix}-dir`}
          value={value.direccion}
          autoComplete="street-address"
          onChange={(event) => patch({ direccion: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-ciudad`}>Ciudad</Label>
        <Input
          id={`${idPrefix}-ciudad`}
          value={value.ciudad}
          autoComplete="address-level2"
          onChange={(event) => patch({ ciudad: event.target.value })}
        />
      </div>

      {showEmail ? (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-email`}>Correo (opcional)</Label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            value={value.email ?? ''}
            autoComplete="email"
            onChange={(event) => patch({ email: event.target.value })}
          />
        </div>
      ) : null}

      {showNotas ? (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-notas`}>Notas</Label>
          <textarea
            id={`${idPrefix}-notas`}
            rows={2}
            value={value.notas ?? ''}
            onChange={(event) => patch({ notas: event.target.value })}
            className="flex min-h-[3rem] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      ) : null}
    </div>
  );
}

export { EMPTY_HAITECH_CLIENT };
