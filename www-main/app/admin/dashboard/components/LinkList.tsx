import LinkItem from './LinkItem';
import { LinkData } from './types';

export default function LinkList({ title, links, param }: { title: string; links: LinkData[]; param: string }) {
  return (
    <>
      <h2 className="text-headline6 font-bold mb-4 text-gray-900 dark:text-gray-200">{title}</h2>
      <ul className="my-2 mx-0">
        {links.map((link) => (
          <LinkItem key={link.href} link={link} param={param} />
        ))}
      </ul>
    </>
  );
}
