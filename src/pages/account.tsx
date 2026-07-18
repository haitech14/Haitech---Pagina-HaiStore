import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Package,
  Truck,
  User,
} from 'lucide-react';

import { AccountSidebar, type AccountTab } from '@/components/account/account-sidebar';
import { AccountPackingListPanel } from '@/components/account/account-packing-list-panel';
import { AccountPriceListPanel } from '@/components/account/account-price-list-panel';
import { AccountWalletPanel } from '@/components/account/account-wallet-panel';
import { getHaiPointsBalance } from '@/lib/haipoints';
import {
  OrderStatusSteps,
  orderStateLabel,
} from '@/components/account/order-status-steps';
import {
  ProductQuotePdfViewer,
  type QuotePdfPreview,
} from '@/components/product-detail/product-quote-pdf-viewer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useMyOrders } from '@/hooks/use-my-orders';
import {
  formatOrderDate,
  formatOrderTotal,
  formatShippingAddress,
  mapStoreOrderStatusToUi,
  orderTrackingMessage,
} from '@/lib/map-store-order-ui';
import { generateStoreOrderPdfPreviewFromOrder } from '@/lib/store-order-pdf';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { StoreOrder } from '@/types/store';

export function AccountPage() {
  const { user, isLoading, role } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const orderFromQuery = searchParams.get('orden')?.trim() ?? '';
  const activeTab: AccountTab =
    rawTab === 'pedidos'
      ? 'pedidos'
      : rawTab === 'precios'
        ? 'precios'
        : rawTab === 'packing'
          ? 'packing'
          : rawTab === 'billetera'
            ? 'billetera'
            : 'cuenta';
  const { data: ordersPayload, isLoading: ordersLoading } = useMyOrders(Boolean(user));
  const { data: companySettings } = useCompanySettings();
  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;
  const haiPoints = user ? getHaiPointsBalance(user) : 0;

  const [orderPdfPreview, setOrderPdfPreview] = useState<QuotePdfPreview | null>(null);
  const [orderPdfLoading, setOrderPdfLoading] = useState(false);
  const [, setCompletedOrderId] = useState<string | null>(null);
  const [, setCompletedOrderPaymentStatus] = useState<string | null>(null);
  const autoOpenedRef = useRef(false);

  const orders = ordersPayload?.orders ?? [];

  const revokePreviewUrl = useCallback((preview: QuotePdfPreview | null) => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
  }, []);

  const handleViewOrderPdf = useCallback(
    async (order: StoreOrder) => {
      setOrderPdfLoading(true);
      try {
        revokePreviewUrl(orderPdfPreview);
        const preview = await generateStoreOrderPdfPreviewFromOrder(order, company);
        setOrderPdfPreview(preview);
      } catch {
        /* el usuario puede reintentar desde el botón */
      } finally {
        setOrderPdfLoading(false);
      }
    },
    [company, orderPdfPreview, revokePreviewUrl],
  );

  const handlePdfOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        revokePreviewUrl(orderPdfPreview);
        setOrderPdfPreview(null);
      }
    },
    [orderPdfPreview, revokePreviewUrl],
  );

  useEffect(() => {
    const navState = location.state as {
      orderPdfPreview?: QuotePdfPreview;
      orderId?: string;
      paymentStatus?: string;
    } | null;
    if (navState?.orderPdfPreview && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      setOrderPdfPreview(navState.orderPdfPreview);
      setCompletedOrderId(navState.orderId ?? null);
      setCompletedOrderPaymentStatus(navState.paymentStatus ?? null);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!orderFromQuery || ordersLoading || autoOpenedRef.current || orderPdfPreview) {
      return;
    }

    const navState = location.state as { orderPdfPreview?: QuotePdfPreview } | null;
    if (navState?.orderPdfPreview) return;

    const order = orders.find((item) => item.order_number === orderFromQuery);
    if (!order) return;

    autoOpenedRef.current = true;
    setCompletedOrderId(order.id);
    setCompletedOrderPaymentStatus(order.payment_status);
    setOrderPdfLoading(true);
    void generateStoreOrderPdfPreviewFromOrder(order, company)
      .then((preview) => setOrderPdfPreview(preview))
      .finally(() => setOrderPdfLoading(false));
  }, [company, location.state, orderFromQuery, orderPdfPreview, orders, ordersLoading]);

  useEffect(() => {
    if (!orderFromQuery || ordersLoading) return;
    const element = document.getElementById(`order-${orderFromQuery}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [orderFromQuery, ordersLoading]);

  useEffect(
    () => () => {
      revokePreviewUrl(orderPdfPreview);
    },
    [orderPdfPreview, revokePreviewUrl],
  );

  const handleSelectTab = (tab: AccountTab) => {
    setSearchParams(tab === 'cuenta' ? {} : { tab });
  };

  if (isLoading) {
    return (
      <div className="container py-12" role="status" aria-live="polite">
        <p className="text-sm text-muted-foreground">Cargando tu cuenta...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-background">
      <section className="container py-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <AccountSidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

          <main className="min-w-0 flex-1" id="account-content">
            {activeTab === 'cuenta' ? (
              <div className="grid gap-4 lg:grid-cols-3">
                <article className="rounded-xl border bg-card p-5 lg:col-span-2">
                  <h2 className="mb-4 text-lg font-bold text-foreground">Mi Perfil</h2>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border bg-background p-4">
                      <dt className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                        Nombre
                      </dt>
                      <dd className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <User className="size-4 text-red-600" aria-hidden="true" />
                        {user.name || 'Usuario HaiStore'}
                      </dd>
                    </div>
                    <div className="rounded-lg border bg-background p-4">
                      <dt className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                        Correo
                      </dt>
                      <dd className="text-sm font-semibold text-foreground">{user.email}</dd>
                    </div>
                    <div className="rounded-lg border bg-background p-4">
                      <dt className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                        Rol
                      </dt>
                      <dd className="text-sm font-semibold text-foreground">{role.toUpperCase()}</dd>
                    </div>
                    <div className="rounded-lg border bg-background p-4">
                      <dt className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                        Estado de cuenta
                      </dt>
                      <dd className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BadgeCheck className="size-4 text-red-600" aria-hidden="true" />
                        Activa y al día
                      </dd>
                    </div>
                  </dl>
                </article>

                <aside className="rounded-xl border bg-card p-5">
                  <h2 className="mb-4 text-lg font-bold text-foreground">Resumen</h2>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center justify-between rounded-lg border bg-background p-3">
                      <span className="text-muted-foreground">Pedidos totales</span>
                      <strong className="text-foreground">{orders.length}</strong>
                    </li>
                    <li className="flex items-center justify-between rounded-lg border bg-background p-3">
                      <span className="text-muted-foreground">Último pedido</span>
                      <strong className="text-foreground">
                        {orders[0]?.order_number ?? '—'}
                      </strong>
                    </li>
                    <li className="flex items-center justify-between rounded-lg border bg-background p-3">
                      <span className="text-muted-foreground">Pendientes</span>
                      <strong className="text-red-600">
                        {
                          orders.filter(
                            (order) => mapStoreOrderStatusToUi(order.status) !== 'entregado',
                          ).length
                        }
                      </strong>
                    </li>
                  </ul>
                  <Link
                    to="/contacto"
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    Contactar soporte
                  </Link>
                </aside>
              </div>
            ) : activeTab === 'pedidos' ? (
              <div className="space-y-4">
                <header className="rounded-xl border bg-card p-4 sm:p-5">
                  <h2 className="text-lg font-bold text-foreground">Mis Compras</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Consulta el estado, la trazabilidad y el detalle de cada compra.
                  </p>
                </header>

                {orderFromQuery ? (
                  <div
                    className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5"
                    role="status"
                  >
                    <p className="text-sm font-semibold text-red-800">
                      ¡Gracias por tu compra!
                    </p>
                    <p className="mt-1 text-sm text-red-700">
                      Tu orden de pedido{' '}
                      <span className="font-mono font-semibold">{orderFromQuery}</span> está
                      disponible. Puedes visualizarla o descargarla en PDF desde aquí.
                    </p>
                  </div>
                ) : null}

                {orderPdfLoading ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                    <Loader2 className="size-4 animate-spin text-red-600" aria-hidden="true" />
                    Generando orden de pedido en PDF…
                  </p>
                ) : null}

                {ordersLoading ? (
                  <p className="text-sm text-muted-foreground" role="status">
                    Cargando pedidos…
                  </p>
                ) : null}

                {!ordersLoading && orders.length === 0 ? (
                  <div className="rounded-xl border bg-card p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Aún no tienes pedidos vinculados a esta cuenta.
                    </p>
                    <Link
                      to="/tienda"
                      className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500"
                    >
                      Ir a la tienda
                    </Link>
                  </div>
                ) : null}

                {orders.map((order) => {
                  const uiState = mapStoreOrderStatusToUi(order.status);
                  const date = formatOrderDate(order.created_at);
                  const items = order.items ?? [];

                  return (
                    <article
                      key={order.id}
                      id={`order-${order.order_number}`}
                      className="rounded-xl border bg-card p-5 sm:p-6"
                    >
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            Pedido {order.order_number}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <CalendarDays className="size-4 text-red-600" aria-hidden="true" />
                            <time dateTime={date.iso}>{date.label}</time>
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="min-h-9 gap-1.5"
                            disabled={orderPdfLoading}
                            onClick={() => void handleViewOrderPdf(order)}
                          >
                            <FileText className="size-4 text-red-600" aria-hidden="true" />
                            Ver orden de pedido
                          </Button>
                          <span className="inline-flex w-fit items-center rounded-full bg-red-600/10 px-3 py-1 text-xs font-semibold text-red-700">
                            {orderStateLabel[uiState]}
                          </span>
                        </div>
                      </div>

                      <OrderStatusSteps state={uiState} />

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border bg-background p-3 text-sm">
                          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                            Total
                          </p>
                          <p className="font-semibold text-foreground">{formatOrderTotal(order)}</p>
                        </div>
                        <div className="rounded-lg border bg-background p-3 text-sm">
                          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                            Método de pago
                          </p>
                          <p className="flex items-center gap-1.5 font-semibold text-foreground">
                            <CreditCard className="size-4 text-red-600" aria-hidden="true" />
                            {order.payment_method ?? '—'}
                          </p>
                        </div>
                        <div className="rounded-lg border bg-background p-3 text-sm sm:col-span-2">
                          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                            Dirección de envío
                          </p>
                          <p className="flex items-start gap-1.5 font-semibold text-foreground">
                            <MapPin
                              className="mt-0.5 size-4 shrink-0 text-red-600"
                              aria-hidden="true"
                            />
                            {formatShippingAddress(order)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border bg-background p-3 text-sm">
                          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                            Productos/servicios
                          </p>
                          <ul className="space-y-1.5">
                            {items.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center gap-2 text-foreground"
                              >
                                <Package className="size-4 text-red-600" aria-hidden="true" />
                                <span className="font-medium">
                                  {item.product_snapshot?.name ?? 'Producto'}
                                </span>
                                <span className="text-muted-foreground">x{item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg border bg-background p-3 text-sm">
                          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                            Seguimiento
                          </p>
                          <p className="flex items-center gap-2 font-semibold text-foreground">
                            <Truck className="size-4 text-red-600" aria-hidden="true" />
                            {orderTrackingMessage(order)}
                          </p>
                          <Link
                            to="/contacto"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-500"
                          >
                            <FileText className="size-4" aria-hidden="true" />
                            Solicitar detalle del envío
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : activeTab === 'precios' ? (
              <AccountPriceListPanel />
            ) : activeTab === 'packing' ? (
              <AccountPackingListPanel />
            ) : activeTab === 'billetera' ? (
              <AccountWalletPanel balance={haiPoints} ordersCount={orders.length} />
            ) : (
              <AccountPriceListPanel />
            )}
          </main>
        </div>
      </section>

      <ProductQuotePdfViewer
        preview={orderPdfPreview}
        onOpenChange={handlePdfOpenChange}
        title="Orden de pedido"
        description={
          orderPdfPreview?.quoteNumber
            ? `Pedido ${orderPdfPreview.quoteNumber}. Revise su orden antes de descargarla.`
            : 'Revise su orden de pedido antes de descargarla o compartirla.'
        }
        downloadLabel="Descargar orden PDF"
      />
    </div>
  );
}
