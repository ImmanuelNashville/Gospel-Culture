import Link from 'next/link';
import { Article } from '../../models/contentful';
import Card from '../Card';
import React from 'react';

interface ArticleCardProps {
  article: Article;
  cardContent?: (article: Article) => React.ReactNode;
  className?: string;
  imageSizes?: string;
  priorityLoading?: boolean;
}

const ArticleCard = ({ article, cardContent, imageSizes, className = '', priorityLoading }: ArticleCardProps) => {
  return (
    <div className={`${className} w-full`}>
      <Link href={`/articles/${article.id}`}>
        <Card
          imageUrl={article.imageUrls?.[0] || '/images/default-thumbnail.jpg'} // Assuming first image is the main one
          className={className}
          imageSizes={imageSizes}
          priorityLoading={priorityLoading}
        >
          {/* Optional custom card content */}
          {cardContent?.(article) ?? (
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900">{article.entryTitle}</h3>
              {article.subtitle && <p className="text-sm text-gray-600">{article.subtitle}</p>}
              {article.articleText && <p className="text-sm text-gray-500 line-clamp-3">{article.articleText}</p>}
            </div>
          )}
        </Card>
      </Link>
    </div>
  );
};

export default ArticleCard;
