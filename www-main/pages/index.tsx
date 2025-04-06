import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecentCard from '../components/Card/RecentCard';
import Image from 'next/image';
import Link from 'next/link';
import FullPageHero from '../components/FullPageHero';
import FullWidthSection from '../components/PageSections/FullWidthSection';
import SectionWithMargin from '../components/PageSections/SectionWithMargin';
import { SectionDivider } from '../components/SectionDivider';
import MeetContributorCard from '../components/Card/MeetContributorCard';
import { createClient } from 'contentful';
import Button from '../components/Button';
import FeaturedSermonsCarousel from '../components/FeaturedSermonsCarousel';

// Dynamically import NewsletterModal to reduce initial bundle size
const NewsletterModal = dynamic(() => import('../components/NewsletterModal'));

export async function getStaticProps() {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  // Helper to retrieve asset URL safely
  const getAssetUrl = (asset: any) => {
    if (!asset?.fields?.file?.url) return '/placeholder.png';
    return asset.fields.file.url.startsWith('//')
      ? `https:${asset.fields.file.url}`
      : asset.fields.file.url;
  };

  try {
    const [podcasts, sermons, articles, contributors] = await Promise.all([
      client.getEntries({ content_type: 'podcast', limit: 4 }),
      client.getEntries({ content_type: 'sermon', limit: 4 }),
      client.getEntries({ content_type: 'article', limit: 4 }),
      client.getEntries({ content_type: 'contributor' }),
    ]);

    const recentResources = [
      ...podcasts.items.map((item: any) => ({
        type: 'Podcast' as const,
        title: item.fields.title || 'Untitled Podcast',
        link: `/podcasts/${item.sys.id}`,
        imageUrl: getAssetUrl(item.fields.podcastCover),
        description: item.fields.description ?? null,
        sys: item.sys,
      })),
      ...sermons.items.map((item: any) => ({
        type: 'Sermon' as const,
        title: item.fields.title || 'Untitled Sermon',
        link: `/sermons/${item.sys.id}`,
        imageUrl: getAssetUrl(item.fields.customThumbnail),
        videoUrl: item.fields.ytSermonSHORT || null,
        description: item.fields.description ?? null,
        sys: item.sys,
      })),
      ...articles.items.map((item: any) => ({
        type: 'Article' as const,
        title: item.fields.title || 'Untitled Article',
        link: `/articles/${item.sys.id}`,
        imageUrl: item.fields.images?.[0]
          ? getAssetUrl(item.fields.images[0])
          : '/placeholder.png',
        description: item.fields.description ?? null,
        sys: item.sys,
      })),
    ];

    // Sort resources by creation date (most recent first)
    recentResources.sort(
      (a, b) => new Date(b.sys?.createdAt).getTime() - new Date(a.sys?.createdAt).getTime()
    );

    const contributorData = contributors.items.map((item: any) => ({
      name: item.fields.name || 'Unnamed Contributor',
      entryTitle: item.fields.entryTitle || '',
      link: item.sys.id || '',
      bio: item.fields.bio || '',
      imagePath: getAssetUrl(item.fields.profilePhoto) || '/default-avatar.png',
      heroImagePath: getAssetUrl(item.fields.hero) || '/default-hero.png',
      oneLineBio: item.fields.oneLineBio || '',
      socialLinks: item.fields.socialLinks || null,
    }));

    const sermonItems = recentResources.filter((resource) => resource.type === 'Sermon');

    return {
      props: {
        recentResources,
        contributorData,
        sermonItems,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Contentful Fetch Error:', error);
    return {
      props: {
        recentResources: [],
        contributorData: [],
        sermonItems: [],
      },
      revalidate: 60,
    };
  }
}

interface HomePageProps {
  recentResources: any[];
  contributorData: any[];
  sermonItems: any[];
}

const HomePage: React.FC<HomePageProps> = ({
  recentResources,
  contributorData,
  sermonItems,
}) => {
  // Removed video popup state and handler

  // Newsletter modal state remains
  const [isNewsletterModalOpen, setNewsletterModalOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Home | Your Site Name</title>
        <meta
          name="description"
          content="Practical resources for building out your church culture around the grace of Jesus"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div>
        <Navbar />
        <main>
        <FullPageHero
  height="py-20 md:py-32"
  overlayStyle="bg-[#205952]"
  mainContent={
    <div className="flex flex-col items-center text-center">
      <div className="relative w-10 h-18 md:w-32 md:h-32">
        <Image
          src="/images/cgc-badge-gold.webp"
          alt="Logo Badge"
          fill
          className="object-contain"
        />
      </div>
      <h1 className="font-bold text-white text-4xl md:text-5xl mt-6">
        Helping churches reflect <br /> the beauty of Jesus
      </h1>
      <p className="max-w-md md:max-w-xl leading-tight text-bodySmall md:text-subtitle1 text-white text-center mt-6">
  Get practical resources for building out your church culture around the grace God has shown us through Jesus
</p>
    </div>
  }
/>

          

          <SectionWithMargin>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-300">
              Recent Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentResources[0] && (
                <div className="flex flex-col h-full">
                  <RecentCard
                    key={recentResources[0].sys.id}
                    {...recentResources[0]}
                    customThumbnailUrl={
                      recentResources[0].imageUrl || recentResources[0].videoUrl
                    }
                  />
                </div>
              )}
              <div className="flex flex-col gap-6">
                {recentResources.slice(1, 3).map((resource) => (
                  <RecentCard
                    key={resource.sys.id}
                    {...resource}
                    customThumbnailUrl={resource.imageUrl || resource.videoUrl}
                  />
                ))}
              </div>
            </div>
          </SectionWithMargin>

          <SectionWithMargin>
            <SectionDivider />
          </SectionWithMargin>

          <SectionWithMargin>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-300">
              Popular Resources
            </h2>
            <div className="grid grid-cols-3 gap-6">
              {recentResources.map((resource) => (
                <RecentCard
                  key={resource.sys.id}
                  {...resource}
                  customThumbnailUrl={resource.imageUrl || resource.videoUrl}
                />
              ))}
            </div>
          </SectionWithMargin>

          <SectionWithMargin>
            <SectionDivider />
          </SectionWithMargin>

          <SectionWithMargin>
            <FeaturedSermonsCarousel sermonItems={sermonItems} />
          </SectionWithMargin>

          <FullWidthSection bgColor="bg-[#2a2727]">
            <h2 className="text-4xl font-bold mb-6 text-white/90 text-center">
              Meet Our Contributors
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-4 gap-6">
              {contributorData.map((contributor) => (
                <MeetContributorCard
                  key={contributor.link}
                  contributor={contributor}
                />
              ))}
            </div>
          </FullWidthSection>

          <FullWidthSection
            bgColor="bg-gradient-to-tr bg-[#205952] via-bt-green to-white/30 dark:to-black/30"
            secondaryOverlay={
              <div className="absolute inset-0 filter mix-blend-luminosity opacity-70">
                <Image
                  className="object-cover rotate-180"
                  src="/images/teal-bg.png"
                  alt=""
                  fill
                  sizes="100vw"
                />
              </div>
            }
          >
            <SectionWithMargin className="flex flex-col items-center max-w-sm text-center">
              <h2 className="text-white text-3xl font-bold">Want more?</h2>
              <p className="font-bodycopy text-white/80 mt-1 leading-snug mb-5">
                Our catalog of articles, books, sermons, and podcasts is always growing.
              </p>
              <Link href="/search">
                <button className="px-6 py-2 bg-bt-yellow text-white font-bold">
                  Explore Everything
                </button>
              </Link>
            </SectionWithMargin>
          </FullWidthSection>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
