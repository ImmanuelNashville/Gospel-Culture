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
  const creatorsResponse = await contentfulClient.getEntries<{ slug: string }>({
    select: 'fields.slug',
    content_type: 'creator',
  });

  const teamsResponse = await contentfulClient.getEntries<{ slug: string }>({
    select: 'fields.slug',
    content_type: 'creatorTeam',
  });

  return {
    paths: [...creatorsResponse.items, ...teamsResponse.items].map((item) => `/creators/${item.fields.slug}`),
    fallback: true,
  };
};

export const getTopLessons = (courses: Course[]) => {
  return courses
    ?.flatMap((course) => {
      return course.fields.chapters?.flatMap((chapter) => {
        return chapter.fields.lessons ?? [];
      });
    })
    .filter((item) => item?.sys.id ?? false)
    .sort(() => (Math.random() > Math.random() ? 1 : -1))
    .slice(0, 10);
};

export const getStaticProps = async (context: GetStaticPropsContext<{ creatorSlug: string }>) => {
  const { params: { creatorSlug } = {} } = context;

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
};

const CreatorPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({
  creator,
  coursesByCreator,
  trailerTokens,
  courseDurations,
}) => {
  const router = useRouter();
  const videoCount = useMemo(() => {
    return coursesByCreator?.reduce((sum, course) => {
      const chapters = course?.fields.chapters ?? [];
      const lessons = chapters.flatMap((chapter) => chapter.fields.lessons ?? []);
      return sum + lessons.length;
    }, 0);
  }, [coursesByCreator]);

  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.05,
  });

  const getCourseCountText = () => {
    let text = 'Course';
    const allCoursesAreGuides = coursesByCreator
      .map((c) => c.sys.id)
      .every((cid) => appConfig.travelGuides.includes(cid));

    if (allCoursesAreGuides) {
      text = 'Guide';
    }

    if (coursesByCreator.length !== 1) {
      text += 's';
    }

    return text;
  };

  return (
    <Layout
      title={creator?.fields.name ?? 'Creator Details'}
      description="Bright Trip"
      fullBleed
      transparentHeader={heroInView}
      openGraph={buildCreatorOpenGraph(creator)}
      twitter={{
        cardType: 'summary_large_image',
      }}
    >
      {router.isFallback && <p>Loading creator...</p>}
      {creator ? (
        <div>
          <header
            className={`flex h-screen w-full items-end justify-center bg-cover bg-center bg-no-repeat relative mt-nav`}
          >
            {creator.fields.hero?.fields.file.url && (
              <Image
                src={creator.fields.hero?.fields.file.url}
                alt=""
                className="absolute object-cover"
                sizes="100vh"
                fill
                priority
                loader={contentfulImageLoader}
              />
            )}
            <div
              className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-tr from-black opacity-60"
              ref={heroRef}
            />
            <div className="z-10 mb-24 flex w-full flex-col items-start justify-self-start px-20 text-center drop-shadow-md filter">
              <div className="mb-4 flex items-start gap-4">
                {creator.fields.profilePhoto && (
                  <Image
                    className="rounded-full object-cover"
                    src={creator.fields.profilePhoto?.fields.file.url}
                    alt={creator.fields.name}
                    width="48"
                    height="48"
                    loader={contentfulImageLoader}
                  />
                )}
                <h1 className="text-white text-5xl font-bold pb-0 leading-none">{creator.fields.name}</h1>
              </div>
              <p className="text-white/90 text-lg font-bodycopy max-w-md text-left">
                {creator.fields.oneLineBio ?? ''}
              </p>
              <div className="min-w-max">
                <dl className="mt-7 mb-3 flex gap-4 text-white md:gap-6">
                  {coursesByCreator.length > 0 ? (
                    <div>
                      <Text As="dd" alwaysWhite variant="headline6">
                        {coursesByCreator.length}
                      </Text>
                      <Text As="dt" alwaysWhite variant="body">
                        {getCourseCountText()}
                      </Text>
                    </div>
                  ) : null}
                  <div>
                    <Text As="dd" alwaysWhite variant="headline6">
                      {videoCount}
                    </Text>
                    <Text As="dt" alwaysWhite variant="body">
                      Videos
                    </Text>
                  </div>
                </dl>
              </div>
            </div>
            <div className="absolute bottom-12 hidden md:block">
              <SocialLinks className="text-gray-200 hover:text-white" links={buildSocialLinks(creator)} />
            </div>
          </header>

          <FullWidthSection>
            <h4 className="text-3xl font-bold dark:text-gray-200">
              {creator.fields.name}&apos;s {getCourseCountText()}
            </h4>
            {coursesByCreator.length ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {coursesByCreator.map((course) => (
                  <CourseCard
                    key={course.sys.id}
                    course={course}
                    imageSizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                ))}
              </div>
            ) : (
              <p className="mt-6">{"This creator doesn't have any courses yet"}</p>
            )}
          </FullWidthSection>
          <FullWidthSection bgColor="bg-gradient-to-tr from-bt-teal-dark to-bt-teal-light dark:to-bt-teal-light/30">
            <h4 className="text-4xl text-white dark:text-gray-200 text-center font-bold">
              About {creator.fields.name}
            </h4>
            <CreatorCard creator={creator} />
          </FullWidthSection>
        </div>
      ) : (
        <p>{"Hmm... this creator doesn't seem to exist"}</p>
      )}
    </Layout>
  );
};

export default CreatorPage;
