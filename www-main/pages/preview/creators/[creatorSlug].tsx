import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import { contentfulPreviewClient } from '../../../contentful/contentfulClient';
import {
  ContentfulCourseFields,
  ContentfulCreatorFields,
  ContentfulCreatorTeamFields,
  Course,
} from '../../../models/contentful';
import { getDurationsForVideosFromFile } from '../../../utils/courses.server';
import { getTokensForAllTrailers, getTokensForTopLessons } from '../../../utils/tokens';
import CreatorPage, { getTopLessons } from '../../creators/[creatorSlug]';

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(context: GetServerSidePropsContext) {
    const session = getSession(context.req, context.res);

    const redirect = {
      destination: '/',
      permanent: false,
    };

    if (!session) {
      return { redirect };
    }

    const { params: { creatorSlug } = {} } = context;

    if (!creatorSlug) {
      return { redirect };
    }

    const getCoursesForTeamIds = async (teamIds: string[]) => {
      return await contentfulPreviewClient.getEntries<ContentfulCourseFields>({
        content_type: 'course',
        'fields.creator.sys.contentType.sys.id': 'creatorTeam',
        'fields.creator.sys.id[in]': teamIds.join(','),
        include: 10,
      });
    };

    const creatorResponse = await contentfulPreviewClient.getEntries<ContentfulCreatorFields>({
      'fields.slug': String(creatorSlug),
      content_type: 'creator',
      include: 10,
    });

    const teamsResponse = await contentfulPreviewClient.getEntries<ContentfulCreatorTeamFields>({
      'fields.slug': String(creatorSlug),
      content_type: 'creatorTeam',
      include: 10,
    });

    let allCourses: Course[] = [];

    if (creatorResponse.items.length) {
      const { items: creatorsCourses } = await contentfulPreviewClient.getEntries<ContentfulCourseFields>({
        content_type: 'course',
        links_to_entry: creatorResponse.items[0].sys.id,
        include: 10,
      });

      const { items: creatorsTeams } = await contentfulPreviewClient.getEntries<ContentfulCreatorTeamFields>({
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

    const topLessons = getTopLessons(allCourses);
    const thumbnailTokens = getTokensForTopLessons(topLessons);
    const trailerTokens = await getTokensForAllTrailers(true);
    const courseDurations = allCourses.reduce((durationsMap, course) => {
      const durations = getDurationsForVideosFromFile(course);
      durationsMap[course.sys.id] = durations.courseTotal.duration ?? 0;
      return durationsMap;
    }, {} as Record<string, number>);

    return {
      props: {
        creator: creatorResponse.items[0] ?? teamsResponse.items[0] ?? null,
        coursesByCreator: allCourses,
        topLessons: topLessons ?? [],
        thumbnailTokens,
        trailerTokens,
        courseDurations,
      },
    };
  },
});

export default CreatorPage;
