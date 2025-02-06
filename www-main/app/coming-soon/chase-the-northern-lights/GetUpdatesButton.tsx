'use client';

import { MailIcon } from '@heroicons/react/solid';
import { useProductNotification } from 'hooks/useProductNotification';

type GetUpdatesButtonProps = {
  courseName: string;
};

export default function GetUpdatesButton({ courseName }: GetUpdatesButtonProps) {
  const { openModal, notifyModal } = useProductNotification('Stay updated about ' + courseName, courseName);
  return (
    <>
      <button
        className="flex gap-2 items-center bg-bt-teal/50 hover:bg-bt-teal/100 transition-colors duration-150 text-white rounded-full px-6 py-2.5"
        onClick={openModal}
      >
        <MailIcon className="w-6 h-6" />
        <span className="uppercase tracking-widest font-bold">Get Updates</span>
      </button>
      {notifyModal}
    </>
  );
}
