import SectionWithMargin from 'components/PageSections/SectionWithMargin';
import VideoPlayer from 'components/VideoPlayer';
import contentfulClient from 'contentful/contentfulClient';
import { ContentfulMuxVideoFields } from 'models/contentful';
import { getMuxVideoTokenForSignedPlaybackId } from 'utils/tokens';

export const metadata = {
  title: 'Musicbed Contest',
  description: 'MusicBed and Bright Trip have partnered to make a contest for all travel lovers.',
};

const DAVID_SHORT_FORM_EXAMPLE_ID = '5M1SRkXyl8CeMUUunV8KOq';
const DANIEL_HOW_TO_VIDEO_ID = '1PfCNRLYvj8jEg28f6VFpL';

const getMusicbedPageData = async () => {
  const cfResponse = await contentfulClient.getEntries<ContentfulMuxVideoFields>({
    'sys.id[in]': `${DAVID_SHORT_FORM_EXAMPLE_ID},${DANIEL_HOW_TO_VIDEO_ID}`,
  });

  const exampleVid = cfResponse.items.find((item) => item.sys.id === DAVID_SHORT_FORM_EXAMPLE_ID);
  const howToVid = cfResponse.items.find((item) => item.sys.id === DANIEL_HOW_TO_VIDEO_ID);

  const exampleToken = getMuxVideoTokenForSignedPlaybackId(exampleVid?.fields.video?.signedPlaybackId ?? '');
  const howToToken = getMuxVideoTokenForSignedPlaybackId(howToVid?.fields.video?.signedPlaybackId ?? '');

  return {
    exampleVid,
    exampleToken,
    howToVid,
    howToToken,
  };
};

export default async function MusicbedContestPage() {
  const { exampleToken, exampleVid, howToToken, howToVid } = await getMusicbedPageData();

  return (
    <main className="dark:text-white/80 max-w-screen-md mx-auto">
      <SectionWithMargin>
        <h1 className="text-headline4 font-bold mb-2">Musicbed &times; Bright Trip Challenge</h1>
        <p className="font-bodycopy text-lg text-gray-700 dark:text-white/70">
          Musicbed and Bright Trip have partnered for a contest for all travel lovers. Every street has a story — tell
          us yours and you could win! The winner&apos;s video will be shared on all the major Bright Trip accounts:
          Instagram Reels, TikTok, and YouTube Shorts, along with other prizes (see below).
        </p>
      </SectionWithMargin>
      <SectionWithMargin>
        <h2 className="text-headline5 font-bold mb-2">How to participate</h2>
        <h3 className="text-headline6 font-bold mb-2 mt-6">Requirements</h3>
        <ul className="list-disc ml-4 space-y-2 mb-8 font-bodycopy text-lg text-gray-700 dark:text-white/70">
          <li>Must be no more than 60 seconds</li>
          <li>Must be portrait/vertical format (9:16 aspect ratio)</li>
          <li>Must be about your own town or somewhere you&apos;ve personally travelled to</li>
          <li>Must be in English</li>
          <li>
            Must use a song from{' '}
            <a
              href="https://www.musicbed.com/bright-trip-challenge-2023"
              target="_blank"
              rel="noopener"
              className="underline text-bt-teal dark:text-bt-teal-light font-bold"
            >
              this FREE Musicbed playlist
            </a>{' '}
          </li>
          <li>
            Post as an Instagram Reel, TikTok, or YouTube Short and include the hashtag{' '}
            <span className="text-bt-teal dark:text-bt-teal-light font-bold">#BrightTripMusicbedChallenge</span>
          </li>
          <li>Tag Bright Trip and Musicbed in your post</li>
          <li>You must be at least 18 years of age to be eligible for the contest</li>
          <li>Make sure to post before July 1, 2023 at noon central US time</li>
        </ul>
        <h3 className="text-headline6 font-bold">Other Considerations</h3>
        <ul className="list-disc ml-4 space-y-2 my-4 font-bodycopy text-lg">
          <li>You can shoot with any device, no need for a fancy camera</li>
          <li>There are no regional restrictions, so the contest is open to anyone from anywhere</li>
        </ul>
        <h3 className="text-headline6 font-bold mt-8">Here&apos;s some inspiration</h3>
        <div className="grid md:grid-cols-2 gap-6 place-items-center bg-bt-teal-ultraLight/20 p-4 rounded-2xl mt-2 mb-8 shadow">
          <p className="font-bodycopy text-xl text-black/60 dark:text-white/60 leading-relaxed px-4">
            David from our directorial team recently travelled to Mexico City and created this shortform video about the
            city&apos;s delicious food, hosted by Manuel — a local creator.
          </p>
          {exampleToken && exampleVid && (
            <div className="rounded-xl overflow-hidden leading-[0]">
              <VideoPlayer muxToken={exampleToken} muxVideo={exampleVid} />
            </div>
          )}
        </div>
        <h3 className="text-headline6 font-bold">Here&apos;s some guidance</h3>
        <div className="grid gap-6 place-items-center bg-bt-teal-ultraLight/20 p-4 rounded-2xl mt-2 mb-8 shadow">
          <p className="font-bodycopy text-xl p-4 text-black/60 dark:text-white/70">
            Daniel from our directorial team made a quick video that should help you make your video the best it can be
          </p>
          {howToToken && howToVid && (
            <div className="rounded-xl overflow-hidden leading-[0]">
              <VideoPlayer muxToken={howToToken} muxVideo={howToVid} />
            </div>
          )}
        </div>
      </SectionWithMargin>
      <SectionWithMargin>
        <h2 className="text-headline5 font-bold mb-2">Prizes</h2>
        <h3 className="text-headline6 font-bold mt-6">Winner</h3>
        <ul className="list-disc ml-4 space-y-2 my-4 font-bodycopy text-lg text-gray-700 dark:text-white/70">
          <li>Your video will be reposted on Bright Trip&apos;s Instagram, TikTok, and YouTube shorts accounts</li>
          <li>
            You&apos;ll get two 30-minute mentorship calls with a member of the Bright Trip directorial team to help you
            on your creator journey.
          </li>
          <li>Free access for one-year to a Bright Trip subscription, valued at $60</li>
          <li>A free one-year Musicbed Personal subscription, valued at $360</li>
        </ul>
        <h3 className="text-headline6 font-bold mt-6">Runners Up</h3>
        <ul className="list-disc ml-4 space-y-2 my-4 font-bodycopy text-lg text-gray-700 dark:text-white/70">
          <li>Free access for one-year to a Bright Trip subscription, valued at $60</li>
          <li>A free one-year Musicbed Personal subscription, valued at $360</li>
        </ul>
      </SectionWithMargin>
      <SectionWithMargin className="bg-bt-teal-ultraLight/20 p-8 rounded-2xl mt-20">
        <h2 className="text-headline5 font-bold mb-3">Terms & Conditions</h2>
        <div className="font-bodycopy text-sm text-gray-600 dark:text-white/60 space-y-3">
          <p>Musicbed BrightTrip Short Video Challenge 2023</p>
          <p>
            The promoter is: The Music Bed, LLC, whose registered office is at 9555 Harmon Rd, Fort Worth Texas, 76177
            and Bright Trip 4037 Rural Plains Cir, Franklin, TN 37064, United States
          </p>
          <p>
            Employees of The Music Bed LLC—, Bright Trip Inc and their family members or anyone else directly connected
            to The Music Bed LLC Bright Trip Inc—shall not be permitted to enter Musicbed BrightTrip Short Video
            Challenge 2023.
          </p>
          <p>
            There is no submission fee. No purchase necessary to enter Musicbed BrightTrip Short Video Challenge 2023.
          </p>
          <p>
            The closing date for contest submission will be noon CT, July 01, 2023. No submissions to the competition
            will be permitted following this date and time.
          </p>
          <p>
            The Music Bed, LLC and Bright Trip, Inc. accepts no responsibility for entries not received for any reason.
          </p>
          <p>
            The promoter reserves the right to cancel or amend the competition or its terms and conditions without
            notice in the event of a catastrophe, war, civil or military disturbance, act of God, any actual or
            anticipated breach of any applicable law or regulation, or any other event outside of the promoter&apos;s
            control. Title promoter will notify entrants of any changes to the competition as soon as possible.
          </p>
          <p>
            The promoter is not responsible for inaccurate prize details supplied to any entrant by any third party
            connected to this competition.
          </p>
          <p>
            No cash alternative to the prizes will be offered. The prizes are non-transferable. Prizes are subject to
            availability, and the promoter reserves the right to amend any prize package without notice. Category award
            winners will be chosen by the judging panel. The Audience Selection award winner will be chosen by the
            number of votes.
          </p>
          <p>
            The winners will be notified by email and/or letter within 14 days of the winner-announcement date. If the
            winner(s) cannot be contacted or do not claim their prize within 48 hours of notification, the promoter
            reserves the right to withdraw the prize from the winners and pick replacement winners.
          </p>
          <p>
            The promoter will notify the winner when and where the prizes can be collected. All prizes will be subject
            to relevant customs processes and procedures of the country where the winner is located.
          </p>
          <p>
            The promoter&apos;s decision, in respect of all matters to do with the competition, will be final, and no
            correspondence will be entered into.
          </p>
          <p>
            By entering this competition, the entrant agrees to be bound by these terms and conditions. By entering this
            competition, the entrant agrees to allow their final film to be covered, documented, and marketed by The
            Music Bed, LLC and Bright Trip, Inc.
          </p>
          <p>
            The competition and these terms and conditions will be governed by Texas law, and any disputes will be
            subject to the exclusive jurisdiction of the courts of Tarrant County, Texas.
          </p>
          <p>
            The winner agrees to the use of their name and image in any publicity material. Any personal data relating
            to the winner or any other entrants will be used solely in accordance with current U.S. data protection
            legislation and will not be disclosed to a third party without the entrant&apos;s prior consent.
          </p>
          <p>Entry into the competition will be deemed as acceptance of these terms and conditions.</p>
          <p>
            All winners will be responsible for their own taxes on any and all products won or rented. Winners outside
            of the US will not be eligible for any of the rental prizes.
          </p>
          <p>
            You are providing your information to The Music Bed, LLC and Bright Trip, Inc.; not to any other party. The
            information provided will be used in conjunction with the following Privacy Policy found at{' '}
            <a
              className="text-bt-teal dark:text-bt-teal-light underline"
              href="https://www.musicbed.com/privacy-policy"
            >
              musicbed.com/privacy-policy
            </a>{' '}
            and Bright Trip{' '}
            <a
              className="text-bt-teal dark:text-bt-teal-light underline"
              href="https://www.brighttrip.com/privacy-policy"
            >
              brighttrip.com/privacy-policy
            </a>
          </p>
          <p>
            All entries are subject to review by Musicbed & Bright Trip staff. Your film idea may not be considered if
            the text or images in your submission include inappropriate content such as, but not limited to, pornography
            or extreme violence.
          </p>
          <p>Winners are responsible for any duties or taxes imposed by their respective country.</p>
          <p>
            Winners are responsible for any shipping costs incurred. Entrants must obtain all permissions required if
            creating a film featuring or promoting an existing brand.
          </p>
          <p>Entrants must be 18 years of age to participate.</p>
        </div>
      </SectionWithMargin>
    </main>
  );
}
