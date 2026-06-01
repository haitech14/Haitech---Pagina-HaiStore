import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Store } from 'lucide-react';

import { PriceListRoleTable } from '@/components/admin/price-lists/price-list-role-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useAdminInventory, useInventoryMutations } from '@/hooks/use-products';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { buildAllPriceListStats } from '@/lib/price-list-stats';
import { cn, formatUsd } from '@/lib/utils';
import {
  PRICE_ROLE_LABELS,
  PRICE_ROLES,
  type PriceRole,
} from '@/types/product';

export function AdminListasPreciosPage() {
  const { data: products = [], isLoading, isError, refetch, dataUpdatedAt } = useAdminInventory();
  const { syncCatalog } = useInventoryMutations();
  const { data: company } = useCompanySettings();
  const [selectedRole, setSelectedRole] = useState<PriceRole>('public');

  const statsByRole = useMemo(() => buildAllPriceListStats(products), [products]);
  const selectedStats = statsByRole.find((s) => s.role === selectedRole) ?? statsByRole[0];

  const lastUpdated = dataUpdatedAt
    ? new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(dataUpdatedAt))
    : null;

  async function handleSync() {
    await syncCatalog.mutateAsync(true);
    await refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Mismos precios que ve la tienda pública y cada rol de cliente. Los importes se
            editan en inventario; el tipo de cambio (
            {company?.usd_to_pen_rate != null
              ? `1 USD = ${company.usd_to_pen_rate} PEN`
              : 'configura en ajustes'}
            ) aplica a todas las listas.
          </p>
          {lastUpdated ? (
            <p className="text-xs text-muted-foreground" role="status">
              Catálogo cargado: {lastUpdated}
              {products.length > 0 ? ` · ${products.length} productos` : ''}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 shrink-0 gap-2"
          disabled={syncCatalog.isPending || isLoading}
          onClick={() => void handleSync()}
        >
          <RefreshCw
            className={cn('size-4', syncCatalog.isPending && 'animate-spin')}
            aria-hidden
          />
          {syncCatalog.isPending ? 'Sincronizando…' : 'Actualizar desde la tienda'}
        </Button>
      </div>

      {isError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          No se pudo cargar el catálogo. Comprueba que el servidor admin esté en marcha.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? PRICE_ROLES.map((role) => (
              <Card key={role}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))
          : statsByRole.map((stats) => (
              <Card
                key={stats.role}
                className={cn(
                  'cursor-pointer transition-colors',
                  selectedRole === stats.role && 'ring-2 ring-primary',
                )}
                onClick={() => setSelectedRole(stats.role)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedRole(stats.role);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={selectedRole === stats.role}
                aria-label={`Lista ${PRICE_ROLE_LABELS[stats.role]}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{PRICE_ROLE_LABELS[stats.role]}</CardTitle>
                  <CardDescription>
                    Rol «{stats.role}» · {stats.pricedCount} con precio
                    {stats.productCount > 0 ? ` de ${stats.productCount}` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Promedio: </span>
                    <span className="font-medium tabular-nums">
                      {stats.pricedCount > 0 ? formatUsd(stats.averageUsd) : '—'}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Lo que ve un cliente con este rol en la tienda.
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      <section aria-labelledby="price-list-detail-heading" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="price-list-detail-heading" className="text-lg font-semibold text-balance">
            {selectedStats ? PRICE_ROLE_LABELS[selectedStats.role] : 'Lista'}
          </h2>
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filtrar lista">
            {PRICE_ROLES.map((role) => (
              <Button
                key={role}
                type="button"
                size="sm"
                variant={selectedRole === role ? 'default' : 'outline'}
                className="min-h-9"
                role="tab"
                aria-selected={selectedRole === role}
                onClick={() => setSelectedRole(role)}
              >
                {PRICE_ROLE_LABELS[role]}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : selectedStats ? (
          <PriceListRoleTable
            rows={selectedStats.rows}
            emptyMessage={`Ningún producto tiene precio ${PRICE_ROLE_LABELS[selectedStats.role].toLowerCase()} asignado. Edítalo en inventario.`}
          />
        ) : null}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild className="min-h-11">
          <Link to={ADMIN_ROUTES.INVENTORY}>Editar precios en inventario</Link>
        </Button>
        <Button asChild variant="outline" className="min-h-11 gap-2">
          <Link to={ADMIN_ROUTES.SETTINGS_GENERAL}>
            <Store className="size-4" aria-hidden />
            Tipo de cambio y empresa
          </Link>
        </Button>
        <Button asChild variant="ghost" className="min-h-11">
          <Link to="/">Ver tienda (precio público)</Link>
        </Button>
      </div>
    </div>
  );
}
