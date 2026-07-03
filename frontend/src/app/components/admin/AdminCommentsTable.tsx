import Link from 'next/link';

import { deleteCommentFormAction } from '@/app/actions/commentActions';
import {
  adminCommentTargetHref,
  adminCommentTargetLabel,
} from '@/app/components/admin/adminCommentTargetHelpers';
import { moderationAdminStyles as s } from '@/app/components/admin/moderationAdminStyles';
import type { ForumComment } from '@/app/types/forumTypes';
import { formatDateTime } from '@/app/utils/dateFormatUtils';

export default function AdminCommentsTable({ comments }: { comments: ForumComment[] }) {
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead className={s.thead}>
          <tr>
            <th className={s.th}>ID</th>
            <th className={s.th}>РђРІС‚РѕСЂ</th>
            <th className={s.th}>РћР±КјС”РєС‚</th>
            <th className={s.th}>РљРѕРјРµРЅС‚Р°СЂ</th>
            <th className={s.th}>РЎС‚РІРѕСЂРµРЅРѕ</th>
            <th className={s.th}>Р”С–С—</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => {
            const href = adminCommentTargetHref(comment);
            const label = adminCommentTargetLabel(comment);
            return (
              <tr key={comment.id} className={s.row}>
                <td className={s.td}>{comment.id}</td>
                <td className={s.td}>{comment.user_display_name ?? comment.user_username ?? 'РљРѕСЂРёСЃС‚СѓРІР°С‡'}</td>
                <td className={s.td}>
                  {href ? <Link className="font-medium underline" href={href}>{label}</Link> : label}
                </td>
                <td className={s.td}>
                  <p className="max-w-xl">{comment.body}</p>
                  {comment.attachments.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {comment.attachments.map((photo) => (
                        <a key={photo.id} href={photo.image} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.image} alt="Р¤РѕС‚Рѕ РґРѕ РєРѕРјРµРЅС‚Р°СЂСЏ" className="size-16 rounded-lg border object-cover" />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </td>
                <td className={s.td}>{formatDateTime(comment.created_at)}</td>
                <td className={s.td}>
                  <form action={deleteCommentFormAction}>
                    <input type="hidden" name="id" value={comment.id} />
                    <button type="submit" className={s.dangerButton}>Р’РёРґР°Р»РёС‚Рё</button>
                  </form>
                </td>
              </tr>
            );
          })}
          {comments.length === 0 ? (
            <tr><td className={s.td} colSpan={6}>РљРѕРјРµРЅС‚Р°СЂС–РІ РЅРµРјР°С”.</td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
