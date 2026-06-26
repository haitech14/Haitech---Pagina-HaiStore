import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, FileText, Loader2, MessageCircle, Package } from 'lucide-react';

import { CheckoutPaymentTotals } from '@/components/checkout/checkout-payment-totals';
import type { QuotePdfPreview } from '@/components/product-detail/product-quote-pdf-viewer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cartLineUnitUsd } from '@/context/cart-context';
import { openCheckoutOrderWhatsApp } from '@/lib/checkout-order-whatsapp-message';
import {
  calculateCheckoutTotals,
  formatCheckoutAmount,
  type CheckoutPaymentCurrency,
} from '@/lib/checkout-totals';
import type { CheckoutPaymentProvider } from '@/lib/build-checkout-session-payload';
import { downloadQuotePdf } from '@/lib/generate-product-quote-pdf';
import { fireCheckoutConfetti } from '@/lib/fire-confetti';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import { DualPrice } from '@/components/product-showcase-card';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import type { CartItem } from '@/types/product';

export interface CheckoutSuccessOrder {
  orderNumber: string;
  paymentMethod: string;
  paymentProvider: CheckoutPaymentProvider;
  paymentCurrency: CheckoutPaymentCurrency;
  items: CartItem[];
  subtotalUsd: number;
  discountUsd: number;
  couponCode?: string | null;
  client: HaitechClientFormValues;
}

interface CheckoutSuccessModalProps {
  order: CheckoutSuccessOrder | null;
  pdfPreview: QuotePdfPreview | null;
  pdfLoading: boolean;
  companyPhone: string;
  onOpenChange: (open: boolean) => void;
  onViewPdf: () => void;
}

export function CheckoutSuccessModal({
  order,
  pdfPreview,
  pdfLoading,
  companyPhone,
  onOpenChange,
  onViewPdf,
}: CheckoutSuccessModalProps) {
  const confettiFiredRef = useRef(false);
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    if (!order || confettiFiredRef.current) return;
    confettiFiredRef.current = true;
    fireCheckoutConfetti();
  }, [order]);

  useEffect(() => {
    if (!order) {
      confettiFiredRef.current = false;
      setShowPdf(false);
    }
  }, [order]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowPdf(false);
    }
    onOpenChange(open);
  };

  const handleWhatsApp = () => {
    if (!order) return;
    const totals = calculateCheckoutTotals({
      subtotalUsd: order.subtotalUsd,
      discountUsd: order.discountUsd,
      paymentProvider: order.paymentProvider,
    });
    openCheckoutOrderWhatsApp(companyPhone, {
      orderNumber: order.orderNumber,
      items: order.items,
      paymentMethod: order.paymentMethod,
      paymentCurrency: order.paymentCurrency,
      totalUsd: totals.totalUsd,
      totalPen: totals.totalPen,
      client: order.client,
    });
  };

  const handleDownloadPdf = () => {
    if (!pdfPreview) return;
    downloadQuotePdf(pdfPreview.blob, pdfPreview.filename);
  };

  if (!order) return null;

  const totals = calculateCheckoutTotals({
    subtotalUsd: order.subtotalUsd,
    discountUsd: order.discountUsd,
    paymentProvider: order.paymentProvider,
  });

  return (
    <Dialog open={Boolean(order)} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(96vh,900px)] w-[min(98vw,560px)] flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        {!showPdf ? (
          <>
            <div className="shrink-0 border-b px-5 py-5 sm:px-6">
              <DialogHeader className="space-y-2 text-center sm:text-left">
                <DialogTitle className="flex flex-col items-center gap-2 text-xl sm:flex-row sm:items-center sm:text-left">
                  <CheckCircle2 className="size-8 text-red-600 sm:size-6" aria-hidden="true" />
                  <span>Compra Realizada con éxito</span>
                </DialogTitle>
                <DialogDescription className="text-base text-foreground">
                  Muchas gracias por tu compra
                </DialogDescription>
                <p className="text-sm text-muted-foreground">
                  Pedido{' '}
                  <span className="font-mono font-semibold text-foreground">{order.orderNumber}</span>
                </p>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
              <section aria-labelledby="checkout-success-items">
                <h2
                  id="checkout-success-items"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"
                >
                  <Package className="size-4 text-red-600" aria-hidden="true" />
                  Tu pedido
                </h2>
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {order.items.map((item) => {
                    const imageUrl = resolveProductImageUrl(item.product);
                    const lineUsd = cartLineUnitUsd(item) * item.quantity;
                    return (
                      <li key={item.lineId} className="flex gap-3 p-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 p-1">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground" aria-hidden="true">
                              {item.product.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug">{item.product.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.quantity} × <DualPrice usd={cartLineUnitUsd(item)} />
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            <DualPrice usd={lineUsd} />
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section aria-labelledby="checkout-success-shipping" className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
                <h2 id="checkout-success-shipping" className="mb-2 font-semibold text-foreground">
                  Datos de envío
                </h2>
                <dl className="space-y-1 text-muted-foreground">
                  <div>
                    <dt className="sr-only">Cliente</dt>
                    <dd>{order.client.nombre.trim()}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Dirección</dt>
                    <dd>
                      {order.client.direccion.trim()}, {order.client.ciudad.trim()}
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Teléfono</dt>
                    <dd>{order.client.telefono.trim()}</dd>
                  </div>
                  {order.client.email?.trim() ? (
                    <div>
                      <dt className="sr-only">Correo</dt>
                      <dd>{order.client.email.trim()}</dd>
                    </div>
                  ) : null}
                </dl>
              </section>

              <section aria-labelledby="checkout-success-payment">
                <h2 id="checkout-success-payment" className="mb-2 text-sm font-semibold text-foreground">
                  Pago
                </h2>
                <p className="mb-2 text-sm text-muted-foreground">{order.paymentMethod}</p>
                <CheckoutPaymentTotals
                  subtotalUsd={order.subtotalUsd}
                  discountUsd={order.discountUsd}
                  paymentProvider={order.paymentProvider}
                  paymentCurrency={order.paymentCurrency}
                  showSubtotal={order.paymentProvider !== 'culqi'}
                  {...(order.couponCode ? { couponCode: order.couponCode } : {})}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Total principal:{' '}
                  <span className="font-semibold text-foreground">
                    {formatCheckoutAmount(totals.totalUsd, totals.totalPen, order.paymentCurrency)}
                  </span>
                </p>
              </section>
            </div>

            <div className="flex shrink-0 flex-col gap-2 border-t px-5 py-4 sm:flex-row sm:px-6">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 flex-1 gap-2"
                disabled={pdfLoading}
                onClick={() => {
                  if (pdfPreview) {
                    setShowPdf(true);
                  } else {
                    onViewPdf();
                  }
                }}
              >
                {pdfLoading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FileText className="size-4" aria-hidden="true" />
                )}
                Ver Orden de Pedido
              </Button>
              <Button
                type="button"
                className="min-h-11 flex-1 gap-2 bg-emerald-600 hover:bg-emerald-500"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Enviar por WhatsApp
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="shrink-0 border-b px-5 py-4 sm:px-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <FileText className="size-5 text-red-600" aria-hidden="true" />
                  Orden de pedido
                </DialogTitle>
                <DialogDescription>
                  {pdfPreview?.quoteNumber
                    ? `Pedido ${pdfPreview.quoteNumber}`
                    : 'Vista previa de su orden de pedido'}
                </DialogDescription>
              </DialogHeader>
            </div>

            {pdfPreview ? (
              <div className="min-h-0 flex-1 overflow-hidden bg-neutral-100 px-4 py-3">
                <iframe
                  src={pdfPreview.url}
                  title={`Vista previa ${pdfPreview.filename}`}
                  className="size-full min-h-[50vh] rounded-lg border border-neutral-200 bg-white"
                />
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8" role="status">
                <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Generando PDF…</span>
              </div>
            )}

            <div className="flex shrink-0 flex-col gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => setShowPdf(false)}
              >
                Volver al resumen
              </Button>
              <Button
                type="button"
                className="min-h-11 gap-2 bg-red-600 hover:bg-red-500"
                disabled={!pdfPreview}
                onClick={handleDownloadPdf}
              >
                <Download className="size-4" aria-hidden="true" />
                Descargar PDF
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
