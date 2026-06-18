import { ExternalLink, TrendingUp, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  getHaibotCrmNewLeadUrl,
  getHaibotCrmPipelineUrl,
  getHaibotCrmResumenUrl,
} from '@/lib/haibot-integrations';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { useAuth } from '@/context/auth-context';

const VENTAS_WHATSAPP_MESSAGE =
  'Hola, consulto desde HaiStore (Haibot · Ventas). Necesito registrar un lead o dar seguimiento comercial. ¿Me pueden orientar?';

interface HaibotSalesWorkflowProps {
  onClose?: () => void;
}

export function HaibotSalesWorkflow({ onClose }: HaibotSalesWorkflowProps) {
  const { canAccessAdminPanel } = useAuth();

  if (canAccessAdminPanel) {
    return (
      <div className="space-y-3 rounded-xl bg-white p-3 shadow-sm">
        <p className="text-[0.7rem] font-semibold text-[#075e54]">📈 Ventas y CRM</p>
        <p className="text-[0.65rem] leading-relaxed text-[#667781]">
          Gestiona leads, pipeline y seguimiento comercial desde el panel HaiStore (integrado con
          HaiSales).
        </p>

        <div className="flex flex-col gap-2">
          <Button
            asChild
            size="sm"
            className="h-9 justify-start gap-2 bg-[#075e54] text-xs hover:bg-[#128c7e]"
            onClick={onClose}
          >
            <Link to={getHaibotCrmNewLeadUrl()}>
              <UserPlus className="size-3.5 shrink-0" aria-hidden="true" />
              Nuevo lead en CRM
            </Link>
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

  return (
    <div className="space-y-3 rounded-xl bg-white p-3 shadow-sm">
      <p className="text-[0.7rem] font-semibold text-[#075e54]">📈 Ventas</p>
      <p className="text-[0.65rem] leading-relaxed text-[#667781]">
        Para registrar leads y dar seguimiento comercial, inicia sesión como equipo de ventas o
        contáctanos por WhatsApp.
      </p>

      <div className="flex flex-col gap-2">
        <Button
          asChild
          size="sm"
          className="h-9 gap-2 bg-[#25D366] text-xs hover:bg-[#20bd5a]"
        >
          <a
            href={buildHaitechWhatsAppUrl(VENTAS_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp ventas 💬
          </a>
        </Button>

        <Button asChild size="sm" variant="outline" className="h-9 text-xs">
          <Link to="/login?redirect=/admin/crm/pipeline">Iniciar sesión · CRM</Link>
        </Button>
      </div>
    </div>
  );
}
