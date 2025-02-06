/* eslint-disable react/display-name */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck because contentful is wild
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';

import { Entry } from 'contentful';
import { ContentfulImageFields, ContentfulMuxVideoFields } from '../models/contentful';

import Image from 'next/image';
import VideoPlayer from '../components/VideoPlayer';
import styles from '../styles/RichText.module.css';
import { contentfulImageLoader } from '../utils/contentfulImageLoader';

const buildRichTextComponents = (tokens?: Record<string, { video: string; thumbnail: string }>) => ({
  renderNode: {
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (_node, children) => (
      <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">{children}</h4>
    ),
    [BLOCKS.PARAGRAPH]: (_node, children) => (
      <p className="py-2 font-bodycopy text-gray-600 dark:text-gray-300">{children}</p>
    ),
    [BLOCKS.HR]: () => <hr />,
    [BLOCKS.UL_LIST]: (_node, children) => <ul className="ml-6 list-disc py-1">{children}</ul>,
    [BLOCKS.OL_LIST]: (_node, children) => <ol className="ml-6 list-decimal py-1">{children}</ol>,
    [BLOCKS.LIST_ITEM]: (_node, children) => <li>{children}</li>,
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        className="text-bt-teal hover:text-bt-teal-dark hover:underline dark:text-bt-teal-light dark:hover:text-bt-teal-ultraLight"
        href={node.data.uri}
      >
        {children}
      </a>
    ),
    [BLOCKS.EMBEDDED_ENTRY]: (node) => {
      const mediaLocation = node.data.target.fields.mediaLocation ?? 'left';
      const image = node.data.target.fields.image as Entry<ContentfulImageFields>;
      const imageDimensions = image?.fields.file.details.image;
      const rawRatio = imageDimensions?.width / imageDimensions?.height;
      const imageRatio = isNaN(rawRatio) ? 1 : rawRatio;

      const video = node.data.target.fields.video as Entry<ContentfulMuxVideoFields>;
      const videoSignedPlaybackId = video?.fields.video.signedPlaybackId;

      const renderImage = () => (
        <Image
          src={node.data.target.fields.image.fields.file.url}
          alt=""
          width="600"
          height={600 / imageRatio}
          className="rounded-lg"
          sizes="100vw"
          loader={contentfulImageLoader}
        />
      );

      const renderVideo = () => {
        if (!tokens || !video) return null;
        return (
          <div className="overflow-hidden rounded-md leading-[0]">
            <VideoPlayer muxToken={tokens[videoSignedPlaybackId]} muxVideo={video} />
          </div>
        );
      };

      if (!image && !video) {
        return (
          <div className={`${styles.pageSection}`}>
            <div className="mx-auto max-w-screen-xl text-center p-8">
              {documentToReactComponents(node.data.target.fields.copy, buildRichTextComponents())}
            </div>
          </div>
        );
      }

      return (
        <div className={`${styles.pageSection}`}>
          <div className="mx-auto max-w-screen-xl grid-cols-5 items-center px-8 py-12 lg:grid">
            {mediaLocation === 'left' && (
              <div className="col-span-3">
                {image && !video && renderImage()}
                {video && !image && renderVideo()}
              </div>
            )}
            <div className={`${mediaLocation == 'center' ? 'col-span-5 text-center' : 'col-span-2'}`}>
              {documentToReactComponents(node.data.target.fields.copy, buildRichTextComponents())}
            </div>
            {mediaLocation === 'center' && (
              <div className="col-span-5 flex justify-center">
                {image && !video && renderImage()}
                {video && !image && renderVideo()}
              </div>
            )}
            {mediaLocation === 'right' && (
              <div className="col-span-3">
                {image && !video && renderImage()}
                {video && !image && renderVideo()}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  renderMark: {
    [MARKS.BOLD]: (text) => <strong className="font-bold">{text}</strong>,
    [MARKS.ITALIC]: (text) => <span className="italic">{text}</span>,
  },
});

export default buildRichTextComponents;
