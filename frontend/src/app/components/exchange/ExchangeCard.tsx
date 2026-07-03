import Link from 'next/link';

import type { ExchangeProposal } from '@/app/types/exchangeTypes';
import { meExchangePageUrlBuilder } from '@/app/urls/pageUrls/exchangePageUrlBuilder';
import { exchangeStyles } from '@/app/components/exchange/exchangeStyles';
import ExchangeStatusBadge from '@/app/components/exchange/ExchangeStatusBadge';
import ExchangeItemList, {
  ExchangeRequestedItem,
} from '@/app/components/exchange/ExchangeItemList';

type Props = {
  proposal: ExchangeProposal;
  variant: 'sent' | 'received';
};

function getUserLabel(user: ExchangeProposal['owner']): string {
  return user.display_name || 'РљРѕСЂРёСЃС‚СѓРІР°С‡';
}

export default function ExchangeCard({ proposal, variant }: Props) {
  const detailHref = meExchangePageUrlBuilder.detail(proposal.id);

  const userLabel =
    variant === 'sent'
      ? `РћС‚СЂРёРјСѓРІР°С‡: ${getUserLabel(proposal.owner)}`
      : `Р’С–РґРїСЂР°РІРЅРёРє: ${getUserLabel(proposal.proposer)}`;

  return (
    <article className={exchangeStyles.card}>
      <div className={exchangeStyles.cardTop}>
        <div>
          <h2 className={exchangeStyles.cardTitle}>
            РџСЂРѕРїРѕР·РёС†С–СЏ РѕР±РјС–РЅСѓ
          </h2>

          <p className={exchangeStyles.cardMeta}>
            {userLabel}
          </p>
        </div>

        <ExchangeStatusBadge status={proposal.status} />
      </div>

      <div className={exchangeStyles.cardBody}>
        <div className={exchangeStyles.fieldBlock}>
          <span className={exchangeStyles.fieldLabel}>РҐРѕС‡Рµ РѕС‚СЂРёРјР°С‚Рё</span>
          <ExchangeRequestedItem item={proposal.requested} />
        </div>

        <div className={exchangeStyles.fieldBlock}>
          <span className={exchangeStyles.fieldLabel}>РџСЂРѕРїРѕРЅСѓС”</span>
          {proposal.offer_all ? (
            <span className={exchangeStyles.itemUnavailable}>
              РѕР±СЂР°С‚Рё Р· СѓСЃС–С… РїСЂРѕРїРѕР·РёС†С–Р№
            </span>
          ) : (
            <ExchangeItemList items={proposal.offered_items} />
          )}
        </div>

        {proposal.message ? (
          <p className="text-gray-600">{proposal.message}</p>
        ) : null}

        {proposal.decision_note ? (
          <p className="text-gray-600">
            <span className="font-medium text-gray-900">РљРѕРјРµРЅС‚Р°СЂ СЂС–С€РµРЅРЅСЏ: </span>
            {proposal.decision_note}
          </p>
        ) : null}
      </div>

      <div className={exchangeStyles.cardActions}>
        <Link
          href={detailHref}
          className={`${exchangeStyles.button} ${exchangeStyles.buttonSecondary}`}
        >
          Р”РµС‚Р°Р»С–
        </Link>
      </div>
    </article>
  );
}
