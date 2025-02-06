import { FC } from 'react';
import Link from 'next/link';
import SocialLinks from './SocialLinks';
import NewsletterSignup from './NewsletterSignup';

const navigation = [
  { name: 'About', href: '/about' },
  { name: 'Log In', href: '/#' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Terms of Use', href: '/terms-of-use' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
];

const Footer: FC = () => {
  return (
    <footer
      className="relative mx-auto max-w-screen-2xl w-full bg-bt-off-white py-6 text-center text-gray-500 dark:bg-gray-900 dark:text-gray-300 z-10"
      aria-label="Footer"
    >
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <hr className="my-8 dark:border-gray-600" />
        <div className="flex flex-col justify-between gap-8 sm:flex-row items-center">
          <nav className="-mx-5 -my-2 flex flex-col items-center sm:items-start">
            {navigation.map((item) => (
              <div key={item.name} className="px-5 py-2">
                <Link
                  href={item.href}
                  className="text-base cursor-pointer text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </nav>
          <NewsletterSignup />
        </div>
        <hr className="my-8 dark:border-gray-600" />
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <SocialLinks />
          <p className="text-subtitle2 uppercase font-bodycopy text-gray-600 dark:text-gray-500">
            &copy; {new Date().getFullYear()} The Center of Gospel Culture. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
