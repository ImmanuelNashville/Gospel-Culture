import Image from 'next/image';
import FullPageHero from 'components/FullPageHero';
import FullWidthSection from 'components/PageSections/FullWidthSection';
import VideoPlayer from 'components/VideoPlayer';
import GetUpdatesButton from './GetUpdatesButton';
import contentfulClient from 'contentful/contentfulClient';
import { ContentfulMuxVideoFields } from 'models/contentful';
import { getMuxVideoTokenForSignedPlaybackId } from 'utils/tokens';
import { Metadata } from 'next';

const courseName = 'Chase the Northern Lights';
const courseDescription =
  'A complete guide to forecasting the auroras and capturing photos and videos of the northern lights.';
const creatorName = 'Agnius Narkevičius';
const creatorDescription =
  "Agnius is a landscape filmmaker and photographer. When he was younger he always dreamt of finding a job where he could travel and create content. By the age of 21 years old his dream was realized; he started shooting relaxing landscape documentaries for several Youtube channels. This job has taken Agnius to many different places, including the Lofoten Islands and Tromso where he has spent many nights searching for and shooting the northern lights. He's shared everything he’s learned about the northern lights in this course.";

export const generateMetadata = async (): Promise<Metadata> => {
  const title = courseName + ' with ' + creatorName;
  const ogImage = await contentfulClient.getAsset('7eCtpKX9qcP0DxtPDImk6i');

  return {
    title,
    description: courseDescription,
    openGraph: {
      title: 'COMING SOON! ' + title,
      description: courseDescription,
      url: 'https://www.brighttrip.com/northern-lights',
      images: [
        {
          url: ogImage.fields.file.url ? `https:${ogImage.fields.file.url}?w=800` : '',
          width: 800,
          height: 450,
          alt: title,
          type: 'image/jpg',
        },
      ],
      siteName: 'Bright Trip',
      locale: 'en_US',
      type: 'website',
    },
  };
};

export default async function NorthernLightsComingSoonPage() {
  const heroVideo = await contentfulClient.getEntry<ContentfulMuxVideoFields>('2KzZ5rLyJtpGSMlCj8kSTI');
  const heroTokens = getMuxVideoTokenForSignedPlaybackId(heroVideo.fields.video?.signedPlaybackId ?? '');
  const creatorImage = await contentfulClient.getAsset('3D1DYtnWP6s4iZPz9MCEvo');
  const trailerVideo = await contentfulClient.getEntry<ContentfulMuxVideoFields>('6hn6k527enASdqBSb3ChoL');
  const trailerTokens = getMuxVideoTokenForSignedPlaybackId(trailerVideo.fields.video?.signedPlaybackId ?? '');

  return (
    <>
      <FullPageHero
        video={{
          muxVideo: heroVideo,
          muxTokens: heroTokens,
        }}
        mainContent={
          <div className="text-white flex flex-row justify-evenly items-center gap-6 lg:gap-12 max-w-screen-2xl">
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-4">
                <div className="rounded-full px-4 py-1.5 bg-white/10">
                  <span className="font-bold text-body">Coming Soon</span>
                </div>
              </div>
              <div className="max-w-xl">
                <h1 className="uppercase text-headline3 font-bold tracking-widest leading-none">{courseName}</h1>
                <h2 className="uppercase text-white/70 text-headline6 font-bold tracking-widest mt-1">
                  with {creatorName}
                </h2>
              </div>
              <div className="mt-8 mb-12 flex gap-6">
                <GetUpdatesButton courseName="Northern Lights" />
              </div>
            </div>
          </div>
        }
      />
      <FullWidthSection
        bgColor="bg-gradient-to-tr from-gray-800 via-black to-gray-800"
        secondaryOverlay={<div className="absolute inset-0 bg-gradient-to-tl from-bt-orange/30 to-bt-teal-light/30" />}
      >
        <h3 className="text-center text-white text-4xl font-bold mb-10">Watch the Trailer</h3>
        <div className="rounded-lg overflow-hidden leading-[0]">
          <VideoPlayer muxVideo={trailerVideo} muxToken={trailerTokens} playsInline />
        </div>
      </FullWidthSection>
      <FullWidthSection
        bgColor={'bg-gradient-to-tr from-bt-teal to-bt-teal-light'}
        secondaryOverlay={<div className="absolute inset-0 bg-gradient-to-br from-bt-orange/60 to-bt-teal-light/30" />}
      >
        <h3 className="text-center text-white text-4xl font-bold mb-10">Meet Your Teacher</h3>
        <div className="flex flex-col-reverse md:grid md:grid-cols-2 text-white place-items-center md:gap-12 shadow-md md:shadow-none">
          <div className="flex flex-col items-center md:shadow-md backdrop-blur-lg bg-white/10 p-8 rounded-b-2xl md:rounded-2xl">
            <h4 className="text-3xl font-bold mb-5">{creatorName}</h4>
            <p className="leading-relaxed font-bodycopy text-lg mb-8">{creatorDescription}</p>
          </div>
          <div className="rounded-t-2xl md:rounded-2xl md:drop-shadow-md relative w-full h-full min-h-[360px] overflow-hidden">
            <Image
              src={`https:${creatorImage.fields.file.url}`}
              className="object-cover absolute inset-0 bg-center"
              fill
              alt={creatorName}
              sizes="40vw, 600px"
            />
          </div>
        </div>
      </FullWidthSection>
    </>
  );
}
