import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { FC } from 'react';

import Layout from '../../components/Layout';
import Text from '../../components/Text';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNowStrict } from 'date-fns';
import Button from '../../components/Button';
import CourseCard from '../../components/Card/CourseCard';
import ContinueWatching from '../../components/ContinueWatching';
import FullWidthSection from '../../components/PageSections/FullWidthSection';
import SectionWithMargin from '../../components/PageSections/SectionWithMargin';
import RecommendedCourses from '../../components/RecommendedCourses';
import { SectionDivider } from '../../components/SectionDivider';
import { SectionHeading } from '../../components/SectionHeading';
import Spinner from '../../components/Spinner';
import { useUserDataContext } from '../../hooks/useUserDataContext';
import { CourseDurationsMap, getDisplayDurationsForAllCourses } from '../../utils/courses.server';
import { isFutureCourse } from '../../utils/dates';
import {
  migrateAuthedUser,
  QK_MIGRATE_AUTHED_USER,
  QK_USER_COURSES_PROGRESS,
  QK_USER_ENROLLED_COURSES,
} from '../../utils/queries';
import { getTokensForAllTrailers, TrailerTokenMap } from '../../utils/tokens';

interface MyCoursesProps {
  trailerTokens: TrailerTokenMap;
  courseDurations: CourseDurationsMap;
}

const MyCourses: FC<MyCoursesProps> = ({ trailerTokens, courseDurations }) => {
  const { user, enrolledCourses } = useUserDataContext();
  const queryClient = useQueryClient();
  useQuery({
    queryKey: [QK_MIGRATE_AUTHED_USER],
    queryFn: migrateAuthedUser,
    retry(failureCount) {
      return failureCount < 3;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: [QK_USER_ENROLLED_COURSES, QK_USER_COURSES_PROGRESS] });
      }
    },
    enabled: Boolean(user?.email),
  });

  const renderContent = () => {
    if (!enrolledCourses) {
      return (
        <div className="mx-auto mt-14 h-24 w-24 text-gray-300 dark:text-gray-600">
          <Spinner />
        </div>
      );
    }

    if (enrolledCourses.length > 0) {
      return (
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => {
            return (
              <CourseCard
                key={course.sys.id}
                course={course}
                imageSizes="(max-width: 720px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 400px"
                cardContent={(course) =>
                  isFutureCourse(course) && course.fields.launchDate ? (
                    <div className="flex w-full h-full items-end">
                      <div className="relative bg-bt-teal/80 backdrop-blur-sm rounded-md text-white font-bodycopy w-full py-1">
                        Available{' '}
                        {formatDistanceToNowStrict(new Date(course.fields.launchDate), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  ) : null
                }
              />
            );
          })}
        </div>
      );
    }

    return <EmptyState />;
  };

  return (
    <Layout title="My Courses" description="" fullBleed>
      <FullWidthSection bgColor="bg-gradient-to-tr from-bt-orange-darker to-bt-orange-light dark:to-bt-orange-light/30">
        <h1 className="text-3xl md:text-4xl font-bold text-white/90">My Courses</h1>
        <p className="font-bodycopy text-md md:text-lg text-white/70 mb-4 mt-1">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! Here you&apos;ll find all the courses and guides
          in which you&apos;re enrolled.
        </p>
      </FullWidthSection>
      <SectionWithMargin>
        <ContinueWatching trailerTokens={trailerTokens} courseDurations={courseDurations} />
      </SectionWithMargin>
      <SectionWithMargin>
        <SectionDivider />
      </SectionWithMargin>
      <SectionWithMargin>
        <SectionHeading title="Your Library" description="Everything you've either purchased or started watching" />
        {renderContent()}
      </SectionWithMargin>
      <SectionWithMargin>
        <SectionDivider />
      </SectionWithMargin>
      <SectionWithMargin>
        <RecommendedCourses trailerTokens={trailerTokens} courseDurations={courseDurations} />
      </SectionWithMargin>
    </Layout>
  );
};

export default MyCourses;

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async () => {
    const trailerTokens = await getTokensForAllTrailers();
    const courseDurations: CourseDurationsMap = await getDisplayDurationsForAllCourses();

    return {
      props: {
        trailerTokens,
        courseDurations,
      },
    };
  },
});

const EmptyState = () => (
  <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-8 rounded-lg bg-gray-100 p-4 py-10 dark:bg-gray-700">
    <Text variant="subtitle1" className="text-gray-500">
      {"You haven't enrolled in any courses yet"}
    </Text>
    <Link href="/courses">
      <Button>View Library</Button>
    </Link>
  </div>
);
