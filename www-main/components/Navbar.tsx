'use client';

import { Popover, Transition } from '@headlessui/react';
import { GiftIcon, MenuIcon, ShoppingCartIcon, XIcon } from '@heroicons/react/outline';
import { SearchIcon } from '@heroicons/react/solid';
import Image from 'next/image';
import Link from 'next/link';
import va from '@vercel/analytics';
import { FC, Fragment } from 'react';
import btLogoImage from '../public/images/logo.png';


const navLinksLeft = [
  {
    label: 'Articles',
    href: '/articles'
  },
  {
    label: 'Books',
    href: '/books',
  },
  {
    label: 'Podcasts',
    href: '/podcasts',
  },
  {
    label: 'Sermons',
    href: '/sermons',
  },
];

const navLinksRight = [
  {
    label: 'Contact',
    href: '/contact',
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
 

  const isTransparent = backgroundStyle === 'bg-bt-background-light/10';
  const textTheme = isTransparent ? transparentTextTheme : opaqueTextTheme;

  

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
      className={`relative z-50 ${backgroundStyle} backdrop-blur-lg flex w-full justify-center px-4 shadow-sm filter ${textTheme} ${
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
              height="300"
              width="300"
              priority
            />
          </Link>
          <span className="sr-only">Center for Gospel Culture</span>
          <div className="ml-4 md:ml-6 lg:ml-10 hidden items-center gap-6 md:flex">
            {navLinksLeft
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
                  
                  .map((item) => (
                    <NavLink key={item.label} href={item.href} label={item.label} textTheme={opaqueTextTheme} />
                  ))}
                <hr className="dark:border-gray-600" />
                {navLinksRight.map((item) => (
                  <NavLink key={item.label} href={item.href} label={item.label} textTheme={opaqueTextTheme} />
                ))}
              </div>
              
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export default Navbar;
