import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ban, Loader2, Plus, Search, Tag } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useAdminCouponsQuery,
  useCancelAdminCoupon,
  useCreateAdminCoupon,
} from '@/hooks/use-discount-coupon';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';
import type { DiscountCouponStatus, DiscountCouponType } from '@/types/discount-coupon';

const STATUS_LABELS: Record<DiscountCouponStatus, string> = {
  active: 'Activo',
  used: 'Usado',
  expired: 'Expirado',
  cancelled: 'Cancelado',
};

function statusBadgeClass(status: DiscountCouponStatus): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800';
    case 'used':
      return 'bg-slate-100 text-slate-700';
    case 'expired':
      return 'bg-amber-100 text-amber-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return '';
  }
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function CouponsPanel() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    label: '',
    discountType: 'percent' as DiscountCouponType,
    discountValue: '10',
    assignedEmail: '',
    validHours: '168',
  });

  const { data, isLoading, isError, error } = useAdminCouponsQuery({
    status: statusFilter,
    search,
  });
  const createCoupon = useCreateAdminCoupon();
  const cancelCoupon = useCancelAdminCoupon();

  const coupons = data?.coupons ?? [];

  const stats = useMemo(() => {
    return {
      active: coupons.filter((coupon) => coupon.status === 'active').length,
      used: coupons.filter((coupon) => coupon.status === 'used').length,
    };
  }, [coupons]);

  const handleCreate = async () => {
    const discountValue = Number(form.discountValue);
    if (!form.label.trim() || !Number.isFinite(discountValue) || discountValue <= 0) {
      toast.error('Completa etiqueta y valor de descuento.');
      return;
    }

    try {
      const result = await createCoupon.mutateAsync({
        label: form.label.trim(),
        discountType: form.discountType,
        discountValue,
        assignedEmail: form.assignedEmail.trim() || undefined,
        validHours: Number(form.validHours) || 168,
        campaign: 'manual',
      });
      toast.success('Cupón creado', { description: result.coupon.code });
      setCreateOpen(false);
      setForm({
        label: '',
        discountType: 'percent',
        discountValue: '10',
        assignedEmail: '',
        validHours: '168',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo crear el cupón');
    }
  };

  const handleCancel = async (couponId: string, code: string) => {
    try {
      await cancelCoupon.mutateAsync(couponId);
      toast.success(`Cupón ${code} cancelado`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo cancelar');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 w-fit">
            <Link to={ADMIN_ROUTES.MARKETING}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Marketing
            </Link>
          </Button>
          <h1 className="flex items-center gap-1.5 text-xl font-bold sm:text-[1.35rem]">
            <Tag className="size-4 text-primary" aria-hidden="true" />
            Cupones de descuento
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Registro de cupones de la Ruleta del Color y promociones manuales.
          </p>
        </div>
        <Button className="h-8 gap-1 text-xs" onClick={() => setCreateOpen(true)}>
          <Plus className="size-3.5" aria-hidden="true" />
          Nuevo cupón
        </Button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Activos</CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Usados</CardDescription>
            <CardTitle className="text-3xl">{stats.used}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Listado</CardTitle>
            <CardDescription>Códigos, campaña, estado y vencimiento.</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar código o correo"
                className="min-h-10 pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="min-h-10 w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="used">Usados</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center" role="status">
              <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Cargando cupones…</span>
            </div>
          ) : isError ? (
            <p role="alert" className="text-sm text-red-600">
              {error instanceof Error ? error.message : 'No se pudieron cargar los cupones'}
            </p>
          ) : coupons.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aún no hay cupones registrados.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Beneficio</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Campaña</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono text-xs font-semibold">{coupon.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{coupon.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {coupon.discountType === 'percent'
                          ? `${coupon.discountValue}%`
                          : coupon.discountType === 'fixed_pen'
                            ? `S/ ${coupon.discountValue}`
                            : `$${coupon.discountValue} USD`}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[12rem] truncate text-sm">
                      {coupon.assignedEmail ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm">{coupon.campaign ?? '—'}</TableCell>
                    <TableCell>
                      <Badge className={cn('font-medium', statusBadgeClass(coupon.status))}>
                        {STATUS_LABELS[coupon.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(coupon.expiresAt)}</TableCell>
                    <TableCell className="text-right">
                      {coupon.status === 'active' ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          disabled={cancelCoupon.isPending}
                          onClick={() => void handleCancel(coupon.id, coupon.code)}
                        >
                          <Ban className="size-4" aria-hidden="true" />
                          Cancelar
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {coupon.usedAt ? formatDate(coupon.usedAt) : '—'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear cupón manual</DialogTitle>
            <DialogDescription>
              Se generará un código único canjeable en el checkout.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="coupon-label">Etiqueta</Label>
              <Input
                id="coupon-label"
                value={form.label}
                onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                placeholder="Ej. 15% en tóner"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coupon-type">Tipo</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      discountType: value as DiscountCouponType,
                    }))
                  }
                >
                  <SelectTrigger id="coupon-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Porcentaje</SelectItem>
                    <SelectItem value="fixed_pen">Monto PEN</SelectItem>
                    <SelectItem value="fixed_usd">Monto USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-value">Valor</Label>
                <Input
                  id="coupon-value"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.discountValue}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, discountValue: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-email">Correo asignado (opcional)</Label>
              <Input
                id="coupon-email"
                type="email"
                value={form.assignedEmail}
                onChange={(event) =>
                  setForm((current) => ({ ...current, assignedEmail: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-hours">Validez (horas)</Label>
              <Input
                id="coupon-hours"
                type="number"
                min="1"
                value={form.validHours}
                onChange={(event) =>
                  setForm((current) => ({ ...current, validHours: event.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="min-h-11"
              disabled={createCoupon.isPending}
              onClick={() => void handleCreate()}
            >
              {createCoupon.isPending ? 'Creando…' : 'Crear cupón'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
