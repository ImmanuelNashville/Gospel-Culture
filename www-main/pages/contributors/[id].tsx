import React from 'react';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { createClient } from 'contentful';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import MeetContributorCard from '../../components/Card/MeetContributorCard';
import { ContentfulContributorFields } from '../../models/contentful'; // Ensure correct path
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY, // Ensure this is correctly set
  });
  

  const contributors = await client.getEntries({
    content_type: 'contributor',
  });

  const paths = contributors.items.map((item: any) => ({
    params: { id: item.sys.id },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  try {
    const contributorId = params?.id as string;

    const contributorResponse = await client.getEntry(contributorId);
    const contributor = contributorResponse.fields as ContentfulContributorFields;

    return {
      props: {
        contributor: {
          name: contributor.name || 'Unnamed Contributor',
          entryTitle: contributor.entryTitle || '',
          bio: contributor.bio || '',
          imagePath: '/default-avatar.png',
          heroImagePath: contributor.hero?.fields.file?.url || '/default-hero.png',
          oneLineBio: contributor.oneLineBio || '',
          socialLinks: contributor.socialLinks || null,
        },
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Contentful Fetch Error:', error);
    return {
      props: {
        contributor: {
          name: 'Contributor Not Found',
          bio: 'No bio available.',
          imagePath: '/default-avatar.png',
          heroImagePath: '/default-hero.png',
          oneLineBio: 'No additional information.',
        },
      },
      revalidate: 60,
    };
  }
};

const ContributorPage = ({ contributor }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <div>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section
          className="relative bg-cover bg-center h-[60vh] flex items-center justify-center"
          style={{ backgroundImage: `url(${contributor.heroImagePath})` }}
        >
          <h1 className="text-5xl text-white font-bold">{contributor.name}</h1>
        </section>

        {/* Contributor Details */}
        <section className="max-w-3xl mx-auto my-12 px-4">
          <h2 className="text-3xl font-bold mb-4">About {contributor.name}</h2>
          <p className="text-lg mb-4">{contributor.bio}</p>

          <h3 className="text-xl font-semibold mb-2">One-liner Bio</h3>
          <p className="text-lg mb-4">{contributor.oneLineBio}</p>

          {contributor.socialLinks && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Follow {contributor.name}</h3>
              <div>{documentToReactComponents(contributor.socialLinks)}</div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContributorPage;
