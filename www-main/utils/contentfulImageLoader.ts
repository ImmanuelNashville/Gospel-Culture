import { ImageLoader } from 'next/image';

export const contentfulImageLoader: ImageLoader = ({ src, width, quality }) => {
  const fixedSrc = String(src).startsWith('//') ? String(`https:${src}`) : String(src);
  return `${fixedSrc}?w=${width}&q=${quality || 75}`;
};
