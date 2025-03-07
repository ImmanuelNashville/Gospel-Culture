import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecentCard from '../components/Card/RecentCard';
import Image from 'next/image';
import Link from 'next/link';
import CardCarousel from '../components/CardCarousel';
import FullPageHero from '../components/FullPageHero';
import FullWidthSection from '../components/PageSections/FullWidthSection';
import SectionWithMargin from '../components/PageSections/SectionWithMargin';
import { SectionDivider } from '../components/SectionDivider';
import MeetContributorCard from '../components/Card/MeetContributorCard';
import { createClient } from 'contentful';
import Button from '../components/Button';
import NewsletterModal from '../components/NewsletterModal'; // Import the new modal component

export async function getStaticProps() {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  try {
    const [podcasts, sermons, articles, contributors] = await Promise.all([
      client.getEntries({ content_type: 'podcast', limit: 4 }),
      client.getEntries({ content_type: 'sermon', limit: 4 }),
      client.getEntries({ content_type: 'article', limit: 4 }),
      client.getEntries({ content_type: 'contributor', limit: 8 }),
    ]);

    const getAssetUrl = (asset: any) => {
      if (!asset?.fields?.file?.url) return '/placeholder.png';
      return asset.fields.file.url.startsWith('//') ? `https:${asset.fields.file.url}` : asset.fields.file.url;
    };

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
        imageUrl: item.fields.images?.[0] ? getAssetUrl(item.fields.images[0]) : '/placeholder.png',
        description: item.fields.description ?? null,
        sys: item.sys,
      })),
    ];

    recentResources.sort((a, b) => {
      const dateA = new Date(a.sys?.createdAt || 0);
      const dateB = new Date(b.sys?.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

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

const HomePage = ({
  recentResources,
  contributorData,
  sermonItems,
}: {
  recentResources: any[];
  contributorData: any[];
  sermonItems: any[];
}) => {
  const [isVideoModalOpen, setVideoModalOpen] = useState(false);
  const [isNewsletterModalOpen, setNewsletterModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');

  const handleLearnMoreClick = () => {
    const videoUrl = 'https://player.vimeo.com/video/970768769';
    console.log('Setting video URL:', videoUrl);
    setVideoUrl(videoUrl);
    setVideoModalOpen(true);
  };

  useEffect(() => {
    if (isVideoModalOpen) {
      console.log('Video modal opened with video URL:', videoUrl);
    }
  }, [isVideoModalOpen, videoUrl]);

  return (
    <div>
      <Navbar />
      <main>
        <FullPageHero
          height="min-h-[90vh]"
          overlayStyle="bg-[#205952]"
          mainContent={
            <div className={`flex flex-col gap-4 items-center -mt-12`}>
              <img src="/images/cgc-badge-gold.webp" alt="Logo Badge" className="w-10 h-24 md:w-32 md:h-32" />
              <h1 className="font-bold text-white text-5xl md:text-6xl text-center mt-6">
                Helping churches reflect
                <br />
                the beauty of Jesus
              </h1>
              <p className="max-w-xs md:max-w-full leading-tight text-bodySmall md:text-subtitle1 text-white text-center mt-6">
                Get practical resources for building out your church culture around the grace God has shown us through
                Jesus
              </p>

              <div className="flex gap-4 mt-4">
                <Button className="px-6 py-2 bg-bt-yellow text-white font-bold" onClick={() => setNewsletterModalOpen(true)}>Open Newsletter Signup</Button>
                <button
                  onClick={handleLearnMoreClick}
                  className="px-6 py-2 bg-white text-bt-yellow font-bold border-bt-yellow"
                >
                  Learn More
                </button>
              </div>
            </div>
          }
        />

        {isVideoModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-6xl p-6">
              <button
                onClick={() => setVideoModalOpen(false)}
                className="absolute top-3 right-3 bg-gray-200 text-gray-800 rounded-full p-2"
              >
                ✕
              </button>
              <div className="w-full h-[80vh]">
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title="Learn More Video"
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {isNewsletterModalOpen && (
          <NewsletterModal open={isNewsletterModalOpen} onClose={() => setNewsletterModalOpen(false)} />
        )}

        <SectionWithMargin>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-300">More Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentResources[0] && (
              <div className="flex flex-col h-full">
                <RecentCard
                  key={0}
                  {...recentResources[0]}
                  customThumbnailUrl={recentResources[0]?.imageUrl || recentResources[0]?.videoUrl}
                />
              </div>
            )}
            <div className="flex flex-col gap-6">
              {recentResources.slice(1, 3).map((resource, index) => (
                <RecentCard
                  key={index + 1}
                  {...resource}
                  customThumbnailUrl={resource?.imageUrl || resource?.videoUrl}
                />
              ))}
            </div>
          </div>
        </SectionWithMargin>

        <SectionWithMargin>
          <SectionDivider />
        </SectionWithMargin>

        <SectionWithMargin>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-300">Recent Resources</h2>
          <div className="grid grid-cols-3 gap-6">
            {recentResources.map((resource, index) => (
              <RecentCard
                key={index}
                {...resource}
                customThumbnailUrl={resource?.imageUrl || resource?.videoUrl}
              />
            ))}
          </div>
        </SectionWithMargin>

        <FullWidthSection bgColor="bg-[#2a2727]">
          <h2 className="text-4xl font-bold mb-6 text-white/90 text-center">Meet Our Contributors</h2>
          <div className="grid grid-cols-4 md:grid-cols-4 gap-6">
            {contributorData.map((contributor) => (
              <MeetContributorCard key={contributor.link} contributor={contributor} />
            ))}
          </div>
        </FullWidthSection>

        <SectionWithMargin>
        <CardCarousel
  title="Featured Sermons"
  subtitle="Check out some of our latest sermons."
  containerStyles="pb-10 px-2"
  items={sermonItems.map((sermon, index) => (
    <Link
      key={sermon.sys.id}
      href={sermon.link}
      className="border-2 shadow-md border-transparent hover:shadow-xl hover:scale-[103%] cursor-pointer flex-shrink-0 block w-small-card md:w-card isolate bg-bt-background-light dark:bg-gray-800 rounded-xl overflow-hidden p-2 transition-all duration-200"
    >
      <div className="p-1 rounded-md filter-none border border-black/10">
        <div className="relative w-full h-0 pb-[66.67%]"> {/* Enforce 3:2 aspect ratio */}
          <Image
            src={sermon.imageUrl}
            alt={sermon.title}
            fill
            className="rounded-md object-cover object-center"
            sizes="(max-width: 768px) 100vw, 300px" // Adjust based on your layout
          />
        </div>
        <div className="flex flex-col px-0.5 pt-2 pb-1">
          <span className="text-bodySmall md:text-body font-bold leading-tight text-gray-800 dark:text-gray-300">
            {sermon.title}
          </span>
        </div>
      </div>
    </Link>
  ))}
/>
        </SectionWithMargin>

        <SectionWithMargin>
          <SectionDivider />
        </SectionWithMargin>

        <FullWidthSection
          bgColor="bg-gradient-to-tr bg-[#205952] via-bt-green to-white/30 dark:to-black/30"
          secondaryOverlay={
            <>
              <div className="absolute inset-0 filter mix-blend-luminosity opacity-70">
                <Image className="object-cover rotate-180" src="/images/teal-bg.png" alt="" fill sizes="100vw" />
              </div>
            </>
          }
        >
          <SectionWithMargin className="flex flex-col items-center max-w-sm text-center">
            <h2 className="text-white text-3xl font-bold">Want more?</h2>
            <p className="font-bodycopy text-white/80 mt-1 leading-snug mb-5">
              Our catalog of articles, books, sermons, and podcasts is always growing.
            </p>
            <Link href="/search">
              <button className="px-6 py-2 bg-bt-yellow text-white font-bold">Explore Everything</button>
            </Link>
          </SectionWithMargin>
        </FullWidthSection>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;