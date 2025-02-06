import { getStaticProps as courseGSP } from '../courses/[courseSlug]';
import CourseDetailsPage from '../courses/[courseSlug]';
import { GetStaticPaths } from 'next';
import contentfulClient from '../../contentful/contentfulClient';
import appConfig from '../../appConfig';

export const getStaticPaths: GetStaticPaths = async () => {
  const guides = await contentfulClient.getEntries<{ slug: string }>({
    select: 'fields.slug',
    content_type: 'course',
    'sys.id[in]': appConfig.travelGuides.join(),
  });

  return {
    paths: guides.items.map((item) => {
      return `/guides/${item.fields.slug}`;
    }),
    fallback: true,
  };
};

export const getStaticProps = courseGSP;

export default CourseDetailsPage;
