import appConfig from '../../appConfig';
import { Course } from '../../models/contentful';
import CoursePrice from '../CoursePrice';
import { TopRight } from './ContentAligners';
import { useBrightTripUser } from 'hooks/useBrightTripUser';
import { useUserEnrolledCourses } from 'hooks/useUserEnrolledCourses';

export const PremiumBadge = ({ course }: { course: Course }) => {
  const { user } = useBrightTripUser();
  const enrolledCourses = useUserEnrolledCourses(user?.email);

  const enrolledCourseIds = enrolledCourses.map((c) => c.sys.id);
  const isEnrolled = enrolledCourseIds.includes(course.sys.id);

  const baseStyles = 'rounded-full px-3 py-0.5 backdrop-blur-lg';
  const watchStyle = `${baseStyles} bg-gradient-to-tr from-black/20 to-bt-orange/50`;
  const buyStyle = `${baseStyles} bg-gradient-to-tr from-black/20 to-bt-teal/50`;

  if (isEnrolled) {
    return (
      <div className="relative">
        <TopRight>
          <div className={watchStyle}>
            <span className="relative text-bodySmall text-white font-bold">Continue</span>
          </div>
        </TopRight>
      </div>
    );
  }

  if ((appConfig.subscriptionCourses.includes(course.sys.id) && user?.subscribed) || course.fields.price === 0) {
    return (
      <div className="relative">
        <TopRight>
          <div className={watchStyle}>
            <span className="relative font-bold text-white text-bodySmall">Watch Now</span>
          </div>
        </TopRight>
      </div>
    );
  }

  return (
    <div className="relative">
      <TopRight>
        <div className={buyStyle}>
          <span className="relative text-bodySmall font-bold text-white flex gap-1 top-[1px]">
            <CoursePrice
              variant="bodySmallBold"
              courseId={course.sys.id}
              price={course.fields.price ?? 0}
              alwaysWhite
            />
          </span>
        </div>
      </TopRight>
    </div>
  );
};
