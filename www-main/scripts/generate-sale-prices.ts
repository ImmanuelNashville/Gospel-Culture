import dotenv from 'dotenv';
import contentful from 'contentful';

import { getSalePrice } from '../utils/sales';
import { ContentfulCourseFields } from '../models/contentful';

const PERCENTAGE_DISCOUNT = process.argv.length > 2 ? process.argv[2] : 0;

dotenv.config();

async function main() {
  const contentfulClient = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID ?? '',
    accessToken: process.env.CONTENTFUL_CONTENT_DELIVERY_API_ACCESS_TOKEN ?? '',
    removeUnresolved: true,
  });

  const { items: allCourses } = await contentfulClient.getEntries<ContentfulCourseFields>({
    content_type: 'course',
    include: 1,
  });

  const coursesWithSalePrices = allCourses.reduce((result, course) => {
    result.push({
      Course: course.fields.title,
      'Regular Price': (course.fields.price ?? 0) / 100,
      [`${PERCENTAGE_DISCOUNT}% Off`]: getSalePrice(course.fields.price ?? 0, true, Number(PERCENTAGE_DISCOUNT)) / 100,
    });
    return result;
  }, [] as Record<string, string | number>[]);

  console.table(coursesWithSalePrices);
}

main();
