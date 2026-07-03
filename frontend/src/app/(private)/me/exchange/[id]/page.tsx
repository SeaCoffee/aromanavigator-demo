import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireUserOrRedirect } from '@/app/lib/session';
import { getExchangeProposalServer } from '@/app/services/exchangeServerServices';
import { meExchangePageUrlBuilder } from '@/app/urls/pageUrls/exchangePageUrlBuilder';
import { exchangeStyles } from '@/app/components/exchange/exchangeStyles';
import ExchangeStatusBadge from '@/app/components/exchange/ExchangeStatusBadge';
import ExchangeDecisionForms from '@/app/components/exchange/ExchangeDecisionForms';
import ExchangeItemList, {
  ExchangeRequestedItem,
} from '@/app/components/exchange/ExchangeItemList';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function getUserLabel(user: { id: number | null; display_name?: string }) {
  return user.display_name || 'РљРѕСЂРёСЃС‚СѓРІР°С‡';
}

export default async function MeExchangeDetailPage({ params }: Props) {
  const user = await requireUserOrRedirect();
  const { id } = await params;

  const proposalId = Number(id);
  if (!Number.isFinite(proposalId) || proposalId <= 0) notFound();

  const proposal = await getExchangeProposalServer(proposalId);

  const isOwner = proposal.owner.id === user.id;
  const isProposer = proposal.proposer.id === user.id;

  const mode = isOwner ? 'owner' : isProposer ? 'proposer' : 'viewer';

  const backHref = isOwner
    ? meExchangePageUrlBuilder.received()
    : meExchangePageUrlBuilder.sent();

  return (
    <main className={exchangeStyles.page}>
      <div className={exchangeStyles.header}>
        <div>
          <h1 className={exchangeStyles.title}>РџСЂРѕРїРѕР·РёС†С–СЏ РѕР±РјС–РЅСѓ</h1>
          <p className={exchangeStyles.subtitle}>
            Р”РµС‚Р°Р»С– РїСЂРѕРїРѕР·РёС†С–С— РѕР±РјС–РЅСѓ С‚Р° РґРѕСЃС‚СѓРїРЅС– РґС–С—.
          </p>
        </div>

        <ExchangeStatusBadge status={proposal.status} />
      </div>

      <Link
        href={backHref}
        className={`${exchangeStyles.button} ${exchangeStyles.buttonSecondary} w-fit`}
      >
        в†ђ РќР°Р·Р°Рґ
      </Link>

      <section className={exchangeStyles.card}>
        <div className={exchangeStyles.cardBody}>
          <div className={exchangeStyles.fieldBlock}>
            <span className={exchangeStyles.fieldLabel}>Р’С–РґРїСЂР°РІРЅРёРє</span>
            {getUserLabel(proposal.proposer)}
          </div>

          <div className={exchangeStyles.fieldBlock}>
            <span className={exchangeStyles.fieldLabel}>РћС‚СЂРёРјСѓРІР°С‡</span>
            {getUserLabel(proposal.owner)}
          </div>

          <div className={exchangeStyles.fieldBlock}>
            <span className={exchangeStyles.fieldLabel}>РҐРѕС‡Рµ РѕС‚СЂРёРјР°С‚Рё</span>
            <ExchangeRequestedItem item={proposal.requested} />
          </div>

          <div className={exchangeStyles.fieldBlock}>
            <span className={exchangeStyles.fieldLabel}>РџСЂРѕРїРѕРЅСѓС”</span>
            {proposal.offer_all ? (
              <span className={exchangeStyles.itemUnavailable}>
                РѕР±СЂР°С‚Рё Р· СѓСЃС–С… С‚РѕРІР°СЂС–РІ
              </span>
            ) : (
              <ExchangeItemList items={proposal.offered_items} />
            )}
          </div>

          {proposal.accepted_items.length ? (
            <div className={exchangeStyles.fieldBlock}>
              <span className={exchangeStyles.fieldLabel}>РџСЂРёР№РЅСЏС‚С– РїРѕР·РёС†С–С—</span>
              <ExchangeItemList items={proposal.accepted_items} />
            </div>
          ) : null}

          {proposal.message ? (
            <div className={exchangeStyles.fieldBlock}>
              <span className={exchangeStyles.fieldLabel}>РџРѕРІС–РґРѕРјР»РµРЅРЅСЏ</span>
              <p className="mt-1 text-gray-600">{proposal.message}</p>
            </div>
          ) : null}

          {proposal.decision_note ? (
            <div className={exchangeStyles.fieldBlock}>
              <span className={exchangeStyles.fieldLabel}>РљРѕРјРµРЅС‚Р°СЂ СЂС–С€РµРЅРЅСЏ</span>
              <p className="mt-1 text-gray-600">{proposal.decision_note}</p>
            </div>
          ) : null}
        </div>
      </section>

      <ExchangeDecisionForms proposal={proposal} mode={mode} />
    </main>
  );
}
