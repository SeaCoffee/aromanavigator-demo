'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { deleteForumTopicAction } from '@/app/actions/forumActions';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';

import { forumTopicStyles } from './forumStyles';
import { normalizeActionMessage } from './forumUtils';

type Props = {
  topicId: number;
  sectionId?: number | string | null;
  refreshPaths?: string[];
  onDeleted?: () => void;
};

export default function ForumTopicDeleteButton({
  topicId,
  sectionId = null,
  refreshPaths,
  onDeleted,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const afterDeleteHref = sectionId
    ? forumPageUrlBuilder.sections.detail(sectionId)
    : forumPageUrlBuilder.home();

  const onDelete = () => {
    if (isPending) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteForumTopicAction(topicId, {
        refreshPaths,
      });

      if (result.ok) {
        setDeleted(true);
        setConfirmOpen(false);
        onDeleted?.();
        return;
      }

      setError(normalizeActionMessage(result.msg));
    });
  };

  if (deleted) {
    return (
      <div className={forumTopicStyles.deleteWrap}>
        <div className={forumTopicStyles.success}>РўРµРјСѓ РІРёРґР°Р»РµРЅРѕ.</div>
        <Link href={afterDeleteHref} className={forumTopicStyles.actionButton}>
          РџРѕРІРµСЂРЅСѓС‚РёСЃСЏ
        </Link>
      </div>
    );
  }

  return (
    <div className={forumTopicStyles.deleteWrap}>
      <button
        type="button"
        onClick={() => setConfirmOpen((value) => !value)}
        disabled={isPending}
        className={forumTopicStyles.actionDangerButton}
      >
        {confirmOpen ? 'РЎРєР°СЃСѓРІР°С‚Рё' : 'Р’РёРґР°Р»РёС‚Рё'}
      </button>

      {confirmOpen ? (
        <div className={forumTopicStyles.deleteConfirmBox}>
          <span>Р’РёРґР°Р»РёС‚Рё С†СЋ С‚РµРјСѓ? Р”С–СЋ РЅРµ РјРѕР¶РЅР° Р±СѓРґРµ С€РІРёРґРєРѕ СЃРєР°СЃСѓРІР°С‚Рё.</span>

          <div className={forumTopicStyles.deleteConfirmActions}>
            <button
              type="button"
              onClick={onDelete}
              disabled={isPending}
              className={forumTopicStyles.actionDangerButton}
            >
              {isPending ? 'Р’РёРґР°Р»РµРЅРЅСЏ...' : 'РўР°Рє, РІРёРґР°Р»РёС‚Рё'}
            </button>

            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={isPending}
              className={forumTopicStyles.actionButton}
            >
              РЎРєР°СЃСѓРІР°С‚Рё
            </button>
          </div>
        </div>
      ) : null}

      {error ? <span className={forumTopicStyles.error}>{error}</span> : null}
    </div>
  );
}
