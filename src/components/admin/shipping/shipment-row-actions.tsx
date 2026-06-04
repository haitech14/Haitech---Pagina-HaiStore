import { useState } from 'react';
import {
  ArrowRight,
  Copy,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Printer,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { AdminPdfPreviewDialog, type AdminPdfPreview } from '@/components/admin/admin-pdf-preview-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { createShipmentLabelPreview } from '@/lib/shipment-label';
import {
  loadShipmentLabelFormat,
  saveShipmentLabelFormat,
  SHIPMENT_LABEL_FORMAT_OPTIONS,
  type ShipmentLabelFormat,
} from '@/lib/shipment-label-format';
import {
  copyShipmentWhatsAppMessage,
  openShipmentWhatsApp,
} from '@/lib/shipment-whatsapp-message';
import type { ShipmentRecord, ShipmentStatus } from '@/types/shipping';

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending_pickup: 'Por recoger',
  in_transit: 'En tránsito',
  out_for_delivery: 'En reparto',
  delivered: 'Entregado',
  failed: 'Fallido',
};

interface ShipmentRowActionsProps {
  shipment: ShipmentRecord;
  carrierName: string;
  zoneName: string;
  nextStatus?: ShipmentStatus;
  onAdvance?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}

export function ShipmentRowActions({
  shipment,
  carrierName,
  zoneName,
  nextStatus,
  onAdvance,
  onDuplicate,
  onDelete,
  onEdit,
}: ShipmentRowActionsProps) {
  const { data: companySettings } = useCompanySettings();
  const context = { carrierName, zoneName };
  const [labelPreview, setLabelPreview] = useState<AdminPdfPreview | null>(null);
  const [labelLoading, setLabelLoading] = useState(false);

  const handleWhatsApp = async () => {
    try {
      await copyShipmentWhatsAppMessage(shipment, context);
    } catch {
      toast.error('No se pudo copiar el mensaje');
      return;
    }

    const opened = openShipmentWhatsApp(shipment, context);
    if (opened) {
      toast.success('WhatsApp abierto con el mensaje del envío 📲', {
        description: 'El texto también quedó en el portapapeles por si necesitas editarlo.',
      });
      return;
    }

    toast.success('Mensaje copiado al portapapeles 📋', {
      description: shipment.customerPhone
        ? 'Agrega un teléfono válido al envío para abrir WhatsApp directo.'
        : 'Pégalo en WhatsApp y agrega el teléfono del cliente.',
    });
  };

  const handleLabelPreview = async (format: ShipmentLabelFormat) => {
    if (!companySettings) {
      toast.error('Cargando datos de la empresa…');
      return;
    }
    saveShipmentLabelFormat(format);
    setLabelLoading(true);
    try {
      const preview = await createShipmentLabelPreview(shipment, context, companySettings, format);
      const formatLabel =
        SHIPMENT_LABEL_FORMAT_OPTIONS.find((o) => o.id === format)?.label ?? 'Rótulo';
      setLabelPreview({
        url: preview.url,
        blob: preview.blob,
        filename: preview.filename,
        documentNumber: preview.documentNumber,
        documentLabel: `${preview.documentLabel} (${formatLabel})`,
      });
    } catch {
      toast.error('No se pudo generar el rótulo PDF');
    } finally {
      setLabelLoading(false);
    }
  };

  const defaultLabelFormat = loadShipmentLabelFormat();

  const handleLabelPreviewClose = (open: boolean) => {
    if (!open && labelPreview) {
      URL.revokeObjectURL(labelPreview.url);
      setLabelPreview(null);
    }
  };

  const handleDuplicate = () => {
    onDuplicate();
    toast.success('Envío duplicado');
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        `¿Eliminar el envío ${shipment.orderRef} de ${shipment.customerName}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    onDelete();
    toast.success('Envío eliminado');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 min-h-9 gap-1.5 px-2.5"
            aria-label={`Acciones del envío ${shipment.orderRef}`}
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {nextStatus && onAdvance && (
            <DropdownMenuItem onClick={onAdvance} className="gap-2">
              <ArrowRight className="size-4" aria-hidden="true" />
              Avanzar a {STATUS_LABELS[nextStatus]}
            </DropdownMenuItem>
          )}
          {nextStatus && onAdvance ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem
            onClick={() => void handleLabelPreview(defaultLabelFormat)}
            className="gap-2"
            disabled={labelLoading}
          >
            <Printer className="size-4" aria-hidden="true" />
            {labelLoading ? 'Generando rótulo…' : 'Ver rótulo PDF'}
          </DropdownMenuItem>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Formato del rótulo</DropdownMenuLabel>
          {SHIPMENT_LABEL_FORMAT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.id}
              className="pl-6 text-sm"
              disabled={labelLoading}
              onClick={() => void handleLabelPreview(option.id)}
            >
              {option.label}
              <span className="ml-auto text-xs text-muted-foreground">{option.description}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => void handleWhatsApp()} className="gap-2">
            <MessageCircle className="size-4" aria-hidden="true" />
            Enviar WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate} className="gap-2">
            <Copy className="size-4" aria-hidden="true" />
            Duplicar
          </DropdownMenuItem>
          {onEdit && (
            <DropdownMenuItem onClick={onEdit} className="gap-2">
              <Pencil className="size-4" aria-hidden="true" />
              Editar envío
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdminPdfPreviewDialog preview={labelPreview} onOpenChange={handleLabelPreviewClose} />
    </>
  );
}
