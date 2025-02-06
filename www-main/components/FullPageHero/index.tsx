'use client';

import { ChevronDownIcon } from '@heroicons/react/outline';
import { Entry } from 'contentful';
import Image from 'next/image';
import { forwardRef, useRef } from 'react';
import { ContentfulMuxVideoFields } from '../../models/contentful';
import { contentfulImageLoader } from '../../utils/contentfulImageLoader';

type FullPageHeroProps = {
  bgImageUrl?: string;
  mainContent?: React.ReactNode;
  footerContent?: {
    left?: React.ReactNode;
    middle?: React.ReactNode;
    right?: React.ReactNode;
  };
  
  height?: string;
  overlayStyle?: string;
  secondaryOverlayStyle?: string;
  hideChevron?: boolean;
  imageClassName?: string;
};

export const FullPageHero = forwardRef<HTMLDivElement, FullPageHeroProps>(function FullPageHero(
  {
    mainContent,
    footerContent,
    height = 'min-h-screen',
    overlayStyle = 'bg-black opacity-20',
    secondaryOverlayStyle,
    hideChevron = false,
    imageClassName = '',
  },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <header className={`flex ${height} z-10 justify-center bg-gray-600 items-center relative mt-nav`}>
      
      <div ref={ref} className={`absolute inset-0 ${overlayStyle}`} />
      {secondaryOverlayStyle ? <div className={`absolute inset-0 ${secondaryOverlayStyle}`} /> : null}
      <div className="flex flex-col relative items-center px-2 text-center sm:px-10">{mainContent}</div>
      {footerContent?.middle && <div className="absolute bottom-12 text-white">{footerContent.middle}</div>}
      {hideChevron ? null : <ChevronDownIcon className="absolute bottom-3 h-8 w-8 text-white" />}
      {footerContent?.left && <div className="absolute bottom-6 left-6 hidden md:block">{footerContent.left}</div>}
      {footerContent?.right && <div className="absolute bottom-6 right-6 hidden md:block">{footerContent.right}</div>}
    </header>
  );
});

export default FullPageHero;
