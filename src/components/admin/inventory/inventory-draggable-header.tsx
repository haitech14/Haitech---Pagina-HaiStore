import { useState } from 'react';

import type { InventoryReorderableColumnId } from '@/lib/inventory-table-columns';
import {
  getInventoryColumnCellClass,
  getInventoryColumnLabel,
  isInventoryPriceColumn,
} from '@/lib/inventory-table-columns';
import { cn } from '@/lib/utils';

interface InventoryDraggableHeaderProps {
  columnId: InventoryReorderableColumnId;
  onReorder: (
    draggedId: InventoryReorderableColumnId,
    targetId: InventoryReorderableColumnId,
  ) => void;
}

export function InventoryDraggableHeader({ columnId, onReorder }: InventoryDraggableHeaderProps) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <th
      scope="col"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('application/x-inventory-column', columnId);
        event.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => setDragOver(false)}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        const draggedId = event.dataTransfer.getData(
          'application/x-inventory-column',
        ) as InventoryReorderableColumnId;
        if (draggedId && draggedId !== columnId) {
          onReorder(draggedId, columnId);
        }
      }}
      className={cn(
        'select-none px-2 py-2.5 align-middle font-medium',
        'cursor-grab active:cursor-grabbing',
        getInventoryColumnCellClass(columnId),
        isInventoryPriceColumn(columnId) && 'text-right',
        columnId === 'stock' && 'text-center',
        dragOver && 'bg-muted/80 ring-2 ring-inset ring-primary/30',
      )}
      title="Arrastra para reordenar esta columna"
    >
      <span
        className={cn(
          'block w-full',
          isInventoryPriceColumn(columnId) && 'text-right',
          columnId === 'stock' && 'text-center',
        )}
      >
        {getInventoryColumnLabel(columnId)}
      </span>
    </th>
  );
}
