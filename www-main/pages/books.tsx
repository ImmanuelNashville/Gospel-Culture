import { GetStaticProps } from 'next';
import Link from 'next/link';
import { createClient } from 'contentful';
import { ContentfulBook } from '../models/contentful';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const getStaticProps: GetStaticProps = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  const res = await client.getEntries({ content_type: 'book' });

  return {
    props: {
      books: res.items,
    },
  };
};

const BooksPage = ({ books }: { books: any[] }) => {
  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-5xl font-bold mb-8">Books</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <Link key={book.sys.id} href={`/books/${book.sys.id}`} passHref>
              <div className="text-center cursor-pointer hover:opacity-80 transition">
                {book.fields.bookImage?.fields.file.url && (
                  <img
                    src={book.fields.bookImage.fields.file.url}
                    alt={book.fields.title}
                    className="w-full h-auto max-h-[300px] object-cover mx-auto"
                  />
                )}
                <h2 className="text-lg font-semibold mt-4">{book.fields.title}</h2>
                <p className="text-gray-600">{book.fields.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BooksPage;
