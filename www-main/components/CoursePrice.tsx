import Text, { TextProps } from './Text';
import { toUsd } from '../utils';
import { getAdjustedPrice } from '../utils/sales';
import { useCartContext } from '../hooks/useCartContext';

interface CoursePriceProps extends TextProps {
  courseId: string;
  price: number;
  showZero?: boolean;
  showPromo?: boolean;
}

const CoursePrice = ({
  courseId,
  price,
  showZero = false,
  showPromo = false,
  className,
  ...props
}: CoursePriceProps) => {
  const { promo } = useCartContext();
  const adjustedPrice = getAdjustedPrice(price, courseId, { promoCode: promo?.appliedCode });

  return (
    <div className="flex flex-nowrap items-center justify-center gap-2">
      {price !== adjustedPrice && (
        <Text {...props} className={`line-through opacity-40 ${className}`}>
          {toUsd(price)}
        </Text>
      )}
      <div className="flex items-center gap-2">
        <Text {...props} className={className}>
          {toUsd(getAdjustedPrice(price, courseId, { promoCode: promo?.appliedCode }), showZero)}
        </Text>
        {showPromo && promo?.isPromoCodeApplied && promo?.PromoCodeIcon}
      </div>
    </div>
  );
};

export default CoursePrice;
