import { describe, expect, it } from 'vitest';

import {
  adminCommentTargetHref,
  adminCommentTargetLabel,
} from '@/app/components/admin/adminCommentTargetHelpers';
import type { ForumComment } from '@/app/types/forumTypes';

function makeComment(target: ForumComment['target']): ForumComment {
  return {
    id: 1,
    user: 1,
    user_username: 'seller',
    user_display_name: 'Seller',
    user_avatar: null,
    content_type: 1,
    object_id: target.id,
    target,
    parent: null,
    reply_to: null,
    body: 'Comment',
    is_deleted: false,
    likes_count: 0,
    is_liked_by_me: false,
    my_like_id: null,
    is_owner: false,
    attachments: [],
    created_at: '2026-06-16T10:00:00Z',
    updated_at: '2026-06-16T10:00:00Z',
  };
}

describe('adminCommentTargetHelpers', () => {
  it('links fragrance comments by slug and uses provided title', () => {
    const comment = makeComment({
      app: 'fragrance',
      model: 'fragrancemodel',
      id: 10,
      title: 'Dior Homme',
      slug: 'dior-homme',
    });

    expect(adminCommentTargetHref(comment)).toBe('/fragrances/dior-homme');
    expect(adminCommentTargetLabel(comment)).toBe('Dior Homme');
  });

  it('links article comments and falls back to a readable label', () => {
    const comment = makeComment({
      app: 'articles',
      model: 'article',
      id: 12,
      title: null,
    });

    expect(adminCommentTargetHref(comment)).toBe('/articles/12');
    expect(adminCommentTargetLabel(comment)).toBe('РЎС‚Р°С‚С‚СЏ #12');
  });

  it('keeps unknown targets unlinked with a neutral fallback label', () => {
    const comment = makeComment({
      app: 'unknown',
      model: 'thing',
      id: 7,
      title: null,
    });

    expect(adminCommentTargetHref(comment)).toBeNull();
    expect(adminCommentTargetLabel(comment)).toBe('РћР±КјС”РєС‚ #7');
  });
});
