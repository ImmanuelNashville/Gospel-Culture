import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import { contentfulPreviewClient } from '../../../contentful/contentfulClient';
import { ContentfulCourseFields, Course } from '../../../models/contentful';
import { getDurationsForVideosFromFile } from '../../../utils/courses.server';
import { getMuxTokensForCourseMarketing } from '../../../utils/tokens';
import CourseDetailsPage from '../../courses/[courseSlug]';

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(context: GetServerSidePropsContext) {
    const session = getSession(context.req, context.res);

    const redirect = {
      destination: '/courses',
      permanent: false,
    };

    if (!session) {
      return { redirect };
    }

    const { params: { courseSlug } = {} } = context;

    if (!courseSlug) {
      return { redirect };
    }

    const previewCourseResponse = await contentfulPreviewClient.getEntries<ContentfulCourseFields>({
      content_type: 'course',
      'fields.slug': String(courseSlug),
      include: 10,
    });

    const matchedCourse = previewCourseResponse.items[0] as unknown as Course;

    if (!matchedCourse) {
      return { redirect };
    }

    const tokens = getMuxTokensForCourseMarketing(matchedCourse);
    const videoAssets = getDurationsForVideosFromFile(matchedCourse);

    return {
      props: {
        course: matchedCourse ?? null,
        tokens,
        videoAssets,
      },
    };
  },
});

export default CourseDetailsPage;
