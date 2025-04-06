import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

type Testimonial = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
};

interface Props {
  testimonials: Testimonial[];
}

const TestimonialCarousel: React.FC<Props> = ({ testimonials }) => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: {
      perView: 1,
      spacing: 16,
    },
    mode: 'snap',
    breakpoints: {
      '(min-width: 640px)': {
        slides: {
          perView: 2,
          spacing: 24,
        },
      },
      '(min-width: 1024px)': {
        slides: {
          perView: 3,
          spacing: 32,
        },
      },
    },
  });

  if (!testimonials?.length) {
    return null;
  }

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Stories of Gospel Culture
        </h2>

        <div className="relative">
          <div ref={sliderRef} className="keen-slider">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="keen-slider__slide px-4"
                role="button"
                tabIndex={0}
                onClick={() => setCurrentVideo(testimonial.videoUrl)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setCurrentVideo(testimonial.videoUrl);
                  }
                }}
              >
                <div className="group relative w-full h-64 max-w-md mx-auto overflow-hidden rounded-lg">
                  <img
                    src={testimonial.thumbnailUrl || '/default-image.jpg'}
                    alt={testimonial.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => instanceRef.current?.prev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-gray-800/80 hover:bg-gray-800 text-white p-2 rounded-full transition-colors"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => instanceRef.current?.next()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-gray-800/80 hover:bg-gray-800 text-white p-2 rounded-full transition-colors"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <Dialog
          open={!!currentVideo}
          onClose={() => setCurrentVideo(null)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-4xl bg-black rounded-xl overflow-hidden">
              <button
                onClick={() => setCurrentVideo(null)}
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-black p-2 rounded-full transition-colors"
                aria-label="Close video"
              >
                ✕
              </button>
              {currentVideo && (
                <video
                  src={currentVideo}
                  controls
                  autoPlay
                  className="w-full aspect-video"
                  onError={(e) => console.error('Video error:', e)}
                />
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </section>
  );
};

export default TestimonialCarousel;