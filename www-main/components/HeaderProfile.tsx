import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { FC, Fragment } from 'react';
import Button from './Button';

import Image from 'next/image';
import { withAWSPathPrefix } from '../utils';
import AvatarPlaceholder from './AvatarPlaceholder';
import { FaunaUserData } from '../models/fauna';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface HeaderProfileProps {
  user: FaunaUserData;
}

const HeaderProfile: FC<HeaderProfileProps> = ({ user }) => {
  const profileImageUrl = user.imageUrl?.startsWith('http') ? user.imageUrl : withAWSPathPrefix(user.imageUrl);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button
        aria-label="Open profile menu"
        className="focus:outline-none flex items-center justify-center rounded-full shadow-md focus:ring-2 focus:ring-bt-teal focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800"
      >
        {user.imageUrl ? (
          <Image src={profileImageUrl} className="rounded-full" alt="" width="36" height="36" unoptimized />
        ) : (
          <AvatarPlaceholder widthHeight="w-9 h9" />
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="focus:outline-none absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-bt-background-light shadow-lg ring-1 ring-black ring-opacity-5 dark:divide-gray-600 dark:bg-gray-700">
          <div className="text-bold px-4 py-3 border-b dark:border-gray-600">
            <p className="text-lg leading-none mt-1.5 font-bold text-gray-900 dark:text-gray-200">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-bodySmall text-gray-500 font-bodycopy dark:text-gray-400">{user.email}</p>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <>
                  <Link
                    href="/profile"
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300',
                      'text-sm block px-4 py-2'
                    )}
                  >
                    View Profile
                  </Link>
                  <Link
                    href="/my-courses"
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300',
                      'text-sm block px-4 py-2'
                    )}
                  >
                    My Courses
                  </Link>
                  <Link
                    href="/contact"
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300',
                      'text-sm block px-4 py-2'
                    )}
                  >
                    Help
                  </Link>
                </>
              )}
            </Menu.Item>
          </div>
          <div className="p-2 pb-4 max-w-max mx-auto">
            <Menu.Item>
              {() => (
                <>
                  {/* "a" tag not "Link" b/c it goes to an API route */}
                  <Link href="/api/auth/logout">
                    <Button variant="primary" className="mx-auto">
                      Sign out
                    </Button>
                  </Link>
                </>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default HeaderProfile;
