'use client';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import { ReactNode } from 'react';

export default function Auth0UserProvider({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
