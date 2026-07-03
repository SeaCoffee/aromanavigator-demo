import type { ExchangeProposal } from '@/app/types/exchangeTypes';
import { exchangeStyles } from '@/app/components/exchange/exchangeStyles';
import ExchangeCard from '@/app/components/exchange/ExchangeCard';

type Props = {
  items: ExchangeProposal[];
  variant: 'sent' | 'received';
  emptyText: string;
};

export default function ExchangeList({ items, variant, emptyText }: Props) {
  if (!items.length) {
    return <div className={exchangeStyles.empty}>{emptyText}</div>;
  }

  return (
    <div className={exchangeStyles.list}>
      {items.map((proposal) => (
        <ExchangeCard
          key={proposal.id}
          proposal={proposal}
          variant={variant}
        />
      ))}
    </div>
  );
}
