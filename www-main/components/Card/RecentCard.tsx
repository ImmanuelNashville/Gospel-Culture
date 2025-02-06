import React from 'react';

interface RecentCardProps {
  type: 'podcast' | 'sermon' | 'article';
  title: string;
  link: string;
  imageUrl?: string; // For podcast and article images
  videoUrl?: string; // For sermon video URL (YouTube) (not used now for thumbnail)
  customThumbnailUrl?: string; // For sermon custom thumbnail from Contentful
}

const RecentCard: React.FC<RecentCardProps> = ({ type, title, link, imageUrl, videoUrl, customThumbnailUrl }) => {
  const getImageUrl = () => {
    // If no images or thumbnails are available, return a default image
    if (!imageUrl && !customThumbnailUrl) {
      return '/default-image.jpg';
    }

    // Use customThumbnailUrl if it's provided (prioritize custom thumbnail)
    if (customThumbnailUrl) {
      try {
        // Ensure the URL has a protocol and return optimized URL for Contentful
        const urlWithProtocol = customThumbnailUrl.startsWith('//')
          ? `https:${customThumbnailUrl}`
          : customThumbnailUrl.startsWith('http')
          ? customThumbnailUrl
          : `https://${customThumbnailUrl}`;

        const optimizedUrl = new URL(urlWithProtocol);
        optimizedUrl.searchParams.set('fm', 'webp'); // Convert to WebP format
        optimizedUrl.searchParams.set('q', '80'); // Set quality to 80%
        optimizedUrl.searchParams.set('fit', 'fill'); // Maintain aspect ratio while filling
        optimizedUrl.searchParams.set('w', '800'); // Set width
        optimizedUrl.searchParams.set('h', '450'); // Set height

        return optimizedUrl.toString();
      } catch (error) {
        console.error('Error processing custom thumbnail URL:', error);
        return customThumbnailUrl; // Return original URL if there's an error
      }
    }

    // Fallback to regular Contentful image if custom thumbnail is not available
    if (imageUrl) {
      try {
        // Check if it's a Contentful URL (contains images.ctfassets.net)
        if (imageUrl.includes('images.ctfassets.net')) {
          const urlWithProtocol = imageUrl.startsWith('//')
            ? `https:${imageUrl}`
            : imageUrl.startsWith('http')
            ? imageUrl
            : `https://${imageUrl}`;

          const optimizedUrl = new URL(urlWithProtocol);
          optimizedUrl.searchParams.set('fm', 'webp'); // Convert to WebP format
          optimizedUrl.searchParams.set('q', '80'); // Set quality to 80%
          optimizedUrl.searchParams.set('fit', 'fill'); // Maintain aspect ratio while filling
          optimizedUrl.searchParams.set('w', '800'); // Set width
          optimizedUrl.searchParams.set('h', '450'); // Set height

          return optimizedUrl.toString();
        }

        return imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
      } catch (error) {
        console.error('Error processing image URL:', error);
        return imageUrl; // Return original URL if there's an error
      }
    }

    // Default fallback image if no image is available
    return '/default-image.jpg';
  };

  return (
    <div className="bg-white rounded-md shadow-md p-4 hover:shadow-lg transition flex flex-col h-full">
      <a href={link} className="block relative flex flex-col h-full">
        <div className="absolute top-4 left-4 bg-gray-800 text-white text-xs px-2 py-1 rounded-md z-10">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </div>

        {/* Image rendering */}
        <div className="relative w-full h-48 mb-3 flex-grow">
          <img
            src={getImageUrl()}
            alt={title}
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              e.currentTarget.src = '/default-image.jpg';
              e.currentTarget.onerror = null; // Prevent infinite loop
            }}
          />
        </div>

        <h3 className="text-lg font-semibold mt-auto">{title}</h3>
      </a>
    </div>
  );
};

export default RecentCard;
