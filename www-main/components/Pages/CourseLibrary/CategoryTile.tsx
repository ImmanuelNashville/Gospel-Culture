import Link from 'next/link';
import Button from '../../Button';
import Card from '../../Card';
import Text from '../../Text';

export interface CourseCategory {
  id: string;
  name: string;
  numberOfResults: number;
}

interface CategoryTileProps {
  category: CourseCategory;
  onClick: () => void;
}

const CategoryTile = ({ category, onClick }: CategoryTileProps) => {
  return (
    <Link href="#filter" onClick={onClick}>
      <Card
        imageUrl={''}
        innerClassName="p-0 overflow-hidden rounded-md"
        imageSizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 400px"
      >
        <div className="absolute h-full w-full bg-gray-800 opacity-30" />
        <div className="absolute flex h-full w-full flex-col text-center items-center justify-center md:text-left md:items-start md:justify-between p-4">
          <Text As="h3" variant="headline6" alwaysWhite>
            {category.name}
          </Text>
          <Button variant="background" size="small" className="hidden md:block">
            View All
          </Button>
        </div>
      </Card>
    </Link>
  );
};

export default CategoryTile;
