import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getVentasErpCellValue,
  VENTAS_ERP_COLUMNS,
} from '@/lib/ventas-report-columns';
import type { ImportedSaleDocument } from '@/types/imported-sale';
import { cn } from '@/lib/utils';

interface ImportedSalesErpTableProps {
  documents: ImportedSaleDocument[];
}

export function ImportedSalesErpTable({ documents }: ImportedSalesErpTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table className="min-w-max text-xs">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {VENTAS_ERP_COLUMNS.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  'whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide',
                  column.align === 'right' && 'text-right',
                )}
                style={{ minWidth: column.minWidth }}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const totalNegative = Number(doc.total) < 0;
            return (
              <TableRow key={doc.id}>
                {VENTAS_ERP_COLUMNS.map((column) => {
                  const value = getVentasErpCellValue(doc, column);
                  const isTotalCol = column.id === 'total' || column.id === 'importe_soles';
                  return (
                    <TableCell
                      key={column.id}
                      className={cn(
                        'max-w-[16rem] whitespace-nowrap px-2 py-1.5',
                        column.align === 'right' && 'text-right tabular-nums',
                        column.id === 'nombre_razon_social' && 'whitespace-normal',
                        column.id === 'observaciones' && 'max-w-[12rem] whitespace-normal',
                        column.id === 'doc_relacionado' && 'max-w-[10rem] whitespace-normal',
                        isTotalCol && totalNegative && 'text-destructive font-medium',
                      )}
                      title={value}
                    >
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <p className="border-t px-4 py-2 text-xs text-muted-foreground">
        {documents.length} comprobante{documents.length === 1 ? '' : 's'} · columnas según Reporte
        de Ventas ERP
      </p>
    </div>
  );
}
