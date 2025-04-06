import React from 'react';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { createClient } from 'contentful';
import Image from 'next/image';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import RecentCard from '../../components/Card/RecentCard';
import SectionWithMargin from '../../components/PageSections/SectionWithMargin';
import FullWidthSection from '../../components/PageSections/FullWidthSection';
import { ContentfulContributorFields } from '../../models/contentful';

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  const contributors = await client.getEntries({ content_type: 'contributor' });

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

  const getAssetUrl = (asset: any) => {
    if (!asset?.fields?.file?.url) return '/placeholder.png';
    return asset.fields.file.url.startsWith('//')
      ? `https:${asset.fields.file.url}`
      : asset.fields.file.url;
  };

  try {
    const contributorId = params?.id as string;

    const contributorResponse = await client.getEntry(contributorId);
    const contributor = contributorResponse.fields as ContentfulContributorFields;

    const relatedContentResponse = await client.getEntries({
      links_to_entry: contributorId,
      limit: 100,
    });

    const formattedRelatedContent = relatedContentResponse.items
      .filter((item: any) => item.sys.contentType.sys.id !== 'contributor')
      .map((item: any) => {
        const type = item.sys.contentType.sys.id;
        let imageUrl = '/placeholder.png';

        if (type === 'article') {
          imageUrl = item.fields.images?.[0]
            ? getAssetUrl(item.fields.images[0])
            : '/placeholder.png';
        } else if (type === 'podcast') {
          imageUrl = getAssetUrl(item.fields.podcastCover);
        } else if (type === 'sermon') {
          imageUrl = getAssetUrl(item.fields.customThumbnail);
        }

        return {
          type: type.charAt(0).toUpperCase() + type.slice(1),
          title: item.fields.title || `Untitled ${type}`,
          link: `/${type}s/${item.sys.id}`,
          imageUrl,
          description: item.fields.description ?? null,
          videoUrl: item.fields.ytSermonSHORT || null,
          sys: item.sys,
        };
      });

    return {
      props: {
        contributor: {
          name: contributor.name || 'Unnamed Contributor',
          entryTitle: contributor.entryTitle || '',
          bio: contributor.bio || '',
          imagePath: contributor.profilePhoto
            ? getAssetUrl(contributor.profilePhoto)
            : '/default-avatar.png',
          heroImagePath: contributor.hero?.fields?.file?.url
            ? getAssetUrl(contributor.hero)
            : '/default-hero.png',
          oneLineBio: contributor.oneLineBio || '',
          socialLinks: contributor.socialLinks || null,
        },
        relatedContent: formattedRelatedContent,
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
          socialLinks: null,
        },
        relatedContent: [],
      },
      revalidate: 60,
    };
  }
};

const ContributorPage = ({
  contributor,
  relatedContent,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <header
        className="relative h-[90vh] bg-center bg-cover bg-no-repeat flex items-end"
        style={{ backgroundImage: `url(${contributor.heroImagePath})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 z-10" />
        <div className="relative z-20 w-full px-4">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-4 items-start text-white">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white">
                <Image
                  src={contributor.imagePath}
                  alt={contributor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">{contributor.name}</h1>
            </div>
            {contributor.oneLineBio && (
              <p className="text-lg md:text-xl text-white/90 max-w-xl">{contributor.oneLineBio}</p>
            )}
          </div>
        </div>
      </header>

      {/* Related Content Grid */}
      <SectionWithMargin>
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Resources by {contributor.name}
        </h2>
        {relatedContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedContent.map((resource: any) => (
              <RecentCard
                key={resource.sys.id}
                {...resource}
                customThumbnailUrl={resource.imageUrl || resource.videoUrl}
              />
            ))}
          </div>
        ) : (
          <p className="text-lg text-gray-600 dark:text-gray-300">No related content found.</p>
        )}
      </SectionWithMargin>

      {/* About Section */}
      <FullWidthSection bgColor="bg-[#205952]">
        <div className="max-w-3xl mx-auto px-4 py-12 text-white">
          <h2 className="text-4xl font-bold mb-4">About {contributor.name}</h2>
          <p className="text-lg leading-relaxed">{contributor.bio}</p>
          {contributor.socialLinks && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <div>{documentToReactComponents(contributor.socialLinks)}</div>
            </div>
          )}
        </div>
      </FullWidthSection>

      <Footer />
    </div>
  );
};

export default ContributorPage;
