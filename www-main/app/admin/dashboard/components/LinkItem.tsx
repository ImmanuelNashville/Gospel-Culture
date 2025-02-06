'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LinkData } from './types';

function LinkItem({ link, param }: { link: LinkData; param: string }) {
  const routeParams = useParams();
  const isActive = routeParams?.[param] && link.href.endsWith(String(routeParams[param]));

  return (
    <li className="my-0.5 text-body -ml-1.5 font-bodycopy">
      <Link
        href={link.href}
        className={`block w-full dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded-lg ${
          isActive ? 'bg-bt-teal-ultraLight/10 text-bt-teal-dark font-bold' : ''
        }`}
      >
        {link.label}
      </Link>
    </li>
  );
}

export default LinkItem;
