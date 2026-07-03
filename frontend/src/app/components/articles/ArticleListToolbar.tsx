import Form from 'next/form';
import Link from 'next/link';

import { articleStyles as styles } from '@/app/components/articles/article.styles';
import { ARTICLE_STATUS_OPTIONS } from '@/app/constants/articleConstants';
import type { ArticleListQuery } from '@/app/types/articleTypes';

type Props = {
  action: string;
  query: ArticleListQuery;
  showStatusFilter?: boolean;
};

export default function ArticleListToolbar({
  action,
  query,
  showStatusFilter = false,
}: Props) {
  return (
    <div className={styles.toolbar}>
      <Form
        action={action}
        className={styles.toolbarForm}
      >
        <input
          name="q"
          type="search"
          defaultValue={String(query.q ?? query.search ?? '')}
          placeholder="РџРѕС€СѓРє Р·Р° Р·Р°РіРѕР»РѕРІРєРѕРј, С‚РµРєСЃС‚РѕРј Р°Р±Рѕ С‚РµРіРѕРј"
          className={styles.input}
        />

        {showStatusFilter ? (
          <select
            name="status"
            defaultValue={String(query.status ?? '')}
            className={styles.input}
          >
            <option value="">РЈСЃС– СЃС‚Р°С‚СѓСЃРё</option>

            {ARTICLE_STATUS_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="tag_name"
            defaultValue={String(query.tag_name ?? '')}
            placeholder="РўРµРі"
            className={styles.input}
          />
        )}

        <select
          name="ordering"
          defaultValue={String(query.ordering ?? '-created_at')}
          className={styles.input}
        >
          <option value="-created_at">РЎРїРѕС‡Р°С‚РєСѓ РЅРѕРІС–</option>
          <option value="created_at">РЎРїРѕС‡Р°С‚РєСѓ СЃС‚Р°СЂС–</option>
          <option value="-updated_at">РЎРїРѕС‡Р°С‚РєСѓ РѕРЅРѕРІР»РµРЅС–</option>
          <option value="title">Р—Р° РЅР°Р·РІРѕСЋ РђвЂ“РЇ</option>
          <option value="-title">Р—Р° РЅР°Р·РІРѕСЋ РЇвЂ“Рђ</option>
        </select>

        <button
          type="submit"
          className={styles.button}
        >
          Р—Р°СЃС‚РѕСЃСѓРІР°С‚Рё
        </button>

        <Link
          href={action}
          className={styles.reset}
        >
          РЎРєРёРЅСѓС‚Рё
        </Link>
      </Form>
    </div>
  );
}
