import { ReactNode } from 'react';

export default function InputLabel({ id, children }: { id: string; children: ReactNode }) {
  return (
    <label htmlFor={id} className="text-bodySmall block w-full text-gray-700 dark:text-gray-300">
      {children}
    </label>
  );
}
