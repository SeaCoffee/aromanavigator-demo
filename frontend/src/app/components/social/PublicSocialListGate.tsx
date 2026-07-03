import Link from 'next/link';
import type { ReactNode } from 'react';

import { socialStyles } from '@/app/components/social/socialStyles';
import type { PublicUser } from '@/app/types/userTypes';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { getPublicUserDisplayName } from '@/app/utils/userDisplayUtils';

type Props = {
  profileUser: PublicUser;
  title: string;
  description: string;
  children: ReactNode;
};

export default function PublicSocialListGate({
  profileUser,
  title,
  description,
  children,
}: Props) {
  const displayName = getPublicUserDisplayName(profileUser);

  return (
    <main className={socialStyles.page}>
      <header className={socialStyles.header}>
        <Link
          href={userPageUrlBuilder.publicProfile(displayName)}
          className={socialStyles.backLink}
        >
          РќР°Р·Р°Рґ РґРѕ РїСЂРѕС„С–Р»СЋ
        </Link>

        <div>
          <h1 className={socialStyles.title}>{title}</h1>
          <p className={socialStyles.subtitle}>{description}</p>
        </div>
      </header>

      <section className={socialStyles.profileCard}>
        <h2 className={socialStyles.profileTitle}>{displayName}</h2>

        <div className={socialStyles.profileStats}>
          <Link
            href={userPageUrlBuilder.followers(displayName)}
            className={socialStyles.profileStatLink}
          >
            РџС–РґРїРёСЃРЅРёРєРё:{' '}
            <strong>{profileUser.stats?.followers_count ?? 0}</strong>
          </Link>

          <Link
            href={userPageUrlBuilder.following(displayName)}
            className={socialStyles.profileStatLink}
          >
            РџС–РґРїРёСЃРєРё:{' '}
            <strong>{profileUser.stats?.following_count ?? 0}</strong>
          </Link>
        </div>
      </section>

      {children}
    </main>
  );
}
