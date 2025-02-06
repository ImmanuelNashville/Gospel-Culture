import { render, screen } from '@testing-library/react';
import HeroDataItem from '../HeroDataItem';

describe('HeroDataItem', () => {
  it('displays the label and value', () => {
    render(<HeroDataItem value="10" label="widgets" />);
    screen.getAllByText('10').forEach((result) => {
      expect(result).toBeVisible();
    });
    expect(screen.getByText('widgets')).toBeVisible();
  });
});
