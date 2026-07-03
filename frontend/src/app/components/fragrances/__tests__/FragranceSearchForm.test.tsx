import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/services/fragranceOptions.service.client', () => ({
  getBrandOptionsClient: vi.fn().mockResolvedValue({
    count: 0,
    results: [],
  }),
  getFragranceOptionsClient: vi.fn().mockResolvedValue({
    count: 0,
    results: [],
  }),
}));

import { FragranceSearchForm } from '@/app/components/fragrances/FragranceSearchForm';

describe('FragranceSearchForm', () => {
  it('submits a freely typed fragrance name', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FragranceSearchForm
        listHref="/fragrances"
        defaultValues={{
          brand: '',
          fragrance_id: '',
          name: '',
          year_from: '',
          year_to: '',
        }}
        hiddenValues={{ ordering: 'brand' }}
        resetHref="/fragrances"
      />,
    );

    await user.type(
      screen.getByRole('searchbox', { name: 'РќР°Р·РІР° Р°СЂРѕРјР°С‚Сѓ' }),
      'Mitsouko',
    );

    const hiddenName = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="name"]',
    );

    expect(hiddenName).not.toBeNull();
    expect(hiddenName?.value).toBe('Mitsouko');
  });
});
