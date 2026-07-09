import { ShipmentRowActions } from '@/components/admin/shipping/shipment-row-actions';
import type { ShipmentRecord, ShipmentStatus } from '@/types/shipping';

interface AdminEnviosRowActionsProps {
  shipment: ShipmentRecord;
  carrierName: string;
  zoneName: string;
  nextStatus?: ShipmentStatus;
  onAdvance?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function AdminEnviosRowActions(props: AdminEnviosRowActionsProps) {
  return <ShipmentRowActions {...props} />;
}
