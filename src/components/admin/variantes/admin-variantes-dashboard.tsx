import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AdminProductOptionsKpis } from '@/components/admin/variantes/admin-product-options-kpis';
import { AdminProductOptionsTablePanel } from '@/components/admin/variantes/admin-product-options-table-panel';
import { AdminVariantesKpis } from '@/components/admin/variantes/admin-variantes-kpis';
import { AdminVariantesPageHeader } from '@/components/admin/variantes/admin-variantes-page-header';
import { AdminVariantesTablePanel } from '@/components/admin/variantes/admin-variantes-table-panel';
import { AdminVariantesWidgets } from '@/components/admin/variantes/admin-variantes-widgets';
import { useAdminInventory } from '@/hooks/use-products';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import {
  collectProductOptionsFromInventory,
  computeProductOptionsKpis,
} from '@/lib/admin-variantes-utils';
import type { AdminVariantesView } from '@/types/admin-variantes';

function resolveView(searchParams: URLSearchParams): AdminVariantesView {
  return searchParams.get('vista') === 'opciones' ? 'opciones' : 'variantes';
}

export function AdminVariantesDashboard() {
  const [headerSearch, setHeaderSearch] = useState('');
  const [searchParams] = useSearchParams();
  const view = resolveView(searchParams);
  const { data: products = [] } = useAdminInventory();

  const optionKpis = useMemo(() => {
    const options = collectProductOptionsFromInventory(products);
    return computeProductOptionsKpis(options);
  }, [products]);

  const handleNewVariant = () => {
    toast.info('El formulario de nueva variante estará disponible próximamente.');
  };

  const handleNewOption = () => {
    toast.info('Configura opciones desde el editor de inventario (Merchandising).', {
      action: {
        label: 'Ir a inventario',
        onClick: () => {
          window.location.assign(ADMIN_ROUTES.INVENTORY);
        },
      },
    });
  };

  return (
    <div className="space-y-3">
      <AdminVariantesPageHeader
        search={headerSearch}
        onSearchChange={setHeaderSearch}
        onNewVariant={handleNewVariant}
        onNewOption={handleNewOption}
      />

      {view === 'variantes' ? (
        <>
          <AdminVariantesKpis />
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]">
            <AdminVariantesTablePanel headerSearch={headerSearch} />
            <AdminVariantesWidgets />
          </div>
        </>
      ) : (
        <>
          <AdminProductOptionsKpis values={optionKpis} />
          <AdminProductOptionsTablePanel headerSearch={headerSearch} />
        </>
      )}
    </div>
  );
}
