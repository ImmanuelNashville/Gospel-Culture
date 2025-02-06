import * as contentfulClient from '../../contentful/contentfulClient';
import { Course } from '../../models/contentful';
import { getDurationsForVideosFromFile, coursePrice } from '../courses.server';
import { mockCourse } from '../../test-fixtures/course';

jest.mock('../../contentful/contentfulClient');
jest.spyOn(contentfulClient.default, 'getEntries').mockResolvedValue({
  items: [
    // @ts-expect-error b/c this isn't a full contentful entry
    {
      fields: {
        price: 2400,
      },
    },
  ],
});
jest.mock('../../appConfig', () => ({
  __esModule: true,
  default: {
    sale: {
      courses: {},
    },
  },
}));
jest.mock(
  '../../data/video-meta.json',
  () => ({
    assets: {
      video1: {
        duration: 360,
      },
      video2: {
        duration: 640,
      },
      video3: {
        duration: 128,
      },
      video4: {
        duration: 343,
      },
      video5: {
        duration: 534,
      },
      video6: {
        duration: 756,
      },
      video7: {
        duration: 645,
      },
    },
  }),
  { virtual: true }
);

describe('getDurationsForVideosFromFile', () => {
  it('returns durations in the correct format', () => {
    const result = getDurationsForVideosFromFile(mockCourse);
    expect(result).toEqual({
      video1: {
        duration: 360,
      },
      video3: {
        duration: 128,
      },
      video5: {
        duration: 534,
      },
      video7: {
        duration: 645,
      },
      courseTotal: {
        duration: 1667,
      },
    });
  });
});

describe('coursePrice', () => {
  it('returns the price when passed in price matches contentful', async () => {
    const result = await coursePrice('someCourseId', 2400);
    expect(result).toEqual(2400);
  });

  it("returns the price from contentful if price doesn't match with trust client set to false", async () => {
    const result = await coursePrice('someCourseId', 1000, false);
    expect(result).toEqual(2400);
  });

  it("returns the price from contentful if price doesn't match with trust client set to true", async () => {
    const result = await coursePrice('someCourseId', 1000);
    expect(result).toEqual(2400);
  });

  it('returns the price passed if contentful call fails if trustClient is true', async () => {
    jest.spyOn(contentfulClient.default, 'getEntries').mockRejectedValueOnce(new Error('intentional error'));
    const result = await coursePrice('someCourseId', 1000, true);
    expect(result).toEqual(1000);
  });

  it('throws an error if contentful call fails if trustClient is false', async () => {
    jest.spyOn(contentfulClient.default, 'getEntries').mockRejectedValueOnce(new Error('intentional error'));
    try {
      const result = await coursePrice('someCourseId', 1000, false);
      expect(result).toBe(undefined);
    } catch (error) {
      // @ts-expect-error testing error state
      expect(error.message).toEqual('intentional error');
    }
  });
});
