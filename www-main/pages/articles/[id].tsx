import { GetStaticProps, GetStaticPaths } from 'next';
import { createClient } from 'contentful';
import { ContentfulArticle } from '../../models/contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY,
  });

  // Fetch all articles to get their IDs for dynamic routing
  const res = await client.getEntries({ content_type: 'article' });

  const paths = res.items.map((article) => ({
    params: { id: article.sys.id },
  }));

  return { paths, fallback: false }; // 'false' means 404 for non-existent paths
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params as { id: string }; // Get article ID from URL
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  try {
    const article = await client.getEntry(id);

    // Type assertion for 'article' to let TypeScript know its shape
    const typedArticle = article as { fields: ContentfulArticle['fields'] };

    // Ensure the content type is 'article' and the articleText is present
    if (typedArticle.fields.articleText) {
      return {
        props: {
          article: typedArticle.fields, // Now this is correctly typed
        },
      };
    } else {
      return {
        props: { article: null },
      };
    }
  } catch (error) {
    console.error('Error fetching article:', error);
    return { props: { article: null } };
  }
};

interface ArticlePageProps {
  article: ContentfulArticle['fields'] | null;
}

const ArticlePage = ({ article }: ArticlePageProps) => {
  if (!article) {
    return <div className="text-center text-xl">Article not found</div>;
  }

  console.log('Article:', article); // Log the entire article to inspect its structure
  const { title, subtitle, datePublished, articleText, images } = article;

  // Check if articleText exists and if it's in rich text format
  let renderedArticleText = null;
  if (articleText && articleText.nodeType === 'document') {
    // If it's in rich text format, render it as React components
    try {
      renderedArticleText = documentToReactComponents(articleText);
    } catch (error) {
      console.error('Error rendering article text:', error);
      renderedArticleText = <p>Error rendering article content.</p>;
    }
  } else {
    // If it's plain text, render it directly
    renderedArticleText = <p>{articleText}</p>;
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto p-6">
        <div className="p-8">
          {/* Article Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">{subtitle}</h2>
            <p className="text-sm text-gray-500">
  {datePublished ? new Date(datePublished).toLocaleDateString() : 'Date not available'}
</p>
          </header>

          {/* Article Image */}
          {images && images.length > 0 && (
            <div className="mb-8">
              <img
                src={images[0].fields.file.url}
                alt={title}
                className="w-full h-auto max-h-[400px] object-cover" // Reduced height and ensured proper scaling
              />
            </div>
          )}

          {/* Article Content */}
          <section className="prose lg:prose-xl text-gray-800">
            <div>{renderedArticleText}</div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticlePage;
