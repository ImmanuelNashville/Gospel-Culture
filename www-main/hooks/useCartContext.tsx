import { useContext } from 'react';
import { CartContext } from '../context/cart';

export const useCartContext = () => {
  const cartContext = useContext(CartContext);
  if (!cartContext) {
    throw new Error(
      'No CartContext.Provider found when calling `useCartContext`. Make sure this component is a child the CartContext.Provider somewhere in the component tree.'
    );
  }
  return cartContext;
};
