import { InferGetStaticPropsType } from 'next';
import appConfig from '../appConfig';
import { PremiumBadge } from '../components/Card/Badges';
import CourseCard from '../components/Card/CourseCard';
import Layout from '../components/Layout';
import FullWidthSection from '../components/PageSections/FullWidthSection';
import SectionWithMargin from '../components/PageSections/SectionWithMargin';
import { SectionDivider } from '../components/SectionDivider';
import { SectionHeading } from '../components/SectionHeading';
import contentfulClient from '../contentful/contentfulClient';
import cn from '../courseNames';
import { ContentfulCourseFields, Course } from '../models/contentful';

export const getStaticProps = async () => {
  const response = await contentfulClient.getEntries<ContentfulCourseFields>({
    content_type: 'course',
    include: 2,
  });

  const featuredCourses = [
    cn['Visual Storytelling'],
    cn['The Ultimate Language Learning Guide'],
    cn['How to Appreciate Art'],
  ].map((id) => response.items.find((course) => course.sys.id === id) as Course);

  const courses = response.items.filter(
    (course) =>
      !appConfig.archivedItems.map((ai) => ai.id).includes(course.sys.id) && // course isn't archived
      (course.fields.price ?? 0) > 0 // course isn't free
  );

  return {
    props: { courses, featuredCourses },
  };
};

export const StorePage = ({ courses, featuredCourses }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [primary, secondaryTop, secondaryBottom] = featuredCourses;

  return (
    <Layout title="Store" description="Bright Trip" fullBleed>
      <FullWidthSection bgColor="bg-gradient-to-tr from-bt-teal-dark to-bt-teal-light dark:to-bt-teal-light/30">
        <h1 className="text-3xl md:text-4xl font-bold text-white/90">Premium Store</h1>
        <p className="font-bodycopy text-md md:text-lg text-white/70 mb-4">
          These premium creator courses are available for individual purchase with lifetime access
        </p>
      </FullWidthSection>
      <SectionWithMargin>
        <SectionHeading title="Most Popular" description="Our community's favorite courses" />
        <div className="mb-12 flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:grid-rows-2">
          <CourseCard
            course={primary}
            className="col-span-2 row-span-2 rounded-md"
            imageSizes="(max-width: 640px) 100vw, (max-width: 1280px) 66vw, 820px"
            priorityLoading
            cardContent={(c) => <PremiumBadge course={c} />}
          />
          <CourseCard
            course={secondaryTop}
            imageSizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 400px"
            cardContent={(c) => <PremiumBadge course={c} />}
          />
          <CourseCard
            course={secondaryBottom}
            imageSizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 400px"
            cardContent={(c) => <PremiumBadge course={c} />}
          />
        </div>
      </SectionWithMargin>
      <SectionWithMargin>
        <SectionDivider />
      </SectionWithMargin>
      <SectionWithMargin>
        <SectionHeading
          title="Full Premium Catalog"
          description="All of our premium courses from our favorite creators"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((c) => (
            <CourseCard
              key={c.sys.id}
              course={c}
              cardContent={(c) => <PremiumBadge course={c} />}
              imageSizes="(max-width: 720px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 400px"
            />
          ))}
        </div>
      </SectionWithMargin>
    </Layout>
  );
};

export default StorePage;
