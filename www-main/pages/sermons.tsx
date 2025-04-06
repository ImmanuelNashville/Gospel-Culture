import { GetStaticProps } from 'next';
import { createClient } from 'contentful';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SimpleCard from '../components/Card/SimpleCard';

export const getStaticProps: GetStaticProps = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  const getAssetUrl = (asset: any) => {
    if (!asset?.fields?.file?.url) return '/placeholder.png';
    return asset.fields.file.url.startsWith('//')
      ? `https:${asset.fields.file.url}`
      : asset.fields.file.url;
  };

  const sermons = await client.getEntries({ content_type: 'sermon', limit: 100 });

  const sermonItems = sermons.items.map((item: any) => ({
    title: item.fields.title || 'Untitled Sermon',
    link: `/sermons/${item.sys.id}`,
    imageUrl: item.fields.customThumbnail ? getAssetUrl(item.fields.customThumbnail) : '/placeholder.png',
    customThumbnailUrl: item.fields.customThumbnail ? getAssetUrl(item.fields.customThumbnail) : undefined,
    sys: item.sys,
  }));

  return {
    props: {
      sermonItems,
    },
    revalidate: 300,
  };
};

const SermonsPage = ({ sermonItems }: { sermonItems: any[] }) => {
  return (
    <div>
      <Navbar />
      <main className="w-full">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Sermons</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sermonItems.map((sermon) => (
              <SimpleCard
                key={sermon.sys.id}
                title={sermon.title}
                link={sermon.link}
                imageUrl={sermon.imageUrl}
                customThumbnailUrl={sermon.customThumbnailUrl}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SermonsPage;
