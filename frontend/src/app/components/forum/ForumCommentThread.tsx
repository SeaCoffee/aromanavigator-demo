'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';

import { deleteCommentAction } from '@/app/actions/commentActions';
import { buttonStyles } from '@/app/components/common/buttonStyles';
import ForumCommentCreateForm from '@/app/components/forum/ForumCommentCreateForm';
import ForumCommentEditForm from '@/app/components/forum/ForumCommentEditForm';
import ForumLikeButton from '@/app/components/forum/ForumLikeButton';
import MediaImage from '@/app/components/images/MediaImage';
import { PublicUserRoleBadge } from '@/app/components/users/PublicUserRoleBadge';
import type { ForumComment } from '@/app/types/forumTypes';
import { commentAnchorUrlBuilder } from '@/app/urls/pageUrls/commentAnchorUrlBuilder';
import { commentLikeTarget } from '@/app/utils/likeTargetBuilders';

import { forumCommentStyles } from './forumStyles';
import { formatForumUserLabel, normalizeActionMessage } from './forumUtils';

type Props = {
  items: ForumComment[];
  topicId: number;
  refreshPaths?: string[];
  maxDepth?: number;
  loginHref?: string;
  commentPagePath?: string;
  canPublishOfficial?: boolean;
};

type ReplyTo = NonNullable<ForumComment['reply_to']>;

function ClientDate({ value }: { value: string }) {
  const [text, setText] = useState(value);

  useEffect(() => {
    try {
      setText(
        new Intl.DateTimeFormat('uk-UA', {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date(value)),
      );
    } catch {
      setText(value);
    }
  }, [value]);

  return <>{text}</>;
}

function formatReplyToLabel(replyTo: ReplyTo) {
  return (
    replyTo.user_display_name ||
    replyTo.user_username ||
    (replyTo.user ? `РєРѕСЂРёСЃС‚СѓРІР°С‡ #${replyTo.user}` : 'РєРѕРјРµРЅС‚Р°СЂ')
  );
}

function buildCommentAnchorHref({
  commentPagePath,
  commentId,
}: {
  commentPagePath?: string;
  commentId: number;
}) {
  if (commentPagePath) {
    return commentAnchorUrlBuilder.withAnchor(commentPagePath, commentId);
  }

  return commentAnchorUrlBuilder.hash(commentId);
}

function ReplyToPreview({
  replyTo,
  href,
}: {
  replyTo: ReplyTo;
  href: string;
}) {
  const userLabel = formatReplyToLabel(replyTo);

  return (
    <div className="mb-3 rounded-2xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-sm text-gray-700">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={href} className="font-medium hover:underline">
          в†і Сѓ РІС–РґРїРѕРІС–РґСЊ {userLabel}
        </Link>

        <PublicUserRoleBadge
          roleLabel={replyTo.user_role_label}
          isStaff={replyTo.user_is_staff}
        />
      </div>

      {replyTo.is_deleted ? (
        <div className="mt-1 text-xs text-gray-500">
          РљРѕРјРµРЅС‚Р°СЂ, РЅР° СЏРєРёР№ РІС–РґРїРѕРІС–Р»Рё, РІРёРґР°Р»РµРЅРѕ.
        </div>
      ) : replyTo.body_preview ? (
        <div className="mt-1 max-h-10 overflow-hidden text-xs leading-relaxed text-gray-500">
          {replyTo.body_preview}
        </div>
      ) : null}
    </div>
  );
}

function CommentItem({
  item,
  topicId,
  refreshPaths,
  loginHref,
  commentPagePath,
  canPublishOfficial,
}: {
  item: ForumComment;
  topicId: number;
  refreshPaths?: string[];
  loginHref?: string;
  commentPagePath?: string;
  canPublishOfficial?: boolean;
}) {
  const [body, setBody] = useState(item.body);
  const [updatedAt, setUpdatedAt] = useState(item.updated_at);
  const [isDeleted, setIsDeleted] = useState(item.is_deleted);
  const [replyOpen, setReplyOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    setBody(item.body);
    setUpdatedAt(item.updated_at);
    setIsDeleted(item.is_deleted);
  }, [item.body, item.updated_at, item.is_deleted]);

  const canReply = !isDeleted;
  const canEdit = item.is_owner && !isDeleted;
  const canDelete = item.is_owner && !isDeleted;
  const userLabel = formatForumUserLabel(item);
  const isEdited = Boolean(updatedAt && updatedAt !== item.created_at);

  const handleSaved = (comment: ForumComment) => {
    setBody(comment.body);
    setUpdatedAt(comment.updated_at);
    setEditOpen(false);
  };

  const onDelete = () => {
    if (!canDelete || isDeleting) {
      return;
    }

    setDeleteError(null);

    startDeleteTransition(async () => {
      const result = await deleteCommentAction(item.id, {
        refreshPaths,
      });

      if (result.ok) {
        setBody('');
        setIsDeleted(true);
        setEditOpen(false);
        setReplyOpen(false);
        setConfirmDeleteOpen(false);
        return;
      }

      setDeleteError(normalizeActionMessage(result.msg));
    });
  };

  return (
    <div
      id={commentAnchorUrlBuilder.domId(item.id)}
      className={`${forumCommentStyles.node} scroll-mt-24`}
    >
      <div className={isDeleted ? forumCommentStyles.deletedCard : forumCommentStyles.card}>
        <div className="flex items-start gap-3">
          <MediaImage
            src={item.user_avatar}
            alt={userLabel}
            className={forumCommentStyles.avatar}
            fallbackClassName={forumCommentStyles.avatarFallback}
            fallback=""
          />

          <div className={forumCommentStyles.contentWrap}>
            <div className={forumCommentStyles.header}>
              <span className={forumCommentStyles.author}>{userLabel}</span>

              <PublicUserRoleBadge
                roleLabel={item.user_role_label}
                isStaff={item.user_is_staff}
              />

              {item.is_owner ? (
                <span className={forumCommentStyles.ownerBadge}>РІР°С€ РєРѕРјРµРЅС‚Р°СЂ</span>
              ) : null}

              <span className={forumCommentStyles.date}>
                <ClientDate value={item.created_at} />
              </span>

              {isEdited && !isDeleted ? (
                <span className={forumCommentStyles.date}>
                  СЂРµРґ. <ClientDate value={updatedAt} />
                </span>
              ) : null}
            </div>

            {!isDeleted && item.reply_to ? (
              <ReplyToPreview
                replyTo={item.reply_to}
                href={buildCommentAnchorHref({
                  commentPagePath,
                  commentId: item.reply_to.id,
                })}
              />
            ) : null}

            {editOpen && canEdit ? (
              <div className="mt-3">
                <ForumCommentEditForm
                  commentId={item.id}
                  initialBody={body}
                  refreshPaths={refreshPaths}
                  onSaved={handleSaved}
                  onCancel={() => setEditOpen(false)}
                />
              </div>
            ) : (
              <div className={forumCommentStyles.body}>
                {isDeleted ? (
                  <span className={forumCommentStyles.deletedText}>
                    РљРѕРјРµРЅС‚Р°СЂ РІРёРґР°Р»РµРЅРѕ
                  </span>
                ) : (
                  body
                )}
              </div>
            )}

            {!isDeleted && item.attachments?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.attachments.map((photo) => (
                  <MediaImage
                    key={photo.id}
                    src={photo.image}
                    alt="Р¤РѕС‚Рѕ РґРѕ РєРѕРјРµРЅС‚Р°СЂСЏ"
                    className="h-24 w-24 rounded-xl object-cover"
                    fallbackClassName="h-24 w-24 rounded-xl bg-gray-100"
                    fallback=""
                  />
                ))}
              </div>
            ) : null}

            <div className={forumCommentStyles.actions}>
              {!isDeleted ? (
                <ForumLikeButton
                  target={commentLikeTarget(item.id)}
                  initialLiked={item.is_liked_by_me}
                  initialCount={item.likes_count}
                  initialMyLikeId={item.my_like_id ?? null}
                  refreshPaths={refreshPaths}
                  size="sm"
                />
              ) : null}

              {canReply && !editOpen ? (
                <button
                  type="button"
                  onClick={() => setReplyOpen((value) => !value)}
                  className={forumCommentStyles.smallButton}
                >
                  {replyOpen ? 'РЎРєР°СЃСѓРІР°С‚Рё' : 'Р’С–РґРїРѕРІС–СЃС‚Рё'}
                </button>
              ) : null}

              {canEdit && !editOpen ? (
                <button
                  type="button"
                  onClick={() => {
                    setReplyOpen(false);
                    setConfirmDeleteOpen(false);
                    setEditOpen(true);
                  }}
                  className={forumCommentStyles.smallButton}
                >
                  Р РµРґР°РіСѓРІР°С‚Рё
                </button>
              ) : null}

              {canDelete && !editOpen ? (
                <button
                  type="button"
                  onClick={() => {
                    setReplyOpen(false);
                    setConfirmDeleteOpen((value) => !value);
                  }}
                  disabled={isDeleting}
                  className={forumCommentStyles.dangerButton}
                >
                  {confirmDeleteOpen ? 'РЎРєР°СЃСѓРІР°С‚Рё РІРёРґР°Р»РµРЅРЅСЏ' : 'Р’РёРґР°Р»РёС‚Рё'}
                </button>
              ) : null}
            </div>

            {confirmDeleteOpen && canDelete ? (
              <div className={forumCommentStyles.confirmBox}>
                <span>Р’РёРґР°Р»РёС‚Рё С†РµР№ РєРѕРјРµРЅС‚Р°СЂ?</span>

                <button
                  type="button"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className={`${buttonStyles.compactDanger}`}
                >
                  {isDeleting ? 'Р’РёРґР°Р»РµРЅРЅСЏ...' : 'РўР°Рє, РІРёРґР°Р»РёС‚Рё'}
                </button>
              </div>
            ) : null}

            {deleteError ? (
              <div className={forumCommentStyles.error}>{deleteError}</div>
            ) : null}

            {replyOpen && canReply && !editOpen ? (
              <div className="mt-3">
                <ForumCommentCreateForm
                  topicId={topicId}
                  parentId={item.id}
                  refreshPaths={refreshPaths}
                  compact
                  submitLabel="РќР°РґС–СЃР»Р°С‚Рё РІС–РґРїРѕРІС–РґСЊ"
                  placeholder={`Р’С–РґРїРѕРІС–РґСЊ РґР»СЏ ${userLabel}...`}
                  onCreated={() => setReplyOpen(false)}
                  loginHref={loginHref}
                  canPublishOfficial={canPublishOfficial}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForumCommentThread({
  items,
  topicId,
  refreshPaths,
  loginHref,
  commentPagePath,
  canPublishOfficial = false,
}: Props) {
  if (!items?.length) {
    return (
      <div className={forumCommentStyles.empty}>
        РљРѕРјРµРЅС‚Р°СЂС–РІ РїРѕРєРё РЅРµРјР°С”.
      </div>
    );
  }

  return (
    <div className={forumCommentStyles.tree}>
      {items.map((item) => (
        <CommentItem
          key={item.id}
          item={item}
          topicId={topicId}
          refreshPaths={refreshPaths}
          loginHref={loginHref}
          commentPagePath={commentPagePath}
          canPublishOfficial={canPublishOfficial}
        />
      ))}
    </div>
  );
}
