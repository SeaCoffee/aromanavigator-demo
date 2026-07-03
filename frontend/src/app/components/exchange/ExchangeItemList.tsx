import Link from 'next/link';

import {
  buildExchangeItemPageUrl,
  formatExchangeItem,
  formatRequestedExchangeItem,
} from '@/app/components/exchange/exchangeHelpers';
import { exchangeStyles } from '@/app/components/exchange/exchangeStyles';
import type {
  ExchangeItemPayload,
  ExchangeRequestedShort,
} from '@/app/types/exchangeTypes';

type Props = {
  items: ExchangeItemPayload[];
  emptyText?: string;
};

type RequestedProps = {
  item: ExchangeRequestedShort;
};

function itemLink(
  item: ExchangeItemPayload | ExchangeRequestedShort,
  label: string,
) {
  const href = buildExchangeItemPageUrl(item);

  if (!href) {
    return <span className={exchangeStyles.itemUnavailable}>{label}</span>;
  }

  return (
    <Link href={href} className={exchangeStyles.itemLink}>
      {label}
    </Link>
  );
}

export function ExchangeRequestedItem({ item }: RequestedProps) {
  return (
    <div className={exchangeStyles.itemRow}>
      {itemLink(item, formatRequestedExchangeItem(item))}
    </div>
  );
}

export default function ExchangeItemList({
  items,
  emptyText = 'РќРµ РІРёР±СЂР°РЅРѕ',
}: Props) {
  if (!items.length) {
    return <span className={exchangeStyles.itemUnavailable}>{emptyText}</span>;
  }

  return (
    <ul className={exchangeStyles.itemListCompact}>
      {items.map((item, index) => (
        <li key={`${item.type}-${item.id}-${index}`} className={exchangeStyles.itemRow}>
          {itemLink(item, formatExchangeItem(item))}
        </li>
      ))}
    </ul>
  );
}
