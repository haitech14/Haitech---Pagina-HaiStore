import { Outlet } from 'react-router-dom';

import { CrmPipelineProvider } from '@/context/crm-pipeline-context';

/** Estado compartido de leads entre Pipeline y Resumen CRM. */
export function AdminCrmLayout() {
  return (
    <CrmPipelineProvider>
      <Outlet />
    </CrmPipelineProvider>
  );
}
