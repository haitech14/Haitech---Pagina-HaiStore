import { useState } from 'react';
import { MessageCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  CustomerEditDialog,
  type CustomerEditFormValues,
} from '@/components/admin/customer-edit-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminProductsQuery } from '@/hooks/use-admin-dashboard';
import { useAdminStoreCustomersMutations } from '@/hooks/use-admin-customers';
import {
  buildCustomerWhatsAppMessage,
  getCustomerWhatsAppPhone,
  openCustomerWhatsApp,
} from '@/lib/customer-whatsapp-message';
import { isHaiSupportOnlyCustomer } from '@/lib/customers-by-role';
import { customerDisplayName } from '@/lib/admin-clientes-utils';
import type { StoreCustomerWithRole } from '@/types/store';

interface AdminClientesRowActionsProps {
  customer: StoreCustomerWithRole;
}

export function AdminClientesRowActions({ customer }: AdminClientesRowActionsProps) {
  const [editing, setEditing] = useState(false);
  const { data: inventoryData } = useAdminProductsQuery();
  const inventoryProducts = inventoryData ?? [];
  const { updateCustomer, deleteCustomer } = useAdminStoreCustomersMutations();
  const readOnly = isHaiSupportOnlyCustomer(customer);
  const label = customerDisplayName(customer);

  const productNameById = new Map(inventoryProducts.map((product) => [product.id, product.name]));

  const handleSave = async (values: CustomerEditFormValues) => {
    await updateCustomer.mutateAsync({ id: customer.id, values });
    toast.success('Cliente actualizado');
    setEditing(false);
  };

  const handleWhatsApp = () => {
    const productNames = (customer.productos_interes ?? [])
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

  const handleDelete = async () => {
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`Acciones para ${label}`}
          >
            <MoreVertical className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleWhatsApp()}>
            <MessageCircle className="size-4" aria-hidden="true" />
            WhatsApp
          </DropdownMenuItem>
          {!readOnly ? (
            <>
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <Pencil className="size-4" aria-hidden="true" />
                Editar cliente
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={deleteCustomer.isPending}
                onClick={() => void handleDelete()}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Eliminar
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomerEditDialog
        customer={customer}
        open={editing}
        onOpenChange={setEditing}
        onSubmit={handleSave}
        isSaving={updateCustomer.isPending}
      />
    </>
  );
}
