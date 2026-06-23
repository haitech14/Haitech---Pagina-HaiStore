import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  FileText,
  MapPin,
  Package,
  Truck,
  User,
} from 'lucide-react';

import { AccountSidebar, type AccountTab } from '@/components/account/account-sidebar';
import {
  OrderStatusSteps,
  orderStateLabel,
  type OrderState,
} from '@/components/account/order-status-steps';
import { useAuth } from '@/context/auth-context';

const orders = [
  {
    id: 'HS-2026-1042',
    date: '31 may 2026',
    isoDate: '2026-05-31',
    total: 'S/ 1,890.00',
    paymentMethod: 'Tarjeta de crédito',
    shippingAddress: 'Av. Javier Prado 1250, San Isidro, Lima',
    state: 'enviado' as const,
    estimated: 'Llega entre 01 y 02 jun',
    items: [
      { name: 'Impresora Multifuncional RICOH IM 430F', qty: 1 },
      { name: 'Tóner compatible RICOH IM 430F', qty: 2 },
    ],
  },
  {
    id: 'HS-2026-0997',
    date: '21 may 2026',
    isoDate: '2026-05-21',
    total: 'S/ 540.00',
    paymentMethod: 'Transferencia bancaria',
    shippingAddress: 'Calle Las Acacias 240, Miraflores, Lima',
    state: 'entregado' as const,
    estimated: 'Entregado el 24 may 2026',
    items: [{ name: 'Servicio técnico preventivo', qty: 1 }],
  },
] as const;

export function AccountPage() {
  const { user, isLoading, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: AccountTab = rawTab === 'pedidos' ? 'pedidos' : 'cuenta';

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
        <header className="mb-6 rounded-2xl border bg-card p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
            Área de cliente
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Mi cuenta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestiona tu información de cuenta y da seguimiento a tus pedidos en tiempo real.
          </p>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <AccountSidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

          <main className="min-w-0 flex-1" id="account-content">
            {activeTab === 'cuenta' ? (
              <div className="grid gap-4 lg:grid-cols-3">
                <article className="rounded-xl border bg-card p-5 lg:col-span-2">
                  <h2 className="mb-4 text-lg font-bold text-foreground">Información del usuario</h2>
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
                      <strong className="text-foreground">{orders[0].id}</strong>
                    </li>
                    <li className="flex items-center justify-between rounded-lg border bg-background p-3">
                      <span className="text-muted-foreground">Pendientes</span>
                      <strong className="text-red-600">
                        {orders.filter((order) => order.state !== 'entregado').length}
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
            ) : (
              <div className="space-y-4">
                <header className="rounded-xl border bg-card p-4 sm:p-5">
                  <h2 className="text-lg font-bold text-foreground">Mis pedidos</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Consulta el estado, la trazabilidad y el detalle de cada compra.
                  </p>
                </header>

                {orders.map((order) => (
                  <article key={order.id} className="rounded-xl border bg-card p-5 sm:p-6">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Pedido {order.id}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CalendarDays className="size-4 text-red-600" aria-hidden="true" />
                          <time dateTime={order.isoDate}>{order.date}</time>
                        </p>
                      </div>
                      <span className="inline-flex w-fit items-center rounded-full bg-red-600/10 px-3 py-1 text-xs font-semibold text-red-700">
                        {orderStateLabel[order.state as OrderState]}
                      </span>
                    </div>

                    <OrderStatusSteps state={order.state as OrderState} />

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg border bg-background p-3 text-sm">
                        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                          Total
                        </p>
                        <p className="font-semibold text-foreground">{order.total}</p>
                      </div>
                      <div className="rounded-lg border bg-background p-3 text-sm">
                        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                          Método de pago
                        </p>
                        <p className="flex items-center gap-1.5 font-semibold text-foreground">
                          <CreditCard className="size-4 text-red-600" aria-hidden="true" />
                          {order.paymentMethod}
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
                          {order.shippingAddress}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border bg-background p-3 text-sm">
                        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                          Productos/servicios
                        </p>
                        <ul className="space-y-1.5">
                          {order.items.map((item) => (
                            <li key={item.name} className="flex items-center gap-2 text-foreground">
                              <Package className="size-4 text-red-600" aria-hidden="true" />
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground">x{item.qty}</span>
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
                          {order.estimated}
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
                ))}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
