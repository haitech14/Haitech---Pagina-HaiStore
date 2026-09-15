import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

import { CheckoutManualInstructions } from '@/components/checkout/checkout-manual-instructions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ManualPaymentMethodId } from '@/lib/build-checkout-session-payload';

interface CheckoutSuccessProps {
  orderNumber: string;
  paymentProvider?: string | null;
  paymentStatus?: string | null;
  manualMethod?: ManualPaymentMethodId | null;
}

function resolveManualMethod(method: string | null | undefined): ManualPaymentMethodId {
  if (method?.toLowerCase().includes('yape') || method?.toLowerCase().includes('plin')) return 'yape-plin';
  if (method?.toLowerCase().includes('contra')) return 'contra-entrega';
  return 'transferencia';
}

export function CheckoutSuccess({
  orderNumber,
  paymentProvider,
  paymentStatus,
  manualMethod,
}: CheckoutSuccessProps) {
  const isPaid = paymentStatus === 'paid';
  const isManual = paymentProvider === 'manual' || !paymentProvider;

  return (
    <div className="container max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="size-5" aria-hidden="true" />
            {isPaid ? 'Pago confirmado' : 'Pedido registrado'}
          </CardTitle>
          <CardDescription>
            {isPaid
              ? 'Hemos recibido tu pago. Coordinaremos el envío a la brevedad.'
              : 'Hemos recibido tu solicitud de compra. Un asesor confirmará el pago y coordinará el envío.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Referencia:{' '}
            <span className="font-mono font-semibold text-foreground">{orderNumber}</span>
          </p>

          {isManual ? (
            <CheckoutManualInstructions
              method={manualMethod ?? resolveManualMethod(paymentProvider ?? null)}
            />
          ) : null}

          <Button asChild className="min-h-11 bg-red-600 hover:bg-red-500">
            <Link to="/tienda">Seguir comprando</Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <Link to="/mi-cuenta?tab=pedidos">Ver mis compras</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/login/registro" className="font-medium text-red-600 underline-offset-2 hover:underline">
              Regístrate
            </Link>{' '}
            para ver el estado de tus pedidos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
