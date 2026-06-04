import { useCallback, useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';

import {
  AdminPdfPreviewDialog,
  type AdminPdfPreview,
} from '@/components/admin/admin-pdf-preview-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminProductsQuery } from '@/hooks/use-admin-dashboard';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { useCreateStoreOrder } from '@/hooks/use-create-store-order';
import { buildProformaPayloadFromTpv } from '@/lib/build-proforma-payload';
import { TPV_ACCENT_TEXT_CLASS, TPV_PRIMARY_BUTTON_CLASS } from '@/lib/tpv-highlight';
import { cn } from '@/lib/utils';
import { buildTpvDocumentPdf } from '@/lib/generate-tpv-document-pdf';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { getEffectivePrice } from '@/lib/pricing';
import { haitechFormToClient, tpvCustomerToHaitechForm } from '@/lib/haitech-client-mappers';
import { nextTpvDocumentNumber } from '@/lib/tpv-document-serial';
import { formatTpvMoney, unitPriceForTpv } from '@/lib/tpv-pricing';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { InventoryProduct } from '@/types/product';
import { TpvCatalogList } from '@/components/admin/tpv/tpv-catalog-list';
import { TpvCustomerForm } from '@/components/admin/tpv/tpv-customer-form';
import { TpvDocumentTypeFieldset } from '@/components/admin/tpv/tpv-document-type-fieldset';
import type { TpvCustomer, TpvDocumentType, TpvLineItem } from '@/types/tpv';
import { TPV_DOCUMENT_META } from '@/types/tpv';
import type { PriceRole } from '@/types/product';
import type { TpvCurrency } from '@/types/tpv';

const EMPTY_CUSTOMER: TpvCustomer = {
  razonSocial: '',
  documento: '',
  atencion: '',
  celular: '',
  direccion: 'Lima',
  ciudad: 'Lima',
  priceList: 'public',
  currency: 'PEN',
  storeCustomerId: null,
};

function productToLine(
  product: InventoryProduct,
  quantity: number,
  priceList: PriceRole,
  currency: TpvCurrency,
): TpvLineItem {
  return {
    productId: product.id,
    name: product.name,
    sku: product.id,
    brand: product.brand ?? 'Haitech',
    quantity,
    unitPricePen: unitPriceForTpv(product, priceList, currency),
    imageUrl: product.image_url,
  };
}

function validateCustomer(type: TpvDocumentType, customer: TpvCustomer): string | null {
  if (!customer.razonSocial.trim()) return 'Indique el nombre o razón social del cliente.';
  const doc = customer.documento.replace(/\D/g, '');
  if (type === 'factura' || type === 'guia_remision') {
    if (doc.length !== 11) {
      return type === 'guia_remision'
        ? 'La guía de remisión requiere un RUC válido de 11 dígitos.'
        : 'La factura requiere un RUC válido de 11 dígitos.';
    }
  } else if (type === 'boleta') {
    if (doc.length !== 8 && doc.length !== 11) {
      return 'La boleta requiere DNI (8 dígitos) o RUC (11 dígitos).';
    }
  }
  return null;
}

export function TpvPanel() {
  const { data: products = [], isLoading } = useAdminProductsQuery();
  const { data: companySettings } = useCompanySettings();
  const { createProforma } = useProformaMutations();
  const createStoreOrder = useCreateStoreOrder();

  const [search, setSearch] = useState('');
  const [documentType, setDocumentType] = useState<TpvDocumentType>('factura');
  const [cart, setCart] = useState<TpvLineItem[]>([]);
  const [customer, setCustomer] = useState<TpvCustomer>(EMPTY_CUSTOMER);
  const [preview, setPreview] = useState<AdminPdfPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<TpvDocumentType | null>(null);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, l) => s + l.unitPricePen * l.quantity, 0);
    const gravada = Math.round((subtotal / 1.18) * 100) / 100;
    const igv = Math.round((subtotal - gravada) * 100) / 100;
    return { subtotal, gravada, igv };
  }, [cart]);

  const addProduct = (product: InventoryProduct) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, productToLine(product, 1, customer.priceList, customer.currency)];
    });
  };

  useEffect(() => {
    if (cart.length === 0) return;
    setCart((prev) =>
      prev.map((line) => {
        const product = products.find((entry) => entry.id === line.productId);
        if (!product) return line;
        return productToLine(product, line.quantity, customer.priceList, customer.currency);
      }),
    );
  }, [customer.priceList, customer.currency, products]);

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) =>
          l.productId === productId ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l,
        )
        .filter((l) => l.quantity > 0),
    );
  };

  const removeLine = (productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setError(null);
  };

  const handlePreviewClose = (open: boolean) => {
    if (!open && preview) {
      URL.revokeObjectURL(preview.url);
      setPreview(null);
    }
  };

  const generateDocument = useCallback(
    async (type: TpvDocumentType) => {
      setError(null);
      if (cart.length === 0) {
        setError('Agregue al menos un producto al carrito.');
        return;
      }
      const validation = validateCustomer(type, customer);
      if (validation) {
        setError(validation);
        return;
      }

      setGenerating(type);
      try {
        const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
        const documentNumber = nextTpvDocumentNumber(type);
        const meta = TPV_DOCUMENT_META[type];
        const generated = await buildTpvDocumentPdf(
          type,
          documentNumber,
          customer,
          cart,
          company,
        );
        const pdfBlob =
          generated.blob.type === 'application/pdf'
            ? generated.blob
            : new Blob([generated.blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        setPreview({
          url,
          blob: pdfBlob,
          filename: generated.filename,
          documentNumber: generated.documentNumber,
          documentLabel: meta.label,
        });

        if (type === 'proforma') {
          try {
            await createProforma.mutateAsync(
              buildProformaPayloadFromTpv(documentNumber, customer, cart, totals.subtotal),
            );
          } catch {
            setError('PDF generado, pero no se pudo registrar la cotización para seguimiento.');
          }
        }

        if (type === 'factura' || type === 'boleta') {
          try {
            const exchangeRate = getUsdToPenSaleRate();
            await createStoreOrder.mutateAsync({
              customer: haitechFormToClient(tpvCustomerToHaitechForm(customer)),
              lineItems: cart.map((line) => {
                const product = products.find((p) => p.id === line.productId);
                const unitPriceUsd = product
                  ? getEffectivePrice(product, customer.priceList)
                  : line.unitPricePen / exchangeRate;
                return {
                  productId: line.productId,
                  name: line.name,
                  quantity: line.quantity,
                  unitPriceUsd,
                  imageUrl: line.imageUrl ?? null,
                };
              }),
              currency: customer.currency === 'USD' ? 'USD' : 'PEN',
              paymentMethod: type === 'factura' ? 'Factura TPV' : 'Boleta TPV',
              paymentStatus: 'paid',
              status: 'confirmed',
              exchangeRate,
              notes: `${meta.label} ${documentNumber}`,
            });
          } catch {
            setError('PDF generado, pero no se pudo registrar la venta en el panel.');
          }
        }
      } catch {
        setError('No se pudo generar el PDF. Inténtelo de nuevo.');
      } finally {
        setGenerating(null);
      }
    },
    [cart, customer, companySettings, createProforma, createStoreOrder, products, totals.subtotal],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-6 xl:grid-cols-[1fr_minmax(320px,400px)]">
        <div className="flex flex-col gap-4">
        {/* Catálogo */}
        <section className="rounded-xl border bg-card p-4">
          <form
            className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              void generateDocument(documentType);
            }}
          >
            <TpvDocumentTypeFieldset
              value={documentType}
              onChange={setDocumentType}
              disabled={generating !== null}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end">
              <div className="relative min-w-0 flex-1 space-y-1.5">
                <label htmlFor="tpv-catalog-search" className="text-xs font-medium text-muted-foreground">
                  Catálogo rápido
                </label>
                <Search
                  className="pointer-events-none absolute bottom-2.5 left-3 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="tpv-catalog-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, SKU o marca…"
                  className="h-11 pl-9"
                />
              </div>
              <Button
                type="submit"
                className={cn('h-11 shrink-0', TPV_PRIMARY_BUTTON_CLASS)}
                disabled={generating !== null}
              >
                {generating
                  ? 'Generando…'
                  : `Generar ${TPV_DOCUMENT_META[documentType].label}`}
              </Button>
            </div>
          </form>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando productos…</p>
          ) : (
            <TpvCatalogList
              products={products}
              search={search}
              priceList={customer.priceList}
              currency={customer.currency}
              onAddProduct={addProduct}
            />
          )}
        </section>

        <section className="rounded-xl border bg-card p-4" aria-labelledby="tpv-cart-heading">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 id="tpv-cart-heading" className="flex items-center gap-2 text-sm font-semibold">
                <ShoppingCart className="size-4" aria-hidden="true" />
                Carrito ({cart.length})
              </h3>
              {cart.length > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={clearCart}>
                  Vaciar
                </Button>
              )}
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground">Seleccione productos del catálogo.</p>
            ) : (
              <ul className="max-h-56 space-y-2 overflow-y-auto">
                {cart.map((line) => (
                  <li
                    key={line.productId}
                    className="flex items-start gap-2 rounded-lg border bg-muted/20 p-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-medium">{line.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTpvMoney(line.unitPricePen, customer.currency)} × {line.quantity}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => updateQty(line.productId, -1)}
                        aria-label={`Menos ${line.name}`}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-xs font-semibold">{line.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => updateQty(line.productId, 1)}
                        aria-label={`Más ${line.name}`}
                      >
                        <Plus className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive"
                        onClick={() => removeLine(line.productId)}
                        aria-label={`Quitar ${line.name}`}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <dl className="mt-4 space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Gravada</dt>
                <dd>{formatTpvMoney(totals.gravada, customer.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">IGV 18%</dt>
                <dd>{formatTpvMoney(totals.igv, customer.currency)}</dd>
              </div>
              <div className="flex justify-between font-bold">
                <dt>Total</dt>
                <dd className={TPV_ACCENT_TEXT_CLASS}>
                  {formatTpvMoney(totals.subtotal, customer.currency)}
                </dd>
              </div>
            </dl>
        </section>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Cliente</h3>
            <TpvCustomerForm customer={customer} onChange={setCustomer} />
          </section>

          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </aside>
      </div>

      <AdminPdfPreviewDialog preview={preview} onOpenChange={handlePreviewClose} />
    </div>
  );
}
