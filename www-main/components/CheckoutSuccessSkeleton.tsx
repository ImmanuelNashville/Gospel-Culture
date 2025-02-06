import { ReactNode } from 'react';

export default function CheckoutSuccessSkeleton({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-tl from-bt-teal-dark/90 via-transparent to-bt-orange/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-bt-off-white dark:from-gray-900 to-transparent" />
      <main className="relative flex max-w-max mx-auto p-12 rounded-2xl shadow-md flex-col items-center space-y-6 bg-bt-background-light dark:bg-bt-background-light/10 mt-8 mb-24">
        {children}
      </main>
    </>
  );
}
