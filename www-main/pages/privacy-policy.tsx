import React from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { createClient } from 'contentful';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, Document } from '@contentful/rich-text-types';
import type { Options } from '@contentful/rich-text-react-renderer';
import type { Block, Inline, Text } from '@contentful/rich-text-types';

export const getStaticProps: GetStaticProps = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  // Define the expected structure for this entry
  type PrivacyFields = {
    internalName?: string;
    body?: Document;
  };

  try {
    const entryId = '379fyvhfuZO9G9FjATpvO8'; // Privacy policy entry ID
    const entry = await client.getEntry(entryId);
    const fields = entry.fields as PrivacyFields;

    return {
      props: {
        internalName:
          typeof fields.internalName === 'string' && fields.internalName.trim() !== ''
            ? fields.internalName
            : 'Privacy Policy',
        body: fields.body || null,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching Privacy Policy:', error);
    return {
      props: {
        internalName: 'Privacy Policy',
        body: null,
      },
      revalidate: 3600,
    };
  }
};


const richTextOptions: Options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: Block | Inline | Text, children) => (
      <p className="mb-4 text-lg text-gray-700">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (node: Block | Inline | Text, children) => (
      <h1 className="text-4xl font-bold my-4">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node: Block | Inline | Text, children) => (
      <h2 className="text-3xl font-bold my-4">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node: Block | Inline | Text, children) => (
      <h3 className="text-2xl font-bold my-4">{children}</h3>
    ),
    [BLOCKS.UL_LIST]: (node: Block | Inline | Text, children) => (
      <ul className="list-disc ml-8 my-4">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node: Block | Inline | Text, children) => (
      <ol className="list-decimal ml-8 my-4">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node: Block | Inline | Text, children) => (
      <li className="my-1">{children}</li>
    ),
  },
};


const PrivacyPolicyPage = ({ internalName, body }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto my-12 px-4">
        {body && body.nodeType === 'document' ? (
          <div>{documentToReactComponents(body, richTextOptions)}</div>
        ) : (
          <p className="text-gray-500">Privacy policy content not available.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
