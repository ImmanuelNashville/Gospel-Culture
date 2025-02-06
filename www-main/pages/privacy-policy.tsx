import { Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Layout from '../components/Layout';
import contentfulClient from '../contentful/contentfulClient';
import { RichTextPageFields } from '../models/contentful';

import Text from '../components/Text';
import buildRichTextComponents from '../contentful/richTextComponents';

const PRIVACY_POLICY_ENTRY_ID = '6zxhUje2JrWuNnsxtB1hq9';

export const getStaticProps = async () => {
  const contentfulResponse = await contentfulClient.getEntry<RichTextPageFields>(PRIVACY_POLICY_ENTRY_ID);

  return {
    props: {
      content: contentfulResponse.fields.body,
    },
    revalidate: 60,
  };
};

export default function PrivacyPolicy({ content }: { content: Document }) {
  return (
    <Layout title="Privacy Policy" description="Bright Trip">
      <section className="text-sm mx-auto max-w-screen-md px-4 whitespace-pre-wrap">
        <Text As="h1" variant="sectionTitleUnderline" className="my-8 w-full text-center">
          Privacy Policy
        </Text>
        {documentToReactComponents(content, buildRichTextComponents())}
      </section>
    </Layout>
  );
}

PrivacyPolicy.Layout = Layout;
