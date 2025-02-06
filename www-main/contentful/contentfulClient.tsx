import { createClient } from 'contentful';

const contentfulClient = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_CONTENT_DELIVERY_API_ACCESS_TOKEN || '',
  removeUnresolved: true,
});

export const contentfulPreviewClient = createClient({
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_CONTENT_PREVIEW_API_ACCESS_TOKEN || '',
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || '',
  host: 'preview.contentful.com',
});

export default contentfulClient;
