'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { deleteObjectAttachmentAction, deleteObjectCoverAction } from '@/app/actions/objectPhotoActions';
import { moderationAdminStyles as s } from '@/app/components/admin/moderationAdminStyles';
import MediaImage from '@/app/components/images/MediaImage';
import type { ModerationPhoto } from '@/app/types/photoTypes';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';
import { formatDateTime } from '@/app/utils/dateFormatUtils';
import { getEntityTypeLabel } from '@/app/utils/entityDisplayUtils';

type Props = {
  title: string;
  photos: ModerationPhoto[];
};

function photoTargetHref(target: ModerationPhoto['target']): string | null {
  const key = `${target.app}.${target.model}`.toLowerCase();

  if (key === 'forum.forumtopicmodel') {
    return forumPageUrlBuilder.topics.detail(target.id);
  }

  if (key === 'comments.commentmodel') {
    return adminPageUrlBuilder.comments.list({ q: String(target.id) });
  }

  return null;
}

export default function AdminPhotosTable({ title, photos }: Props) {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function remove(photo: ModerationPhoto) {
    startTransition(() => {
      void (async () => {
        const result = photo.kind === 'cover'
          ? await deleteObjectCoverAction(photo.id, ['/admin/photos'])
          : await deleteObjectAttachmentAction(photo.id, ['/admin/photos']);
        setMessages((current) => ({
          ...current,
          [`${photo.kind}-${photo.id}`]: result.ok ? result.message || 'Р¤РѕС‚Рѕ РІРёРґР°Р»РµРЅРѕ.' : result.error || 'РќРµ РІРґР°Р»РѕСЃСЏ РІРёРґР°Р»РёС‚Рё С„РѕС‚Рѕ.',
        }));
      })();
    });
  }

  return (
    <section className={s.panel}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead className={s.thead}>
            <tr>
              <th className={s.th}>ID</th>
              <th className={s.th}>Р¤РѕС‚Рѕ</th>
              <th className={s.th}>РћР±вЂ™С”РєС‚</th>
              <th className={s.th}>РЎС‚РІРѕСЂРµРЅРѕ</th>
              <th className={s.th}>Р”С–С—</th>
            </tr>
          </thead>
          <tbody>
            {photos.map((photo) => (
              <tr key={`${photo.kind}-${photo.id}`} className={s.row}>
                <td className={s.td}>{photo.id}</td>
                <td className={s.td}>
                  <a href={photo.image} target="_blank" rel="noreferrer"><MediaImage src={photo.image} alt="" className="h-16 w-16 rounded-xl object-cover" fallbackClassName="grid h-16 w-16 place-items-center rounded-xl bg-gray-100 text-[10px] text-gray-400" fallback="РќРµРјР°С”" /></a>
                </td>
                <td className={s.td}>
                  {photoTargetHref(photo.target) ? <Link className="underline" href={photoTargetHref(photo.target)!}>{getEntityTypeLabel(photo.target)} #{photo.target.id}</Link> : `${getEntityTypeLabel(photo.target)} #${photo.target.id}`}
                </td>
                <td className={s.td}>{formatDateTime(photo.created_at)}</td>
                <td className={s.td}>
                  <button disabled={pending} onClick={() => remove(photo)} type="button" className={s.dangerButton}>Р’РёРґР°Р»РёС‚Рё</button>
                  {messages[`${photo.kind}-${photo.id}`] ? <p className={s.smallMuted}>{messages[`${photo.kind}-${photo.id}`]}</p> : null}
                </td>
              </tr>
            ))}
            {photos.length === 0 ? (
              <tr>
                <td className={s.td} colSpan={5}>
                  Р¤РѕС‚Рѕ РЅРµРјР°С”.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
