import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import AvatarPlaceholder from '../../components/AvatarPlaceholder';

interface Contributor {
  name: string;
  entryTitle: string;
  link: string;
  imagePath: string;
}

const MeetContributorCard: FC<{ contributor: Contributor }> = ({ contributor }) => {
  return (
    <div className="flex flex-col items-center text-white shadow-md bg-white/10 p-8 rounded-2xl">
      <div className="h-24 w-24 rounded-full shadow-md overflow-hidden relative">
        {contributor.imagePath ? (
          <Image 
            src={contributor.imagePath} 
            alt={contributor.name} 
            fill 
            className="object-cover" 
          />
        ) : (
          <AvatarPlaceholder widthHeight="w-24 h-24" />
        )}
      </div>
      <Link href={`/contributors/${contributor.link}`}>
        <h3 className="text-2xl font-bold hover:underline underline-offset-4 my-2 text-center">{contributor.name}</h3>
      </Link>
      <p className="text-lg text-white/80 text-center">{contributor.entryTitle}</p>
    </div>
  );
};

export default MeetContributorCard;
