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
              {article.fields.articleText && (
                <div className="text-sm text-gray-500 line-clamp-3">
                  {/* Note: articleText is a Document type from Contentful's Rich Text.
                      You'll need to use a rich text renderer to display it properly */}
                </div>
              )}
            </div>
          )}
        </Card>
      </Link>
    </div>
  );
};

export default ArticleCard;