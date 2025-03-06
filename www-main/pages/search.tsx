import React, { useState, useEffect } from 'react';
import { createClient } from 'contentful';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecentCard from '../components/Card/RecentCard';
import SectionWithMargin from '../components/PageSections/SectionWithMargin';

export async function getServerSideProps() {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY!,
  });

  try {
    const [podcasts, sermons, articles] = await Promise.all([
      client.getEntries({ content_type: 'podcast' }),
      client.getEntries({ content_type: 'sermon' }),
      client.getEntries({ content_type: 'article' }),
    ]);

    const getAssetUrl = (asset: any) => {
      if (!asset?.fields?.file?.url) return '/placeholder.png';
      return asset.fields.file.url.startsWith('//') ? `https:${asset.fields.file.url}` : asset.fields.file.url;
    };

    const allResources = [
      ...podcasts.items.map((item: any) => ({
        type: 'Podcast' as const,
        title: item.fields.title || 'Untitled Podcast',
        link: `/podcasts/${item.sys.id}`,
        imageUrl: getAssetUrl(item.fields.podcastCover),
        description: item.fields.description ?? null,
        sys: item.sys,
      })),
      ...sermons.items.map((item: any) => ({
        type: 'Sermon' as const,
        title: item.fields.title || 'Untitled Sermon',
        link: `/sermons/${item.sys.id}`,
        imageUrl: getAssetUrl(item.fields.customThumbnail),
        description: item.fields.description ?? null,
        sys: item.sys,
      })),
      ...articles.items.map((item: any) => ({
        type: 'Article' as const,
        title: item.fields.title || 'Untitled Article',
        link: `/articles/${item.sys.id}`,
        imageUrl: item.fields.images?.[0] ? getAssetUrl(item.fields.images[0]) : '/placeholder.png',
        description: item.fields.description ?? null,
        sys: item.sys,
      })),
    ];

    return {
      props: {
        allResources,
      },
    };
  } catch (error) {
    console.error('Contentful Fetch Error:', error);
    return {
      props: {
        allResources: [],
      },
    };
  }
}

const SearchPage = ({ allResources }: { allResources: any[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResources, setFilteredResources] = useState(allResources);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allResources.filter((resource) =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResources(filtered);
    } else {
      setFilteredResources(allResources);
    }
  }, [searchTerm, allResources]);

  return (
    <div>
      <Navbar />
      <main>
        <SectionWithMargin>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-300">Search Resources</h2>

          <input
            type="text"
            className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-1/2 lg:w-1/3"
            placeholder="Search for Podcasts, Sermons, Articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            {filteredResources.length === 0 ? (
              <p>No results found</p>
            ) : (
              filteredResources.map((resource, index) => (
                <RecentCard
                  key={index}
                  {...resource}
                  customThumbnailUrl={resource?.imageUrl || resource?.videoUrl}
                />
              ))
            )}
          </div>
        </SectionWithMargin>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
