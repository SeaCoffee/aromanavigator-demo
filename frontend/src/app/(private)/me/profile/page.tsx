import Link from 'next/link';

import ProfileEditForm from '@/app/components/me/ProfileEditForm';
import ProfileAvatarEditor from '@/app/components/me/ProfileAvatarEditor';
import { meDashboardStyles as styles } from '@/app/components/me/meDashboard.styles';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getObjectPhotosServer } from '@/app/services/objectPhotoServices.server';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { profilePhotoTarget } from '@/app/utils/photoTargetBuilders';

export default async function MeProfilePage() {
  const user = await requireUserOrRedirect(
    authPageUrlBuilder.login({
      next: mePageUrlBuilder.profile.edit(),
    }),
    mePageUrlBuilder.profile.edit(),
  );

  const publicProfileHref = user.profile?.display_name
    ? userPageUrlBuilder.publicProfile(user.profile.display_name)
    : null;
  const avatarTarget = user.profile
    ? profilePhotoTarget(user.profile.id)
    : null;
  const avatarPhotos = avatarTarget
    ? await getObjectPhotosServer(avatarTarget)
    : null;
  const avatarRefreshPaths = [
    mePageUrlBuilder.profile.edit(),
    mePageUrlBuilder.home(),
    ...(publicProfileHref ? [publicProfileHref] : []),
  ];

  return (
    <main className={styles.profilePage}>
      <section className={styles.profileHeader}>
        <div className={styles.profileHeaderContent}>
          <div className={styles.profileHeaderKicker}>РќР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ Р°РєР°СѓРЅС‚Р°</div>

          <h1 className={styles.profileHeaderTitle}>РџСЂРѕС„С–Р»СЊ</h1>

          <p className={styles.profileHeaderText}>
            РљРµСЂСѓР№С‚Рµ РїСѓР±Р»С–С‡РЅРёРј С–РјКјСЏРј, СЂРµРіС–РѕРЅРѕРј С‚Р° РєРѕСЂРѕС‚РєРёРј РѕРїРёСЃРѕРј. Р¦С– РґР°РЅС–
            РІРёРєРѕСЂРёСЃС‚РѕРІСѓСЋС‚СЊСЃСЏ Сѓ РїСЂРѕС„С–Р»С–, РїРѕСЃРёР»Р°РЅРЅСЏС… С– РїСѓР±Р»С–С‡РЅРёС… РґС–СЏС… РЅР° СЃР°Р№С‚С–.
          </p>
        </div>

        {publicProfileHref ? (
          <Link href={publicProfileHref} className={styles.publicProfileLink}>
            Р’С–РґРєСЂРёС‚Рё РїСѓР±Р»С–С‡РЅРёР№ РїСЂРѕС„С–Р»СЊ
          </Link>
        ) : null}
      </section>

      {avatarTarget && user.profile ? (
        <ProfileAvatarEditor
          target={avatarTarget}
          initialCover={avatarPhotos?.cover ?? null}
          displayName={user.profile.display_name}
          refreshPaths={avatarRefreshPaths}
        />
      ) : null}

      <ProfileEditForm profile={user.profile} />
    </main>
  );
}
