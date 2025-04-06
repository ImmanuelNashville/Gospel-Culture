import { GetStaticProps, GetStaticPaths } from 'next';
import { createClient } from 'contentful';
import { INLINES } from '@contentful/rich-text-types';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const getStaticPaths: GetStaticPaths = async () => {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_KEY;

  if (!spaceId || !accessToken) {
    throw new Error("Missing Contentful environment variables.");
  }

  const client = createClient({
    space: spaceId,
    accessToken: accessToken,
  });

  const res = await client.getEntries({ content_type: 'book' });

  const paths = res.items.map((book) => ({
    params: { id: book.sys.id },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params as { id: string };
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  try {
    const book = await client.getEntry(id);

    if (book.fields) {
      return {
        props: {
          book: book.fields,
        },
      };
    } else {
      return { props: { book: null } };
    }
  } catch (error) {
    console.error('Error fetching book:', error);
    return { props: { book: null } };
  }
};

const getFirstLink = (richText: any) => {
  if (!richText) return null;

  const links: string[] = [];
  const extractLinks = (node: any) => {
    if (node.nodeType === INLINES.HYPERLINK) {
      links.push(node.data.uri);
    }
    if (node.content) {
      node.content.forEach(extractLinks);
    }
  };

  extractLinks(richText);
  return links.length > 0 ? links[0] : null;
};

const BookPage = ({ book }: { book: any }) => {
  if (!book) {
    return <div className="text-center text-xl">Book not found</div>;
  }

  const purchaseUrl = getFirstLink(book.purchaseLink);
  const downloadUrl = getFirstLink(book.downloadLink);

  return (
    <div className="bg-white dark:bg-gray-900">
      <Navbar />
      <main className="w-full">
        <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
          {/* Book Cover */}
          <div className="w-full md:w-1/3">
            {book.bookImage?.fields.file.url && (
              <div className="aspect-[2/3] w-full">
                <img
                  src={book.bookImage.fields.file.url}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-md shadow-lg"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-4">
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#205952] hover:bg-[#17403d] text-white px-4 py-2 rounded-md font-bold text-center transition-colors"
                >
                  Download
                </a>
              )}
              {purchaseUrl && (
                <a
                  href={purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#205952] hover:bg-[#17403d] text-white px-4 py-2 rounded-md font-bold text-center transition-colors"
                >
                  Purchase
                </a>
              )}
            </div>
          </div>

          {/* Book Info */}
          <div className="w-full md:w-2/3">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{book.title}</h1>
            {book.contributor && (
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                by {book.contributor.fields.name}
              </p>
            )}
            <div className="mt-6 text-lg text-gray-800 dark:text-gray-200">
              {book.description}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookPage;
