import { useEffect, useRef, useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    Culqi?: {
      publicKey: string;
      settings: (config: Record<string, unknown>) => void;
      options: (config: Record<string, unknown>) => void;
      open: () => void;
      token?: { id: string };
      error?: { user_message?: string; merchant_message?: string };
    };
    culqi?: () => void;
  }
}

const CULQI_SCRIPT = 'https://js.culqi.com/v4';

function loadCulqiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Sin ventana'));
  if (window.Culqi) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${CULQI_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Culqi')));
      return;
    }
    const script = document.createElement('script');
    script.src = CULQI_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Culqi'));
    document.head.appendChild(script);
  });
}

interface CheckoutCulqiFormProps {
  publicKey: string;
  email: string;
  amountPen: number;
  orderNumber: string | null;
  onBeforeOpen?: () => Promise<string | null | void>;
  onToken: (token: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export function CheckoutCulqiForm({
  publicKey,
  email,
  amountPen,
  orderNumber,
  onBeforeOpen,
  onToken,
  onError,
  disabled,
}: CheckoutCulqiFormProps) {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeOrderNumber, setActiveOrderNumber] = useState(orderNumber);
  const callbackRef = useRef({ onToken, onError });

  callbackRef.current = { onToken, onError };

  useEffect(() => {
    if (orderNumber) {
      setActiveOrderNumber(orderNumber);
    }
  }, [orderNumber]);

  useEffect(() => {
    let cancelled = false;
    void loadCulqiScript()
      .then(() => {
        if (cancelled || !window.Culqi) return;
        window.Culqi.publicKey = publicKey;
        window.Culqi.settings({
          title: 'Haitech',
          currency: 'PEN',
          description: activeOrderNumber ? `Pedido ${activeOrderNumber}` : 'Pedido Haitech',
          amount: Math.round(amountPen * 100),
        });
        window.Culqi.options({
          lang: 'es',
          installments: false,
          paymentMethods: {
            tarjeta: true,
            yape: false,
            billetera: false,
            bancaMovil: false,
            agente: false,
            cuotealo: false,
          },
        });
        window.culqi = () => {
          if (window.Culqi?.token?.id) {
            callbackRef.current.onToken(window.Culqi.token.id);
            return;
          }
          const message =
            window.Culqi?.error?.user_message ??
            window.Culqi?.error?.merchant_message ??
            'No se pudo tokenizar la tarjeta';
          callbackRef.current.onError(message);
        };
        setReady(true);
      })
      .catch((error) => {
        onError(error instanceof Error ? error.message : 'Error al cargar Culqi');
      });

    return () => {
      cancelled = true;
    };
  }, [publicKey, amountPen, activeOrderNumber, onError]);

  const openCulqi = async () => {
    if (!window.Culqi || !ready) return;
    setLoading(true);
    try {
      let resolvedOrderNumber = activeOrderNumber;
      if (onBeforeOpen) {
        const result = await onBeforeOpen();
        if (result === null) return;
        if (typeof result === 'string') {
          resolvedOrderNumber = result;
          setActiveOrderNumber(result);
        }
      }
      if (!resolvedOrderNumber) {
        onError('No se pudo preparar el pedido para el pago con tarjeta.');
        return;
      }
      window.Culqi.settings({
        title: 'Haitech',
        currency: 'PEN',
        description: `Pedido ${resolvedOrderNumber}`,
        amount: Math.round(amountPen * 100),
        email,
      });
      window.Culqi.open();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 w-full justify-center gap-2"
      disabled={disabled || !ready || loading}
      onClick={() => void openCulqi()}
    >
      {loading || !ready ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <CreditCard className="size-4" aria-hidden="true" />
      )}
      Pagar con tarjeta
    </Button>
  );
}
