import { Course } from '../../../models/contentful';
import { MuxToken } from '../../../utils/tokens';
import CourseCTAButton from '../../CourseCTAButton';
import VideoPlayer from '../../VideoPlayer';

const FeaturedGuideSection = ({ course, tokens }: { course: Course; tokens: MuxToken }) => {
  return (
    <div className="text-white flex flex-col items-center gap-3 lg:grid lg:grid-cols-5 lg:gap-[72px]">
      <div className="w-full col-span-3 place-self-center drop-shadow-lg">
        {course.fields.trailer && (
          <div className="rounded-md overflow-hidden leading-[0]">
            <VideoPlayer
              poster={course.fields.tileThumbnail?.fields.file.url}
              muxVideo={course.fields.trailer}
              muxToken={tokens}
              autoPlay={false}
            />
          </div>
        )}
      </div>
      <div className="w-full md:col-span-2 flex flex-col items-center justify-center p-8 pb-9 px-6 -mx-4 rounded-xl drop-shadow-lg backdrop-blur-2xl backdrop-saturate-150 shadow-sm bg-white bg-opacity-10">
        <p className="text-2xl font-bold text-white/60 uppercase">Featured Guide</p>
        <h2 className="text-6xl font-bold mt-1 mb-4 leading-none text-center">{course.fields.title.toUpperCase()}</h2>
        <p className="font-bodycopy px-2 line-clamp-6">{course.fields.description}</p>
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <CourseCTAButton
            course={course}
            buttonLocation="card"
            buttonProps={{
              className: 'px-10 font-bold',
              variant: 'glassPrimary',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FeaturedGuideSection;
