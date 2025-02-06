import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Bright Trip Admin',
};

async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.user.email) {
    redirect('/api/auth/login?returnTo=/admin/dashboard');
  }
  if (!session?.user['https://brighttrip.com/isAdmin']) {
    redirect('/');
  }

  return (
    <main className="max-w-screen-2xl mx-auto p-6">
      <h1 className="text-headline5 font-bold mb-3 ml-6 dark:text-gray-100">Admin Dashboard</h1>
      <div>{children}</div>
    </main>
  );
}

export default AdminDashboardLayout;
