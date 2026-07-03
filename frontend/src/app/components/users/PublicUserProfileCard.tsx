import Link from "next/link";

import AvatarImage from "@/app/components/images/AvatarImage";
import OnlineBadge from "@/app/components/users/OnlineBadge";
import { OnlineUsersProvider } from "@/app/components/users/OnlineUsersProvider";
import PublicUserActionsPanel from "@/app/components/users/PublicUserActionsPanel";
import { publicUserStyles as styles } from "@/app/components/users/publicUser.styles";
import { getRegionLabel } from "@/app/constants/regionOptions";
import type { SocialState } from "@/app/types/socialTypes";
import type { ID, PublicUser } from "@/app/types/userTypes";
import { userPageUrlBuilder } from "@/app/urls/pageUrls/usersPageUrlBuilder";
import {
  getPublicUserDisplayName,
  getPublicUserProfileUsername,
  getUserInitial,
} from "@/app/utils/userDisplayUtils";

type Props = {
  user: PublicUser;
  shareUrl: string;
  viewerId?: ID | null;
  socialState?: SocialState | null;
};

export default function PublicUserProfileCard({
  user,
  shareUrl,
  viewerId = null,
  socialState = null,
}: Props) {
  const displayName = getPublicUserDisplayName(user);
  const publicUsername = getPublicUserProfileUsername(user);
  const isSelf = viewerId !== null && String(viewerId) === String(user.id);
  const regionLabel = getRegionLabel(user.profile?.region);

  return (
    <OnlineUsersProvider userIds={[user.id]}>
      <section className={styles.profileShell}>
        <header className={styles.profileHeader}>
          <AvatarImage
            src={user.profile?.avatar_url}
            initial={getUserInitial(user)}
            alt={displayName}
            className={styles.avatar}
            fallbackClassName={styles.avatarFallback}
          />

          <div className={styles.profileInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.title}>{displayName}</h1>
              {isSelf ? (
                <span className={styles.selfBadge}>Р¦Рµ РІРё</span>
              ) : (
                <OnlineBadge userId={user.id} />
              )}
            </div>

            {user.profile?.name && user.profile.name !== displayName ? (
              <p className={styles.name}>{user.profile.name}</p>
            ) : null}
            {regionLabel ? <p className={styles.region}>{regionLabel}</p> : null}

            {user.stats ? (
              <div className={styles.statList}>
                {publicUsername ? (
                  <>
                    <Link
                      href={userPageUrlBuilder.followers(publicUsername)}
                      className={styles.stat}
                    >
                      <span className={styles.statValue}>
                        {user.stats.followers_count ?? 0}
                      </span>{" "}
                      РїС–РґРїРёСЃРЅРёРєС–РІ
                    </Link>
                    <Link
                      href={userPageUrlBuilder.following(publicUsername)}
                      className={styles.stat}
                    >
                      <span className={styles.statValue}>
                        {user.stats.following_count ?? 0}
                      </span>{" "}
                      РїС–РґРїРёСЃРѕРє
                    </Link>
                  </>
                ) : null}
                <span className={styles.statStatic}>
                  <span className={styles.statValue}>
                    {user.stats.likes_received_count ?? 0}
                  </span>{" "}
                  РІРїРѕРґРѕР±Р°РЅСЊ
                </span>
              </div>
            ) : null}
          </div>

          <PublicUserActionsPanel
            user={user}
            shareUrl={shareUrl}
            isSelf={isSelf}
            socialState={socialState}
          />
        </header>

        <div className={styles.profileBody}>
          <section className={styles.about}>
            <h2 className={styles.sectionTitle}>РџСЂРѕ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°</h2>
            {user.profile?.about_me ? (
              <p className={styles.aboutText}>{user.profile.about_me}</p>
            ) : (
              <p className={styles.empty}>РћРїРёСЃ РїСЂРѕС„С–Р»СЋ РїРѕРєРё РЅРµ РґРѕРґР°РЅРѕ.</p>
            )}
          </section>
        </div>
      </section>
    </OnlineUsersProvider>
  );
}
