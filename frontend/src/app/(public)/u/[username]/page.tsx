import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PublicUserProfileCard from '@/app/components/users/PublicUserProfileCard';
import PublicUserProfileLinks from '@/app/components/users/PublicUserProfileLinks';
import { publicUserStyles as styles } from '@/app/components/users/publicUser.styles';
import { siteUrl } from '@/app/constants/siteConstants';
import { getUserServer } from '@/app/lib/session';
import { getSocialStateServer } from '@/app/services/socialServices.server';
import { getPublicUserByUsernameServer } from '@/app/services/userServices.server';
import type { SocialState } from '@/app/types/socialTypes';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import {
  absoluteImageUrl,
  buildSeoMetadata,
  truncateSeoText,
} from '@/app/utils/seoMetadata';
import { getPublicUserDisplayName } from '@/app/utils/userDisplayUtils';
import { ApiError } from '@/errors/ApiError';

type Props = {
  params: Promise<{
    username: string;
  }>;
};

async function getSafeSocialState(
  userId: number,
  viewerId: number | null | undefined,
): Promise<SocialState | null> {
  if (!viewerId || viewerId === userId) return null;

  try {
    return await getSocialStateServer(userId);
  } catch {
    return null;
  }
}

function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  try {
    const publicUser = await getPublicUserByUsernameServer(username);
    const displayName = getPublicUserDisplayName(publicUser);
    const about = publicUser.profile?.about_me?.trim();
    const avatarUrl = absoluteImageUrl(publicUser.profile?.avatar_url);

    return buildSeoMetadata({
      title: `РџСЂРѕС„С–Р»СЊ ${displayName}`,
      description: truncateSeoText(
        about ||
          `РџСѓР±Р»С–С‡РЅРёР№ РїСЂРѕС„С–Р»СЊ ${displayName}: РїР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ, РіР°СЂРґРµСЂРѕР±, СЃС‚Р°С‚С‚С–, РІС–РґРіСѓРєРё С‚Р° РѕРіРѕР»РѕС€РµРЅРЅСЏ.`,
      ),
      path: userPageUrlBuilder.publicProfile(username),
      images: avatarUrl
        ? [{ url: avatarUrl, alt: displayName }]
        : undefined,
      keywords: [
        displayName,
        'РїСѓР±Р»С–С‡РЅРёР№ РїСЂРѕС„С–Р»СЊ',
        'РїР°СЂС„СѓРјРµСЂРЅР° СЃРїС–Р»СЊРЅРѕС‚Р°',
        'РіР°СЂРґРµСЂРѕР± Р°СЂРѕРјР°С‚С–РІ',
        'РІС–РґРіСѓРєРё РєРѕСЂРёСЃС‚СѓРІР°С‡Р°',
      ],
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      return buildSeoMetadata({
        title: 'РџСЂРѕС„С–Р»СЊ РЅРµ Р·РЅР°Р№РґРµРЅРѕ',
        description: 'РџСѓР±Р»С–С‡РЅРёР№ РїСЂРѕС„С–Р»СЊ РєРѕСЂРёСЃС‚СѓРІР°С‡Р° РЅРµ Р·РЅР°Р№РґРµРЅРѕ.',
        path: userPageUrlBuilder.publicProfile(username),
        noIndex: true,
      });
    }

    throw error;
  }
}

export default async function PublicUserProfilePage({ params }: Props) {
  const { username } = await params;

  try {
    const [publicUser, viewer] = await Promise.all([
      getPublicUserByUsernameServer(username),
      getUserServer(),
    ]);
    const socialState = await getSafeSocialState(publicUser.id, viewer?.id);
    const shareUrl = siteUrl(userPageUrlBuilder.publicProfile(username));

    return (
      <main className={styles.profilePage}>
        <PublicUserProfileCard
          user={publicUser}
          shareUrl={shareUrl}
          viewerId={viewer?.id ?? null}
          socialState={socialState}
        />
        <PublicUserProfileLinks
          username={username}
        />
      </main>
    );
  } catch (error) {
    if (isNotFoundError(error)) notFound();
    throw error;
  }
}
