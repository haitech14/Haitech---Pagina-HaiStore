import { Outlet } from 'react-router-dom';

import { CrmLeadDialogProvider } from '@/context/crm-lead-dialog-context';
import { CrmPipelineProvider } from '@/context/crm-pipeline-context';

/** Estado compartido de leads entre Pipeline y Resumen CRM. */
export function AdminCrmLayout() {
  return (
    <CrmPipelineProvider>
      <CrmLeadDialogProvider>
        <Outlet />
      </CrmLeadDialogProvider>
    </CrmPipelineProvider>
  );
}
