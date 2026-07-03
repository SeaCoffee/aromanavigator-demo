import FavoriteCard from '@/app/components/favorites/FavoriteCard';
import {
  favoriteGroupOrder,
  getFavoriteGroupLabel,
  getFavoriteItemGroup,
} from '@/app/components/favorites/favoriteHelpers';
import { favoriteStyles } from '@/app/components/favorites/favoriteStyles';
import type {
  FavoriteItem,
} from '@/app/types/favoriteTypes';

type Props = {
  favorites: FavoriteItem[];
};

function groupFavorites(favorites: FavoriteItem[]) {
  const groups = new Map<string, FavoriteItem[]>();

  for (const favorite of favorites) {
    const group = getFavoriteItemGroup(favorite.item);
    const current = groups.get(group) ?? [];

    current.push(favorite);
    groups.set(group, current);
  }

  return favoriteGroupOrder
    .map((group) => ({
      group,
      label: getFavoriteGroupLabel(group),
      favorites: groups.get(group) ?? [],
    }))
    .filter((section) => section.favorites.length > 0);
}

export default function FavoriteList({ favorites }: Props) {
  if (favorites.length === 0) {
    return (
      <section className={favoriteStyles.emptyCard}>
        Р’ РѕР±СЂР°РЅРѕРјСѓ РїРѕРєРё РЅС–С‡РѕРіРѕ РЅРµРјР°С”.
      </section>
    );
  }

  const sections = groupFavorites(favorites);

  return (
    <div className={favoriteStyles.sections}>
      {sections.map((section) => (
        <section key={section.group} className={favoriteStyles.section}>
          <header className={favoriteStyles.sectionHeader}>
            <h2 className={favoriteStyles.sectionTitle}>{section.label}</h2>
            <span className={favoriteStyles.sectionCount}>
              {section.favorites.length}
            </span>
          </header>

          <div className={favoriteStyles.grid}>
            {section.favorites.map((favorite) => (
              <FavoriteCard key={favorite.id} favorite={favorite} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
