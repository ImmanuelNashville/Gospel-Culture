import { render, screen } from '@testing-library/react';
import CoursePrice from '../CoursePrice';
import * as appConfig from '../../appConfig';
import { CartContext, CartContextType } from '../../context/cart';

jest.mock('../../appConfig', () => ({
  __esModule: true,
  default: {
    sale: {
      courses: {},
    },
  },
}));

jest.mock('../../hooks/useBrightTripUser', () => ({}));

const mockConfig = appConfig as {
  default: { sale: { isActive: boolean; percentageDiscount: number } };
};

describe('CoursePrice', () => {
  it('renders the standard course price when there is no sale', () => {
    render(
      <CartContext.Provider value={{} as CartContextType}>
        <CoursePrice courseId="someCourseId" price={2400} variant="body" />
      </CartContext.Provider>
    );
    expect(screen.getByText('$24')).toBeVisible();
  });

  it('handles free courses when there is no sale', () => {
    render(
      <CartContext.Provider value={{} as CartContextType}>
        <CoursePrice courseId="someCourseId" price={0} variant="body" />
      </CartContext.Provider>
    );
    expect(screen.getByText('FREE')).toBeVisible();
  });

  it('renders the discounted course price when there is a sale', () => {
    mockConfig.default.sale.isActive = true;
    mockConfig.default.sale.percentageDiscount = 30;
    render(
      <CartContext.Provider value={{} as CartContextType}>
        <CoursePrice courseId="someCourseId" price={2400} variant="body" />
      </CartContext.Provider>
    );
    expect(screen.getByText('$24')).toHaveClass('line-through');
    expect(screen.getByText('$16')).toBeVisible();
  });

  it('handles free courses when there is sale', () => {
    mockConfig.default.sale.isActive = true;
    mockConfig.default.sale.percentageDiscount = 30;
    render(
      <CartContext.Provider value={{} as CartContextType}>
        <CoursePrice courseId="someCourseId" price={0} variant="body" />
      </CartContext.Provider>
    );
    expect(screen.getByText('FREE')).toBeVisible();
  });
});
