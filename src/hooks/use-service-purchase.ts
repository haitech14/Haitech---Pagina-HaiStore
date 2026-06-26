import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCart } from '@/context/cart-context';
import {
  buildServiceCartProduct,
  type ServiceCartInput,
} from '@/lib/service-to-cart';

interface ServicePurchaseOptions {
  openDrawer?: boolean;
}

export function useServicePurchase() {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const addServiceToCart = useCallback(
    (input: ServiceCartInput, options?: ServicePurchaseOptions) => {
      const product = buildServiceCartProduct(input);
      addItem(product, { openDrawer: options?.openDrawer !== false });
    },
    [addItem],
  );

  const buyServiceNow = useCallback(
    (input: ServiceCartInput) => {
      addServiceToCart(input, { openDrawer: false });
      navigate('/checkout');
    },
    [addServiceToCart, navigate],
  );

  return { addServiceToCart, buyServiceNow };
}
