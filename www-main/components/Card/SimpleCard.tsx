import React from 'react';

interface SimpleCardProps {
  title: string;
  link: string;
  imageUrl?: string;
  customThumbnailUrl?: string;
}

const SimpleCard: React.FC<SimpleCardProps> = ({ title, link, imageUrl, customThumbnailUrl }) => {
  const getImageUrl = () => {
    const url = customThumbnailUrl || imageUrl;
    if (!url) return '/default-image.jpg';

    try {
      const formatted = url.startsWith('//') ? `https:${url}` : url.startsWith('http') ? url : `https://${url}`;
      const optimizedUrl = new URL(formatted);
      optimizedUrl.searchParams.set('fm', 'webp');
      optimizedUrl.searchParams.set('q', '80');
      optimizedUrl.searchParams.set('fit', 'fill');
      optimizedUrl.searchParams.set('w', '800');
      optimizedUrl.searchParams.set('h', '450');
      return optimizedUrl.toString();
    } catch (e) {
      console.error('Image URL processing error:', e);
      return url;
    }
  };

  return (
    <div className="bg-white rounded-md shadow-md p-4 hover:shadow-lg transition flex flex-col h-full">
      <a href={link} className="block relative flex flex-col h-full">
        <div className="relative w-full aspect-[16/9] mb-3 flex-shrink-0">
          <img
            src={getImageUrl()}
            alt={title}
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              e.currentTarget.src = '/default-image.jpg';
              e.currentTarget.onerror = null;
            }}
          />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </a>
    </div>
  );
};

export default SimpleCard;
