import { ExternalLink, TrendingUp, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useCrmLeadDialog } from '@/context/crm-lead-dialog-context';
import { buildHaibotCrmLeadPrefill } from '@/lib/haibot-crm-prefill';
import {
  getHaibotCrmPipelineUrl,
  getHaibotCrmResumenUrl,
} from '@/lib/haibot-integrations';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import type { Product } from '@/types/product';

interface HaibotSalesWorkflowProps {
  onClose?: () => void;
  inventoryContext?: {
    searchQuery?: string;
    products: Product[];
  } | null;
}

export function HaibotSalesWorkflow({ onClose, inventoryContext }: HaibotSalesWorkflowProps) {
  const { openNewLead } = useCrmLeadDialog();

  const handleNewLead = () => {
    const prefill = inventoryContext?.products.length
      ? buildHaibotCrmLeadPrefill(inventoryContext.products, inventoryContext.searchQuery)
      : buildHaibotCrmLeadPrefill([], inventoryContext?.searchQuery);
    openNewLead({ stageId: 'leads', prefill });
    onClose?.();
  };

  return (
    <div className="space-y-3 rounded-xl bg-white p-3 shadow-sm">
      <p className="text-[0.7rem] font-semibold text-[#075e54]">📈 Ventas y CRM</p>
      <p className="text-[0.65rem] leading-relaxed text-[#667781]">
        Crea leads con datos del inventario consultado o gestiona el pipeline sin salir de la tienda.
      </p>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="sm"
          className="h-9 justify-start gap-2 bg-[#075e54] text-xs hover:bg-[#128c7e]"
          onClick={handleNewLead}
        >
          <UserPlus className="size-3.5 shrink-0" aria-hidden="true" />
          Nuevo lead en CRM
        </Button>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-9 justify-start gap-2 text-xs"
          onClick={onClose}
        >
          <Link to={getHaibotCrmPipelineUrl()}>
            <TrendingUp className="size-3.5 shrink-0" aria-hidden="true" />
            Pipeline de ventas
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-9 justify-start gap-2 text-xs text-[#54656f]"
          onClick={onClose}
        >
          <Link to={getHaibotCrmResumenUrl()}>
            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
            Resumen comercial
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-9 justify-start gap-2 text-xs text-[#54656f]"
          onClick={onClose}
        >
          <Link to={ADMIN_ROUTES.VENTAS}>
            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
            Panel de ventas / TPV
          </Link>
        </Button>
      </div>
    </div>
  );
}
