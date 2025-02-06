import { CheckCircleIcon, LockClosedIcon } from '@heroicons/react/solid';
import { Entry } from 'contentful';
import { ContentfulLessonFields } from '../../../models/contentful';
import { formatDuration } from '../../../utils';
import { getLessonThumbnailURL } from '../../../utils/courses';
import { VideoDurationMap } from '../../../utils/courses.server';
import { getMuxTokensForCoursePlayer } from '../../../utils/tokens';
import { DurationBadge } from '../../Badges';
import Card from '../../Card';
import { BottomRight } from '../../Card/ContentAligners';

interface LessonButtonProps {
  currentLesson?: Entry<ContentfulLessonFields>;
  lesson: Entry<ContentfulLessonFields>;
  completedLessons: Set<string>;
  handleClickLesson: (id: string) => void;
  tokens: ReturnType<typeof getMuxTokensForCoursePlayer>;
  videoAssets: VideoDurationMap;
  progress: number;
  disabled?: boolean;
}

export default function LessonButton({
  currentLesson,
  lesson,
  completedLessons,
  handleClickLesson,
  tokens,
  videoAssets,
  progress,
  disabled = false,
}: LessonButtonProps) {
  const isCurrent = currentLesson?.sys.id === lesson.sys.id;
  const isCompleted = completedLessons.has(lesson.sys.id);
  const signedPlaybackId = lesson.fields.video?.fields.video?.signedPlaybackId ?? '';
  const duration = videoAssets[lesson.fields.video?.fields.video?.assetId ?? '']?.duration;
  const isMissingVideo = lesson.fields.video?.fields.video === undefined;
  disabled = isMissingVideo || disabled;

  return (
    <button
      disabled={disabled}
      key={lesson.sys.id}
      onClick={() => handleClickLesson(lesson.sys.id)}
      className={`group p-1.5 rounded-lg grid grid-cols-9 items-center gap-2.5 text-left hover:text-black dark:hover:text-gray-200 ${
        // isCurrent ? 'bg-bt-teal/20 hover:bg-bt-teal/20' : 'hover:bg-bt-teal-ultraLight/20'
        isCurrent ? 'bg-bt-off-white shadow-md dark:bg-bt-teal-dark/40' : 'hover:bg-bt-teal-ultraLight/20'
      } ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <Card
        imageUrl={getLessonThumbnailURL(lesson, tokens.image[signedPlaybackId])}
        className="col-span-3"
        innerClassName="p-0 overflow-hidden rounded-md drop-shadow-none"
        imageSizes="(max-width: 1024px) 40vw, (max-width: 1280px) 10vw, 128px"
      >
        <div
          className={`relative flex h-full w-full items-center justify-center ${isCurrent ? 'bg-black/60' : ''} ${
            isCompleted && !isCurrent ? 'bg-white/60 dark:bg-gray-800/80' : ''
          }`}
        >
          {disabled && (
            <div className="bg-gray-700 bg-opacity-70 p-1 rounded-md text-gray-100 absolute w-full h-full text-bodySmall leading-none font-bold flex justify-center items-center">
              <div className="">
                <LockClosedIcon className="w-6 h-6" />
              </div>
            </div>
          )}
          {isMissingVideo && (
            <div className="absolute w-[150%] text-center -rotate-12 p-0.5 text-white bg-bt-teal text-caption uppercase font-bold shadow-md">
              Coming Soon
            </div>
          )}
          {isCurrent ? (
            <span className="text-bodySmall text-white mx-2 text-center leading-none font-bold">Now Playing</span>
          ) : (
            <BottomRight>
              {isCompleted ? (
                <div className="relative h-7 w-7 drop-shadow-lg filter bottom-1 right-0.5">
                  <div className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white" />
                  <CheckCircleIcon className="absolute text-bt-teal" />
                  <span className="sr-only">Completed</span>
                </div>
              ) : (
                duration &&
                !disabled && (
                  <div className="absolute bottom-0 right-0">
                    <DurationBadge>{formatDuration(duration ?? 0, 'mm:ss')}</DurationBadge>
                  </div>
                )
              )}
            </BottomRight>
          )}
          {progress > 0 && (
            <div className="absolute bottom-0 w-full" style={{ height: '3px' }}>
              <div className="absolute z-10 h-full rounded-md bg-bt-orange" style={{ width: `${progress}%` }} />
              <div className="absolute h-full w-full bg-gray-800 opacity-80" />
            </div>
          )}
        </div>
      </Card>
      <div className="col-span-6 pr-2">
        <h4
          className={`text-gray-800 dark:text-gray-300 text-sm font-bodycopy leading-tight ${
            // isCurrent && 'text-bt-teal-dark dark:text-bt-teal-ultraLight'
            isCurrent && 'text-black dark:text-bt-teal-ultraLight'
          } ${isCompleted && 'opacity-60'}`}
        >
          {lesson.fields.title}
        </h4>
      </div>
    </button>
  );
}
