import Link from 'next/link';

import { AppIcon } from '@/app/components/fragrances/AppLucideIcons';
import ShareButton from '@/app/components/share/ShareButton';
import BlockUserButton from '@/app/components/social/BlockUserButton';
import FollowToggleButton from '@/app/components/social/FollowToggleButton';
import { publicUserStyles as styles } from '@/app/components/users/publicUser.styles';
import type { SocialState } from '@/app/types/socialTypes';
import type { PublicUser } from '@/app/types/userTypes';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { wardrobePageUrlBuilder } from '@/app/urls/pageUrls/wardrobePageUrlBuilder';
import { getPublicUserProfileUsername } from '@/app/utils/userDisplayUtils';

type Props = {
  user: PublicUser;
  shareUrl: string;
  isSelf?: boolean;
  socialState?: SocialState | null;
};

export default function PublicUserActionsPanel({
  user,
  shareUrl,
  isSelf = false,
  socialState = null,
}: Props) {
  const publicUsername = getPublicUserProfileUsername(user);

  if (isSelf) {
    return (
      <div className={styles.profileActions}>
        <Link
          href={mePageUrlBuilder.profile.edit()}
          className={styles.actionPrimary}
        >
          <AppIcon name="edit" className="size-4" />
          <span className="ml-2">Р РµРґР°РіСѓРІР°С‚Рё РїСЂРѕС„С–Р»СЊ</span>
        </Link>
        <Link
          href={wardrobePageUrlBuilder.me.list()}
          className={styles.actionSecondary}
        >
          РњС–Р№ РіР°СЂРґРµСЂРѕР±
        </Link>
        <ShareButton
          url={shareUrl}
          title={`РџСЂРѕС„С–Р»СЊ ${publicUsername ?? ''}`}
          label="РџРѕРґС–Р»РёС‚РёСЃСЏ РїСЂРѕС„С–Р»РµРј"
          iconOnly
          className={styles.actionQuiet}
        />
      </div>
    );
  }

  return (
    <div className={styles.profileActions}>
      <FollowToggleButton
        userId={user.id}
        publicUsername={publicUsername}
        initialIsFollowing={socialState?.is_following ?? false}
        disabled={socialState?.is_blocked_between ?? false}
        buttonClassName={styles.actionPrimary}
        messageClassName={styles.actionMessage}
      />

      <ShareButton
        url={shareUrl}
        title={`РџСЂРѕС„С–Р»СЊ ${publicUsername ?? ''}`}
        label="РџРѕРґС–Р»РёС‚РёСЃСЏ РїСЂРѕС„С–Р»РµРј"
        iconOnly
        className={styles.actionQuiet}
      />

      <details className={styles.moreActions}>
        <summary className={styles.moreActionsSummary}>Р©Рµ</summary>
        <div className={styles.moreActionsBody}>
          <BlockUserButton
            userId={user.id}
            publicUsername={publicUsername}
            initialIsBlockedByMe={socialState?.is_blocked_by_me ?? false}
            buttonClassName={styles.actionQuiet}
            messageClassName={styles.actionMessage}
          />
        </div>
      </details>
    </div>
  );
}
