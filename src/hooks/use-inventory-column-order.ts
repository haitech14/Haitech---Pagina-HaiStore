import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_INVENTORY_COLUMN_ORDER,
  loadInventoryColumnOrder,
  reorderInventoryColumns,
  saveInventoryColumnOrder,
  type InventoryReorderableColumnId,
} from '@/lib/inventory-table-columns';

export function useInventoryColumnOrder() {
  const [columnOrder, setColumnOrder] = useState<InventoryReorderableColumnId[]>(
    loadInventoryColumnOrder,
  );

  useEffect(() => {
    saveInventoryColumnOrder(columnOrder);
  }, [columnOrder]);

  const reorder = useCallback(
    (draggedId: InventoryReorderableColumnId, targetId: InventoryReorderableColumnId) => {
      setColumnOrder((prev) => reorderInventoryColumns(prev, draggedId, targetId));
    },
    [],
  );

  const resetOrder = useCallback(() => {
    setColumnOrder([...DEFAULT_INVENTORY_COLUMN_ORDER]);
  }, []);

  const isDefaultOrder =
    columnOrder.length === DEFAULT_INVENTORY_COLUMN_ORDER.length &&
    columnOrder.every((id, index) => id === DEFAULT_INVENTORY_COLUMN_ORDER[index]);

  return { columnOrder, reorder, resetOrder, isDefaultOrder };
}
