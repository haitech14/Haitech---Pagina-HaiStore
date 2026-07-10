import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { ProductDetailShippingRows } from '@/components/product-detail/product-detail-shipping-info';
import { cn } from '@/lib/utils';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Pago con tarjeta (+5%)' },
  { id: 'yape-plin', label: 'Pago Yape/Plin' },
  { id: 'transfer', label: 'Transferencia Bancaria' },
  { id: 'cod', label: 'Contraentrega (Solo Lima)' },
] as const;

function PurchasePaymentMethodCards() {
  const groupId = useId();
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  return (
    <div
      role="list"
      aria-label="Métodos de pago disponibles"
      className="flex flex-col gap-2"
    >
      {PAYMENT_METHODS.map((method) => {
        const selected = selectedMethodId === method.id;
        const inputId = `${groupId}-${method.id}`;

        return (
          <div key={method.id} role="listitem">
            <label
              htmlFor={inputId}
              className={cn(
                'flex h-full min-w-0 cursor-pointer items-start gap-2 rounded-md bg-white px-2 py-2 transition-colors',
                selected ? 'bg-red-50/60' : 'hover:bg-neutral-50',
              )}
            >
              <input
                id={inputId}
                type="checkbox"
                checked={selected}
                onChange={() =>
                  setSelectedMethodId((current) => (current === method.id ? null : method.id))
                }
                className="mt-0.5 size-3.5 shrink-0 accent-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[0.6875rem] font-semibold leading-snug text-[#0f1f3d] sm:text-xs">
                  {method.label}
                </p>
              </div>
            </label>
          </div>
        );
      })}
    </div>
  );
}

function PurchaseDisclosure({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const triggerId = useId();

  return (
    <div className="border-t border-neutral-100">
      <button
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-1.5 py-2 text-left text-[0.6875rem] font-medium text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600"
      >
        <ChevronDown
          className={cn(
            'size-3 shrink-0 text-neutral-400 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
        <span>{title}</span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!open}
        className={cn('pb-2.5', !open && 'hidden')}
      >
        {children}
      </div>
    </div>
  );
}

interface ProductDetailPurchasePaymentShippingProps {
  className?: string;
}

export function ProductDetailPurchasePaymentShipping({
  className,
}: ProductDetailPurchasePaymentShippingProps) {
  return (
    <div className={cn('space-y-0', className)}>
      <div className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
          <p className="shrink-0 text-xs font-semibold text-neutral-700">
            Pagos 100% seguros
          </p>
          <div className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
        </div>
        <div className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-2">
          <img
            src="/mediosdepago2.png"
            alt="Medios de pago: Visa, Mastercard, American Express, Yape, Plin y más"
            className="mx-auto block h-auto max-h-9 w-full max-w-full object-contain sm:max-h-10"
            loading="lazy"
            width={1200}
            height={96}
          />
        </div>
      </div>

      <PurchaseDisclosure title="Métodos de pago y condiciones">
        <PurchasePaymentMethodCards />
      </PurchaseDisclosure>

      <PurchaseDisclosure title="Envíos y tiempos de entrega">
        <ProductDetailShippingRows variant="mockup" />
      </PurchaseDisclosure>
    </div>
  );
}
