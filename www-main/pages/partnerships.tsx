import Layout, { DEFAULT_OPEN_GRAPH } from '../components/Layout';
import contentfulClient from '../contentful/contentfulClient';
import { ContentfulMuxVideoFields, RichTextPageFields } from '../models/contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import buildRichTextComponents from '../contentful/richTextComponents';
import { InferGetStaticPropsType } from 'next';
import { Entry } from 'contentful';
import { getMuxVideoTokenForSignedPlaybackId, MuxToken } from '../utils/tokens';

export async function getStaticProps() {
  const PAGE_ID = '5GLRcWKA6dqNi7GvYPVofu';

  const response = await contentfulClient.getEntry<RichTextPageFields>(PAGE_ID, { include: 10 });

  const videosInPage: Entry<ContentfulMuxVideoFields>[] = response.fields.body.content
    .map((item) => item.data.target?.fields.video)
    .filter(Boolean);

  const tokens = videosInPage.reduce((all, video) => {
    const muxVid = video?.fields.video ?? '';
    const { signedPlaybackId = '' } = muxVid || {};
    all[signedPlaybackId] = getMuxVideoTokenForSignedPlaybackId(signedPlaybackId);
    return all;
  }, {} as Record<string, MuxToken>);

  return {
    props: {
      content: response.fields.body,
      tokens,
    },
    revalidate: 60,
  };
}

const Partnerships = ({ content, tokens }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const richTextComponents = buildRichTextComponents(tokens);

  return (
    <Layout
      title="Partnerships"
      description="Bright Trip"
      fullBleed
      openGraph={{
        ...DEFAULT_OPEN_GRAPH,
        description:
          'Whether you are a destination marketing organization, airline, hotel chain, travel insurance or any other form of travel brand, Bright Trip can be the solution for you.',
      }}
    >
      {documentToReactComponents(content, richTextComponents)}
    </Layout>
  );
};

export default Partnerships;
