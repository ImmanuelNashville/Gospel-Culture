import md5 from 'md5';
import { wpToCfCourses } from './course-ids';
import humanizeDuration from 'humanize-duration';

export const toUsd = (price: number, showZero = false): string => {
  if (price === 0 && !showZero) return 'FREE';
  return `$${price / 100}`;
};

export const withAWSPathPrefix = (fileName: string) => {
  return `https://brighttrip-assets.s3.us-west-2.amazonaws.com/test/f38dda32-67be-4e64-9ac4-211ac652c704/${fileName}`;
};

type DurationFormat = 'mm:ss' | 'mm minutes' | 'humanized';

export const formatDuration = (duration: number, format: DurationFormat) => {
  switch (format) {
    case 'humanized': {
      return humanizeDuration(duration * 1000, {
        round: true,
        units: ['h', 'm'],
      });
    }
    case 'mm minutes': {
      const minutes = Math.round(duration / 60);
      const label = minutes === 1 ? 'minute' : 'minutes';
      return `${minutes} ${label}`;
    }
    case 'mm:ss': {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.round(duration % 60);
      const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;
      return `${minutes}:${displaySeconds}`;
    }
    default:
      throw new Error('Unknown duration format');
  }
};

export const normalizeString = (value: string) => value.trim().toLowerCase();

export const normalizeAndHash = (value: string) => md5(value);

export const wpIdToContentfulId = (wpId: string) => {
  const course = wpToCfCourses.filter((c) => c.wpId === wpId)[0];
  if (course.chapter) {
    return '4EYfg9lhplQscwFCJlq2qi';
  } else {
    return course.cfId;
  }
};

export const parseCookie = (cookie: string) => {
  try {
    return JSON.parse(cookie);
  } catch (e) {
    return null;
  }
};

export const preventSessionAuthToAuth0Subs = (sessionAuth: string, auth0Subs: string[]) => {
  const [authProvider, authType] = sessionAuth.split('|');
  let preventAddSessionAuth0Sub = false;
  if (authProvider === 'auth0' && !authType.startsWith('wp_') && !auth0Subs.includes(sessionAuth)) {
    preventAddSessionAuth0Sub =
      auth0Subs.filter((s) => s.startsWith('google-oauth2') || s.startsWith('facebook')).length > 0 ? true : false;
  }
  return preventAddSessionAuth0Sub;
};

export const capitalize = (input: string) => {
  return `${input.charAt(0).toUpperCase()}${input.slice(1)}`;
};
