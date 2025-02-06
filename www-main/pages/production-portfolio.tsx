import Layout from 'components/Layout';
import FullWidthSection from 'components/PageSections/FullWidthSection';
import SectionWithMargin from 'components/PageSections/SectionWithMargin';
import VideoPlayer from 'components/VideoPlayer';
import contentfulClient from 'contentful/contentfulClient';
import { ContentfulMuxVideoFields } from 'models/contentful';
import { InferGetStaticPropsType } from 'next';
import { getMuxVideoTokenForSignedPlaybackId, MuxToken } from 'utils/tokens';
import Button from 'components/Button';
import Head from 'next/head';

const SECTIONS_WITH_PROJECTS = [
  {
    heading: 'Destination Marketing',
    bgStyle: 'bg-gradient-to-tr from-bt-orange to-bt-orange-light',
    description:
      "At Bright Trip we combine research, education design, storytelling, and high-quality video production to empower audiences to travel with confidence. Partnering with tourism boards and destination marketers allows us to deliver more authentic guides that simultaneously serve the audience and the DMO's needs.",
    items: [
      {
        name: 'Jordan Tourism',
        description:
          'We partnered with Jordan Tourism to create a 16-part guide to Jordan. The guide educates audiences on Jordan’s history, landmarks, food, and culture, while also giving practical tips on planning and experiencing a trip through the country. We used the guide to promote the Jordan Pass, which is a ticket bundle created by Jordan Tourism that includes a tourist visa and entry to over 40 attractions.',
        media: ['6uC0XothZ3FEmcIKqbVWx9', '1vjDMx4LQxMsWa33UlbEvk'],
        ctaText: 'Watch the full Jordan travel guide for free',
        href: '/my-courses/jordan',
      },
      {
        name: 'Qatar Tourism Board',
        description:
          "In collaboration with the Qatar Tourism Board, we created a 13-part guide for the country in anticipation of the 2022 FIFA World Cup. This guide was accompanied by a social-media-friendly “pocket guide” — a condensed single video combining elements from the entire guide into one. The whole guide is currently on Qatar Airways' in-flight entertainment systems for passengers to enjoy.",
        media: ['2xpaaI42MP8ofrdnnOAAEl'],
        ctaText: 'Watch the full Qatar travel guide for free',
        href: '/my-courses/qatar',
      },
    ],
  },
  {
    heading: 'Our Secret Sauce',
    bgStyle: 'bg-gradient-to-br from-bt-teal to-bt-teal-light',
    description:
      'We draw from our collective experience in storytelling, content creation, and education design to simplify complex ideas and offer practical examples to help people understand and experience a place to the fullest.',
    items: [
      {
        name: 'Paris Metro, Explained',
        description: 'Using animation and on-the-ground imagery to make navigating Paris’ metro less intimidating.',
        media: ['62w5OZdfe90JJHMz9wINu9'],
        ctaText: 'Watch the full video on YouTube',
        href: 'https://youtu.be/NUMx6taaOws',
      },
      {
        name: 'Tokyo’s Trains - Getting from A to B',
        description:
          'After a bird’s eye view of the Tokyo’s train system, we look at an example trip to apply what was learned.',
        media: ['4yZZf2gcs8Nf0uR4kd17dk'],
        ctaText: 'Check out our full Tokyo course',
        href: '/tokyo',
      },
      {
        name: 'Zion National Park',
        description:
          'Collaborating with the artists at Anderson Design Group, we created a guide to Zion National Park to empower anyone to take on this breathtaking natural wonder.',
        media: ['15aJwcOTANgE3FONc22eCC'],
        ctaText: 'See the full Zion travel guide',
        href: '/guides/zion-national-park',
      },
      {
        name: 'Burkhardt’s Discovery of Petra',
        description:
          'Using animation to take the audience back in time, we tell the story of how Petra was rediscovered.',
        media: ['4GK37053KUsdx8m7lSEg8I'],
        ctaText: 'See the full Jordan travel guide',
        href: '/guides/jordan',
      },
    ],
  },
  {
    heading: 'Star Power',
    bgStyle: 'bg-gradient-to-tr from-bt-yellow to-bt-yellow/70',
    description:
      'We are rooted in the online creator community. We leverage the knowledge of experts—who have built audience trust—to create engaging and valuable video content for our audience.',
    items: [
      {
        name: 'Jo Franco',
        description: '',
        media: ['31dprsTSN16auO5YY0IeR9'],
        ctaText: "See Jo's Course",
        href: '/courses/the-art-of-mindful-journaling',
      },
      {
        name: 'Raya & Louis',
        description: '',
        media: ['1CaJ2jzaMACka6i5Ux3j4K'],
        ctaText: "See Raya & Louis' Course",
        href: '/courses/van-life-a-practical-guide',
      },
      {
        name: 'Chris Hau',
        description: '',
        media: ['e22KwBJ4e6pUpdXHr7bej'],
        ctaText: "See Chris's Course",
        href: '/courses/how-to-get-paid-to-travel',
      },
    ],
  },
  {
    heading: 'Video Production',
    bgStyle: 'bg-gradient-to-tr from-bt-green to-bt-green/70',
    description: `Our team creates content for more than just ourselves.

        The creator-led online platform Nebula commissioned us to create a series of classes and documentaries for their platform, focusing on travel-adjacent topics.`,
    items: [
      {
        name: 'Nebula - Class - Understanding the Architecture of Places of Worship',
        description: '',
        media: ['32aSnZLAkjk3ER7KL2uXKQ'],
        ctaText: 'Watch the full class on Nebula',
        href: 'https://nebula.tv/architecture-in-places-of-worship',
      },
      {
        name: 'Nebula - Documentary - Gone Birds',
        description: '',
        media: ['1sTOsYIg0t3VR2mspOgxW4'],
        ctaText: 'Watch the full documentary on Nebula',
        href: 'https://nebula.tv/videos/gone-birds-how-africa-is-losing-its-only-penguin',
      },
    ],
  },
  {
    heading: 'Brand Partnerships',
    bgStyle: 'bg-gradient-to-tr from-bt-lightBlue to-bt-lightBlue/70',
    description: 'We also partner with a variety of brands to make travel-related content for various platforms.',
    items: [
      {
        name: 'Musicbed',
        description: '',
        media: ['3flRq2On5n709lxptYLkw1'],
      },
      {
        name: 'EzPacking',
        description: '',
        media: ['4zgiM7ZL8VMkkqZGsbwyF4'],
        ctaText: 'Watch the full Packing Cubes 101 course for free',
        href: '/my-courses/packing-cubes-101',
      },
      {
        name: 'Product Reviews',
        description: '',
        media: ['3elpwcPuopP5xL60E5eANs'],
      },
    ],
  },
];

export const getStaticProps = async () => {
  const videoIds = SECTIONS_WITH_PROJECTS.flatMap((sections) => sections.items.map((item) => item.media));
  const { items: videos } = await contentfulClient.getEntries<ContentfulMuxVideoFields>({
    'sys.id[in]': videoIds?.filter((id) => !id.includes('vid')).join(','),
  });

  const tokens: Record<string, MuxToken> = {};
  videos.forEach((video) => {
    const id = video.fields.video?.signedPlaybackId ?? '';
    tokens[id] = getMuxVideoTokenForSignedPlaybackId(id);
  });

  return {
    props: {
      videos,
      tokens,
    },
  };
};

export default function ProductionPortfolioPage({ videos, tokens }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout
      title="Portfolio"
      description="An overview of our work to tell compelling stories about the world"
      fullBleed
    >
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <FullWidthSection bgColor="bg-gradient-to-tr from-bt-teal to-bt-teal-light">
        <SectionWithMargin>
          <h1 className="text-headline4 text-white font-bold text-center">Tell your story with Bright Trip</h1>
        </SectionWithMargin>
      </FullWidthSection>
      {SECTIONS_WITH_PROJECTS.map((section) => (
        <FullWidthSection key={section.heading} bgColor={section.bgStyle}>
          <SectionWithMargin className="relative top-0 grid md:grid-cols-5 gap-6">
            <div className="md:col-span-2 md:sticky top-24 h-min bg-gradient-to-tr from-white/60 via-white to-white dark:from-gray-900/30 dark:to-gray-900/60 rounded-2xl p-6 pb-8">
              <h2 className="font-bold text-headline6 mb-2 dark:text-white/90">{section.heading}</h2>
              <p className="font-bodycopy text-lg text-black/60 dark:text-white/60">{section.description}</p>
            </div>
            <div className="md:col-span-3 space-y-6">
              {section.items.map((item) => (
                <div
                  key={item.name}
                  className="bg-gradient-to-tr from-white/60 via-white to-white dark:from-gray-900/30 dark:to-gray-900/60 rounded-2xl p-6"
                >
                  <h3 className="text-subtitle1 font-bold mb-1 dark:text-white/90">{item.name}</h3>
                  {item.description && (
                    <p className="font-bodycopy text-black/60 dark:text-white/60">{item.description}</p>
                  )}
                  <div className="my-3 space-y-3">
                    {item.media.map((mediaItem) => {
                      const video = videos.find((v) => v.sys.id === mediaItem);
                      return (
                        <div key={mediaItem} className="rounded-lg overflow-hidden leading-[0]">
                          {video ? (
                            <VideoPlayer
                              muxVideo={video}
                              muxToken={tokens[video.fields.video?.signedPlaybackId ?? '']}
                            />
                          ) : (
                            mediaItem
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {item.ctaText && item.href && (
                    <a href={item.href} target="_blank" className="block mt-5 mx-auto text-center">
                      <Button variant="secondary">{item.ctaText}</Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </SectionWithMargin>
        </FullWidthSection>
      ))}
    </Layout>
  );
}
