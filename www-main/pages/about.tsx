import React from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { createClient } from 'contentful';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, Document } from '@contentful/rich-text-types';
import TestimonialCarousel from '../components/TestimonialCarousel'; // Add this at top
import type { Options } from '@contentful/rich-text-react-renderer';
import type { Block, Inline, Text } from '@contentful/rich-text-types';


type AboutPageProps = {
  internalName: string;
  heroImagePath: string;
  body: Document | null;
  testimonials: {
    title: string;
    videoUrl: string;
    thumbnailUrl?: string;
  }[];
};

export const getStaticProps: GetStaticProps = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  type AboutFields = {
    internalName?: string;
    body?: Document;
    heroImage?: {
      fields?: {
        file: {
          url: string;
        };
      };
    };
  };

  try {
    const [entry, testimonialsRes] = await Promise.all([
      client.getEntry('30PqtUsx7PMzoMhrbNZar'),
      client.getEntries({ content_type: 'testimonial' }),
    ]);

    const fields = entry.fields as AboutFields;

    const testimonials = testimonialsRes.items.map((item: any) => ({
      title: item.fields.title,
      videoUrl: item.fields.videoFile
        ? `https:${item.fields.videoFile.fields.file.url}`
        : null,
      thumbnailUrl: item.fields.thumbnail
        ? `https:${item.fields.thumbnail.fields.file.url}`
        : '',
    }));

    return {
      props: {
        internalName:
          typeof fields.internalName === 'string' && fields.internalName.trim() !== ''
            ? fields.internalName
            : 'About',
        body: fields.body || null,
        heroImagePath: fields.heroImage?.fields?.file?.url
          ? `https:${fields.heroImage.fields.file.url}`
          : '/default-hero.png',
        testimonials,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching About Page:', error);
    return {
      props: {
        internalName: 'About',
        body: null,
        heroImagePath: '/default-hero.png',
        testimonials: [],
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

const AboutPage = ({ internalName, heroImagePath, body, testimonials }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <div>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section
          className="relative bg-cover bg-center h-[60vh] flex items-center justify-center"
          style={{ backgroundImage: `url(${heroImagePath})` }}
        >
          <h1 className="text-5xl text-white font-bold z-10">{internalName}</h1>
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </section>

        {/* Body Content */}
        <section className="max-w-3xl mx-auto my-12 px-4">
          {body && body.nodeType === 'document' ? (
            <div className="mb-8">
              {documentToReactComponents(body, richTextOptions)}
            </div>
          ) : (
            <p className="text-gray-500">Content not available.</p>
          )}
        </section>

        {/* Testimonials Section */}
        {testimonials && testimonials.length > 0 && (
  <TestimonialCarousel testimonials={testimonials} />
)}
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
