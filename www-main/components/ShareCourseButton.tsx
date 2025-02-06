import { Popover } from '@headlessui/react';
import { ClipboardCopyIcon, ShareIcon } from '@heroicons/react/outline';
import { FC, useEffect, useState } from 'react';
import * as gtag from '../lib/gtag';
import * as mpClient from '../mixpanel/client';
import Button from './Button';

interface ShareCourseButtonProps {
  courseId?: string;
}

const ShareCourseButton: FC<ShareCourseButtonProps> = ({ courseId }) => {
  const [buttonText, setButtonText] = useState('Copy Link');

  const handleCopyClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setButtonText('Copied!');
    setTimeout(() => {
      setButtonText('Copy Link');
    }, 1500);
    if (courseId) {
      try {
        mpClient.track(mpClient.Event.CopyLink, { courseId });
        gtag.event(gtag.Action.Share, {
          method: 'copy_link',
          content_type: 'course',
          item_id: courseId,
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Popover className="relative">
      {({ open }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (open && courseId) {
            try {
              mpClient.track(mpClient.Event.Share, { courseId });
            } catch (e) {
              console.error(e);
            }
          }
        }, [open]);

        return (
          <>
            <Popover.Button as="div">
              <Button variant="muted" size="small" icon={<ShareIcon />} className="md:hidden" />
              <Button variant="muted" size="small" icon={<ShareIcon />} className="hidden md:inline px-5">
                <span className="hidden md:inline">Share</span>
              </Button>
            </Popover.Button>

            <Popover.Panel className="absolute z-10">
              <div className="flex items-center justify-center rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-lg">
                <Button
                  onClick={handleCopyClick}
                  size="extraSmall"
                  variant="secondary"
                  className="whitespace-nowrap"
                  icon={<ClipboardCopyIcon />}
                >
                  {buttonText}
                </Button>
              </div>
            </Popover.Panel>
          </>
        );
      }}
    </Popover>
  );
};

export default ShareCourseButton;
