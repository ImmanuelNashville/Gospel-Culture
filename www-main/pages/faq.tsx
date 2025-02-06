import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/outline';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Layout from '../components/Layout';
import contentfulClient from '../contentful/contentfulClient';
import { FAQ, ContentfulFAQFields } from '../models/contentful';

import styles from '../styles/FAQ.module.css';
import buildRichTextComponents from '../contentful/richTextComponents';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function FaqPage({ faqs }: { faqs: FAQ[] }) {
  const richTextComponents = buildRichTextComponents();

  return (
    <Layout title="FAQ" description="Bright Trip">
      <div className={styles.faq}>
        <div className="mx-auto max-w-7xl py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold w-full text-center dark:text-gray-200">Frequently Asked Questions</h1>
            <dl className="mt-8 space-y-6 divide-y divide-gray-200 bg-bt-background-light dark:bg-gray-800 p-8 pt-0 rounded-lg shadow-md dark:divide-gray-700">
              {faqs.map((faq) => (
                <Disclosure as="div" key={faq.fields.question} className="pt-6">
                  {({ open }) => (
                    <>
                      <dt className="text-lg">
                        <Disclosure.Button className="flex w-full items-center justify-between text-left text-gray-800 dark:text-gray-200">
                          <h2 className="text-lg font-bold dark:text-gray-200">{faq.fields.question}</h2>
                          <span className="ml-6 flex h-7 items-center">
                            <ChevronRightIcon
                              className={classNames(open ? 'rotate-90' : 'rotate-0', 'h-6 w-6 transform')}
                              aria-hidden="true"
                            />
                          </span>
                        </Disclosure.Button>
                      </dt>
                      <Disclosure.Panel
                        as="dd"
                        className="mt-2 pr-12 font-bodycopy text-body leading-relaxed text-gray-500 dark:text-gray-400"
                      >
                        {documentToReactComponents(faq.fields.answer, richTextComponents)}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const response = await contentfulClient.getEntries<ContentfulFAQFields>({
    content_type: 'faq',
    order: 'sys.createdAt',
  });

  if (!response.items) {
    return {
      redirect: '/',
      permanent: false,
    };
  }

  return {
    props: {
      faqs: response.items,
    },
    revalidate: 60,
  };
}
