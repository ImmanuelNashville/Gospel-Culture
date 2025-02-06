import { Course } from '../../models/contentful';
import { isFutureCourse, showRelativeTime } from '../dates';

describe('isFutureCourse', () => {
  const mockCourse = { fields: { launchDate: '2021-12-11T00:00-06:00' } } as unknown as Course;

  it('returns true if the course launchDate is in the future', () => {
    const realNow = Date.now;
    Date.now = () => new Date(2021, 11, 9).getTime();
    expect(isFutureCourse(mockCourse)).toEqual(true);
    Date.now = realNow;
  });

  it('returns false if the course launchDate is in the past', () => {
    const realNow = Date.now;
    Date.now = () => new Date(2021, 11, 13).getTime();
    expect(isFutureCourse(mockCourse)).toEqual(false);
    Date.now = realNow;
  });

  it("returns false if the course doesn't have a launch date", () => {
    expect(isFutureCourse({ fields: {} } as unknown as Course)).toEqual(false);
  });
});

describe('showRelativeTime', () => {
  it('handles a valid date', () => {
    const realNow = Date.now;
    Date.now = () => new Date(2021, 11, 9).getTime();
    expect(showRelativeTime('2021-12-11T00:00-06:00')).toEqual('2 days');
    Date.now = realNow;
  });

  it('returns an empty string if no date', () => {
    expect(showRelativeTime()).toEqual('');
  });

  it('returns an empty string if invalid date', () => {
    expect(showRelativeTime('jfdklsjfs')).toEqual('');
  });
});
