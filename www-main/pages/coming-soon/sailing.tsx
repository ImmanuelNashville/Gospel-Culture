import { ArrowRightIcon, MailIcon, VideoCameraIcon } from '@heroicons/react/solid';
import TwitterIcon from 'components/icons/TwitterIcon';
import { InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HTMLAttributes } from 'react';
import { useInView } from 'react-intersection-observer';
import Button from '../../components/Button';
import CourseCard from '../../components/Card/CourseCard';
import FullPageHero from '../../components/FullPageHero';
import Layout from '../../components/Layout';
import FullWidthSection from '../../components/PageSections/FullWidthSection';
import SectionWithMargin from '../../components/PageSections/SectionWithMargin';
import SocialLinks, { DEFAULT_SOCIAL_LINK_ICON, socialNav } from '../../components/SocialLinks';
import VideoPlayer from '../../components/VideoPlayer';
import contentfulClient from '../../contentful/contentfulClient';
import courseNamesMap from '../../courseNames';
import { useProductNotification } from '../../hooks/useProductNotification';
import { ContentfulCourseFields, ContentfulMuxVideoFields } from '../../models/contentful';
import ryanAndSophiePhoto from '../../public/images/coming-soon/sailing/about.jpg';
import { getDisplayDurationsForAllCourses } from '../../utils/courses.server';
import { getMuxVideoTokenForSignedPlaybackId } from '../../utils/tokens';

export async function getStaticProps() {
  const heroVideoLoopId = '7xu9RU11rLsUqE6gFAxql0';
  const trailerVideoId = '6Nr7AlOhl7l3NNoHq40Z4A';

  const heroVideo = await contentfulClient.getEntry<ContentfulMuxVideoFields>(heroVideoLoopId);
  const trailerVideo = await contentfulClient.getEntry<ContentfulMuxVideoFields>(trailerVideoId);

  const heroTokens = getMuxVideoTokenForSignedPlaybackId(heroVideo.fields.video?.signedPlaybackId ?? '');
  const trailerTokens = getMuxVideoTokenForSignedPlaybackId(trailerVideo.fields.video?.signedPlaybackId ?? '');

  const part1Response = await contentfulClient.getEntries<ContentfulCourseFields>({
    'sys.id': courseNamesMap['Sailing Part 1: Getting Started'],
    include: 10,
  });
  const durations = await getDisplayDurationsForAllCourses();

  return {
    props: {
      heroVideo,
      heroTokens,
      trailerVideo,
      trailerTokens,
      coursePart1: part1Response.items[0] ?? null,
      durations,
    },
  };
}

const aboutThisCourse =
  'Start learning everything you need to know to set sail and explore a life of adventures at sea!\n' +
  '\n' +
  'This course explores the first pillar of Ryan and Sophie’s guide to becoming a full-time sailor. Learn how to get into sailing with the necessary terms, concepts, and skills you need to step on board. Go through the full anatomy of a sailboat, basic sailing maneuvers, knots and line work, types of sails, and explore what is actually happening above and below the water when you sail. Develop a core knowledge base of safety and seamanship concepts. Get a break down of the different types of sailboats available by size, price, and style and determine what equipment you’ll want with you onboard. By the end of this course, you’ll have the tools and confidence necessary to fast-track your own sailing dreams.';

export default function SailingComingSoonPage({
  heroVideo,
  heroTokens,
  trailerVideo,
  trailerTokens,
  coursePart1,
  durations,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { ref: trailerRef, inView: trailerInView } = useInView({
    threshold: 0.5,
  });
  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.05,
  });
  const { openModal, notifyModal } = useProductNotification(
    'Stay updated about Sailing the World',
    'Sailing The World Part 1'
  );

  const description = 'Start learning everything you need to know to set sail and explore a life of adventures at sea!';

  return (
    <Layout
      title={'Sailing the World'}
      description={description}
      fullBleed
      transparentHeader={heroInView}
      openGraph={{
        url: 'https://www.brighttrip.com/coming-soon/sailing',
        description,
        images: [
          {
            url: 'https://www.brighttrip.com/images/coming-soon/sailing/ch-1.jpg',
            width: 800,
            height: 450,
            alt: 'Bright Trip, Sailing the World with Ryan & Sophie',
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
        video={
          heroVideo && heroTokens
            ? {
                muxVideo: heroVideo,
                muxTokens: heroTokens,
              }
            : undefined
        }
        footerContent={{
          middle: (
            <span className="font-['Mainsail'] font-bold italic text-subtitle1 text-white tracking-wider">Scroll</span>
          ),
        }}
        mainContent={
          <div className="text-white flex flex-col items-center md:mr-[40vw] mt-[10vh]">
            <div className="object-cover"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="border rounded-full px-4 py-1.5">
                <span className="font-bold font-['Galley']">Part 1 Available Now</span>
              </div>
            </div>
            <h1 className="uppercase text-headline3 font-bold tracking-widest mb-3 font-['Mainsail']">
              Sailing the World
            </h1>
            <h2 className="uppercase text-headline6 font-bold tracking-widest font-['Mainsail']">with Ryan & Sophie</h2>
            <div className="mt-8 mb-12 flex flex-col lg:flex-row gap-2 lg:gap-6">
              <button
                className="flex gap-2 items-center bg-bt-teal text-white rounded-md px-6 py-2.5"
                onClick={openModal}
              >
                <MailIcon className="w-6 h-6" />
                <span className="uppercase tracking-widest">Get Updates</span>
              </button>
              <Link href="/courses/sailing-the-world">
                <button className="flex gap-2 items-center bg-bt-orange text-white rounded-md px-6 py-2.5">
                  <span className="uppercase tracking-widest block">View Part One</span>
                  <ArrowRightIcon className="w-4 h-4 relative -top-[1px]" />
                </button>
              </Link>
            </div>
          </div>
        }
      />
      <main>
        <SectionWithMargin>
          <div className="flex flex-col md:grid grid-cols-7 gap-6 mt-8 max-h-fit">
            <div className="col-span-5 col-start-2 -mt-28 pt-28" id="trailer">
              <SectionWithMargin>
                <h3 className="m-4 md:m-20 flex flex-col gap-4 sm:gap-8 text-center italic font-['Galley']">
                  <p className="tracking-widest md:leading-10 text-[20px] md:text-[48px] text-[#112754] dark:text-gray-300">
                    Step Aboard with Bright Trip
                  </p>
                  <p className="block text-headline5 tracking-widest leading-tight text-[42px] md:text-[72px] text-[#c09c0a]">
                    Sail The World
                  </p>
                </h3>
              </SectionWithMargin>
              <div className="aspect-w-16 aspect-h-9 bg-bt-teal-ultraLight rounded-lg leading-[0] overflow-hidden">
                <VideoPlayer
                  ref={trailerRef}
                  muxVideo={trailerVideo}
                  muxToken={trailerTokens}
                  isVisible={trailerInView}
                  muted={!trailerInView}
                />
              </div>
              <h3 className="mt-6 font-bold text-2xl text-gray-900 dark:text-gray-200">About This Course</h3>
              <p className="mt-1.5 font-bodycopy text-lg leading-relaxed text-gray-500 dark:text-gray-400">
                {aboutThisCourse}
              </p>
            </div>
          </div>
        </SectionWithMargin>
        <div className="flex flex-col items-center">
          <FullWidthSection bgColor="bg-[#143566]">
            <p className="text-subtitle1 text-center text-[#c09c0a] font-['Galley'] mx-auto max-w-lg pb-4">
              AVAILABLE NOW!
            </p>
            <h3 className="text-center text-[#e2eaf2] text-headline4 font-['Mainsail'] font-bold">
              Part 1 • Getting Started
            </h3>
            <div className="flex justify-center mt-8 max-w-lg mx-auto">
              {coursePart1 ? (
                <CourseCard course={coursePart1} />
              ) : (
                <Link href={`/courses/sailing-the-world`} className="flex ">
                  <Button variant="background" icon={<VideoCameraIcon />}>
                    Check out Part 1
                  </Button>
                </Link>
              )}
            </div>
          </FullWidthSection>
          <FullWidthSection bgColor="bg-[#e2eaf2] dark:bg-gray-800">
            <p className="text-subtitle1 text-center text-[#c09c0a] font-['Galley'] mx-auto max-w-lg">Coming in 2023</p>
            <h3 className="text-center text-[#143566] dark:text-white/90 text-headline4 font-['Mainsail'] font-bold pb-4 pt-2">
              Part 2 • Plan a Passage
            </h3>
            <p className="max-w-lg mx-auto text-[#143566] dark:text-white/70 leading-relaxed font-bodycopy text-lg">
              {
                'The next stage in a sailor’s journey, after mastering foundational knowledge, is mastering how to plan a passage. Get  an introduction to maritime navigation and an overview of sailing destinations all around the world. Then, follow along as Ryan and Sophie walk you through their own passage plan from Antigua to Bermuda. Part 2 is for those ready to learn what it takes to get a sailboat out and sailing in open water.'
              }
            </p>
          </FullWidthSection>
          <FullWidthSection bgColor="bg-[#143566]">
            <p className="text-subtitle1 text-center text-[#c09c0a] font-['Galley'] mx-auto max-w-lg">Coming in 2023</p>
            <h3 className="text-center text-[#e2eaf2] text-headline4 font-['Mainsail'] font-bold pb-4 pt-2">
              Part 3 • Learn the Lifestyle
            </h3>
            <p className="max-w-lg mx-auto text-[#e2eaf2] leading-relaxed font-bodycopy text-lg">
              {
                'Get an inside look into what living on a sailboat actually looks like. Part 3 covers the ups, downs, challenges, and rewards of this lifestyle. Learn the realities of day-to-day boat life including cost and budgeting essentials.'
              }
            </p>
          </FullWidthSection>
        </div>
        <FullWidthSection bgColor={'bg-gradient-to-tr from-bt-teal to-bt-teal-light dark:to-bt-teal-light/30'}>
          <h3 className="text-center text-white text-4xl font-bold">Meet Your Instructors</h3>
          <div className="flex flex-col-reverse md:grid grid-cols-3 mt-10 text-white place-items-center gap-12">
            <div className="flex flex-col items-center">
              <Link href="/creators/ryan-and-sophie-sailing">
                <h4 className="text-3xl font-bold mb-5">Ryan and Sophie</h4>
              </Link>
              <p className="leading-relaxed font-bodycopy text-lg mb-8">{aboutDescription}</p>
              <SocialLinks
                className="text-white hover:scale-105 duration-150"
                links={[
                  {
                    name: 'Youtube',
                    href: 'https://www.youtube.com/c/RyanSophieSailing',
                    icon: socialNav.find((n) => n.name === 'Youtube')?.icon ?? DEFAULT_SOCIAL_LINK_ICON,
                  },
                  {
                    name: 'Instagram',
                    href: 'https://www.instagram.com/ryan_and_sophie_sailing/',
                    icon: socialNav.find((n) => n.name === 'Instagram')?.icon ?? DEFAULT_SOCIAL_LINK_ICON,
                  },
                  {
                    name: 'Twitter',
                    href: 'https://twitter.com/ryan_and_sophie',
                    icon: (props: HTMLAttributes<SVGElement>) => <TwitterIcon {...props} />,
                  },
                ]}
              />
            </div>
            <div className="col-span-2 rounded-2xl drop-shadow-md overflow-hidden bg-gray-200 bg-opacity-30 w-full aspect-w-16 aspect-h-9">
              <Image src={ryanAndSophiePhoto} className="object-cover" alt="Ryan and Sophie" fill sizes="100vw" />
            </div>
          </div>
        </FullWidthSection>
        {notifyModal}
      </main>
    </Layout>
  );
}

const aboutDescription =
  'Ryan & Sophie began their sailing adventure as a couple, early into their relationship. Since learning to sail in 2015, they have sailed the Archipelago of Sweden, around the Mediterranean, and across the Atlantic several times. They sail full-time while balancing their non-sailing careers, and they even find time to share their sailing adventures, advice, and insight on their Youtube channel, Ryan and Sophie Sailing.';
