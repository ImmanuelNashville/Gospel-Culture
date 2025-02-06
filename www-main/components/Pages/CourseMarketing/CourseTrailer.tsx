import { forwardRef } from 'react';
import { Course } from '../../../models/contentful';
import { createCourseThumbnailURL } from '../../../utils/ui-helpers';
import Card from '../../Card';
import VideoPlayer from '../../VideoPlayer';
import { MuxToken } from '../../../utils/tokens';

type CourseTrailerProps = {
  course: Course;
  muxToken: MuxToken;
  isVisible: boolean;
  isMuted: boolean;
};

export const CourseTrailer = forwardRef<HTMLDivElement, CourseTrailerProps>(function CourseTrailer(
  { course, muxToken, isVisible, isMuted },
  ref
) {
  const trailerHasValidSignedPlaybackId = course.fields.trailer?.fields.video?.signedPlaybackId;
  const trailerIsPlayable = trailerHasValidSignedPlaybackId && course.fields.trailer?.fields.video?.ready;

  let content: React.ReactNode;
  if (course.fields.trailer && trailerIsPlayable) {
    content = (
      <div className="rounded-2xl shadow-md leading-[0] overflow-hidden">
        <VideoPlayer
          style={{ lineHeight: 'none' }}
          muxVideo={course.fields.trailer}
          muxToken={muxToken}
          isVisible={isVisible}
          muted={isMuted}
        />
      </div>
    );
  } else {
    content = <Card imageUrl={createCourseThumbnailURL(course)} className="md:col-span-2" />;
  }
  return <div ref={ref}>{content}</div>;
});

export default CourseTrailer;
