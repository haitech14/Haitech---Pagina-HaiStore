import { useEffect, useId, useMemo, useState } from 'react';
import { FileText, Truck } from 'lucide-react';

import { CheckoutSectionCard } from '@/components/checkout/checkout-section-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTpvCustomerSearch } from '@/hooks/use-tpv-customers';
import {
  CHECKOUT_LIMA_TRANSPORTE_OPTIONS,
  CHECKOUT_PROVINCIA_AGENCIA_OPTIONS,
  CHECKOUT_PROVINCIA_ENTREGA_OPTIONS,
  formatLimaTransportApprox,
} from '@/lib/checkout-shipping-options';
import {
  CHECKOUT_COMPROBANTE_TYPES,
  CHECKOUT_DESTINO_ENVIO,
  type CheckoutComprobanteType,
  type CheckoutDestinoEnvio,
  type CheckoutLimaTransporte,
  type CheckoutProvinciaAgencia,
  type CheckoutProvinciaEntrega,
  type HaitechClientFormValues,
} from '@/lib/haitech-client-schema';
import { searchResultToHaitechClient } from '@/lib/haitech-client-mappers';
import { customerDisplayLabel } from '@/lib/tpv-customer';
import { cn } from '@/lib/utils';

const COMPROBANTE_LABELS: Record<CheckoutComprobanteType, string> = {
  boleta: 'Boleta',
  factura: 'Factura',
};

const DESTINO_LABELS: Record<
  CheckoutDestinoEnvio,
  { title: string; description: string; badge: string }
> = {
  lima: {
    title: 'Lima metropolitana',
    description: 'Entrega en Lima y distritos cercanos. Coordinación con nuestro equipo.',
    badge: 'Recomendado',
  },
  provincia: {
    title: 'Provincia',
    description: 'Envío a departamentos fuera de Lima. Plazo según destino y agencia.',
    badge: 'Coordinar envío',
  },
};

interface CheckoutBillingShippingFormProps {
  value: HaitechClientFormValues;
  onChange: (value: HaitechClientFormValues) => void;
  idPrefix?: string;
  prefilledFromAccount?: boolean;
}

export function CheckoutBillingShippingForm({
  value,
  onChange,
  idPrefix = 'checkout',
  prefilledFromAccount = false,
}: CheckoutBillingShippingFormProps) {
  const listId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const tipoComprobante = value.tipoComprobante ?? 'boleta';
  const destinoEnvio = value.destinoEnvio ?? 'lima';

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
    suggestionsOpen &&
    (searchQuery.trim().length >= 2 || activeQuery.length >= 2) &&
    (suggestions.length > 0 || isFetching);

  const patch = (partial: Partial<HaitechClientFormValues>) => {
    onChange({ ...value, ...partial, tipoCliente: value.tipoCliente ?? 'public' });
  };

  const handleDestinoChange = (destino: CheckoutDestinoEnvio) => {
    const partial: Partial<HaitechClientFormValues> = { destinoEnvio: destino };

    if (destino === 'lima') {
      partial.transporteLima = value.transporteLima ?? 'motorizado';
      partial.agenciaProvincia = null;
      partial.modalidadProvincia = null;
    } else {
      partial.modalidadProvincia = value.modalidadProvincia ?? 'agencia';
      if (!value.atencionEntrega?.trim() && value.nombreContacto.trim()) {
        partial.atencionEntrega = value.nombreContacto.trim();
      }
      if (!value.dniEntrega?.trim() && value.rucDni.trim()) {
        partial.dniEntrega = value.rucDni.trim();
      }
    }

    patch(partial);
  };

  useEffect(() => {
    if (destinoEnvio !== 'provincia') return;

    const updates: Partial<HaitechClientFormValues> = {};
    if (!value.atencionEntrega?.trim() && value.nombreContacto.trim()) {
      updates.atencionEntrega = value.nombreContacto.trim();
    }
    if (!value.dniEntrega?.trim() && value.rucDni.trim()) {
      updates.dniEntrega = value.rucDni.trim();
    }
    if (Object.keys(updates).length > 0) {
      patch(updates);
    }
    // Solo rellena campos vacíos cuando el usuario completa contacto o documento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinoEnvio, value.nombreContacto, value.rucDni]);

  return (
    <div className="space-y-5">
      {prefilledFromAccount ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Datos cargados desde tu cuenta. Puedes editarlos antes de continuar.
        </p>
      ) : null}

      <CheckoutSectionCard
        icon={FileText}
        title="Datos de facturación"
        description="Indica el comprobante y los datos del titular para tu pedido."
      >
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Tipo de comprobante</p>
          <div
            role="radiogroup"
            aria-label="Tipo de comprobante"
            className="grid grid-cols-2 gap-3"
          >
            {CHECKOUT_COMPROBANTE_TYPES.map((tipo) => {
              const selected = tipoComprobante === tipo;
              return (
                <label
                  key={tipo}
                  className={cn(
                    'flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                    'focus-within:ring-2 focus-within:ring-foreground focus-within:ring-offset-2',
                    selected
                      ? 'border-foreground bg-foreground text-background shadow-sm'
                      : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50',
                  )}
                >
                  <input
                    type="radio"
                    name={`${idPrefix}-comprobante`}
                    value={tipo}
                    checked={selected}
                    onChange={() => patch({ tipoComprobante: tipo })}
                    className="sr-only"
                  />
                  {COMPROBANTE_LABELS[tipo]}
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative space-y-1.5 sm:col-span-2">
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

          <div className="relative space-y-1.5">
            <Label htmlFor={`${idPrefix}-ruc`}>
              {tipoComprobante === 'factura' ? 'RUC' : 'RUC / DNI'}
            </Label>
            <Input
              id={`${idPrefix}-ruc`}
              value={value.rucDni}
              inputMode="numeric"
              autoComplete="off"
              aria-controls={listId}
              onChange={(event) => {
                const rucDni = event.target.value;
                const partial: Partial<HaitechClientFormValues> = {
                  rucDni,
                  storeCustomerId: null,
                };
                if (destinoEnvio === 'provincia' && !value.dniEntrega?.trim()) {
                  partial.dniEntrega = rucDni;
                }
                patch(partial);
                setSearchQuery(rucDni);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 150)}
            />
          </div>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-contacto`}>Contacto</Label>
            <Input
              id={`${idPrefix}-contacto`}
              value={value.nombreContacto}
              autoComplete="name"
              onChange={(event) => {
                const nombreContacto = event.target.value;
                const partial: Partial<HaitechClientFormValues> = {
                  nombreContacto,
                };
                if (destinoEnvio === 'provincia' && !value.atencionEntrega?.trim()) {
                  partial.atencionEntrega = nombreContacto;
                }
                patch(partial);
              }}
            />
          </div>
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
        </div>
      </CheckoutSectionCard>

      <CheckoutSectionCard
        icon={Truck}
        title="Datos de envío"
        description="Selecciona el destino y completa la dirección de entrega."
      >
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Destino de envío</p>
          <div
            role="radiogroup"
            aria-label="Destino de envío"
            className="grid grid-cols-2 gap-3"
          >
            {CHECKOUT_DESTINO_ENVIO.map((destino) => {
              const selected = destinoEnvio === destino;
              const { title, badge } = DESTINO_LABELS[destino];
              return (
                <label
                  key={destino}
                  className={cn(
                    'flex min-h-11 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border px-3 py-2 text-center transition-colors',
                    'focus-within:ring-2 focus-within:ring-foreground focus-within:ring-offset-2',
                    selected
                      ? 'border-foreground bg-foreground text-background shadow-sm'
                      : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50',
                  )}
                >
                  <input
                    type="radio"
                    name={`${idPrefix}-destino`}
                    value={destino}
                    checked={selected}
                    onChange={() => handleDestinoChange(destino)}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold">{title}</span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      selected ? 'text-background/85' : 'text-muted-foreground',
                    )}
                  >
                    {badge}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {DESTINO_LABELS[destinoEnvio].description}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-dir`}>Dirección</Label>
          <Input
            id={`${idPrefix}-dir`}
            value={value.direccion}
            autoComplete="street-address"
            placeholder="Calle, número, urbanización o referencia"
            onChange={(event) => patch({ direccion: event.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-ciudad`}>Ciudad / Distrito</Label>
          <Input
            id={`${idPrefix}-ciudad`}
            value={value.ciudad}
            autoComplete="address-level2"
            placeholder={destinoEnvio === 'lima' ? 'Ej. Miraflores, Lima' : 'Ej. Arequipa, Cusco'}
            onChange={(event) => patch({ ciudad: event.target.value })}
          />
        </div>

        {destinoEnvio === 'lima' ? (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Tipo de transporte</p>
            <div
              role="radiogroup"
              aria-label="Tipo de transporte en Lima"
              className="grid gap-3 sm:grid-cols-3"
            >
              {CHECKOUT_LIMA_TRANSPORTE_OPTIONS.map((option) => {
                const selected = value.transporteLima === option.id;
                return (
                  <label
                    key={option.id}
                    className={cn(
                      'flex min-h-[4.5rem] cursor-pointer flex-col justify-center gap-1 rounded-lg border px-3 py-2.5 transition-colors',
                      'focus-within:ring-2 focus-within:ring-foreground focus-within:ring-offset-2',
                      selected
                        ? 'border-foreground bg-foreground text-background shadow-sm'
                        : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50',
                    )}
                  >
                    <input
                      type="radio"
                      name={`${idPrefix}-transporte-lima`}
                      value={option.id}
                      checked={selected}
                      onChange={() => patch({ transporteLima: option.id as CheckoutLimaTransporte })}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold">{option.label}</span>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        selected ? 'text-background/85' : 'text-muted-foreground',
                      )}
                    >
                      {formatLimaTransportApprox(option.id, value.ciudad)}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Costos referenciales según distrito. Camioneta aplica para equipos voluminosos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Agencia de envío</p>
              <div
                role="radiogroup"
                aria-label="Agencia de envío"
                className="grid gap-3 sm:grid-cols-3"
              >
                {CHECKOUT_PROVINCIA_AGENCIA_OPTIONS.map((option) => {
                  const selected = value.agenciaProvincia === option.id;
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        'flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-center text-sm font-semibold transition-colors',
                        'focus-within:ring-2 focus-within:ring-foreground focus-within:ring-offset-2',
                        selected
                          ? 'border-foreground bg-foreground text-background shadow-sm'
                          : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50',
                      )}
                    >
                      <input
                        type="radio"
                        name={`${idPrefix}-agencia`}
                        value={option.id}
                        checked={selected}
                        onChange={() =>
                          patch({ agenciaProvincia: option.id as CheckoutProvinciaAgencia })
                        }
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-atencion-entrega`}>Atención (quien recibe)</Label>
                <Input
                  id={`${idPrefix}-atencion-entrega`}
                  value={value.atencionEntrega ?? ''}
                  autoComplete="name"
                  placeholder="Nombre de quien recibirá el pedido"
                  onChange={(event) => patch({ atencionEntrega: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-dni-entrega`}>DNI de quien recibe</Label>
                <Input
                  id={`${idPrefix}-dni-entrega`}
                  value={value.dniEntrega ?? ''}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="8 dígitos"
                  onChange={(event) => patch({ dniEntrega: event.target.value })}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Modalidad de entrega</p>
              <div
                role="radiogroup"
                aria-label="Modalidad de entrega en provincia"
                className="grid gap-3 sm:grid-cols-2"
              >
                {CHECKOUT_PROVINCIA_ENTREGA_OPTIONS.map((option) => {
                  const selected = value.modalidadProvincia === option.id;
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        'flex min-h-[4.5rem] cursor-pointer flex-col justify-center gap-1 rounded-lg border px-3 py-2.5 transition-colors',
                        'focus-within:ring-2 focus-within:ring-foreground focus-within:ring-offset-2',
                        selected
                          ? 'border-foreground bg-foreground text-background shadow-sm'
                          : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50',
                      )}
                    >
                      <input
                        type="radio"
                        name={`${idPrefix}-modalidad-provincia`}
                        value={option.id}
                        checked={selected}
                        onChange={() =>
                          patch({ modalidadProvincia: option.id as CheckoutProvinciaEntrega })
                        }
                        className="sr-only"
                      />
                      <span className="text-sm font-semibold">{option.label}</span>
                      <span
                        className={cn(
                          'text-xs font-medium',
                          selected ? 'text-background/85' : 'text-muted-foreground',
                        )}
                      >
                        {option.description}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CheckoutSectionCard>
    </div>
  );
}
