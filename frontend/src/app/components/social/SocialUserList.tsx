import Link from 'next/link';

import AvatarImage from '@/app/components/images/AvatarImage';
import { socialUserListStyles as styles } from '@/app/components/social/socialUserList.styles';
import OnlineBadge from '@/app/components/users/OnlineBadge';
import { OnlineUsersProvider } from '@/app/components/users/OnlineUsersProvider';
import type { SocialUser } from '@/app/types/socialTypes';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';

type Props = {
  users: SocialUser[];
  emptyText: string;
};

function getDisplayName(user: SocialUser) {
  return user.profile?.display_name || user.profile?.name || 'РљРѕСЂРёСЃС‚СѓРІР°С‡';
}

export default function SocialUserList({ users, emptyText }: Props) {
  if (!users.length) {
    return <div className={styles.empty}>{emptyText}</div>;
  }

  return (
    <OnlineUsersProvider userIds={users.map((user) => user.id)}>
      <div className={styles.list}>
        {users.map((user) => {
          const displayName = getDisplayName(user);
          const href = user.profile?.display_name
            ? userPageUrlBuilder.publicProfile(user.profile.display_name)
            : null;
          const content = (
            <>
              <div className={styles.user}>
                <div className={styles.avatarWrap}>
                  <AvatarImage
                    src={user.profile?.avatar_url || user.profile?.avatar}
                    initial={displayName.slice(0, 1).toUpperCase()}
                    alt={displayName}
                    className={styles.avatar}
                    fallbackClassName={styles.avatarFallback}
                  />
                </div>
                <div className={styles.info}>
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className={styles.name}>{displayName}</h3>
                    <OnlineBadge userId={user.id} className="shrink-0" />
                  </div>
                  {user.profile?.name && user.profile.name !== displayName ? (
                    <p className={styles.realName}>{user.profile.name}</p>
                  ) : null}
                </div>
              </div>
              <div className={styles.stats}>
                <span className={styles.stat}>
                  РџС–РґРїРёСЃРЅРёРєРё: {user.stats?.followers_count ?? 0}
                </span>
                <span className={styles.stat}>
                  РџС–РґРїРёСЃРєРё: {user.stats?.following_count ?? 0}
                </span>
              </div>
            </>
          );

          return href ? (
            <Link key={user.id} href={href} className={styles.card}>
              {content}
            </Link>
          ) : (
            <article key={user.id} className={styles.card}>
              {content}
            </article>
          );
        })}
      </div>
    </OnlineUsersProvider>
  );
}
