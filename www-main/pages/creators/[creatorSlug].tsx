import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import { FC, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { useRouter } from 'next/router';

import appConfig from '../../appConfig';
import CourseCard from '../../components/Card/CourseCard';
import CreatorCard from '../../components/CreatorCard';
import Layout from '../../components/Layout';
import SocialLinks from '../../components/SocialLinks';
import Text from '../../components/Text';
import contentfulClient from '../../contentful/contentfulClient';
import {
  ContentfulCourseFields,
  ContentfulCreatorFields,
  ContentfulCreatorTeamFields,
  Course,
} from '../../models/contentful';
import { formatDuration } from '../../utils';
import { contentfulImageLoader } from '../../utils/contentfulImageLoader';
import { getDurationsForVideosFromFile } from '../../utils/courses.server';
import { buildSocialLinks } from '../../utils/creators';
import { buildCreatorOpenGraph } from '../../utils/openGraph';
import { getTokensForAllTrailers } from '../../utils/tokens';
import FullWidthSection from '../../components/PageSections/FullWidthSection';

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const creatorsResponse = await contentfulClient.getEntries<{ slug: string }>({
      select: 'fields.slug',
      content_type: 'creator',
    });

    const teamsResponse = await contentfulClient.getEntries<{ slug: string }>({
      select: 'fields.slug',
      content_type: 'creatorTeam',
    });

    return {
      paths: [...creatorsResponse.items, ...teamsResponse.items].map((item) => ({
        params: { creatorSlug: item.fields.slug },
      })),
      fallback: 'blocking', // Allows on-demand generation
    };
  } catch (error) {
    console.error('Error fetching creator paths:', error);
    return { paths: [], fallback: 'blocking' }; // Avoids build failures
  }
};

export const getStaticProps = async (context: GetStaticPropsContext<{ creatorSlug: string }>) => {
  const { params: { creatorSlug } = {} } = context;

  if (!creatorSlug) {
    return { notFound: true };
  }

  try {
    const getCoursesForTeamIds = async (teamIds: string[]) => {
      return await contentfulClient.getEntries<ContentfulCourseFields>({
        content_type: 'course',
        'fields.creator.sys.contentType.sys.id': 'creatorTeam',
        'fields.creator.sys.id[in]': teamIds.join(','),
        include: 10,
      });
    };

    const creatorResponse = await contentfulClient.getEntries<ContentfulCreatorFields>({
      'fields.slug': String(creatorSlug),
      content_type: 'creator',
      include: 10,
    });

    const teamsResponse = await contentfulClient.getEntries<ContentfulCreatorTeamFields>({
      'fields.slug': String(creatorSlug),
      content_type: 'creatorTeam',
      include: 10,
    });

    let allCourses: Course[] = [];

    if (creatorResponse.items.length) {
      const { items: creatorsCourses } = await contentfulClient.getEntries<ContentfulCourseFields>({
        content_type: 'course',
        links_to_entry: creatorResponse.items[0].sys.id,
        include: 10,
      });

      const { items: creatorsTeams } = await contentfulClient.getEntries<ContentfulCreatorTeamFields>({
        content_type: 'creatorTeam',
        links_to_entry: creatorResponse.items[0].sys.id,
      });

      const { items: teamCourses } = await getCoursesForTeamIds(creatorsTeams.map((team) => team.sys.id));
      allCourses = [...creatorsCourses, ...teamCourses] ?? [];
    }

    if (teamsResponse.items.length) {
      const { items: teamCourses } = await getCoursesForTeamIds([teamsResponse.items[0].sys.id]);
      allCourses = teamCourses;
    }

    const trailerTokens = await getTokensForAllTrailers();
    const courseDurations = allCourses.reduce((durationsMap, course) => {
      const durations = getDurationsForVideosFromFile(course);
      durationsMap[course.sys.id] = durations.courseTotal.duration ?? 0;
      return durationsMap;
    }, {} as Record<string, number>);

    return {
      props: {
        creator: creatorResponse.items[0] ?? teamsResponse.items[0] ?? null,
        coursesByCreator: allCourses,
        trailerTokens,
        courseDurations,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching creator data:', error);
    return { props: { creator: null, coursesByCreator: [], trailerTokens: null, courseDurations: {} } };
  }
};

const CreatorPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({
  creator,
  coursesByCreator,
  trailerTokens,
  courseDurations,
}) => {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Loading creator...</p>;
  }

  if (!creator) {
    return (
      <Layout title="Creator Not Found">
        <div className="text-center p-10">
          <h1 className="text-3xl font-bold">Creator Not Found</h1>
          <p>Sorry, we couldn’t find the creator you’re looking for.</p>
        </div>
      </Layout>
    );
  }

  const videoCount = useMemo(() => {
    return coursesByCreator?.reduce((sum, course) => {
      const chapters = course?.fields.chapters ?? [];
      const lessons = chapters.flatMap((chapter) => chapter.fields.lessons ?? []);
      return sum + lessons.length;
    }, 0);
  }, [coursesByCreator]);

  return (
    <Layout
      title={creator.fields.name}
      description="Bright Trip"
      fullBleed
      openGraph={buildCreatorOpenGraph(creator)}
      twitter={{ cardType: 'summary_large_image' }}
    >
      <header className="relative h-screen flex items-end justify-center bg-cover bg-center">
        {creator.fields.hero?.fields.file.url && (
          <Image
            src={creator.fields.hero.fields.file.url}
            alt=""
            className="absolute object-cover"
            fill
            priority
            loader={contentfulImageLoader}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-black opacity-60" />
        <div className="z-10 mb-24 text-center text-white">
          <h1 className="text-5xl font-bold">{creator.fields.name}</h1>
          <p className="mt-4">{creator.fields.oneLineBio ?? ''}</p>
        </div>
      </header>

      <FullWidthSection>
        <h4 className="text-3xl font-bold">Courses by {creator.fields.name}</h4>
        {coursesByCreator.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {coursesByCreator.map((course) => (
              <CourseCard key={course.sys.id} course={course} imageSizes="(max-width: 640px) 100vw, 33vw" />
            ))}
          </div>
        ) : (
          <p className="mt-6">{"This creator doesn't have any courses yet."}</p>
        )}
      </FullWidthSection>
    </Layout>
  );
};

export default CreatorPage;
