import {
  ContentfulCourseResourceFields,
  ContentfulCourseResourceFieldsType,
  ContentfulFileFields,
  Course,
} from 'models/contentful';
import { ResourceBlocker } from './ResourceBlocker';
import { BlockerMap } from './VideoBlocker';
import { DocumentDownloadIcon, LinkIcon, MapIcon, TableIcon } from '@heroicons/react/outline';
import Button from 'components/Button';
import * as mpClient from '../../../mixpanel/client';
import { Entry } from 'contentful';

export default function CourseResources({ course, blockers }: { course: Course; blockers: BlockerMap }) {
  const mpTrackCourseResource = (
    resourceType: mpClient.CourseResourceDataType | ContentfulCourseResourceFieldsType,
    resource?: Entry<ContentfulFileFields | ContentfulCourseResourceFields>
  ) => {
    try {
      switch (resourceType) {
        case 'guide':
          mpClient.track(mpClient.Event.CourseResource, {
            courseId: course.sys.id,
            courseTitle: course.fields.title,
            ...(resource && { resourceTitle: (resource as Entry<ContentfulFileFields>).fields.title }),
            type: 'guide',
          });
          break;

        case 'map':
          mpClient.track(mpClient.Event.CourseResource, {
            courseId: course.sys.id,
            courseTitle: course.fields.title,
            type: 'map',
          });
          break;

        default:
          mpClient.track(mpClient.Event.CourseResource, {
            courseId: course.sys.id,
            courseTitle: course.fields.title,
            ...(resource && {
              resourceTitle: (resource as Entry<ContentfulCourseResourceFields>)?.fields.internalName,
            }),
            type: resourceType,
          });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return course.fields.resources || course.fields.courseMap || course.fields.courseResources ? (
    <div className="my-4 w-full">
      {blockers.resources ? (
        <ResourceBlocker blockers={blockers.resources} />
      ) : (
        <div className="flex flex-col gap-2 items-center w-full">
          {course.fields.courseResources?.map((res) => {
            const href = res.fields.type === 'PDF' ? res.fields.uploadedFile?.fields.file.url : res.fields.url;
            const getIcon = () => {
              switch (res.fields.type) {
                case 'PDF':
                  return <DocumentDownloadIcon />;
                case 'Google Sheet':
                  return <TableIcon />;
                case 'Course Map':
                  return <MapIcon />;
                default:
                  return <LinkIcon />;
              }
            };
            return (
              <a key={res.sys.id} href={href} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button
                  variant="muted"
                  className="w-full"
                  icon={getIcon()}
                  onClick={() => mpTrackCourseResource(res.fields.type, res)}
                >
                  {res.fields.displayName}
                </Button>
              </a>
            );
          })}
          {course.fields.resources?.length || course.fields.courseMap ? (
            <>
              {course.fields.resources?.map((resource) => (
                <a
                  key={resource.sys.id}
                  href={resource.fields.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="muted"
                    className="w-full"
                    icon={<DocumentDownloadIcon />}
                    onClick={() => mpTrackCourseResource('guide', resource)}
                  >
                    Course Guide
                  </Button>
                </a>
              ))}
              {course.fields.courseMap && (
                <a href={course.fields.courseMap} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button
                    variant="muted"
                    className="mt-1.5 w-full"
                    icon={<MapIcon />}
                    onClick={() => mpTrackCourseResource('map')}
                  >
                    Course Map
                  </Button>
                </a>
              )}
            </>
          ) : null}
          {!course.fields.resources && !course.fields.courseMap && !course.fields.courseResources && (
            <p>No resources</p>
          )}
        </div>
      )}
    </div>
  ) : null;
}
