import contentfulClient from './contentfulClient';
import { ContentfulCourseFields } from '../models/contentful';

export async function courseData(courseId: string) {
  try {
    const response = await contentfulClient.getEntries<ContentfulCourseFields>({
      content_type: 'course',
      'sys.id': courseId,
      select: ['fields.creator', 'fields.price', 'fields.title', 'fields.launchDate'],
      include: 5,
    });
    return response.items[0].fields;
  } catch (error) {
    console.error(error);
  }
}
