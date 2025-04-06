import { GetStaticProps } from 'next';
import Link from 'next/link';
import { createClient } from 'contentful';
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
    <div className="bg-white dark:bg-gray-900">
      <Navbar />
      <main className="w-full">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Books</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {books.map((book) => (
              <Link key={book.sys.id} href={`/books/${book.sys.id}`} passHref>
                <div className="text-center cursor-pointer hover:opacity-80 transition">
                  {book.fields.bookImage?.fields.file.url && (
                    <div className="relative w-full aspect-[2/3] mb-4">
                      <img
                        src={book.fields.bookImage.fields.file.url}
                        alt={book.fields.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  )}
                  <h2 className="text-lg font-semibold mt-1 text-gray-800 dark:text-white">{book.fields.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{book.fields.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BooksPage;
