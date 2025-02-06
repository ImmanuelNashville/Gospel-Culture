import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { ReactNode, useEffect, useRef, useState } from 'react';

interface CardCarouselProps {
  title: string;
  subtitle?: string;
  items: ReactNode[];
  itemWidth?: number;
  containerStyles?: string;
}

export const DEFAULT_ITEM_WIDTH_PIXELS = 310;
export const DEFAULT_CARD_WIDTH_STYLES = `w-[200px] md:w-[${DEFAULT_ITEM_WIDTH_PIXELS}px]`;

export default function CardCarousel({
  title,
  subtitle,
  items,
  itemWidth = DEFAULT_ITEM_WIDTH_PIXELS,
  containerStyles = '',
}: CardCarouselProps) {
  const visibleIndex = useRef<number>(0);
  const [visibleItemCount, setVisibleItemCount] = useState(3);
  const sectionRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const containerWidth = sectionRef.current?.getBoundingClientRect().width ?? 0;
    const numberOfItemsVisible = containerWidth / (itemWidth + 16);
    setVisibleItemCount(numberOfItemsVisible);
  }, [sectionRef, itemWidth]);

  const handleForwardClick = () => {
    const nextValue = visibleIndex.current + 1 * Math.floor(visibleItemCount);
    const maxValue = Math.ceil(items.length - visibleItemCount);
    const capped = Math.min(nextValue, maxValue);
    if (capped === maxValue) {
      document
        .getElementById(`${title}-item-${items.length - 1}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
    } else {
      document
        .getElementById(`${title}-item-${capped}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
    visibleIndex.current = capped;
  };

  const handleBackClick = () => {
    const nextValue =
      visibleIndex.current -
      (visibleIndex.current === items.length ? Math.ceil(1 * visibleItemCount) + 1 : Math.floor(1 * visibleItemCount));
    const minValue = 0;
    const capped = Math.max(nextValue, minValue);
    if (capped === minValue) {
      document
        .getElementById(`${title}-item-${capped}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    } else {
      document
        .getElementById(`${title}-item-${capped}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
    visibleIndex.current = capped;
  };

  return (
    <section className="mb-12" ref={sectionRef}>
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300">{title}</h2>
          {subtitle ? <p className="font-bodycopy text-gray-500 dark:text-gray-400">{subtitle}</p> : ''}
        </div>
        <div className={`gap-2 ${items.length <= visibleItemCount ? 'hidden' : 'flex'}`}>
          <div ref={backButtonRef} className="">
            <button
              aria-label={`See more items in the ${title} section`}
              onClick={handleBackClick}
              className="group rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <ChevronLeftIcon className="relative right-0.5 h-8 w-8 transform text-black/50 dark:text-white/50 group-hover:text-black/80 dark:group-hover:text-white/80" />
            </button>
          </div>

          <div ref={nextButtonRef} className="">
            <button
              disabled={visibleIndex.current === items.length}
              aria-label={`See more items in the ${title} section`}
              onClick={handleForwardClick}
              className="group rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <ChevronRightIcon className="relative left-0.5 h-8 w-8 transform text-black/50 dark:text-white/50 group-hover:text-black/80 dark:group-hover:text-white/80" />
            </button>
          </div>
        </div>
      </div>
      <div className="relative mt-3">
        <div className={`flex gap-3 max-w-screen-2xl overflow-x-auto snap-x snap-mandatory pt-1 ${containerStyles}`}>
          {items.map((item, i) => (
            <div key={i} id={`${title}-item-${i}`} className="snap-center">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
