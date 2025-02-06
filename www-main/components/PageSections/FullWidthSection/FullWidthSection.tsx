import { ReactNode } from 'react';
import Image from 'next/image';
import { contentfulImageLoader } from '../../../utils/contentfulImageLoader';
import SectionWithMargin from '../SectionWithMargin';

const FullWidthSection = ({
  children,
  secondaryOverlay = null,
  bgColor = '',
  imageURL,
  className = '',
}: {
  bgColor?: string;
  imageURL?: string;
  className?: string;
  secondaryOverlay?: ReactNode;
  children?: ReactNode;
}) => (
  <div className={`w-full py-7 ${bgColor} relative isolate ${className}`}>
    {secondaryOverlay}
    {imageURL && (
      <Image
        className={`object-cover top-0 ${bgColor ? 'opacity-30' : 'opacity-70'}`}
        src={imageURL}
        alt=""
        fill
        sizes="100vw"
        loader={contentfulImageLoader}
      />
    )}
    <SectionWithMargin className="relative">{children}</SectionWithMargin>
  </div>
);

export default FullWidthSection;
