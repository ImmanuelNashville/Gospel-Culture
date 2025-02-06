import { GetStaticProps, GetStaticPaths } from 'next';
import { createClient } from 'contentful';
import { INLINES } from '@contentful/rich-text-types';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY,
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

// Extract first hyperlink from rich text
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
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 flex flex-col md:flex-row gap-12">
        {/* Book Cover */}
        <div className="w-full md:w-1/3">
          {book.bookImage?.fields.file.url && (
            <img
              src={book.bookImage.fields.file.url}
              alt={book.title}
              className="w-full h-auto object-cover shadow-lg"
            />
          )}

          {/* Buttons */}
          <div className="mt-6 flex gap-4">
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-4 py-2 rounded-md font-bold text-center flex-1"
              >
                Download
              </a>
            )}
            {purchaseUrl && (
              <a
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-4 py-2 rounded-md font-bold text-center flex-1"
              >
                Purchase
              </a>
            )}
          </div>
        </div>

        {/* Book Info */}
        <div className="w-full md:w-2/3">
          <h1 className="text-4xl font-bold">{book.title}</h1>
          {book.contributor && <p className="text-lg text-gray-600 mt-2">by {book.contributor.fields.name}</p>}
          <div className="mt-6 text-lg text-gray-800">
            {book.description} {/* FIXED: Now renders as plain text */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookPage;
