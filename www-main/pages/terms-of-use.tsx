import { Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Tab } from '@headlessui/react';
import { Fragment } from 'react';
import Layout from '../components/Layout';
import Text from '../components/Text';
import contentfulClient from '../contentful/contentfulClient';
import { RichTextPageFields } from '../models/contentful';
import buildRichTextComponents from '../contentful/richTextComponents';

const MAKER_TERMS_OF_SERVICE_ENTRY_ID = '3bcYAMXhLZCg1e2HOLNpeK';
const STUDENT_TERMS_OF_SERVICE_ENTRY_ID = '6lifkWbNAX7awziI3t7hDL';

export const getStaticProps = async () => {
  const makerResponse = await contentfulClient.getEntry<RichTextPageFields>(MAKER_TERMS_OF_SERVICE_ENTRY_ID);
  const studentResponse = await contentfulClient.getEntry<RichTextPageFields>(STUDENT_TERMS_OF_SERVICE_ENTRY_ID);

  return {
    props: {
      makerContent: makerResponse.fields.body,
      studentContent: studentResponse.fields.body,
    },
    revalidate: 60,
  };
};

export default function TermsOfUse({
  makerContent,
  studentContent,
}: {
  makerContent: Document;
  studentContent: Document;
}) {
  return (
    <Layout title="Terms of Use" description="Bright Trip">
      <Tab.Group>
        <Tab.List className="flex justify-center">
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`${
                  selected
                    ? `border-bt-orange text-gray-900 dark:text-gray-100`
                    : `border-white text-gray-500 dark:border-gray-800`
                } mb-6 border-b-4 px-8 py-4`}
              >
                <Text variant="headline6">Student</Text>
              </button>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`${
                  selected
                    ? `border-bt-orange text-gray-900 dark:text-gray-100`
                    : `border-white text-gray-500 dark:border-gray-800`
                } mb-6 border-b-4 px-8 py-4`}
              >
                <Text variant="headline6">Maker</Text>
              </button>
            )}
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className="mx-auto max-w-screen-md">
            {documentToReactComponents(studentContent, buildRichTextComponents())}
          </Tab.Panel>
          <Tab.Panel className="mx-auto max-w-screen-md">
            {documentToReactComponents(makerContent, buildRichTextComponents())}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </Layout>
  );
}
