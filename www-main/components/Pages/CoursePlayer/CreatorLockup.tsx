import { Entry } from 'contentful';
import Image from 'next/image';
import Link from 'next/link';
import { ContentfulCreatorFields } from '../../../models/contentful';
import { contentfulImageLoader } from '../../../utils/contentfulImageLoader';

export default function CreatorLockup({ creator }: { creator: Entry<ContentfulCreatorFields> }) {
  return (
    <div className="group mt-1 md:mt-5 flex items-center gap-1.5 md:gap-3 mb-1">
      {creator.fields.profilePhoto && (
        <div className="relative h-5 w-5 md:h-8 md:w-8 rounded-full overflow-hidden">
          <Image
            src={creator.fields.profilePhoto?.fields.file.url}
            alt={creator.fields.name}
            width={160}
            height={160}
            loader={contentfulImageLoader}
          />
        </div>
      )}
      <Link href={`/creators/${creator.fields.slug}`}>
        <span className="hover:underline text-bodySmall font-bodycopy text-bt-teal dark:text-bt-teal-light md:text-body">
          {creator.fields.name}
        </span>
      </Link>
    </div>
  );
}
