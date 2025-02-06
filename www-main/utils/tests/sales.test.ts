import { getSalePrice } from '../sales';
import * as appConfig from '../../appConfig';

jest.mock('contentful', () => ({
  createClient: jest.fn(),
}));

jest.mock('../../appConfig', () => ({
  __esModule: true,
  default: {
    sale: {},
  },
}));

const mockConfig = appConfig as { default: { sale: { isActive: boolean; percentageDiscount: number } } };

describe('getSalePrice', () => {
  it('returns the normal price when there is no sale', () => {
    mockConfig.default.sale.isActive = false;
    expect(getSalePrice(2400)).toEqual(2400);
    expect(getSalePrice(0)).toEqual(0);
  });

  it('returns the sale price rounded down to the nearest dollar when there is an active sale', () => {
    mockConfig.default.sale.isActive = true;
    mockConfig.default.sale.percentageDiscount = 30;
    expect(getSalePrice(2400)).toEqual(1600);
    mockConfig.default.sale.percentageDiscount = 50;
    expect(getSalePrice(2400)).toEqual(1200);
    mockConfig.default.sale.percentageDiscount = 42;
    expect(getSalePrice(2400)).toEqual(1300);
  });

  it('handles free courses with no sale', () => {
    mockConfig.default.sale.isActive = false;
    expect(getSalePrice(0)).toEqual(0);
  });

  it('handles free courses with a percentage sale', () => {
    mockConfig.default.sale.isActive = true;
    mockConfig.default.sale.percentageDiscount = 30;
    expect(getSalePrice(0)).toEqual(0);
  });
});
