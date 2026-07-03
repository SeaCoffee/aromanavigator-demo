export const LIKE_CONTENT_TYPES = {
  comment: 'comments.commentmodel',
  forumTopic: 'forum.forumtopicmodel',
  fragrance: 'fragrance.fragrancemodel',
} as const;

export type LikeContentType =
  (typeof LIKE_CONTENT_TYPES)[keyof typeof LIKE_CONTENT_TYPES];

export type LikeTarget = {
  content_type: LikeContentType;
  object_id: number;
};

export type LikeTargetPayload = {
  target: LikeTarget;
};

export type LikeItemTarget = {
  app: string;
  model: string;
  id: number;
  title?: string;
};

export type LikeItem = {
  id: number;
  created_at: string;
  item: LikeItemTarget | null;
};

export type LikeToggleResponse = {
  liked: boolean;
  like: LikeItem | null;
};

export type LikeActionResult =
  | {
      ok: true;
      liked: boolean;
      like: LikeItem | null;
    }
  | {
      ok: false;
      msg: string;
    };

export type LikeActionOptions = {
  revalidatePaths?: string[];
};

export const likeTargets = {
  comment: (id: number): LikeTarget => ({
    content_type: LIKE_CONTENT_TYPES.comment,
    object_id: id,
  }),

  forumTopic: (id: number): LikeTarget => ({
    content_type: LIKE_CONTENT_TYPES.forumTopic,
    object_id: id,
  }),

  fragrance: (id: number): LikeTarget => ({
    content_type: LIKE_CONTENT_TYPES.fragrance,
    object_id: id,
  }),
} as const;
