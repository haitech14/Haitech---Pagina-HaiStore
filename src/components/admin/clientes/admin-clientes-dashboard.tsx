import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { AdminClientesKpis } from '@/components/admin/clientes/admin-clientes-kpis';
import { AdminClientesPageHeader } from '@/components/admin/clientes/admin-clientes-page-header';
import { AdminClientesTablePanel } from '@/components/admin/clientes/admin-clientes-table-panel';
import { AdminClientesWidgets } from '@/components/admin/clientes/admin-clientes-widgets';
import { CustomerCreateDialog } from '@/components/admin/customer-create-dialog';
import { useAdminDateRange } from '@/context/admin-date-range-context';
import {
  useAdminStoreCustomers,
  useAdminStoreCustomersMutations,
} from '@/hooks/use-admin-customers';
import { filterCustomersInRange } from '@/lib/admin-clientes-utils';
import { personaFormToApiBody } from '@/lib/persona-customer-payload';

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

export function AdminClientesDashboard() {
  const { range, setRange } = useAdminDateRange();
  const { data, isLoading, isError } = useAdminStoreCustomers();
  const customers = data?.customers ?? [];
  const { createCustomer, importPersonaExcel } = useAdminStoreCustomersMutations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [creating, setCreating] = useState(false);

  const newCustomersCount = filterCustomersInRange(customers, range).length;

  const handleCreate = async (body: ReturnType<typeof personaFormToApiBody>) => {
    await createCustomer.mutateAsync(body);
    toast.success('Cliente creado correctamente');
    setCreating(false);
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

  return (
    <div className="space-y-6">
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

      <AdminClientesPageHeader
        newCustomersCount={newCustomersCount}
        onCreateCustomer={() => setCreating(true)}
        onImportExcel={() => fileInputRef.current?.click()}
        isImporting={importPersonaExcel.isPending}
      />

      <AdminClientesKpis customers={customers} range={range} isLoading={isLoading} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AdminClientesTablePanel
          customers={customers}
          range={range}
          onRangeChange={setRange}
          isLoading={isLoading}
          isError={isError}
        />
        <AdminClientesWidgets customers={customers} range={range} />
      </div>

      <CustomerCreateDialog
        open={creating}
        onOpenChange={setCreating}
        onSubmit={handleCreate}
        isSaving={createCustomer.isPending}
      />
    </div>
  );
}
