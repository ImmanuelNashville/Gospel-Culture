import { VideoCameraIcon } from '@heroicons/react/solid';
import { Entry } from 'contentful';
import { InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import { useEffect } from 'react';
import Card from '../components/Card';
import { PremiumBadge } from '../components/Card/Badges';
import CourseCard from '../components/Card/CourseCard';
import Layout from '../components/Layout';
import FullWidthSection from '../components/PageSections/FullWidthSection';
import contentfulClient from '../contentful/contentfulClient';
import useCourseFilterSearch from '../hooks/useCourseFilterSearch';
import { ContentfulCourseFields, ContentfulSingleVideoPageFields, Course } from '../models/contentful';
import { formatDuration } from '../utils';

export async function getStaticProps() {
  const response = await contentfulClient.getEntries<ContentfulCourseFields>({
    content_type: 'course',
    include: 2,
  });
  const singleVideos = await contentfulClient.getEntries<ContentfulSingleVideoPageFields>({
    content_type: 'singleVideoPage',
    include: 10,
  });
  const searchableItems = [
    ...(response.items as Course[]),
    ...(singleVideos.items as Entry<ContentfulSingleVideoPageFields>[]),
  ];

  return {
    props: {
      searchableItems,
    },
    revalidate: 60,
  };
}

export default function SearchPage({ searchableItems }: InferGetStaticPropsType<typeof getStaticProps>) {
  const { matchingCourses, filterComponent, inputRef } = useCourseFilterSearch(searchableItems, '');

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  return (
    <Layout title="Search" description="Find your next Bright Trip course or Travel Guide" fullBleed>
      <FullWidthSection bgColor="bg-gradient-to-tr from-bt-green to-bt-green/70 dark:to-bt-green/30">
        <h1 className="text-3xl md:text-4xl font-bold text-white/90">Search Bright Trip</h1>
        <p className="font-bodycopy text-md md:text-lg text-white/70 mb-4">
          All travel guides, premium courses, documentaries, and videos. If we have it, you can find it here.
        </p>
      </FullWidthSection>
      <FullWidthSection className="pt-0 pb-0">
        {filterComponent}
        {matchingCourses.length ? (
          <div className="isolate grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {matchingCourses.map((course) => {
              if (course.sys.contentType.sys.id === 'course') {
                const confirmedCourse = course as Course;
                return (
                  <CourseCard
                    key={confirmedCourse.sys.id}
                    course={confirmedCourse}
                    cardContent={(confirmedCourse) => <PremiumBadge course={confirmedCourse} />}
                    imageSizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 400px"
                  />
                );
              }
              if (course.sys.contentType.sys.id === 'singleVideoPage') {
                const confirmedVideo = course as Entry<ContentfulSingleVideoPageFields>;
                return (
                  <Link href={`/videos/${confirmedVideo.fields.slug}`} key={confirmedVideo.sys.id}>
                    <Card
                      imageUrl={confirmedVideo.fields.video.fields.thumbnail?.fields.file.url ?? ''}
                      className="relative"
                      imageSizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 400px"
                    >
                      <span className="sr-only">{confirmedVideo.fields.title}</span>
                      <div className="relative flex w-full h-full justify-end items-end">
                        <div className="max-w-fit flex items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-0.5">
                          <VideoCameraIcon className="h-4 w-4 text-white" />
                          <span className="text-bodySmall font-bold text-white">
                            <span className="relative" style={{ top: '0.5px' }}>
                              {formatDuration(confirmedVideo.fields.video.fields.video?.duration ?? 0, 'mm:ss')}
                            </span>
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              }
            })}
          </div>
        ) : (
          <div className="w-full">
            <p className="text-body text-center text-gray-400">No matching courses</p>
          </div>
        )}
      </FullWidthSection>
    </Layout>
  );
}
