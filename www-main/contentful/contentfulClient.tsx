import { createClient } from 'contentful';

const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.CONTENTFUL_ACCESS_KEY || '',
  removeUnresolved: true,
});

export const contentfulPreviewClient = createClient({
  accessToken: process.env.CONTENTFUL_CONTENT_PREVIEW_API_ACCESS_TOKEN || '',
  space: process.env.CONTENTFUL_SPACE_ID || '',
  host: 'preview.contentful.com',
});

export default contentfulClient;
