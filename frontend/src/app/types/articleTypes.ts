import type { ID } from '@/app/types/http';
import type {
  ObjectAttachmentPhoto,
  ObjectCover,
} from '@/app/types/photoTypes';

export type ArticleStatus = 'draft' | 'pending' | 'published' | 'rejected';

export type ArticleTag = {
  id: ID;
  name: string;
};

export type ArticleAuthor = {
  id: ID;
  display_name: string;
  avatar_url: string;
};

export type ArticleListItem = {
  id: ID;
  title: string;
  excerpt: string;
  status: ArticleStatus;
  status_label: string;
  author: ArticleAuthor;
  tags: ArticleTag[];
  cover: ObjectCover | null;
  created_at: string;
  updated_at: string;
};

export type ArticleDetail = {
  id: ID;
  title: string;
  content: string;
  status: ArticleStatus;
  status_label: string;
  moderator_comment: string;
  author: ArticleAuthor;
  author_id: ID;
  tags: ArticleTag[];
  cover: ObjectCover | null;
  attachments: ObjectAttachmentPhoto[];
  created_at: string;
  updated_at: string;
};

export type ArticleCreatePayload = {
  title: string;
  content: string;
  status?: ArticleStatus;
  tag_names?: string[];
};

export type ArticleUpdatePayload = {
  title?: string;
  content?: string;
  status?: ArticleStatus;
  tag_names?: string[];
};

export type ArticleRejectPayload = {
  moderator_comment?: string;
};

export type ArticleListQuery = {
  page?: string | number;
  page_size?: string | number;
  q?: string;
  search?: string;
  status?: ArticleStatus | string;
  status_in?: string;
  tag?: string | number;
  tag_name?: string;
  tags?: string;
  tags_in?: string;
  author?: string | number;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
  ordering?: string;
};
