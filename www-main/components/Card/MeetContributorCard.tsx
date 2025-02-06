import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import AvatarPlaceholder from '../../components/AvatarPlaceholder';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

interface Contributor {
  name: string;
  entryTitle: string;
  link: string;
  bio: string;
  imagePath: string;
  heroImagePath: string;
  oneLineBio: string;
  socialLinks?: any;
}

const MeetContributorCard: FC<{ contributor: Contributor }> = ({ contributor }) => {
  return (
    <div className="flex flex-col-reverse md:grid md:grid-cols-1 text-white place-items-center md:gap-12 shadow-md md:shadow-none mt-10">
      <div className="flex flex-col items-center md:shadow-md backdrop-blur-lg bg-white/10 p-12 rounded-b-2xl md:rounded-2xl">
        {contributor.imagePath ? (
          <div className="h-16 w-16 rounded-full shadow-md overflow-hidden">
            <Image src={contributor.imagePath} alt={contributor.name} width={64} height={64} sizes="128px" />
          </div>
        ) : (
          <AvatarPlaceholder widthHeight="w-16 h-16" />
        )}
        <Link href={`/contributors/${contributor.link}`}>
          <h3 className="text-2xl font-bold hover:underline underline-offset-4 my-2">{contributor.name}</h3>
        </Link>
        <p className="text-lg font-bodycopy leading-relaxed text-left text-white/80 mt-1 mb-4">
          {contributor.oneLineBio || 'More info coming soon'}
        </p>
        {contributor.socialLinks && (
          <div className="text-white/80 hover:text-white">{documentToReactComponents(contributor.socialLinks)}</div>
        )}
      </div>
    </div>
  );
};

export default MeetContributorCard;
