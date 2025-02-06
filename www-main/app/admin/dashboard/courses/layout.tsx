import contentfulClient from 'contentful/contentfulClient';
import { ContentfulCourseFields } from 'models/contentful';
import Link from 'next/link';
import { ReactNode } from 'react';
import LinkList from '../components/LinkList';
import type { LinkData } from '../components/types';

async function generateCourseLinks() {
  // get all the published courses from contentful
  const { items: courses } = await contentfulClient.getEntries<Pick<ContentfulCourseFields, 'title'>>({
    content_type: 'course',
    select: 'sys.id,fields.title',
  });

  // construct links so we can display them in the UI
  const links: LinkData[] = courses.map((course) => ({
    label: course.fields.title,
    href: `/admin/dashboard/courses/${course.sys.id}`,
  }));

  // sort alphabetically by course title
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

async function CoursesDashboardLayout({ children }: { children: ReactNode }) {
  const courseLinks = await generateCourseLinks();
  return (
    <div className="grid grid-cols-3 gap-4 items-start">
      <div className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 max-h-fit">
        <LinkList title="Courses" links={courseLinks} param="courseId" />
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

export default CoursesDashboardLayout;
