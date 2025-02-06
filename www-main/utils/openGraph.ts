import { Course, Creator } from '../models/contentful';
import { getBaseName } from './ui-helpers';

export function buildCreatorOpenGraph(creator?: Creator) {
  return {
    url: `https://www.brighttrip.com/creators/${creator?.fields.slug ?? ''}`,
    description: creator?.fields.oneLineBio ?? '',
    images: [
      {
        url: creator?.fields.hero ? `https:${creator.fields.hero.fields.file.url}?w=800` : '',
        width: 800,
        height: 450,
        alt: creator?.fields.name ?? '',
        type: 'image/png',
      },
    ],
    site_name: 'Bright Trip',
  };
}

export function buildCourseOpenGraph(course?: Course) {
  return {
    url: `https://www.brighttrip.com/${getBaseName(course?.sys?.id ?? '')}/${course?.fields.slug ?? ''}`,
    description: course?.fields.oneLineDescription ?? '',
    images: [
      {
        url: course?.fields.tileThumbnail ? `https:${course.fields.tileThumbnail.fields.file.url}?w=800` : '',
        width: 800,
        height: 450,
        alt: course?.fields.title ?? '',
        type: 'image/png',
      },
    ],
    site_name: 'Bright Trip',
  };
}
