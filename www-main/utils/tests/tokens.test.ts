import {
  getMuxVideoTokenForSignedPlaybackId,
  getMuxTokensForCourseMarketing,
  getMuxTokensForCoursePlayer,
  getTokensForTopLessons,
} from '../tokens';
import { mockCourse } from '../../test-fixtures/course';
import { Course } from '../../models/contentful';

jest.mock('@mux/mux-node', () => ({
  JWT: {
    sign: (id: string, options: { [key: string]: any }) => `token_${id}_${JSON.stringify(options)}`,
  },
}));
jest.mock('contentful', () => ({
  createClient: jest.fn(),
}));

describe('getMuxVideoTokenForSignedPlaybackId', () => {
  it('returns the correct format with tokens for signed playback ID', () => {
    expect(getMuxVideoTokenForSignedPlaybackId('pizzaId')).toEqual({
      storyboard: 'token_pizzaId_{"expiration":"30d","type":"storyboard"}',
      thumbnail: 'token_pizzaId_{"expiration":"30d","type":"thumbnail"}',
      video: 'token_pizzaId_{"expiration":"30d","type":"video"}',
    });
  });
});

describe('getMuxTokensForCourseMarketing', () => {
  it('returns the correct format with tokens when no custom thumbnail timecodes', () => {
    expect(getMuxTokensForCourseMarketing(mockCourse)).toEqual({
      video: {
        trailer: 'token_trailer_{"expiration":"30d","type":"video"}',
        sample1: 'token_sample1_{"expiration":"30d","type":"video"}',
        sample2: 'token_sample2_{"expiration":"30d","type":"video"}',
      },
      image: {
        trailer: 'token_trailer_{"expiration":"30d","type":"thumbnail"}',
        chapter1_lesson1: 'token_chapter1_lesson1_{"expiration":"30d","type":"thumbnail","params":{"width":500}}',
        chapter1_lesson2: 'token_chapter1_lesson2_{"expiration":"30d","type":"thumbnail","params":{"width":500}}',
        chapter2_lesson1: 'token_chapter2_lesson1_{"expiration":"30d","type":"thumbnail","params":{"width":500}}',
        chapter2_lesson2: 'token_chapter2_lesson2_{"expiration":"30d","type":"thumbnail","params":{"width":500}}',
      },
      sample: {
        sample1: {
          portrait:
            'token_sample1_{"expiration":"30d","type":"thumbnail","params":{"height":720,"width":405,"fit_mode":"crop"}}',
          landscape: 'token_sample1_{"expiration":"30d","type":"thumbnail","params":{}}',
        },
        sample2: {
          portrait:
            'token_sample2_{"expiration":"30d","type":"thumbnail","params":{"height":720,"width":405,"fit_mode":"crop"}}',
          landscape: 'token_sample2_{"expiration":"30d","type":"thumbnail","params":{}}',
        },
      },
      storyboard: {
        sample1: 'token_sample1_{"expiration":"30d","type":"storyboard"}',
        sample2: 'token_sample2_{"expiration":"30d","type":"storyboard"}',
        trailer: 'token_trailer_{"expiration":"30d","type":"storyboard"}',
      },
    });
  });

  it('returns the correct format with tokens with custom thumbnail timecodes', () => {
    const mockCourseWithThumbnails = JSON.parse(JSON.stringify(mockCourse)) as unknown as Course;
    mockCourseWithThumbnails.fields.samples![0].fields.thumbnailTimecode = 42;
    mockCourseWithThumbnails.fields.samples![1].fields.thumbnailTimecode = 89;
    mockCourseWithThumbnails.fields.chapters![0].fields.lessons![0].fields.video!.fields.thumbnailTimecode = 120;
    mockCourseWithThumbnails.fields.chapters![0].fields.lessons![1].fields.video!.fields.thumbnailTimecode = 45;
    mockCourseWithThumbnails.fields.chapters![1].fields.lessons![0].fields.video!.fields.thumbnailTimecode = 13;
    mockCourseWithThumbnails.fields.chapters![1].fields.lessons![1].fields.video!.fields.thumbnailTimecode = 65.9;
    expect(getMuxTokensForCourseMarketing(mockCourseWithThumbnails)).toEqual({
      video: {
        trailer: 'token_trailer_{"expiration":"30d","type":"video"}',
        sample1: 'token_sample1_{"expiration":"30d","type":"video"}',
        sample2: 'token_sample2_{"expiration":"30d","type":"video"}',
      },
      image: {
        trailer: 'token_trailer_{"expiration":"30d","type":"thumbnail"}',
        chapter1_lesson1:
          'token_chapter1_lesson1_{"expiration":"30d","type":"thumbnail","params":{"time":120,"width":500}}',
        chapter1_lesson2:
          'token_chapter1_lesson2_{"expiration":"30d","type":"thumbnail","params":{"time":45,"width":500}}',
        chapter2_lesson1:
          'token_chapter2_lesson1_{"expiration":"30d","type":"thumbnail","params":{"time":13,"width":500}}',
        chapter2_lesson2:
          'token_chapter2_lesson2_{"expiration":"30d","type":"thumbnail","params":{"time":65.9,"width":500}}',
      },
      sample: {
        sample1: {
          portrait:
            'token_sample1_{"expiration":"30d","type":"thumbnail","params":{"time":42,"height":720,"width":405,"fit_mode":"crop"}}',
          landscape: 'token_sample1_{"expiration":"30d","type":"thumbnail","params":{"time":42}}',
        },
        sample2: {
          portrait:
            'token_sample2_{"expiration":"30d","type":"thumbnail","params":{"time":89,"height":720,"width":405,"fit_mode":"crop"}}',
          landscape: 'token_sample2_{"expiration":"30d","type":"thumbnail","params":{"time":89}}',
        },
      },
      storyboard: {
        sample1: 'token_sample1_{"expiration":"30d","type":"storyboard"}',
        sample2: 'token_sample2_{"expiration":"30d","type":"storyboard"}',
        trailer: 'token_trailer_{"expiration":"30d","type":"storyboard"}',
      },
    });
  });
});

describe('getMuxTokensForCoursePlayer', () => {
  it('returns the correct format with tokens no custom thumbnail timecodes', () => {
    expect(getMuxTokensForCoursePlayer(mockCourse)).toEqual({
      video: {
        chapter1_lesson1: 'token_chapter1_lesson1_{"expiration":"1d","type":"video"}',
        chapter1_lesson2: 'token_chapter1_lesson2_{"expiration":"1d","type":"video"}',
        chapter2_lesson1: 'token_chapter2_lesson1_{"expiration":"1d","type":"video"}',
        chapter2_lesson2: 'token_chapter2_lesson2_{"expiration":"1d","type":"video"}',
      },
      image: {
        chapter1_lesson1: 'token_chapter1_lesson1_{"expiration":"30d","type":"thumbnail","params":{"width":620}}',
        chapter1_lesson2: 'token_chapter1_lesson2_{"expiration":"30d","type":"thumbnail","params":{"width":620}}',
        chapter2_lesson1: 'token_chapter2_lesson1_{"expiration":"30d","type":"thumbnail","params":{"width":620}}',
        chapter2_lesson2: 'token_chapter2_lesson2_{"expiration":"30d","type":"thumbnail","params":{"width":620}}',
      },
      storyboard: {
        chapter1_lesson1: 'token_chapter1_lesson1_{"expiration":"30d","type":"storyboard"}',
        chapter1_lesson2: 'token_chapter1_lesson2_{"expiration":"30d","type":"storyboard"}',
        chapter2_lesson1: 'token_chapter2_lesson1_{"expiration":"30d","type":"storyboard"}',
        chapter2_lesson2: 'token_chapter2_lesson2_{"expiration":"30d","type":"storyboard"}',
      },
    });
  });

  it('returns the correct format with tokens with custom thumbnail timecodes', () => {
    const mockCourseWithThumbnails = JSON.parse(JSON.stringify(mockCourse)) as unknown as Course;
    mockCourseWithThumbnails.fields.chapters![0].fields.lessons![0].fields.video!.fields.thumbnailTimecode = 120;
    mockCourseWithThumbnails.fields.chapters![0].fields.lessons![1].fields.video!.fields.thumbnailTimecode = 45;
    mockCourseWithThumbnails.fields.chapters![1].fields.lessons![0].fields.video!.fields.thumbnailTimecode = 13;
    mockCourseWithThumbnails.fields.chapters![1].fields.lessons![1].fields.video!.fields.thumbnailTimecode = 65.9;
    expect(getMuxTokensForCoursePlayer(mockCourseWithThumbnails)).toEqual({
      video: {
        chapter1_lesson1: 'token_chapter1_lesson1_{"expiration":"1d","type":"video"}',
        chapter1_lesson2: 'token_chapter1_lesson2_{"expiration":"1d","type":"video"}',
        chapter2_lesson1: 'token_chapter2_lesson1_{"expiration":"1d","type":"video"}',
        chapter2_lesson2: 'token_chapter2_lesson2_{"expiration":"1d","type":"video"}',
      },
      image: {
        chapter1_lesson1:
          'token_chapter1_lesson1_{"expiration":"30d","type":"thumbnail","params":{"width":620,"time":120}}',
        chapter1_lesson2:
          'token_chapter1_lesson2_{"expiration":"30d","type":"thumbnail","params":{"width":620,"time":45}}',
        chapter2_lesson1:
          'token_chapter2_lesson1_{"expiration":"30d","type":"thumbnail","params":{"width":620,"time":13}}',
        chapter2_lesson2:
          'token_chapter2_lesson2_{"expiration":"30d","type":"thumbnail","params":{"width":620,"time":65.9}}',
      },
      storyboard: {
        chapter1_lesson1: 'token_chapter1_lesson1_{"expiration":"30d","type":"storyboard"}',
        chapter1_lesson2: 'token_chapter1_lesson2_{"expiration":"30d","type":"storyboard"}',
        chapter2_lesson1: 'token_chapter2_lesson1_{"expiration":"30d","type":"storyboard"}',
        chapter2_lesson2: 'token_chapter2_lesson2_{"expiration":"30d","type":"storyboard"}',
      },
    });
  });
});

describe('getTokensForTopLessons', () => {
  it('returns the tokens in the correct format with no thumbnail timecodes', () => {
    expect(getTokensForTopLessons(mockCourse.fields.chapters![0].fields.lessons!)).toEqual({
      chapter1_lesson1:
        'token_chapter1_lesson1_{"expiration":"30d","type":"thumbnail","params":{"width":620,"time":0}}',
      chapter1_lesson2:
        'token_chapter1_lesson2_{"expiration":"30d","type":"thumbnail","params":{"width":620,"time":0}}',
    });
  });

  it('returns the tokens in the correct format with custom thumbnail timecodes', () => {
    const mockCourseWithThumbnails = JSON.parse(JSON.stringify(mockCourse)) as unknown as Course;
    mockCourseWithThumbnails.fields.chapters![0].fields.lessons![0].fields.video!.fields.thumbnailTimecode = 120;
    mockCourseWithThumbnails.fields.chapters![0].fields.lessons![1].fields.video!.fields.thumbnailTimecode = 45;
    expect(getTokensForTopLessons(mockCourseWithThumbnails.fields.chapters![0].fields.lessons!)).toEqual({
      chapter1_lesson1:
        'token_chapter1_lesson1_{"expiration":"30d","type":"thumbnail","params":{"width":620,"time":120}}',
      chapter1_lesson2:
        'token_chapter1_lesson2_{"expiration":"30d","type":"thumbnail","params":{"width":620,"time":45}}',
    });
  });
});
