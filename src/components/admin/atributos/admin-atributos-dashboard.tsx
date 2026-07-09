import { useState } from 'react';
import { toast } from 'sonner';

import { AdminAtributosKpis } from '@/components/admin/atributos/admin-atributos-kpis';
import { AdminAtributosPageHeader } from '@/components/admin/atributos/admin-atributos-page-header';
import { AdminAtributosTablePanel } from '@/components/admin/atributos/admin-atributos-table-panel';
import { AdminAtributosWidgets } from '@/components/admin/atributos/admin-atributos-widgets';

export function AdminAtributosDashboard() {
  const [headerSearch, setHeaderSearch] = useState('');

  const handleNewAttribute = () => {
    toast.info('El formulario de nuevo atributo estará disponible próximamente.');
  };

  return (
    <div className="space-y-3">
      <AdminAtributosPageHeader
        search={headerSearch}
        onSearchChange={setHeaderSearch}
        onNewAttribute={handleNewAttribute}
      />
      <AdminAtributosKpis />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <AdminAtributosTablePanel headerSearch={headerSearch} />
        <AdminAtributosWidgets />
      </div>
    </div>
  );
}
