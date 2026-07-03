import Link from 'next/link';

import { deleteForumTopicFormAction } from '@/app/actions/forumActions';
import { moderationAdminStyles as s } from '@/app/components/admin/moderationAdminStyles';
import type { ForumTopic } from '@/app/types/forumTypes';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';
import { formatDateTime } from '@/app/utils/dateFormatUtils';

type Props = {
  topics: ForumTopic[];
};

export default function AdminForumTopicsTable({ topics }: Props) {
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead className={s.thead}>
          <tr>
            <th className={s.th}>ID</th>
            <th className={s.th}>РўРµРјР°</th>
            <th className={s.th}>РђРІС‚РѕСЂ</th>
            <th className={s.th}>Р РѕР·РґС–Р»</th>
            <th className={s.th}>РЎС‚Р°РЅ</th>
            <th className={s.th}>РЎС‚РІРѕСЂРµРЅРѕ</th>
            <th className={s.th}>Р”С–С—</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => (
            <tr key={topic.id} className={s.row}>
              <td className={s.td}>{topic.id}</td>
              <td className={s.td}>
                <Link
                  href={forumPageUrlBuilder.topics.detail(topic.id)}
                  className="font-medium underline"
                >
                  {topic.title}
                </Link>
              </td>
              <td className={s.td}>
                {topic.author_display_name ?? topic.author_username ?? 'РљРѕСЂРёСЃС‚СѓРІР°С‡'}
              </td>
              <td className={s.td}>{topic.section_title ?? 'вЂ”'}</td>
              <td className={s.td}>
                <span className={s.badge}>
                  {topic.is_hidden ? 'РџСЂРёС…РѕРІР°РЅРѕ' : 'Р’РёРґРёРјРѕ'}
                </span>
              </td>
              <td className={s.td}>{formatDateTime(topic.created_at)}</td>
              <td className={s.td}>
                <form action={deleteForumTopicFormAction}>
                  <input type="hidden" name="id" value={topic.id} />
                  <button type="submit" className={s.dangerButton}>
                    Р’РёРґР°Р»РёС‚Рё
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {topics.length === 0 ? (
            <tr>
              <td className={s.td} colSpan={7}>
                РўРµРј С„РѕСЂСѓРјСѓ РЅРµРјР°С”.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
