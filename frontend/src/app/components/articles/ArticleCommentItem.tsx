'use client';

import { useEffect, useState, useTransition } from 'react';

import { deleteCommentAction } from '@/app/actions/commentActions';
import ArticleCommentForm from '@/app/components/articles/ArticleCommentForm';
import { buttonStyles } from '@/app/components/common/buttonStyles';
import ForumCommentEditForm from '@/app/components/forum/ForumCommentEditForm';
import MediaImage from '@/app/components/images/MediaImage';
import type { ForumCommentThreadItem } from '@/app/types/forumTypes';
import { commentAnchorUrlBuilder } from '@/app/urls/pageUrls/commentAnchorUrlBuilder';

type Props = {
  item: ForumCommentThreadItem;
  articleId: number;
  refreshPath: string;
  loginHref?: string;
  depth?: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function wasEdited(createdAt: string, updatedAt: string) {
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000;
}

export default function ArticleCommentItem({
  item,
  articleId,
  refreshPath,
  loginHref,
  depth = 0,
}: Props) {
  const [body, setBody] = useState(item.body);
  const [updatedAt, setUpdatedAt] = useState(item.updated_at);
  const [isDeleted, setIsDeleted] = useState(item.is_deleted);
  const [replyOpen, setReplyOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    setBody(item.body);
    setUpdatedAt(item.updated_at);
    setIsDeleted(item.is_deleted);
  }, [item.body, item.updated_at, item.is_deleted]);

  const author =
    item.user_display_name || item.user_username || 'РљРѕСЂРёСЃС‚СѓРІР°С‡';
  const canChange = item.is_owner && !isDeleted;

  const deleteComment = () => {
    setError(null);
    startDeleteTransition(async () => {
      const result = await deleteCommentAction(item.id, {
        refreshPaths: [refreshPath],
      });

      if (result.ok) {
        setIsDeleted(true);
        setBody('');
        setReplyOpen(false);
        setEditOpen(false);
        setConfirmDeleteOpen(false);
        return;
      }

      setError(result.msg);
    });
  };

  return (
    <div className="grid gap-3">
      <article
        id={commentAnchorUrlBuilder.domId(item.id)}
        className="scroll-mt-24 rounded-[20px] border border-[#eadfd5] bg-white p-4"
      >
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-[#7a6d64]">
          <span className="text-[#2b211d]">{author}</span>
          <span>{formatDate(item.created_at)}</span>
          {wasEdited(item.created_at, updatedAt) && !isDeleted ? (
            <span>СЂРµРґ. {formatDate(updatedAt)}</span>
          ) : null}
        </div>

        {editOpen && canChange ? (
          <div className="mt-3">
            <ForumCommentEditForm
              commentId={item.id}
              initialBody={body}
              refreshPaths={[refreshPath]}
              onSaved={(comment) => {
                setBody(comment.body);
                setUpdatedAt(comment.updated_at);
                setEditOpen(false);
              }}
              onCancel={() => setEditOpen(false)}
            />
          </div>
        ) : isDeleted ? (
          <p className="mt-3 text-sm italic text-[#8f8278]">
            РљРѕРјРµРЅС‚Р°СЂ РІРёРґР°Р»РµРЅРѕ.
          </p>
        ) : (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#3c322d]">
            {body}
          </p>
        )}

        {!isDeleted && item.attachments?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.attachments.map((photo) => (
              <MediaImage
                key={photo.id}
                src={photo.image}
                alt="Р¤РѕС‚Рѕ РґРѕ РєРѕРјРµРЅС‚Р°СЂСЏ"
                className="h-24 w-24 rounded-xl object-cover"
                fallbackClassName="h-24 w-24 rounded-xl bg-[#f1e7dc]"
                fallback=""
              />
            ))}
          </div>
        ) : null}

        {!isDeleted && !editOpen ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setReplyOpen((value) => !value)}
              className={buttonStyles.compactSecondary}
            >
              {replyOpen ? 'РЎРєР°СЃСѓРІР°С‚Рё РІС–РґРїРѕРІС–РґСЊ' : 'Р’С–РґРїРѕРІС–СЃС‚Рё'}
            </button>

            {canChange ? (
              <button
                type="button"
                onClick={() => {
                  setReplyOpen(false);
                  setConfirmDeleteOpen(false);
                  setEditOpen(true);
                }}
                className={buttonStyles.compactSecondary}
              >
                Р РµРґР°РіСѓРІР°С‚Рё
              </button>
            ) : null}

            {canChange ? (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen((value) => !value)}
                className={buttonStyles.compactDanger}
              >
                {confirmDeleteOpen ? 'РЎРєР°СЃСѓРІР°С‚Рё РІРёРґР°Р»РµРЅРЅСЏ' : 'Р’РёРґР°Р»РёС‚Рё'}
              </button>
            ) : null}
          </div>
        ) : null}

        {confirmDeleteOpen && canChange ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-[16px] bg-red-50 p-3 text-sm text-red-800">
            <span>Р’РёРґР°Р»РёС‚Рё С†РµР№ РєРѕРјРµРЅС‚Р°СЂ?</span>
            <button
              type="button"
              onClick={deleteComment}
              disabled={isDeleting}
              className={buttonStyles.compactDanger}
            >
              {isDeleting ? 'Р’РёРґР°Р»РµРЅРЅСЏ...' : 'РўР°Рє, РІРёРґР°Р»РёС‚Рё'}
            </button>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

        {replyOpen && !isDeleted && !editOpen ? (
          <div className="mt-3">
            <ArticleCommentForm
              articleId={articleId}
              refreshPath={refreshPath}
              loginHref={loginHref}
              parentId={item.id}
              compact
              submitLabel="РќР°РґС–СЃР»Р°С‚Рё РІС–РґРїРѕРІС–РґСЊ"
              placeholder={`Р’С–РґРїРѕРІС–РґСЊ РґР»СЏ ${author}...`}
              onCreated={() => setReplyOpen(false)}
            />
          </div>
        ) : null}
      </article>

      {item.replies?.length ? (
        <div
          className={
            depth >= 2
              ? 'grid gap-3'
              : 'ml-4 grid gap-3 border-l border-[#eadfd5] pl-4'
          }
        >
          {item.replies.map((reply) => (
            <ArticleCommentItem
              key={reply.id}
              item={reply}
              articleId={articleId}
              refreshPath={refreshPath}
              loginHref={loginHref}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
