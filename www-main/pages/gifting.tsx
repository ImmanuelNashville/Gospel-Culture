import { InferGetStaticPropsType } from 'next';
import contentfulClient from '../contentful/contentfulClient';
import { ContentfulCourseFields, Course } from '../models/contentful';
import GiftFlow from '../components/GiftFlow';

function sortCoursesAlphabetically(a: Course, b: Course) {
  if (a.fields.title > b.fields.title) {
    return 1;
  } else if (a.fields.title < b.fields.title) {
    return -1;
  }
  return 0;
}

function removeNonGiftableCourses(course: Course) {
  if (course.fields.price === 0) {
    return false;
  }
  return true;
}

export async function getStaticProps() {
  const coursesResponse = await contentfulClient.getEntries<ContentfulCourseFields>({
    content_type: 'course',
  });

  return {
    props: {
      courses: coursesResponse.items?.filter(removeNonGiftableCourses).sort(sortCoursesAlphabetically) ?? [],
    },
  };
}

const GiftingPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ courses }) => {
  return <GiftFlow courses={courses} />;
};

export default GiftingPage;
