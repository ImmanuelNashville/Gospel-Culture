import { GetStaticProps, GetStaticPaths } from 'next';
import { createClient } from 'contentful';
import { ContentfulPodcast } from '../../models/contentful'; // Adjust this import to match your model
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Helper function to get the Contentful client
const getContentfulClient = () => {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_KEY;

  if (!spaceId || !accessToken) {
    throw new Error("Missing Contentful environment variables.");
  }

  return createClient({
    space: spaceId,
    accessToken: accessToken,
  });
};

export const getStaticPaths: GetStaticPaths = async () => {
  const client = getContentfulClient();

  // Fetch all podcasts to get their IDs for dynamic routing
  const res = await client.getEntries({ content_type: 'podcast' });

  const paths = res.items.map((podcast) => ({
    params: { id: podcast.sys.id },
  }));

  return { paths, fallback: false }; // 'false' means 404 for non-existent paths
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params as { id: string }; // Get podcast ID from URL

  const client = getContentfulClient();

  try {
    const podcast = await client.getEntry(id);

    // Ensure the content type is 'podcast' and the required fields are present
    if (podcast.fields) {
      return {
        props: {
          podcast: podcast.fields as ContentfulPodcast['fields'],
        },
      };
    } else {
      return {
        props: { podcast: null },
      };
    }
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return { props: { podcast: null } };
  }
};

// pages/podcasts.tsx

const PodcastPage = ({ podcast }: { podcast: ContentfulPodcast['fields'] | null }) => {
  if (!podcast) {
    return <div className="text-center text-xl">Podcast not found</div>;
  }

  const { title, subtitle, subscribeLink, podcastCover } = podcast;

  // Render Subscribe Link and Cover Image
  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto p-6">
        <div className="p-8">
          {/* Podcast Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">{subtitle}</h2>
          </header>

          {/* Podcast Cover Image */}
          {podcastCover && podcastCover.fields.file.url && (
            <div className="mb-8">
              <img
                src={podcastCover.fields.file.url}
                alt={title}
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          )}

          {/* Render Subscribe Link */}
          {subscribeLink && (
            <div className="text-center">
              <a href={subscribeLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                Subscribe to Podcast
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PodcastPage;
