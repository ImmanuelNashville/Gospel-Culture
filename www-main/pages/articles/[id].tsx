import { GetStaticProps, GetStaticPaths } from 'next';
import { createClient } from 'contentful';
import { ContentfulArticle } from '../../models/contentful';
import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, Block, Inline } from '@contentful/rich-text-types';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

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
    const article = await client.getEntry(id, { include: 2 });
    const typedArticle = article as { fields: ContentfulArticle['fields'] };
    console.log('Fetched article fields:', JSON.stringify(typedArticle.fields, null, 2));

    let contributor = null;
    if (typedArticle.fields.contributor) {
      const contributorEntry = typedArticle.fields.contributor as any;
      contributor = {
        name: contributorEntry.fields.name || 'Unnamed Contributor',
        entryTitle: contributorEntry.fields.entryTitle || '',
        imagePath: contributorEntry.fields.profilePhoto?.fields?.file?.url
          ? `https:${contributorEntry.fields.profilePhoto.fields.file.url}`
          : '/default-avatar.png',
        link: `/contributors/${contributorEntry.sys.id}`,
      };
    }

    return {
      props: {
        article: typedArticle.fields,
        contributor,
      },
    };
  } catch (error) {
    console.error('Error fetching article with ID', id, ':', error);
    return { props: { article: null, contributor: null } };
  }
};

interface ArticlePageProps {
  article: ContentfulArticle['fields'] | null;
  contributor: {
    name: string;
    entryTitle: string;
    imagePath: string;
    link: string;
  } | null;
}

const ArticlePage = ({ article, contributor }: ArticlePageProps) => {
  console.log('Article prop in component:', article);
  console.log('Contributor prop in component:', contributor);
  if (!article) {
    return <div className="text-center text-xl">Article not found</div>;
  }

  const { title, subtitle, datePublished, text: articleText, images } = article;

  const options: Options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node: Block | Inline, children: React.ReactNode) => <p className="mb-4">{children}</p>,
      [BLOCKS.HEADING_1]: (node: Block | Inline, children: React.ReactNode) => <h1 className="text-3xl font-bold mt-6">{children}</h1>,
      [BLOCKS.HEADING_2]: (node: Block | Inline, children: React.ReactNode) => <h2 className="text-2xl font-semibold mt-4">{children}</h2>,
      [BLOCKS.UL_LIST]: (node: Block | Inline, children: React.ReactNode) => <ul className="list-disc pl-6">{children}</ul>,
      [BLOCKS.OL_LIST]: (node: Block | Inline, children: React.ReactNode) => <ol className="list-decimal pl-6">{children}</ol>,
      [BLOCKS.QUOTE]: (node: Block | Inline, children: React.ReactNode) => <blockquote className="border-l-4 pl-4 italic text-gray-600">{children}</blockquote>,
      [INLINES.HYPERLINK]: (node: Block | Inline, children: React.ReactNode) => (
        <a href={(node as Inline).data.uri} className="text-[#205952] underline">
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
            <p className="text-sm text-gray-500 mb-4">
              {datePublished ? new Date(datePublished).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date not available'}
            </p>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{title}</h1>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">{subtitle}</h2>
          </header>

          {images && images.length > 0 && (
            <div className="mb-8">
              <img
                src={images[0].fields.file.url}
                alt={title}
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          )}

          <section className="prose lg:prose-xl max-w-[700px] mx-auto text-gray-800">
            {/* Contributor Section */}
            {contributor && (
              <div className="flex items-center justify-left gap-3 mt-4 mb-6">
                <Image
                  src={contributor.imagePath}
                  alt={contributor.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="text-left">
                  <p className="text-sm text-gray-500">
                    Article by{' '}
                    <Link href={contributor.link} className="text-[#205952] hover:underline">
                      {contributor.name}
                    </Link>
                  </p>
                  {contributor.entryTitle && (
                    <p className="text-base text-gray-500">{contributor.entryTitle}</p>
                  )}
                </div>
              </div>
            )}
            <div>{renderedArticleText}</div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticlePage;