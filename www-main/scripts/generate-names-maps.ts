import dotenv from 'dotenv';
import contentful from 'contentful';
import fs from 'fs';
import path from 'path';

import { ContentfulCourseFields, ContentfulCreatorFields } from '../models/contentful';

dotenv.config();

async function main() {
  const contentfulClient = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID ?? '',
    accessToken: process.env.CONTENTFUL_CONTENT_PREVIEW_API_ACCESS_TOKEN ?? '',
    removeUnresolved: true,
    host: 'preview.contentful.com',
  });

  const { items: allCourses } = await contentfulClient.getEntries<ContentfulCourseFields>({
    content_type: 'course',
    include: 1,
  });

  const courseNameMapping = allCourses.reduce((nameMap, course) => {
    nameMap[course.fields.title] = course.sys.id;
    return nameMap;
  }, {} as Record<string, string>);

  syncToFile('courseNames', courseNameMapping);

  const { items: allCreators } = await contentfulClient.getEntries<ContentfulCreatorFields>({
    content_type: 'creator',
    include: 1,
  });

  const creatorNameMapping = allCreators.reduce((nameMap, course) => {
    nameMap[course.fields.name] = course.sys.id;
    return nameMap;
  }, {} as Record<string, string>);

  syncToFile('creatorNames', creatorNameMapping);
}

function syncToFile(fileName: string, data: any) {
  const fileData = `
/*

This file is auto-generated. Do not manually edit it.
Run \`npm run generate-names-maps\` in your terminal to update this list.

*/

const ${fileName}Map = ${JSON.stringify(data, null, 4)} as const;

export default ${fileName}Map;
`;

  const filePath = path.join(process.cwd(), `${fileName}.ts`);

  fs.truncate(filePath, 0, () => {
    fs.writeFile(filePath, fileData, (error) => {
      if (error) {
        console.error(`Error writing ${fileName}: ${error}`);
      } else {
        console.info(`Successfully updated ${fileName}`);
      }
    });
  });
}

main();
