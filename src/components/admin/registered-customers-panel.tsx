import { useMemo, useRef, useState } from 'react';
import { FileUp, MessageCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { CustomerCreateDialog } from '@/components/admin/customer-create-dialog';
import {
  CustomerEditDialog,
  type CustomerEditFormValues,
} from '@/components/admin/customer-edit-dialog';
import { CustomerListProductsCell } from '@/components/admin/customer-list-products-cell';
import { CustomerListRoleCell } from '@/components/admin/customer-list-role-cell';
import { Button } from '@/components/ui/button';
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
import { useAdminProductsQuery } from '@/hooks/use-admin-dashboard';
import {
  useAdminStoreCustomers,
  useAdminStoreCustomersMutations,
} from '@/hooks/use-admin-customers';
import {
  buildCustomerWhatsAppMessage,
  getCustomerWhatsAppPhone,
  openCustomerWhatsApp,
} from '@/lib/customer-whatsapp-message';
import {
  CUSTOMER_ROLE_SECTIONS,
  filterAndSortCustomers,
  isHaiSupportOnlyCustomer,
  type CustomerRoleGroupKey,
  type CustomerSortKey,
} from '@/lib/customers-by-role';
import { CUSTOMER_LIST_COLUMNS, getCustomerListCellValue } from '@/lib/persona-report-columns';
import { personaFormToApiBody } from '@/lib/persona-customer-payload';
import type { UserRole } from '@/types/product';
import type { StoreCustomerWithRole } from '@/types/store';

const ALL_ROLES = 'all' as const;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('No se pudo leer el archivo'));
        return;
      }
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64 ?? '');
    };
    reader.onerror = () => reject(reader.error ?? new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

interface RegisteredCustomersPanelProps {
  variant?: 'page' | 'embedded';
}

export function RegisteredCustomersPanel({ variant = 'page' }: RegisteredCustomersPanelProps) {
  const { data, isLoading, isError } = useAdminStoreCustomers();
  const customers = data?.customers ?? [];
  const counts = data?.counts;
  const { data: inventoryData } = useAdminProductsQuery();
  const inventoryProducts = inventoryData ?? [];
  const {
    updateCustomer,
    createCustomer,
    importPersonaExcel,
    patchCustomerField,
    deleteCustomer,
  } = useAdminStoreCustomersMutations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<CustomerRoleGroupKey | typeof ALL_ROLES>(ALL_ROLES);
  const [sort, setSort] = useState<CustomerSortKey>('name');
  const [editing, setEditing] = useState<StoreCustomerWithRole | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(
    () =>
      filterAndSortCustomers(customers, {
        query,
        roleFilter,
        sort,
      }),
    [customers, query, roleFilter, sort],
  );

  const totalWithAccount = customers.filter((c) => c.profile_id).length;

  const handleSave = async (values: CustomerEditFormValues) => {
    if (!editing) return;
    await updateCustomer.mutateAsync({ id: editing.id, values });
  };

  const handleCreate = async (body: ReturnType<typeof personaFormToApiBody>) => {
    await createCustomer.mutateAsync(body);
    toast.success('Cliente creado correctamente');
  };

  const productNameById = useMemo(
    () => new Map(inventoryProducts.map((p) => [p.id, p.name])),
    [inventoryProducts],
  );

  const handleRoleChange = async (customer: StoreCustomerWithRole, role: UserRole) => {
    try {
      await patchCustomerField.mutateAsync({
        id: customer.id,
        body: { profile_role: role },
      });
      toast.success('Tipo de cliente actualizado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el rol');
    }
  };

  const handleProductsSave = async (customer: StoreCustomerWithRole, productIds: string[]) => {
    try {
      await patchCustomerField.mutateAsync({
        id: customer.id,
        body: { productos_interes: productIds },
      });
      toast.success('Productos de interés guardados');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron guardar los productos');
    }
  };

  const handleWhatsApp = (customer: StoreCustomerWithRole) => {
    const ids = customer.productos_interes ?? [];
    const productNames = ids
      .map((id) => productNameById.get(id))
      .filter((name): name is string => Boolean(name));
    const phone = getCustomerWhatsAppPhone(customer);
    if (!phone.replace(/\D/g, '').match(/\d{9,}/)) {
      toast.error('El cliente no tiene un número de celular válido');
      return;
    }
    const opened = openCustomerWhatsApp(customer, productNames);
    if (!opened) {
      void navigator.clipboard.writeText(buildCustomerWhatsAppMessage(customer, productNames));
      toast.success('Mensaje copiado. Pégalo en WhatsApp.');
    }
  };

  const handleDelete = async (customer: StoreCustomerWithRole) => {
    const label = customer.full_name ?? customer.company_name ?? customer.email;
    if (!window.confirm(`¿Eliminar el cliente «${label}»? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await deleteCustomer.mutateAsync(customer.id);
      toast.success('Cliente eliminado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar el cliente');
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      const fileBase64 = await fileToBase64(file);
      const result = await importPersonaExcel.mutateAsync(fileBase64);
      toast.success(
        `Importación: ${result.created} nuevos, ${result.updated} actualizados${result.errors.length ? `, ${result.errors.length} errores` : ''}.`,
      );
      if (result.errors.length > 0) {
        console.warn('[persona-import]', result.errors);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo importar el Excel');
    }
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleImportFile(file);
          event.target.value = '';
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={importPersonaExcel.isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        <FileUp className="size-4" aria-hidden="true" />
        {importPersonaExcel.isPending ? 'Importando…' : 'Importar Excel'}
      </Button>
      <Button
        type="button"
        className="gap-2 bg-red-600 hover:bg-red-500"
        onClick={() => setCreating(true)}
      >
        <Plus className="size-4" aria-hidden="true" />
        Nuevo Cliente
      </Button>
    </div>
  );

  const summary = !isLoading && customers.length > 0 && (
    <p className="text-sm text-muted-foreground" role="status">
      {filtered.length === customers.length
        ? `${customers.length} cliente${customers.length === 1 ? '' : 's'}`
        : `${filtered.length} de ${customers.length} clientes`}
      {totalWithAccount > 0 ? ` · ${totalWithAccount} con cuenta` : ''}
      {counts && counts.haisupport > 0 ? ` · ${counts.haisupport} HaiSupport` : ''}
    </p>
  );

  const filters = (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[12rem] flex-1 space-y-2">
        <Label htmlFor="customers-search" className="text-xs font-medium uppercase tracking-wide">
          Buscar
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="customers-search"
            type="search"
            placeholder="Nombre, correo, empresa, RUC, campos Persona…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="w-full space-y-2 sm:w-44">
        <Label htmlFor="customers-role-filter" className="text-xs font-medium uppercase tracking-wide">
          Tipo de cliente
        </Label>
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as CustomerRoleGroupKey | typeof ALL_ROLES)}
        >
          <SelectTrigger id="customers-role-filter" aria-label="Filtrar por tipo de cliente">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ROLES}>Todos los tipos</SelectItem>
            {CUSTOMER_ROLE_SECTIONS.map((section) => (
              <SelectItem key={section.key} value={section.key}>
                {section.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full space-y-2 sm:w-44">
        <Label htmlFor="customers-sort" className="text-xs font-medium uppercase tracking-wide">
          Ordenar por
        </Label>
        <Select value={sort} onValueChange={(value) => setSort(value as CustomerSortKey)}>
          <SelectTrigger id="customers-sort" aria-label="Ordenar clientes">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="role">Tipo de cliente</SelectItem>
            <SelectItem value="date">Fecha de registro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const table = (
    <div className="overflow-x-auto rounded-lg border bg-card">
      {isError && (
        <p role="alert" className="p-4 text-sm text-destructive">
          No se pudieron cargar los clientes. Verifica Supabase y el servidor admin.
        </p>
      )}

      {isLoading && (
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && customers.length === 0 && !isError && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Aún no hay clientes registrados. Importa el Excel Persona o crea un cliente nuevo.
        </p>
      )}

      {!isLoading && customers.length > 0 && filtered.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Ningún cliente coincide con los filtros aplicados.
        </p>
      )}

      {!isLoading && filtered.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              {CUSTOMER_LIST_COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  className="whitespace-nowrap text-xs font-semibold"
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="sticky right-0 min-w-[8.5rem] bg-card text-right text-xs font-semibold">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((customer) => {
              const readOnly = isHaiSupportOnlyCustomer(customer);
              const fieldBusy =
                patchCustomerField.isPending && patchCustomerField.variables?.id === customer.id;
              return (
                <TableRow key={`${customer.source ?? 'store'}:${customer.id}`}>
                  {CUSTOMER_LIST_COLUMNS.map((column) => {
                    if (column.key === 'tipo_cliente') {
                      return (
                        <TableCell key={column.key} className="text-xs">
                          <CustomerListRoleCell
                            customer={customer}
                            disabled={readOnly || fieldBusy}
                            onRoleChange={(role) => void handleRoleChange(customer, role)}
                          />
                        </TableCell>
                      );
                    }
                    if (column.key === 'productos_interes') {
                      return (
                        <TableCell key={column.key} className="text-xs">
                          <CustomerListProductsCell
                            customer={customer}
                            products={inventoryProducts}
                            disabled={readOnly || fieldBusy}
                            isSaving={fieldBusy}
                            onSave={(ids) => void handleProductsSave(customer, ids)}
                          />
                        </TableCell>
                      );
                    }
                    const value = getCustomerListCellValue(customer, column.key);
                    return (
                      <TableCell
                        key={column.key}
                        className="max-w-[16rem] truncate text-xs"
                        title={value || undefined}
                      >
                        {value || '—'}
                      </TableCell>
                    );
                  })}
                  <TableCell className="sticky right-0 bg-card text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-9 text-green-700 hover:bg-green-50 hover:text-green-800"
                        aria-label={`WhatsApp con ${customer.full_name ?? customer.email}`}
                        title="WhatsApp"
                        onClick={() => handleWhatsApp(customer)}
                      >
                        <MessageCircle className="size-4" aria-hidden="true" />
                      </Button>
                      {!readOnly && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-9"
                            aria-label={`Editar ${customer.full_name ?? customer.email}`}
                            title="Editar"
                            onClick={() => setEditing(customer)}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-9 text-destructive hover:bg-destructive/10"
                            disabled={deleteCustomer.isPending}
                            aria-label={`Eliminar ${customer.full_name ?? customer.email}`}
                            title="Eliminar"
                            onClick={() => void handleDelete(customer)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );

  const editDialog = (
    <CustomerEditDialog
      customer={editing}
      open={editing != null}
      onOpenChange={(open) => {
        if (!open) setEditing(null);
      }}
      onSubmit={handleSave}
      isSaving={updateCustomer.isPending}
    />
  );

  const createDialog = (
    <CustomerCreateDialog
      open={creating}
      onOpenChange={setCreating}
      onSubmit={handleCreate}
      isSaving={createCustomer.isPending}
    />
  );

  if (variant === 'embedded') {
    return (
      <section className="space-y-4" aria-label="Clientes">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Listado operativo Persona, filtros y alta manual.
          </p>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {headerActions}
            {summary}
          </div>
        </div>
        {filters}
        {table}
        {editDialog}
        {createDialog}
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Mismas columnas del listado de referencia. El detalle completo se edita en el formulario.
          </p>
          {summary}
        </div>
        {headerActions}
      </div>
      {filters}
      {table}
      {editDialog}
      {createDialog}
    </div>
  );
}
