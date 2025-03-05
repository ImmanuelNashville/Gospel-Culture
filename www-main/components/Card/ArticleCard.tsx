import Link from 'next/link';
import { ContentfulArticle } from '../../models/contentful';
import Card from '../Card';
import React from 'react';

interface ArticleCardProps {
  article: ContentfulArticle;
  cardContent?: (article: ContentfulArticle) => React.ReactNode;
  className?: string;
  imageSizes?: string;
  priorityLoading?: boolean;
}

const ArticleCard = ({ article, cardContent, imageSizes, className = '', priorityLoading }: ArticleCardProps) => {
  // Get the first image URL from the images array if it exists
  const imageUrl = article.fields.images?.[0]?.fields.file.url || '/images/default-thumbnail.jpg';

  return (
    <div className={`${className} w-full`}>
      <Link href={`/articles/${article.sys.id}`}>
        <Card
          imageUrl={imageUrl}
          className={className}
          imageSizes={imageSizes}
          priorityLoading={priorityLoading}
        >
          {/* Optional custom card content */}
          {cardContent?.(article) ?? (
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900">{article.fields.title}</h3>
              {article.fields.subtitle && <p className="text-sm text-gray-600">{article.fields.subtitle}</p>}
              {/* Removed the articleText/articleContent section */}
            </div>
          )}
        </Card>
      </Link>
    </div>
  );
};

export default ArticleCard;