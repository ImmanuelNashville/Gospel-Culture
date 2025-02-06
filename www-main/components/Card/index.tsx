import Image from 'next/image';
import { contentfulImageLoader } from '../../utils/contentfulImageLoader';

interface CardProps {
  imageUrl: string;
  className?: string;
  innerClassName?: string;
  imageSizes?: string;
  priorityLoading?: boolean;
  children?: React.ReactNode;
}

const Card = ({
  imageUrl,
  className = '',
  innerClassName = 'p-2 rounded-md',
  imageSizes = '100vw',
  priorityLoading = false,
  children,
}: CardProps) => {
  return (
    <div className={`group aspect-w-16 aspect-h-9 ${className} isolate`}>
      <div
        className={`absolute transform overflow-hidden bg-gray-100 bg-cover bg-center bg-no-repeat drop-shadow-md filter duration-200 dark:bg-gray-700 ${innerClassName}`}
      >
        <Image
          src={imageUrl}
          alt=""
          className="object-cover rounded-md"
          fill
          sizes={imageSizes}
          priority={priorityLoading}
          loader={imageUrl.includes('ctfassets') ? contentfulImageLoader : undefined}
          unoptimized={imageUrl.includes('image.mux') ? true : undefined}
        />
        {children}
      </div>
    </div>
  );
};

export default Card;
