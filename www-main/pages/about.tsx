import Layout from '../components/Layout';
import contentfulClient from '../contentful/contentfulClient';
import { ContentfulMuxVideoFields, RichTextPageFields } from '../models/contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import buildRichTextComponents from '../contentful/richTextComponents';
import { InferGetStaticPropsType } from 'next';
import { Entry } from 'contentful';
import { getMuxVideoTokenForSignedPlaybackId, MuxToken } from '../utils/tokens';

export async function getStaticProps() {
  const ABOUT_PAGE_ID = '2o7Yg7y1ubpf3gpVL9TrM4';

  const response = await contentfulClient.getEntry<RichTextPageFields>(ABOUT_PAGE_ID, { include: 10 });

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

const About = ({ content, tokens }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const richTextComponents = buildRichTextComponents(tokens);

  return (
    <Layout title="About" description="Bright Trip" fullBleed>
      {documentToReactComponents(content, richTextComponents)}
    </Layout>
  );
};

export default About;
