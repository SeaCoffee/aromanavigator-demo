import { describe, expect, it } from 'vitest';

import { validateFragranceReleaseYear } from '@/app/utils/fragranceYearUtils';

describe('validateFragranceReleaseYear', () => {
  it.each(['', '2024', '1500'])('accepts "%s"', (value) => {
    expect(validateFragranceReleaseYear(value)).toBe(true);
  });

  it.each(['abc', '999', '20240'])('rejects malformed year "%s"', (value) => {
    expect(validateFragranceReleaseYear(value)).toBe(
      'Р С–Рє РІРёРїСѓСЃРєСѓ РјР°С” РјС–СЃС‚РёС‚Рё СЂС–РІРЅРѕ 4 С†РёС„СЂРё.',
    );
  });

  it('rejects a four-digit year outside the allowed range', () => {
    expect(validateFragranceReleaseYear('1499')).toContain(
      'Р С–Рє РІРёРїСѓСЃРєСѓ РјР°С” Р±СѓС‚Рё РІ РјРµР¶Р°С…',
    );
  });
});
