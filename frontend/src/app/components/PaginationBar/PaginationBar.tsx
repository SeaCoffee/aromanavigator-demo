
'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import React from 'react';


type Props = {
  loading: boolean;
  page: number;
  count: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function PaginationBar({
  loading,
  page,
  count,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        type="button"
        disabled={loading || !hasPrev}
        onClick={onPrev}
        className={`${buttonStyles.compactSecondary}`}
      >
        РќР°Р·Р°Рґ
      </button>
      <span className="text-sm">
        РЎС‚РѕСЂС–РЅРєР° {page}, СѓСЃСЊРѕРіРѕ РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ: {count}
      </span>
      <button
        type="button"
        disabled={loading || !hasNext}
        onClick={onNext}
        className={`${buttonStyles.compactSecondary}`}
      >
        Р”Р°Р»С–
      </button>
    </div>
  );
}
