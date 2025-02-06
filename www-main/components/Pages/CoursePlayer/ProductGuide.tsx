import { Entry } from 'contentful';
import { ContentfulCourseFields, ContentfulProductFields } from '../../../models/contentful';
import Text from '../../Text';
import * as mpClient from '../../../mixpanel/client';
import Button from '../../Button';

export default function ProductGuide({ course }: { course: Entry<ContentfulCourseFields> }) {
  if (!course.fields.products || !course.fields.products?.length) {
    return (
      <Text As="p" variant="subtitle2" className="mt-8">
        No gear for this course
      </Text>
    );
  }

  const mpTrackProduct = (product: Entry<ContentfulProductFields>) => {
    try {
      mpClient.track(mpClient.Event.ProductView, {
        courseId: course.sys.id,
        courseTitle: course.fields.title,
        productName: product.fields.internalName,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {course.fields.products.map((product) => (
        <div
          key={product.sys.id}
          className="grid h-80 overflow-hidden rounded-lg border dark:border-transparent shadow-md dark:bg-gray-800 bg-white"
          style={{ gridTemplateRows: '1fr auto' }}
        >
          <div
            className="row-span-4 m-6 bg-contain bg-center bg-no-repeat dark:bg-gray-800"
            style={{
              backgroundImage: `url(${product.fields.image?.fields.file.url ?? ''}`,
            }}
          />
          <div className="flex w-full flex-col flex-wrap items-center justify-between bg-bt-teal-ultraLight/10 gap-3 border-t dark:border-gray-600 p-3 pl-3 lg:flex-row">
            <p className="text-bodySmall leading-snug dark:text-gray-300 font-bodycopy">{product.fields.name}</p>
            <a href={product.fields.url} target="_blank" rel="noopener noreferrer" className="mx-auto">
              <Button
                variant="muted"
                size="extraSmall"
                className="whitespace-nowrap px-4"
                onClick={() => mpTrackProduct(product)}
              >
                View Item
              </Button>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
