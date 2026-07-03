import { describe, expect, it } from 'vitest';

import {
  buildExchangeItemPageUrl,
  formatExchangeItem,
  formatRequestedExchangeItem,
} from '@/app/components/exchange/exchangeHelpers';

describe('exchangeHelpers', () => {
  it('formats exchange items without raw ids', () => {
    expect(formatExchangeItem({ type: 'wardrobe', id: 17 })).toBe(
      'Р“Р°СЂРґРµСЂРѕР± Р±С–Р»СЊС€Рµ РЅРµРґРѕСЃС‚СѓРїРЅРёР№',
    );
    expect(formatRequestedExchangeItem({ type: 'wardrobe', id: 21, owner_id: 5 })).toBe(
      'Р“Р°СЂРґРµСЂРѕР± Р±С–Р»СЊС€Рµ РЅРµРґРѕСЃС‚СѓРїРЅРёР№',
    );
  });

  it('formats available item title and note', () => {
    expect(
      formatExchangeItem({
        type: 'wardrobe',
        id: 12,
        brand: 'Dior',
        name: 'Homme',
        note: '5 РјР»',
      }),
    ).toBe('Р“Р°СЂРґРµСЂРѕР±: Dior Homme (5 РјР»)');
  });

  it('does not build listing links for wardrobe items', () => {
    expect(buildExchangeItemPageUrl({ type: 'wardrobe', id: 0 })).toBeNull();
    expect(buildExchangeItemPageUrl({ type: 'wardrobe', id: 17 })).toBeNull();
  });
});
