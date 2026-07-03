// src/app/types/forumTypes.ts

export type ID = number;

export type ApiListMeta = {
  total_items?: number;
  total_pages?: number;
  prev?: boolean | string | null;
  next?: boolean | string | null;
  count?: number;
};

export type Paginated<T> = ApiListMeta & {
  results: T[];
};

export type ObjectPhoto = {
  id: number;
  position?: number;
  image: string;
  created_at?: string;
  updated_at?: string;
};

export type ObjectCover = {
  id: number;
  image: string;
  created_at?: string;
  updated_at?: string;
};

export type Tag = {
  id: number;
  code: string;
  items_count: number | null;
  created_at?: string;
  updated_at?: string;
};

// =========================
// Sections
// =========================

export type ForumSection = {
  id: number;
  title: string;
  slug: string;
  description: string;
  is_active: boolean;
  order: number;
  topics_count: number;
  comments_count: number;
  cover: ObjectCover | null;
  attachments: ObjectPhoto[];
  created_at: string;
  updated_at: string;
};

export type ForumSectionCreatePayload = {
  title: string;
  description?: string;
  is_active?: boolean;
  order?: number;
};

export type ForumSectionUpdatePayload = Partial<ForumSectionCreatePayload>;

// =========================
// Topics
// =========================

export type ForumTopic = {
  id: number;
  section: number;
  author: number;

  author_username: string | null;
  author_display_name: string | null;
  author_avatar: string | null;
  author_is_staff?: boolean;
  author_role_label?: string | null;

  section_title: string | null;
  section_slug: string | null;

  title: string;
  slug: string;
  content: string;

  is_pinned: boolean;
  is_locked: boolean;
  is_hidden: boolean;

  comments_count: number;
  likes_count: number;
  views_count: number;

  last_activity_at: string;

  cover: ObjectCover | null;
  attachments: ObjectPhoto[];

  tags_read: string[];

  is_liked_by_me: boolean;
  my_like_id: number | null;

  is_owner: boolean;

  created_at: string;
  updated_at: string;
};

export type ForumTopicCreatePayload = {
  section: number;
  title: string;
  content: string;
  tags?: string[];

  is_pinned?: boolean;
  is_locked?: boolean;
  is_hidden?: boolean;
};

export type ForumTopicUpdatePayload = Partial<{
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  is_hidden: boolean;
}>;

export type ForumTopicListQuery = Partial<{
  page: number;
  page_size: number;
  ordering: string;
  search: string;
  section: number | string;
  tag: string;
}>;

// =========================
// Comments
// =========================

export type ForumCommentReplyTo = {
  id: number;
  is_deleted: boolean;

  user: number | null;
  user_username: string | null;
  user_display_name: string | null;
  user_avatar: string | null;
  user_is_staff?: boolean;
  user_role_label?: string | null;

  body_preview: string | null;
};

export type ForumComment = {
  id: number;
  user: number;

  user_username: string | null;
  user_display_name: string | null;
  user_avatar: string | null;
  user_is_staff?: boolean;
  user_role_label?: string | null;

  content_type: number;
  object_id: number;
  target: {
    app: string;
    model: string;
    id: number;
    title: string | null;
    slug?: string | null;
  };
  parent: number | null;
  reply_to: ForumCommentReplyTo | null;

  body: string;
  is_deleted: boolean;

  likes_count: number;
  is_liked_by_me: boolean;
  my_like_id: number | null;

  is_owner: boolean;

  attachments: ObjectPhoto[];

  created_at: string;
  updated_at: string;
};

export type ForumCommentThreadItem = {
  id: number;
  user: number;

  user_username: string | null;
  user_display_name: string | null;
  user_avatar: string | null;
  user_is_staff?: boolean;
  user_role_label?: string | null;

  body: string;
  is_deleted: boolean;

  likes_count: number;
  is_liked_by_me: boolean;
  my_like_id: number | null;

  is_owner: boolean;

  attachments: ObjectPhoto[];

  created_at: string;
  updated_at: string;

  parent: number | null;
  replies: ForumCommentThreadItem[];
};

export type ForumCommentTargetQuery = {
  app: string;
  model: string;
  id: number | string;
  page?: number;
  page_size?: number;
};

export type ForumCommentCreatePayload = {
  target: {
    app: string;
    model: string;
    id: number | string;
  };
  body: string;
  parent_id?: number | null;
};

export type ForumCommentUpdatePayload = {
  body: string;
};

// =========================
// Likes
// =========================

export type LikeTargetPayload = {
  target: {
    content_type: 'forumtopicmodel' | 'commentmodel' | string;
    object_id: number;
  };
};

export type ForumLike = {
  id: number;
  created_at: string;
  item: {
    app: string;
    model: string;
    id: number;
  } | null;
};
