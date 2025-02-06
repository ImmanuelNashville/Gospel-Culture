import Image from 'next/image';
import Link from 'next/link';
import { contentfulImageLoader } from '../../../utils/contentfulImageLoader';
import Text from '../../Text';

export interface MeetCreatorData {
  creatorName: string;
  imagePath: string;
  slug: string;
}

export default function MeetCreatorCard({ creatorName, imagePath, slug }: MeetCreatorData) {
  return (
    <Link href={`/creators/${slug}`}>
      <div className="flex flex-col gap-2.5 shadow-md hover:shadow-2xl hover:scale-[103%] duration-200 rounded-lg overflow-hidden">
        <Image src={imagePath} width="384" height="512" alt={creatorName} loader={contentfulImageLoader} />
        <Text variant="subtitle1" className="sr-only">
          {creatorName}
        </Text>
      </div>
    </Link>
  );
}
