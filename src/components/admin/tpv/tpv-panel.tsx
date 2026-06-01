import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Minus,
  Plus,
  Receipt,
  ScrollText,
  Search,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

import {
  AdminPdfPreviewDialog,
  type AdminPdfPreview,
} from '@/components/admin/admin-pdf-preview-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminProductsQuery } from '@/hooks/use-admin-dashboard';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useProformaMutations } from '@/hooks/use-admin-proformas';
import { buildProformaPayloadFromTpv } from '@/lib/build-proforma-payload';
import { buildTpvDocumentPdf } from '@/lib/generate-tpv-document-pdf';
import { nextTpvDocumentNumber, peekTpvDocumentNumber } from '@/lib/tpv-document-serial';
import { formatTpvMoney, unitPriceForTpv } from '@/lib/tpv-pricing';
import { cn } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { InventoryProduct } from '@/types/product';
import { TpvCatalogList } from '@/components/admin/tpv/tpv-catalog-list';
import { TpvCustomerForm } from '@/components/admin/tpv/tpv-customer-form';
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
  if (type === 'factura') {
    if (doc.length !== 11) return 'La factura requiere un RUC válido de 11 dígitos.';
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

  const [search, setSearch] = useState('');
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
        const url = URL.createObjectURL(generated.blob);
        setPreview({
          url,
          blob: generated.blob,
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
            setError('PDF generado, pero no se pudo registrar la proforma para seguimiento.');
          }
        }
      } catch {
        setError('No se pudo generar el PDF. Inténtelo de nuevo.');
      } finally {
        setGenerating(null);
      }
    },
    [cart, customer, companySettings, createProforma, totals.subtotal],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-6 xl:grid-cols-[1fr_minmax(320px,400px)]">
        {/* Catálogo */}
        <section className="rounded-xl border bg-card p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-foreground">Catálogo rápido</h3>
            <div className="relative max-w-md flex-1">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, SKU o marca…"
                className="pl-9"
                aria-label="Buscar productos en TPV"
              />
            </div>
          </div>

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

        {/* Carrito y cliente */}
        <aside className="flex flex-col gap-4">
          <section className="rounded-xl border border-[hsl(var(--admin-accent))]/25 bg-[hsl(var(--admin-accent))]/5 p-3 sm:p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Generar comprobante PDF</p>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tipo de comprobante">
              {(['proforma', 'factura', 'boleta'] as const).map((type) => {
                const meta = TPV_DOCUMENT_META[type];
                const Icon =
                  type === 'proforma' ? ScrollText : type === 'factura' ? FileText : Receipt;
                const isFactura = type === 'factura';
                return (
                  <Button
                    key={type}
                    type="button"
                    variant={isFactura ? 'default' : 'outline'}
                    className={cn(
                      'h-auto min-h-11 flex-col gap-1 px-2 py-2.5',
                      isFactura && 'bg-[hsl(var(--admin-accent))] hover:opacity-90',
                    )}
                    disabled={generating !== null}
                    onClick={() => void generateDocument(type)}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="text-center text-[0.7rem] font-semibold leading-tight sm:text-xs">
                      {meta.label}
                    </span>
                    <span className="text-center text-[0.6rem] font-normal leading-tight opacity-80">
                      {peekTpvDocumentNumber(type)}
                    </span>
                  </Button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
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
              <ul className="max-h-48 space-y-2 overflow-y-auto">
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
                <dd className="text-[hsl(var(--admin-accent))]">
                  {formatTpvMoney(totals.subtotal, customer.currency)}
                </dd>
              </div>
            </dl>
          </section>

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
