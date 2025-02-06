import { MailIcon } from '@heroicons/react/solid';
import { InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import FullPageHero from '../../components/FullPageHero';
import Layout from '../../components/Layout';
import FullWidthSection from '../../components/PageSections/FullWidthSection';
import VideoPlayer from '../../components/VideoPlayer';
import contentfulClient from '../../contentful/contentfulClient';
import { useProductNotification } from '../../hooks/useProductNotification';
import { ContentfulMuxVideoFields } from '../../models/contentful';
import { contentfulImageLoader } from '../../utils/contentfulImageLoader';
import { getMuxVideoTokenForSignedPlaybackId } from '../../utils/tokens';

const courseName = 'Europe by Train';
const courseDescription =
  'Europe is one of the most accessible continents in the world, and there’s no better way to explore it than by rail. Focusing on Central and Western Europe, railway expert Paul Lucas (AKA Wingin’ it With Paul) takes you on a journey through Paris, Frankfurt, and Zurich to demonstrate how to plan and prepare for your dream train adventure. Discover how trains reshaped the landscape of the European continent forever, and the ins and outs of the modern railway system—from the booking process and how to save on tickets and passes, to practical tips and overviews of the top scenic and night train journeys. With this guide, Paul aims to empower you with the tools and knowledge to tailor-make your ideal itinerary … even if that’s on the midnight train going anywhere.';
const creatorName = 'Paul Lucas';
const creatorDescription =
  'Paul Lucas is a professional traveler who has the dream job of reviewing train and air journeys on his YouTube channel. So far he’s traveled over 60,000 miles by rail in Europe—equivalent to traveling around the Earth’s circumference more than twice. With his background in working on the railways and his experience taking trains in every EU country, he’s ideally placed to help you navigate what can sometimes seem a daunting task; sorting out your tickets, planning your trip, and staying clear of the common pitfalls of rail travel.';

export async function getStaticProps() {
  const heroImage = await contentfulClient.getAsset('4Mn84WjCTmf5nNbjp8TQBH');
  const teaserVideo = await contentfulClient.getEntry<ContentfulMuxVideoFields>('4ktzJwhlSoxzrteLtTYEHO');
  const teaserTokens = getMuxVideoTokenForSignedPlaybackId(teaserVideo.fields.video?.signedPlaybackId ?? '');
  const creatorImage = await contentfulClient.getAsset('lfiMU07ccz3PmWKZRju7I');

  return {
    props: {
      heroImage,
      teaserVideo,
      teaserTokens,
      creatorImage,
    },
  };
}

export default function EuropeTrainComingSoon({
  heroImage,
  teaserTokens,
  teaserVideo,
  creatorImage,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.05,
  });
  const { openModal, notifyModal } = useProductNotification('Stay updated about ' + courseName, courseName);
  return (
    <Layout
      title={courseName}
      description={courseDescription}
      fullBleed
      transparentHeader={heroInView}
      openGraph={{
        url: 'https://www.brighttrip.com/coming-soon/europe-by-train',
        description: courseDescription,
        images: [
          {
            url: 'https:' + heroImage.fields.file.url + '?w=800&h=450&fit=fill',
            width: 800,
            height: 450,
            alt: `Bright Trip, ${courseName} with ${creatorName}`,
            type: 'image/jpg',
          },
        ],
        site_name: 'Bright Trip',
      }}
      twitter={{
        cardType: 'summary_large_image',
      }}
    >
      <FullPageHero
        ref={heroRef}
        bgImageUrl={heroImage.fields.file.url}
        footerContent={{
          middle: <span className="text-bodySmall uppercase tracking-widest text-white">Scroll</span>,
        }}
        mainContent={
          <div className="text-white flex flex-row justify-evenly items-center gap-6 lg:gap-12 max-w-screen-2xl mt-[15vh]">
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-4">
                <div className="rounded-full px-4 py-1.5 bg-white bg-opacity-25">
                  <span className="font-bold text-body">Coming Soon</span>
                </div>
              </div>
              <h1 className="uppercase text-headline3 font-bold tracking-widest leading-none">{courseName}</h1>
              <h2 className="uppercase text-headline6 font-bold tracking-widest">with {creatorName}</h2>
              <div className="mt-8 mb-12 flex gap-6">
                <button
                  className="flex gap-2 items-center bg-bt-orange text-white rounded-full px-6 py-2.5"
                  onClick={openModal}
                >
                  <MailIcon className="w-6 h-6" />
                  <span className="uppercase tracking-widest font-bold">Get Updates</span>
                </button>
              </div>
            </div>
          </div>
        }
      />
      <FullWidthSection
        bgColor="bg-gradient-to-tr from-gray-800 via-black to-gray-800"
        secondaryOverlay={<div className="absolute inset-0 bg-gradient-to-tl from-bt-orange/30 to-bt-teal-light/30" />}
      >
        <div className="rounded-lg overflow-hidden leading-[0]">
          <VideoPlayer muxVideo={teaserVideo} muxToken={teaserTokens} playsInline />
        </div>
      </FullWidthSection>
      <FullWidthSection
        bgColor={'bg-gradient-to-tr from-bt-teal to-bt-teal-light'}
        secondaryOverlay={<div className="absolute inset-0 bg-gradient-to-br from-bt-orange/60 to-bt-teal-light/30" />}
      >
        <h3 className="text-center text-white text-4xl font-bold">Meet Your Guide</h3>
        <div className="flex flex-col-reverse md:grid grid-cols-3 mt-10 text-white place-items-center gap-12">
          <div className="flex flex-col items-center">
            <h4 className="text-3xl font-bold mb-5">{creatorName}</h4>
            <p className="leading-relaxed font-bodycopy text-lg mb-8">{creatorDescription}</p>
          </div>
          <div className="col-span-2 rounded-2xl drop-shadow-md overflow-hidden bg-gray-200 bg-opacity-30 w-full aspect-w-16 aspect-h-9">
            <Image
              src={creatorImage.fields.file.url}
              className="object-cover"
              fill
              alt={creatorName}
              loader={contentfulImageLoader}
            />
          </div>
        </div>
      </FullWidthSection>
      {notifyModal}
    </Layout>
  );
}
