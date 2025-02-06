import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { Creator } from '../models/contentful';
import { contentfulImageLoader } from '../utils/contentfulImageLoader';
import { buildSocialLinks } from '../utils/creators';
import AvatarPlaceholder from './AvatarPlaceholder';
import SocialLinks from './SocialLinks';

const CreatorCard: FC<{ creator?: Creator; partner?: 'naro.tv' }> = ({ creator }) => {
  return (
    <div className="flex flex-col-reverse md:grid md:grid-cols-2 text-white place-items-center md:gap-12 shadow-md md:shadow-none mt-10">
      <div className="flex flex-col items-center md:shadow-md backdrop-blur-lg bg-white/10 p-12 rounded-b-2xl md:rounded-2xl">
        {creator?.fields.profilePhoto?.fields.file.url ? (
          <div className="h-16 w-16 rounded-full shadow-md overflow-hidden">
            <Image
              src={creator.fields.profilePhoto.fields.file.url}
              alt={creator.fields.name}
              width="64"
              height="64"
              sizes="128px"
              loader={contentfulImageLoader}
            />
          </div>
        ) : (
          <AvatarPlaceholder widthHeight="w-16 h-16" />
        )}
        <Link href={`/creators/${creator?.fields.slug ?? ''}`}>
          <h3 className="text-2xl font-bold hover:underline underline-offset-4 my-2">
            {creator?.fields.name ?? 'Unknown Creator'}
          </h3>
        </Link>
        <p className="text-lg font-bodycopy leading-relaxed text-left text-white/80 mt-1 mb-8">
          {creator?.fields.bio ?? 'More info coming soon'}
        </p>
        {creator && <SocialLinks links={buildSocialLinks(creator)} className="text-white/80 hover:text-white" />}
      </div>
      <div className="rounded-t-2xl md:rounded-2xl md:drop-shadow-md relative w-full h-full min-h-[360px] overflow-hidden">
        <Image
          src={creator?.fields?.hero?.fields.file.url ?? ''}
          className="object-cover absolute inset-0 bg-center"
          fill
          alt={creator?.fields.name ?? 'Creator profile photo'}
          sizes="40vw, 600px"
          loader={contentfulImageLoader}
        />
      </div>
    </div>
  );
};

export default CreatorCard;
