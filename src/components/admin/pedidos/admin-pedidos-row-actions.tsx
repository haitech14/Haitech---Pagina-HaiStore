import { useState } from 'react';
import { Copy, FileDown, MessageCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { SaleOrderEditDialog } from '@/components/admin/sales/sale-order-edit-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  fetchAdminOrderDetail,
  useDeleteOrder,
  useUpdateOrder,
} from '@/hooks/use-admin-order-mutations';
import { downloadSaleOrderPdf } from '@/lib/sale-order-pdf';
import {
  copySaleOrderWhatsAppMessage,
  openSaleOrderWhatsApp,
} from '@/lib/sale-order-whatsapp-message';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { UpdateSaleOrderPayload } from '@/types/sale-order-admin';
import type { StoreOrder } from '@/types/store';

interface AdminPedidosRowActionsProps {
  order: Pick<StoreOrder, 'id' | 'order_number'>;
}

export function AdminPedidosRowActions({ order }: AdminPedidosRowActionsProps) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<StoreOrder | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const deleteOrder = useDeleteOrder();
  const updateOrder = useUpdateOrder();
  const { data: companySettings } = useCompanySettings();
  const company = companySettings ?? DEFAULT_COMPANY_SETTINGS;

  const loadDetail = async (): Promise<StoreOrder | null> => {
    try {
      return await fetchAdminOrderDetail(order.id);
    } catch {
      toast.error('No se pudo cargar el detalle del pedido');
      return null;
    }
  };

  const handleEdit = async () => {
    setBusy(true);
    try {
      const detail = await loadDetail();
      if (!detail) return;
      setEditing(detail);
      setEditOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async (payload: UpdateSaleOrderPayload) => {
    if (!editing) return;
    await updateOrder.mutateAsync({ id: editing.id, payload });
    toast.success('Pedido actualizado');
  };

  const handlePdf = async () => {
    setBusy(true);
    try {
      const detail = await loadDetail();
      if (!detail) return;
      await downloadSaleOrderPdf(detail, company);
      toast.success('PDF descargado');
    } catch {
      toast.error('No se pudo generar el PDF');
    } finally {
      setBusy(false);
    }
  };

  const handleWhatsAppCopy = async () => {
    setBusy(true);
    try {
      const detail = await loadDetail();
      if (!detail) return;
      await copySaleOrderWhatsAppMessage(detail);
      toast.success('Mensaje copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el mensaje');
    } finally {
      setBusy(false);
    }
  };

  const handleWhatsAppOpen = async () => {
    setBusy(true);
    try {
      const detail = await loadDetail();
      if (!detail) return;
      await copySaleOrderWhatsAppMessage(detail);
      const opened = openSaleOrderWhatsApp(detail);
      if (opened) {
        toast.success('WhatsApp abierto con el mensaje del pedido');
      }
    } catch {
      toast.error('No se pudo abrir WhatsApp');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `¿Eliminar el pedido ${order.order_number}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await deleteOrder.mutateAsync(order.id);
      toast.success('Pedido eliminado');
    } catch {
      toast.error('No se pudo eliminar el pedido');
    } finally {
      setBusy(false);
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
            disabled={busy}
            aria-label={`Acciones para ${order.order_number}`}
          >
            <MoreVertical className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => void handleEdit()}>
            <Pencil className="size-4" aria-hidden="true" />
            Editar pedido
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void handlePdf()}>
            <FileDown className="size-4" aria-hidden="true" />
            Descargar PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void handleWhatsAppCopy()}>
            <Copy className="size-4" aria-hidden="true" />
            Copiar mensaje WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void handleWhatsAppOpen()}>
            <MessageCircle className="size-4" aria-hidden="true" />
            Enviar WhatsApp
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => void handleDelete()}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SaleOrderEditDialog
        order={editing}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={handleSaveEdit}
        isSaving={updateOrder.isPending}
      />
    </>
  );
}
