import { Course, Creator } from '../../models/contentful';
import { buildCourseOpenGraph, buildCreatorOpenGraph } from '../openGraph';

const mockCourse = {
  fields: {
    slug: 'test-course',
    title: 'Test Course',
    oneLineDescription: 'This is the best course ever!',
    tileThumbnail: {
      fields: {
        file: {
          url: '//some-path/test.png',
        },
      },
    },
  },
} as Course;

const mockCreator = {
  fields: {
    slug: 'test-creator',
    name: 'Test Creator',
    oneLineBio: 'This creator is the best person ever!',
    hero: {
      fields: {
        file: {
          url: '//some-path/test.png',
        },
      },
    },
  },
} as unknown as Creator;

describe('buildCourseOpenGraph', () => {
  it('returns the correct format when there is course data', () => {
    expect(buildCourseOpenGraph(mockCourse)).toMatchObject({
      url: 'https://www.brighttrip.com/courses/test-course',
      description: 'This is the best course ever!',
      images: [
        {
          url: 'https://some-path/test.png?w=800',
          width: 800,
          height: 450,
          alt: 'Test Course',
          type: 'image/png',
        },
      ],
      site_name: 'Bright Trip',
    });
  });
  it('handles a missing course gracefully', () => {
    expect(buildCourseOpenGraph()).toMatchObject({
      url: 'https://www.brighttrip.com/courses/',
      description: '',
      images: [
        {
          url: '',
          width: 800,
          height: 450,
          alt: '',
          type: 'image/png',
        },
      ],
      site_name: 'Bright Trip',
    });
  });
});

describe('buildCreatorOpenGraph', () => {
  it('returns the correct format when there is creator data', () => {
    expect(buildCreatorOpenGraph(mockCreator)).toMatchObject({
      url: 'https://www.brighttrip.com/creators/test-creator',
      description: 'This creator is the best person ever!',
      images: [
        {
          url: 'https://some-path/test.png?w=800',
          width: 800,
          height: 450,
          alt: 'Test Creator',
          type: 'image/png',
        },
      ],
      site_name: 'Bright Trip',
    });
  });
  it('handles a missing creator gracefully', () => {
    expect(buildCreatorOpenGraph()).toMatchObject({
      url: 'https://www.brighttrip.com/creators/',
      description: '',
      images: [
        {
          url: '',
          width: 800,
          height: 450,
          alt: '',
          type: 'image/png',
        },
      ],
      site_name: 'Bright Trip',
    });
  });
});
