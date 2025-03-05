import { GetStaticProps, GetStaticPaths } from 'next';
import { createClient } from 'contentful';
import { ContentfulSermonFields } from '../../models/contentful';
import { ContentfulSermon } from '../../models/contentful';
import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import { BLOCKS, Block, Inline, Document } from '@contentful/rich-text-types'; // Added Document import
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const getContentfulClient = () => {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_KEY;

  if (!spaceId || !accessToken) {
    throw new Error('Missing Contentful environment variables.');
  }

  return createClient({
    space: spaceId,
    accessToken: accessToken,
  });
};

export const getStaticPaths: GetStaticPaths = async () => {
  const client = getContentfulClient();
  const res = await client.getEntries({ content_type: 'sermon' });

  const paths = res.items.map((sermon) => ({
    params: { id: sermon.sys.id.toString() },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params as { id: string };
  const client = getContentfulClient();

  try {
    const sermon = await client.getEntry(id);
    console.log('Raw sermon fields:', sermon.fields); // Optional: keep for debugging
    if (sermon.fields) {
      return {
        props: {
          sermon: sermon.fields as ContentfulSermon['fields'],
        },
      };
    } else {
      return {
        props: { sermon: null },
      };
    }
  } catch (error) {
    console.error('Error fetching sermon:', error);
    return { props: { sermon: null } };
  }
};

const getYouTubeEmbedUrl = (url: string | undefined) => {
  if (!url) return null;
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be|youtube\.com\/embed\/)([^&?]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const SermonPage = ({ sermon }: { sermon: ContentfulSermonFields | null }) => {
  if (!sermon) {
    return <div className="text-center text-xl">Sermon not found</div>;
  }

  const {
    title,
    shortText,
    slug,
    ytSermonSHORT,
    reference,
    description,
    relatedItemsLabel,
    relatedItems,
    customThumbnail,
  } = sermon;

  const youtubeEmbedUrl = getYouTubeEmbedUrl(ytSermonSHORT);

  // Rendering options for rich text with proper typing
  const renderOptions: Options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node: Block | Inline, children: React.ReactNode) => <p className="mb-4">{children}</p>,
      [BLOCKS.HEADING_1]: (node: Block | Inline, children: React.ReactNode) => <h1 className="text-3xl font-bold mt-6">{children}</h1>,
      [BLOCKS.HEADING_2]: (node: Block | Inline, children: React.ReactNode) => <h2 className="text-2xl font-semibold mt-4">{children}</h2>,
    },
  };

  // Render description as rich text
  let renderedDescription = null;
  if (description && 'nodeType' in description && description.nodeType === 'document') {
    renderedDescription = documentToReactComponents(description as Document, renderOptions);
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-6">
        <div className="p-8">
          <header className="text-center mb-8">
            {reference && (
              <p className="text-base text-gray-500 mb-4">Reference: {reference}</p>
            )}
            <h1 className="text-5xl font-bold text-gray-800 mb-2">{title}</h1>
            {shortText && (
              <p className="text-3xl font-semibold text-gray-600 mb-4">{shortText}</p>
            )}
          </header>

          {/* YouTube Video */}
          <div className="mb-8">
            {youtubeEmbedUrl ? (
              <div className="relative w-full h-0 pb-[56.25%]">
                <iframe
                  src={youtubeEmbedUrl}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
                ></iframe>
              </div>
            ) : customThumbnail?.fields?.file?.url ? (
              <img
                src={`https:${customThumbnail.fields.file.url}`}
                alt={title}
                className="w-full h-auto max-h-[400px] object-cover rounded-lg shadow-md"
              />
            ) : (
              <p className="text-gray-500">No video or thumbnail available for this sermon.</p>
            )}
          </div>

          <section className="prose prose-base md:prose-lg lg:prose-xl max-w-[700px] mx-auto text-gray-800">
           

            {/* Description under video */}
            {renderedDescription && <div className="mb-6">{renderedDescription}</div>}

            {relatedItemsLabel && (
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">{relatedItemsLabel}</h3>
            )}
            {relatedItems && relatedItems.length > 0 && (
              <ul className="list-disc pl-6 mb-6">
                {relatedItems.map((item) => (
                  <li key={item.sys.id}>{item.fields.title}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SermonPage;