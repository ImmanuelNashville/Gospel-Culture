import contentfulClient from 'contentful/contentfulClient';
import { ContentfulCreatorFields } from 'models/contentful';
import Link from 'next/link';
import { ReactNode } from 'react';
import LinkList from '../components/LinkList';
import type { LinkData } from '../components/types';

async function generateCreatorLinks() {
  // get all the published courses from contentful
  const { items: creators } = await contentfulClient.getEntries<Pick<ContentfulCreatorFields, 'name'>>({
    content_type: 'creator',
    select: 'sys.id,fields.name',
  });

  // construct links so we can display them in the UI
  const links: LinkData[] = creators.map((creator) => ({
    label: creator.fields.name.trim(),
    href: `/admin/dashboard/creators/${creator.sys.id}`,
  }));

  // sort alphabetically by creator name
  links.sort((a, b) => {
    if (a.label > b.label) {
      return 1;
    } else if (a.label < b.label) {
      return -1;
    }
    return 0;
  });

  return links;
}

async function CreatorDashboardLayout({ children }: { children: ReactNode }) {
  const creatorLinks = await generateCreatorLinks();
  return (
    <div className="grid grid-cols-3 gap-4 items-start">
      <div className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 max-h-fit">
        <LinkList title="Creators" links={creatorLinks} param="creatorId" />
        <div className="mt-8">
          <Link href="/admin/dashboard" className="text-bt-teal hover:underline">
            &larr; Back
          </Link>
        </div>
      </div>
      <div className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6">{children}</div>
    </div>
  );
}

export default CreatorDashboardLayout;
