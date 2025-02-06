import { GetStaticProps } from 'next';
import { createClient } from 'contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { ContentfulPodcast } from '../models/contentful';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const getStaticProps: GetStaticProps = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  const res = await client.getEntries({ content_type: 'podcast' });

  return {
    props: {
      podcasts: res.items.map((podcast) => podcast.fields) as ContentfulPodcast['fields'][],
    },
  };
};

// Function to extract the first hyperlink from rich text
const getSubscribeUrl = (subscribeLink: any) => {
  if (!subscribeLink) return null;

  const hyperlinks: string[] = [];
  const extractLinks = (node: any) => {
    if (node.nodeType === INLINES.HYPERLINK) {
      hyperlinks.push(node.data.uri);
    }
    if (node.content) {
      node.content.forEach(extractLinks);
    }
  };

  extractLinks(subscribeLink);

  return hyperlinks.length > 0 ? hyperlinks[0] : null;
};

const PodcastsPage = ({ podcasts }: { podcasts: ContentfulPodcast['fields'][] }) => {
  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-5xl font-bold mb-8">Podcasts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {podcasts.map((podcast, index) => {
            const subscribeUrl = getSubscribeUrl(podcast.subscribeLink);
            return (
              <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden">
                {podcast.podcastCover?.fields.file.url && (
                  <img
                    src={podcast.podcastCover.fields.file.url}
                    alt={podcast.title}
                    className="w-full h-100 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{podcast.title}</h2>
                  <p className="text-gray-600">{podcast.subtitle}</p>

                  {/* Display "Subscribe" link if available */}
                  {subscribeUrl && (
                    <a
                      href={subscribeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block text-blue-600 font-bold"
                    >
                      Subscribe
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PodcastsPage;
