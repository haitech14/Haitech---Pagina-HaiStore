interface InventoryOrderCellProps {
  displayPosition: number;
}

export function InventoryOrderCell({ displayPosition }: InventoryOrderCellProps) {
  return (
    <span className="inline-flex min-w-[1.75rem] justify-center tabular-nums font-medium text-muted-foreground">
      {displayPosition}
    </span>
  );
}
