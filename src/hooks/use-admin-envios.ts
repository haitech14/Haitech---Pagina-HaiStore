import { useCallback, useState } from 'react';

import {
  createShipment,
  deleteShipment,
  duplicateShipment,
  loadShipments,
  updateShipment,
  updateShipmentStatus,
} from '@/lib/shipping-storage';
import type { ShipmentRecord, ShipmentStatus } from '@/types/shipping';
import type { NewShipmentInput } from '@/lib/shipping-storage';

export function useAdminEnviosList() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>(() => loadShipments());

  const refresh = useCallback(() => {
    setShipments(loadShipments());
  }, []);

  const handleCreate = useCallback((input: NewShipmentInput) => {
    const next = createShipment(input);
    setShipments(next);
    return next[0];
  }, []);

  const handleUpdate = useCallback((id: string, input: NewShipmentInput) => {
    const next = updateShipment(id, input);
    setShipments(next);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setShipments(deleteShipment(id));
  }, []);

  const handleDuplicate = useCallback((id: string) => {
    setShipments(duplicateShipment(id));
  }, []);

  const handleAdvanceStatus = useCallback((id: string, status: ShipmentStatus) => {
    setShipments(updateShipmentStatus(id, status));
  }, []);

  return {
    shipments,
    refresh,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleDuplicate,
    handleAdvanceStatus,
  };
}
