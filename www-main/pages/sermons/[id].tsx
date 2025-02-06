// pages/sermons/[id].tsx

import { GetStaticProps, GetStaticPaths } from 'next';
import { createClient } from 'contentful';
import { ContentfulSermonFields } from '../../models/contentful';
import { ContentfulSermon } from '../../models/contentful'; // Import the typed model
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Get static paths for dynamic routing
export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY,
  });

  const res = await client.getEntries({ content_type: 'sermon' });

  const paths = res.items.map((sermon) => ({
    params: { id: sermon.sys.id.toString() }, // Ensure id is a string
  }));

  return { paths, fallback: false }; // 'false' means 404 for non-existent paths
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params as { id: string }; // Get sermon ID from URL
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  try {
    const sermon = await client.getEntry(id);

    // Ensure the content type is 'sermon' and the required fields are present
    if (sermon.fields) {
      return {
        props: {
          sermon: sermon.fields as ContentfulSermon['fields'], // Use typed fields
        },
      };
    } else {
      return {
        props: { sermon: null },
      };
    }
  } catch (error) {
    console.error('Error fetching sermon:', error);
    return { props: { sermon: null } };
  }
};

const SermonPage = ({ sermon }: { sermon: ContentfulSermonFields | null }) => {
  if (!sermon) {
    return <div className="text-center text-xl">Sermon not found</div>;
  }

  console.log('Sermon:', sermon); // Log the entire sermon to inspect its structure
  const {
    title,
    shortText,
    slug, // The video URL is stored in the slug field
    reference,
    description,
    relatedItemsLabel,
    relatedItems,
    customThumbnail,
  } = sermon;

  // Safely extract the video URL from the slug field
  const videoUrl = slug || ''; // Default to empty string if slug is undefined or null

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>

        {/* Short Text (Subtitle or Introduction) */}
        {shortText && <p className="text-lg text-gray-600 mb-4">{shortText}</p>}

        {/* Reference */}
        {reference && <p className="text-sm text-gray-500 mb-4">Reference: {reference}</p>}

        {/* Description (long text) */}
        {description && description.nodeType === 'document' && (
          <div className="prose prose-lg mb-6">{documentToReactComponents(description)}</div>
        )}

        {/* Related Items Label */}
        {relatedItemsLabel && <h3 className="text-xl font-semibold text-gray-700 mb-4">{relatedItemsLabel}</h3>}

        {/* Related Items */}
        {relatedItems && relatedItems.length > 0 && (
          <ul className="list-disc pl-6">
            {relatedItems.map((item) => (
              <li key={item.sys.id} className="text-lg text-gray-700">
                {item.fields.title}
              </li>
            ))}
          </ul>
        )}

        {/* Custom Thumbnail */}
        {customThumbnail && (
          <div className="mt-6">
            <img
              src={customThumbnail.fields.file.url}
              alt={title}
              className="w-full h-auto max-h-[400px] object-cover rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SermonPage;
