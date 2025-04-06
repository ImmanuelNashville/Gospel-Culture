// components/FeaturedSermonsCarousel.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CardCarousel from './CardCarousel';

interface SermonItem {
  sys: {
    id: string;
  };
  link: string;
  imageUrl: string;
  title: string;
}

interface FeaturedSermonsCarouselProps {
  sermonItems: SermonItem[];
}

const FeaturedSermonsCarousel: React.FC<FeaturedSermonsCarouselProps> = ({ sermonItems }) => {
  return (
    <CardCarousel
      title="Featured Sermons"
      subtitle="Check out some of our latest sermons."
      containerStyles="pb-10 px-2"
      items={sermonItems.map((sermon) => (
        <Link
          key={sermon.sys.id}
          href={sermon.link}
          className="border-2 shadow-md border-transparent hover:shadow-xl hover:scale-[103%] cursor-pointer flex-shrink-0 block w-small-card md:w-card isolate bg-bt-background-light dark:bg-gray-800 rounded-xl overflow-hidden p-2 transition-all duration-200"
        >
          <div className="p-1 rounded-md border border-black/10">
            <div className="relative w-full h-0 pb-[66.67%]">
              <Image
                src={sermon.imageUrl}
                alt={sermon.title}
                fill
                className="rounded-md object-cover object-center"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
            <div className="flex flex-col px-0.5 pt-2 pb-1">
              <span className="text-bodySmall md:text-body font-bold leading-tight text-gray-800 dark:text-gray-300">
                {sermon.title}
              </span>
            </div>
          </div>
        </Link>
      ))}
    />
  );
};

export default FeaturedSermonsCarousel;
