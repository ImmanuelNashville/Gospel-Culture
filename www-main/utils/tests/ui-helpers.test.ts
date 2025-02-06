import { Course } from '../../models/contentful';
import { createCourseThumbnailURL, createCourseURL } from '../ui-helpers';

describe('getCourseThumbnailURL', () => {
  const course = {
    fields: {
      tileThumbnail: {
        fields: {
          file: {
            url: 'thumbnail.pizza',
          },
        },
      },
      hero: {
        fields: {
          file: {
            url: 'hero.pizza',
          },
        },
      },
    },
  } as unknown as Course;

  it('defaults to tileThumbnail when present', () => {
    expect(createCourseThumbnailURL(course)).toEqual('thumbnail.pizza');
  });

  it('uses to hero when there tileThumbnail is missing', () => {
    course.fields = {
      ...course.fields,
      tileThumbnail: undefined,
    };
    expect(createCourseThumbnailURL(course)).toEqual('hero.pizza');
  });

  it('returns an empty string if neither are present', () => {
    course.fields = {
      ...course.fields,
      tileThumbnail: undefined,
      hero: undefined,
    };
    expect(createCourseThumbnailURL(course)).toEqual('');
  });
});

describe('getCourseURL', () => {
  const mockCourse = {
    sys: {
      id: '1234',
    },
    fields: {
      slug: 'pizza',
    },
  } as unknown as Course;

  it("returns the path for the marketing page if the user doesn't own the course", () => {
    expect(createCourseURL(mockCourse, ['5678'])).toEqual('/courses/pizza');
  });

  it('returns the path for the player page if the user owns the course', () => {
    expect(createCourseURL(mockCourse, ['1234', '5678'])).toEqual('/my-courses/pizza');
  });
});
