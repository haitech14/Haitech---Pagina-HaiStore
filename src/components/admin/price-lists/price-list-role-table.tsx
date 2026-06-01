import { InventoryDualPrice } from '@/components/admin/inventory/inventory-dual-price';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PriceListRow } from '@/lib/price-list-stats';

interface PriceListRoleTableProps {
  rows: PriceListRow[];
  emptyMessage: string;
}

export function PriceListRoleTable({ rows, emptyMessage }: PriceListRoleTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[5rem]">Código</TableHead>
            <TableHead className="min-w-[10rem]">Producto</TableHead>
            <TableHead className="hidden min-w-[6rem] sm:table-cell">Categoría</TableHead>
            <TableHead className="w-16 text-right">Stock</TableHead>
            <TableHead className="min-w-[5.5rem] text-right">Precio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">{row.code}</TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {row.category}
              </TableCell>
              <TableCell className="text-right tabular-nums">{row.stock}</TableCell>
              <TableCell className="text-right">
                <InventoryDualPrice usd={row.usd} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
