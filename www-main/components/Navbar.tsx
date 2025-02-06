'use client';

import { Popover, Transition } from '@headlessui/react';
import { GiftIcon, MenuIcon, ShoppingCartIcon, XIcon } from '@heroicons/react/outline';
import { SearchIcon } from '@heroicons/react/solid';
import Image from 'next/image';
import Link from 'next/link';
import va from '@vercel/analytics';
import { FC, Fragment } from 'react';
import { useBrightTripUser } from '../hooks/useBrightTripUser';
import { useCartContext } from '../hooks/useCartContext';
import { useColorScheme } from '../hooks/useColorScheme';
import * as gtag from '../lib/gtag';
import * as mpClient from '../mixpanel/client';
import btLogoImage from '../public/images/logo.png';
import { withAWSPathPrefix } from '../utils';
import AvatarPlaceholder from './AvatarPlaceholder';
import Button from './Button';
import HeaderProfile from './HeaderProfile';

const navLinksLeft = [
  {
    label: 'Podcasts',
    href: '/podcasts',
  },
  {
    label: 'Books',
    href: '/books',
  },
];

const navLinksRight = [
  {
    label: 'Help',
    href: '#',
  },
];

interface NavLinkProps {
  label: string;
  href: string;
  textTheme: string;
}

const NavLink: FC<NavLinkProps> = ({ label, href, textTheme }) => {
  return (
    <Link href={href} className={`text-base whitespace-nowrap font-medium ${textTheme}`}>
      {label}
    </Link>
  );
};

interface NavbarProps {
  backgroundStyle?: 'bg-bt-background-light/10' | 'bg-bt-background-light dark:bg-gray-800';
}

const transparentTextTheme = 'text-white dark:text-white hover:text-gray-200 dark:text-gray-200';
const opaqueTextTheme = 'text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white';

const Navbar: FC<NavbarProps> = ({ backgroundStyle = 'bg-bt-background-light dark:bg-gray-800' }) => {
  const { user, isLoading } = useBrightTripUser();
  const { toggleCart } = useCartContext();
  const { themeIcon, toggleTheme } = useColorScheme();

  const isTransparent = backgroundStyle === 'bg-bt-background-light/10';
  const profileImageUrl = user?.imageUrl?.startsWith('http') ? user.imageUrl : withAWSPathPrefix(user?.imageUrl ?? '');
  const textTheme = isTransparent ? transparentTextTheme : opaqueTextTheme;

  const signUpTrack = () => {
    va.track('Sign Up');
    try {
      mpClient.track(mpClient.Event.SignUp, {});
      gtag.event(gtag.Action.SignUp, {
        method: 'auth0',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const signInTrack = () => {
    va.track('Log In');
    try {
      mpClient.track(mpClient.Event.SignIn, {});
      gtag.event(gtag.Action.Login, {
        method: 'auth0',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const loginURL = `/login${
    typeof window !== 'undefined' ? '?returnTo=' + encodeURIComponent(window.location.href) : ''
  }`;
  const signUpURL = `/signup${
    typeof window !== 'undefined' ? '?returnTo=' + encodeURIComponent(window.location.href) : ''
  }`;
  const logoutURL = `/api/auth/logout${
    typeof window !== 'undefined' ? '?returnTo=' + encodeURIComponent(window.location.href) : ''
  }`;

  return (
    <Popover
      className={`relative z-20 ${backgroundStyle} backdrop-blur-lg flex w-full justify-center px-4 shadow-sm filter ${textTheme} ${
        isTransparent ? '' : 'sticky top-0 bg-opacity-90'
      }`}
    >
      <div className="flex w-full max-w-screen-2xl items-center justify-between px-4 py-4 sm:px-6 md:space-x-10">
        <div className="flex items-center">
          <Link href="/">
            <Image
              className={`filter ${isTransparent ? 'invert' : 'dark:invert'} cursor-pointer`}
              src={btLogoImage}
              alt="Center for Gospel Culture Logo"
              height="auto"
              width="300"
              priority
            />
          </Link>
          <span className="sr-only">Center for Gospel Culture</span>
          <div className="ml-4 md:ml-6 lg:ml-10 hidden items-center gap-6 md:flex">
            {navLinksLeft
              .filter((link) => (link.href === '/my-courses' ? Boolean(user) : true))
              .map((navLink) => (
                <NavLink key={navLink.href} href={navLink.href} label={navLink.label} textTheme={textTheme} />
              ))}
          </div>
        </div>
        <div className="-my-2 -mr-2 flex space-x-2 md:hidden">
          <Link href="/search">
            <button className="h-10 w-10 rounded-full hover:bg-black/5 flex justify-center items-center">
              <SearchIcon className="w-6 h-6" />
            </button>
          </Link>
          <button className="h-10 w-10 flex justify-center items-center" aria-label="View cart" onClick={toggleCart}>
            <ShoppingCartIcon className="w-6 h-6" />
          </button>
          <Popover.Button
            className={`${backgroundStyle} inline-flex items-center justify-center rounded-md p-2 ${textTheme} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-bt-teal`}
          >
            <span className="sr-only">Open menu</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </Popover.Button>
        </div>
        <div className="hidden md:gap-4 lg:gap-6 md:flex md:items-center">
          <div className="flex gap-3">
            <Link href="/search">
              <span className="sr-only">Search</span>
              <button
                aria-label="Search"
                className="h-10 w-10 rounded-full hover:bg-black/5 flex justify-center items-center"
              >
                <SearchIcon className="w-6 h-6" />
              </button>
            </Link>
          </div>
          {user ? (
            <HeaderProfile user={user} />
          ) : isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <Link href={loginURL} onClick={signInTrack} className="whitespace-nowrap">
                Log In
              </Link>
              <Link href={signUpURL}>
                <Button
                  variant={isTransparent ? 'glassPrimary' : 'secondary'}
                  onClick={signUpTrack}
                  className="whitespace-nowrap"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* MOBILE NAV BELOW */}
      <Transition
        as={Fragment}
        enter="duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Popover.Panel focus className="absolute inset-x-0 top-0 origin-top-right transform p-2 transition md:hidden">
          <div className="divide-y-2 divide-gray-50 rounded-2xl bg-bt-background-light shadow-lg ring-1 ring-black ring-opacity-5 dark:divide-gray-700 dark:bg-gray-800">
            <div className="px-5 pt-5 pb-6">
              <div className="flex justify-between">
                <div className="flex items-center gap-1">
                  <Link href="/">
                    <Image
                      className="filter dark:invert"
                      src={btLogoImage}
                      alt="Bright Trip"
                      width="500"
                      height="40"
                      priority
                    />
                  </Link>
                  <button
                    onClick={toggleTheme}
                    aria-label="Toggle Dark Mode"
                    className="h-10 w-10 rounded-full hover:bg-black/5 flex justify-center items-center"
                  >
                    {themeIcon}
                  </button>
                </div>
                <div className="">
                  <Popover.Button className="focus:outline-none inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-bt-teal dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200">
                    <span className="sr-only">Close menu</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
            </div>
            <div className="py-6 px-5">
              <div className="flex flex-col gap-6">
                {navLinksLeft
                  .filter((link) => (link.href === '/my-courses' ? Boolean(user) : true))
                  .map((item) => (
                    <NavLink key={item.label} href={item.href} label={item.label} textTheme={opaqueTextTheme} />
                  ))}
                <hr className="dark:border-gray-600" />
                {navLinksRight.map((item) => (
                  <NavLink key={item.label} href={item.href} label={item.label} textTheme={opaqueTextTheme} />
                ))}
              </div>
              <div className="mt-6 border-t pt-5 dark:border-gray-600">
                {user ? (
                  <div className="flex flex-col gap-2 text-gray-600 dark:text-gray-300">
                    <div className="py-5">
                      <div className="flex items-center gap-4">
                        {user.imageUrl ? (
                          <Image
                            src={profileImageUrl}
                            className="rounded-full"
                            alt=""
                            width="64"
                            height="64"
                            unoptimized
                          />
                        ) : (
                          <AvatarPlaceholder size="compact" />
                        )}
                        <div>
                          <span className="block font-bold text-subtitle1">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-sm font-bodycopy block dark:text-gray-400">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Link href="/profile">
                        <Button variant="primary" className="w-full">
                          View Profile
                        </Button>
                      </Link>
                      <Link href={logoutURL}>
                        <Button variant="background" className="w-full">
                          Sign out
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Link href={loginURL}>
                      <Button variant="background" className="w-full" onClick={signInTrack}>
                        Log In
                      </Button>
                    </Link>
                    <Link href={loginURL}>
                      <Button variant="primary" className="w-full" onClick={signUpTrack}>
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export default Navbar;
