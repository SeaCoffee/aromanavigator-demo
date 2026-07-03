import Link from 'next/link';

import SubscriptionToggleButton from '@/app/components/social/SubscriptionToggleButton';
import SubscriptionDeleteButton from '@/app/components/social/SubscriptionDeleteButton';
import { socialStyles } from '@/app/components/social/socialStyles';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';
import { socialPageUrlBuilder } from '@/app/urls/pageUrls/socialPageUrlBuilder';
import type { SubscriptionOut } from '@/app/types/socialTypes';
import { getEntityTypeLabel } from '@/app/utils/entityDisplayUtils';

type Props = {
  subscriptions: SubscriptionOut[];
};

type SubscriptionGroupKey = 'topics' | 'sections' | 'unavailable' | 'other';

const groupOrder: SubscriptionGroupKey[] = [
  'topics',
  'sections',
  'unavailable',
  'other',
];

const groupLabels: Record<SubscriptionGroupKey, string> = {
  topics: 'РўРµРјРё С„РѕСЂСѓРјСѓ',
  sections: 'Р РѕР·РґС–Р»Рё С„РѕСЂСѓРјСѓ',
  unavailable: 'РќРµРґРѕСЃС‚СѓРїРЅС– РѕР±КјС”РєС‚Рё',
  other: 'Р†РЅС€С– РїС–РґРїРёСЃРєРё',
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getItemTitle(subscription: SubscriptionOut) {
  const item = subscription.item;

  if (!item) {
    return 'РћР±КјС”РєС‚ РїС–РґРїРёСЃРєРё РЅРµРґРѕСЃС‚СѓРїРЅРёР№';
  }

  if (item.label) {
    return item.label;
  }

  return getEntityTypeLabel(item);
}

function getItemMeta(subscription: SubscriptionOut) {
  const item = subscription.item;

  if (!item) {
    return 'РћР±КјС”РєС‚ РІРёРґР°Р»РµРЅРѕ Р°Р±Рѕ РІС–РЅ РЅРµРґРѕСЃС‚СѓРїРЅРёР№';
  }

  return getEntityTypeLabel(item);
}

function getSubscriptionGroup(
  subscription: SubscriptionOut,
): SubscriptionGroupKey {
  const item = subscription.item;

  if (!item || item.is_deleted) {
    return 'unavailable';
  }

  const app = item.app.toLowerCase();
  const model = item.model.toLowerCase();

  if (app === 'forum' && model === 'forumtopicmodel') {
    return 'topics';
  }

  if (app === 'forum' && model === 'forumsectionmodel') {
    return 'sections';
  }

  return 'other';
}

function getSubscriptionHref(subscription: SubscriptionOut): string | null {
  const item = subscription.item;

  if (!item || item.is_deleted) {
    return null;
  }

  const app = item.app.toLowerCase();
  const model = item.model.toLowerCase();

  if (app === 'forum' && model === 'forumtopicmodel') {
    return forumPageUrlBuilder.topics.detail(item.id);
  }

  if (app === 'forum' && model === 'forumsectionmodel') {
    return forumPageUrlBuilder.sections.detail(item.id);
  }

  return null;
}

function groupSubscriptions(subscriptions: SubscriptionOut[]) {
  const groups = new Map<SubscriptionGroupKey, SubscriptionOut[]>();

  for (const subscription of subscriptions) {
    const group = getSubscriptionGroup(subscription);
    const current = groups.get(group) ?? [];

    current.push(subscription);
    groups.set(group, current);
  }

  return groupOrder
    .map((group) => ({
      group,
      label: groupLabels[group],
      subscriptions: groups.get(group) ?? [],
    }))
    .filter((section) => section.subscriptions.length > 0);
}

export default function SubscriptionList({ subscriptions }: Props) {
  if (!subscriptions.length) {
    return (
      <div className={socialStyles.emptyCard}>
        РЈ РІР°СЃ РїРѕРєРё РЅРµРјР°С” С„РѕСЂСѓРјРЅРёС… РїС–РґРїРёСЃРѕРє.
      </div>
    );
  }

  const sections = groupSubscriptions(subscriptions);

  return (
    <div className={socialStyles.sections}>
      {sections.map((section) => (
        <section key={section.group} className={socialStyles.section}>
          <header className={socialStyles.sectionHeader}>
            <h2 className={socialStyles.sectionTitle}>{section.label}</h2>

            <span className={socialStyles.sectionCount}>
              {section.subscriptions.length}
            </span>
          </header>

          <div className={socialStyles.list}>
            {section.subscriptions.map((subscription) => {
              const item = subscription.item;
              const href = getSubscriptionHref(subscription);
              const title = getItemTitle(subscription);

              return (
                <article key={subscription.id} className={socialStyles.card}>
                  <div className={socialStyles.cardInner}>
                    <div className={socialStyles.cardMain}>
                      {href ? (
                        <Link href={href} className={socialStyles.cardTitleLink}>
                          {title}
                        </Link>
                      ) : (
                        <h3 className={socialStyles.cardTitle}>{title}</h3>
                      )}

                      <p className={socialStyles.meta}>
                        {getItemMeta(subscription)}
                      </p>

                      <p className={socialStyles.mutedMeta}>
                        РџС–РґРїРёСЃРєР° Р· {formatDate(subscription.created_at)}
                      </p>
                    </div>

                    <div className={socialStyles.actions}>
                      {href ? (
                        <Link href={href} className={socialStyles.openLink}>
                          Р’С–РґРєСЂРёС‚Рё
                        </Link>
                      ) : (
                        <SubscriptionDeleteButton subscriptionId={subscription.id} />
                      )}

                      {item && !item.is_deleted ? (
                        <SubscriptionToggleButton
                          target={{
                            app: item.app,
                            model: item.model,
                            id: item.id,
                          }}
                          initialIsSubscribed
                          currentPath={socialPageUrlBuilder.subscriptions()}
                          subscribeLabel="РџС–РґРїРёСЃР°С‚РёСЃСЏ"
                          unsubscribeLabel="Г—"
                          pendingLabel="..."
                          buttonClassName={socialStyles.unsubscribeIconButton}
                        />
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
