import { useUser } from '@auth0/nextjs-auth0/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { CartCourse } from '../context/cart';
import { getFaunaUser, QK_FAUNA_USER } from '../utils/queries';

export const useBrightTripUser = () => {
  const { user: auth0User, isLoading: auth0IsLoading, error: auth0Error } = useUser();
  const { data: user, error } = useQuery({
    queryKey: [QK_FAUNA_USER],
    queryFn: getFaunaUser,
    enabled: Boolean(auth0User?.email),
    staleTime: 300_000,
  });

  const weHaveAUser = Boolean(user);
  const jsonifiedCart = typeof localStorage !== 'undefined' ? localStorage?.getItem('brighttrip_cart') ?? '[]' : '[]';

  useEffect(() => {
    const cart = JSON.parse(jsonifiedCart);
    if (weHaveAUser && cart.length > 0) {
      const courseIds = cart.map((c: CartCourse) => c.id);
      fetch('/api/users/cart', { method: 'POST', body: JSON.stringify({ courseIds }) });
    }
  }, [jsonifiedCart, weHaveAUser]);

  return { isLoading: !user && !error && !auth0Error && auth0IsLoading, error, user, auth0User };
};
