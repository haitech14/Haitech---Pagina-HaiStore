import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

import { DualPrice } from '@/components/product-showcase-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProductCompare } from '@/context/product-compare-context';
import {
  attributeValueForProduct,
  collectCompareAttributeRows,
} from '@/lib/compare-product';
import { productPath } from '@/lib/product-path';

export function ProductCompareDialog() {
  const { items, compareOpen, setCompareOpen, remove, clear } = useProductCompare();
  const attributeRows = collectCompareAttributeRows(items);

  return (
    <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
      <DialogContent className="flex max-h-[92vh] max-w-[min(96vw,56rem)] flex-col gap-4 overflow-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-balance">Comparar equipos</DialogTitle>
          <DialogDescription>
            Hasta 4 productos seleccionados desde las tarjetas del catálogo.
          </DialogDescription>
        </DialogHeader>

        {items.length < 2 ? (
          <p className="text-sm text-muted-foreground">
            Selecciona al menos dos equipos con el icono de comparar en las tarjetas.
          </p>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 min-w-[7rem] bg-muted/80 backdrop-blur-sm">
                    Característica
                  </TableHead>
                  {items.map((item) => (
                    <TableHead key={item.id} className="min-w-[11rem] text-center align-top sm:min-w-[12rem]">
                      <div className="flex flex-col items-center gap-2.5">
                        {item.image ? (
                          <div className="flex h-28 w-full max-w-[10rem] items-center justify-center rounded-lg bg-muted/40 p-2 sm:h-32 sm:max-w-[11rem]">
                            <img
                              src={item.image}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div
                            className="flex h-28 w-full max-w-[10rem] items-center justify-center rounded-lg bg-muted/40 text-2xl font-bold text-muted-foreground sm:h-32 sm:max-w-[11rem]"
                            aria-hidden="true"
                          >
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <Link
                          to={productPath(item.id)}
                          className="text-xs font-semibold leading-snug text-foreground hover:text-red-600"
                          onClick={() => setCompareOpen(false)}
                        >
                          {item.name}
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          aria-label={`Quitar ${item.name} del comparador`}
                          onClick={() => remove(item.id)}
                        >
                          <X className="size-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="sticky left-0 z-10 bg-background font-medium">
                    Precio
                  </TableCell>
                  {items.map((item) => (
                    <TableCell key={item.id} className="text-center font-semibold">
                      <DualPrice usd={item.price} className="justify-center" />
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 z-10 bg-background font-medium">
                    Categoría
                  </TableCell>
                  {items.map((item) => (
                    <TableCell key={item.id} className="text-center text-sm">
                      {item.category || '—'}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 z-10 bg-background font-medium">
                    Marca
                  </TableCell>
                  {items.map((item) => (
                    <TableCell key={item.id} className="text-center text-sm">
                      {item.brand || '—'}
                    </TableCell>
                  ))}
                </TableRow>
                {attributeRows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="sticky left-0 z-10 bg-background font-medium">
                      {row.label}
                    </TableCell>
                    {items.map((item) => (
                      <TableCell key={item.id} className="text-center text-sm">
                        {attributeValueForProduct(item, row.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t pt-2">
          <Button type="button" variant="outline" onClick={clear}>
            Vaciar comparador
          </Button>
          <Button type="button" onClick={() => setCompareOpen(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
