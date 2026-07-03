import Link from 'next/link';

import { publicUserStyles as styles } from '@/app/components/users/publicUser.styles';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';

type Props = {
  username: string;
};

const getLinks = (username: string) => [
  {
    label: 'РћРіР»СЏРґ',
    href: userPageUrlBuilder.publicProfile(username),
    active: true,
  },
  {
    label: 'РђРєС‚РёРІРЅС–СЃС‚СЊ',
    href: userPageUrlBuilder.activity(username),
  },
  {
    label: 'РџР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ',
    href: userPageUrlBuilder.tasteProfile(username),
  },
  {
    label: 'Р“Р°СЂРґРµСЂРѕР±',
    href: userPageUrlBuilder.wardrobe(username),
  },
  {
    label: 'РЎС‚Р°С‚С‚С–',
    href: userPageUrlBuilder.articles(username),
  },
  {
    label: 'РџС–РґРїРёСЃРЅРёРєРё',
    href: userPageUrlBuilder.followers(username),
  },
  {
    label: 'РџС–РґРїРёСЃРєРё',
    href: userPageUrlBuilder.following(username),
  },
];

export default function PublicUserProfileLinks({ username }: Props) {
  return (
    <nav className={styles.nav} aria-label="Р РѕР·РґС–Р»Рё РїСЂРѕС„С–Р»СЋ">
      {getLinks(username).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={link.active ? 'page' : undefined}
          className={[
            styles.navLink,
            link.active ? styles.navLinkActive : '',
          ].join(' ')}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
