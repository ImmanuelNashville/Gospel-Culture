import { GetStaticProps, GetStaticPaths } from 'next';
import { createClient } from 'contentful';
import { ContentfulArticle } from '../../models/contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Helper function to get Contentful client
const getContentfulClient = () => {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_KEY;

  if (!spaceId || !accessToken) {
    console.error("Missing Contentful environment variables.");
    throw new Error("Missing Contentful environment variables.");
  }

  return createClient({
    space: spaceId,
    accessToken: accessToken,
  });
};

export const getStaticPaths: GetStaticPaths = async () => {
  const client = getContentfulClient();
  try {
    const res = await client.getEntries({ content_type: 'article' });
    console.log('getStaticPaths - Total articles fetched:', res.items.length);
    res.items.forEach((article) => console.log('Article ID:', article.sys.id));

    const paths = res.items.map((article) => ({
      params: { id: article.sys.id },
    }));

    return { paths, fallback: false };
  } catch (error) {
    console.error('getStaticPaths error:', error);
    return { paths: [], fallback: false };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params as { id: string };
  console.log('getStaticProps - Fetching article with ID:', id);
  const client = getContentfulClient();

  try {
    const article = await client.getEntry(id);
    const typedArticle = article as { fields: ContentfulArticle['fields'] };
    console.log('Fetched article fields:', JSON.stringify(typedArticle.fields, null, 2));

    return {
      props: { article: typedArticle.fields },
    };
  } catch (error) {
    console.error('Error fetching article with ID', id, ':', error);
    return { props: { article: null } };
  }
};

interface ArticlePageProps {
  article: ContentfulArticle['fields'] | null;
}

const ArticlePage = ({ article }: ArticlePageProps) => {
  console.log('Article prop in component:', article);
  if (!article) {
    return <div className="text-center text-xl">Article not found</div>;
  }

  const { title, subtitle, datePublished, text: articleText, images } = article; // Renamed to 'text'

  const options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => <p className="mb-4">{children}</p>,
      [BLOCKS.HEADING_1]: (node, children) => <h1 className="text-3xl font-bold mt-6">{children}</h1>,
      [BLOCKS.HEADING_2]: (node, children) => <h2 className="text-2xl font-semibold mt-4">{children}</h2>,
      [BLOCKS.UL_LIST]: (node, children) => <ul className="list-disc pl-6">{children}</ul>,
      [BLOCKS.OL_LIST]: (node, children) => <ol className="list-decimal pl-6">{children}</ol>,
      [BLOCKS.QUOTE]: (node, children) => <blockquote className="border-l-4 pl-4 italic text-gray-600">{children}</blockquote>,
      [INLINES.HYPERLINK]: (node, children) => (
        <a href={node.data.uri} className="text-blue-600 underline">
          {children}
        </a>
      ),
    },
  };

  let renderedArticleText;
  try {
    if (articleText && 'nodeType' in articleText && articleText.nodeType === 'document') {
      renderedArticleText = documentToReactComponents(articleText, options);
    } else {
      console.log('text field is not a valid rich text document:', articleText);
      renderedArticleText = <p>No article content available.</p>;
    }
  } catch (error) {
    console.error('Error rendering rich text:', error);
    renderedArticleText = <p>Error rendering article content.</p>;
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto p-6">
        <div className="p-8">
          <header className="text-center mb-8">
            <p className="text-sm text-gray-500">
              {datePublished ? new Date(datePublished).toLocaleDateString() : 'Date not available'}
            </p>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">{subtitle}</h2>
          </header>

          {images?.length > 0 && (
            <div className="mb-8">
              <img
                src={images[0].fields.file.url}
                alt={title}
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          )}

          <section className="prose lg:prose-xl max-w-[700px] mx-auto text-gray-800">
            <div>{renderedArticleText}</div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticlePage;