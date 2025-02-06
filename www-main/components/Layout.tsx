import { NextSeo, NextSeoProps } from 'next-seo';

import Footer from './Footer';
import Navbar from './Navbar';

import Link from 'next/link';

interface LayoutProps {
  title: string;
  description: string;
  fullBleed?: boolean;
  transparentHeader?: boolean;
  openGraph?: NextSeoProps['openGraph'];
  twitter?: NextSeoProps['twitter'];
  children?: React.ReactNode;
}

export const DEFAULT_OPEN_GRAPH = {
  url: typeof window !== 'undefined' ? window.location.href : 'https://www.brighttrip.com',
  description: 'Satisfy your curiosity',
  images: [
    {
      url: 'https://www.brighttrip.com/images/social/default-social.png',
      width: 800,
      height: 450,
      alt: 'Bright Trip',
      type: 'image/png',
    },
  ],
  site_name: 'Bright Trip',
};

export const DEFAULT_TWITTER = {
  cardType: 'summary_large_image',
};

const Layout = ({
  title,
  description,
  fullBleed = false,
  transparentHeader = false,
  openGraph,
  twitter,
  children,
}: LayoutProps) => {
  return (
    <section className="text-base bg-bt-off-white dark:bg-gray-900">
      <NextSeo
        title={`${title} | Bright Trip`}
        description={description}
        openGraph={openGraph ?? DEFAULT_OPEN_GRAPH}
        twitter={twitter ?? DEFAULT_TWITTER}
      />
      <nav className="sticky top-0 z-30">
        <Navbar
          backgroundStyle={transparentHeader ? 'bg-bt-background-light/10' : 'bg-bt-background-light dark:bg-gray-800'}
        />
      </nav>
      
      <main className={fullBleed ? '' : 'mx-auto max-w-screen-xl px-8 py-6'}>{children}</main>
      <Footer />
    </section>
  );
};

export default Layout;


