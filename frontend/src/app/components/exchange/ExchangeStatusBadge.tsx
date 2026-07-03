import type { ExchangeStatus } from '@/app/types/exchangeTypes';
import { exchangeStyles } from '@/app/components/exchange/exchangeStyles';
import { getExchangeStatusLabel } from '@/app/components/exchange/exchangeHelpers';

type Props = {
  status: ExchangeStatus;
};

const statusClassName: Record<ExchangeStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  canceled: 'bg-gray-100 text-gray-600',
};

export default function ExchangeStatusBadge({ status }: Props) {
  return (
    <span className={`${exchangeStyles.badge} ${statusClassName[status]}`}>
      {getExchangeStatusLabel(status)}
    </span>
  );
}
