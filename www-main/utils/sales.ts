import appConfig from '../appConfig';
import { PromoCode } from '../hooks/usePromoCodeInput';

interface AdjustedPriceOptions {
  isActive?: boolean;
  globalDiscount?: number;
  promoCode?: PromoCode;
}

export function getSalePrice(
  priceInCents: number,
  isActive = Boolean(appConfig.sale.isActive),
  percentageDiscount = Number(appConfig.sale.percentageDiscount)
) {
  if (isActive && percentageDiscount > 0 && priceInCents > 0) {
    const priceInWholeDollars = priceInCents / 100;
    const decimalDiscount = percentageDiscount / 100;
    const priceInDollarsWithDiscount = priceInWholeDollars * (1 - decimalDiscount);
    const discountedPriceRoundedDown = Math.floor(priceInDollarsWithDiscount);
    const discountedPriceInCents = discountedPriceRoundedDown * 100;
    return discountedPriceInCents;
  }

  return priceInCents;
}

export function getPromoPrice(priceInCents: number, courseId: string, promoCode?: PromoCode) {
  if (promoCode && promoCode.allowedCourses && !promoCode.allowedCourses.includes(courseId)) {
    return priceInCents;
  }
  return getSalePrice(priceInCents, Boolean(promoCode?.code), promoCode?.percentageDiscount ?? 0);
}

export function getAdjustedPrice(
  priceInCents: number,
  courseId: string,
  { isActive, globalDiscount, promoCode }: AdjustedPriceOptions
) {
  const isCourseOnSale = (appConfig.sale.courses[courseId]?.isActive ?? false) || isActive;
  const discount = (appConfig.sale.courses[courseId]?.percentageDiscount ?? 0) || globalDiscount;
  const adjustedPriceAfterSale = getSalePrice(priceInCents, isCourseOnSale, discount);
  const adjustedPriceAfterPromo = getPromoPrice(adjustedPriceAfterSale, courseId, promoCode);
  return adjustedPriceAfterPromo;
}
