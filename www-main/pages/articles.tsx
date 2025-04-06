import { GetStaticProps } from 'next';
import { createClient } from 'contentful';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionWithMargin from '../components/PageSections/SectionWithMargin';
import SimpleCard from '../components/Card/SimpleCard'; // updated import

export const getStaticProps: GetStaticProps = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  const getAssetUrl = (asset: any) => {
    if (!asset?.fields?.file?.url) return '/placeholder.png';
    return asset.fields.file.url.startsWith('//') ? `https:${asset.fields.file.url}` : asset.fields.file.url;
  };

  const articles = await client.getEntries({ content_type: 'article', limit: 100 });

  const articleItems = articles.items.map((item: any) => ({
    title: item.fields.title || 'Untitled Article',
    link: `/articles/${item.sys.id}`,
    imageUrl: item.fields.images?.[0] ? getAssetUrl(item.fields.images[0]) : '/placeholder.png',
    sys: item.sys,
  }));

  return {
    props: {
      articleItems,
    },
    revalidate: 300,
  };
};

const ArticlesPage = ({ articleItems }: { articleItems: any[] }) => {
  return (
    <div>
      <Navbar />
      <main className="w-full">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Articles</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articleItems.map((article) => (
              <SimpleCard
                key={article.sys.id}
                title={article.title}
                link={article.link}
                imageUrl={article.imageUrl}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticlesPage;
