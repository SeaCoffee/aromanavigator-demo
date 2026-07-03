export const FAVORITE_CONTENT_TYPES = {
  fragrance: 'fragrance.fragrancemodel',
  forumTopic: 'forum.forumtopicmodel',
} as const;

export type FavoriteContentType =
  (typeof FAVORITE_CONTENT_TYPES)[keyof typeof FAVORITE_CONTENT_TYPES];

export type FavoriteTarget = {
  content_type: FavoriteContentType;
  object_id: number;
};

export type FavoriteTargetPayload = {
  target: FavoriteTarget;
};

export type FavoriteSerializedItem = {
  id?: number;
  app?: string;
  model?: string;

  title?: string;
  name?: string;
  display_name?: string;

  slug?: string;
  image_url?: string;
  cover_image?: string;
  cover?: string;

  is_available?: boolean;
  unavailable_reason?: 'deleted' | 'blocked' | 'hidden' | string;

  brand?: string | {
    id?: number | null;
    name?: string;
    slug?: string;
  } | null;

  section?: {
    id?: number | null;
    title?: string;
    name?: string;
    slug?: string;
  } | null;

  author?: {
    id?: number | null;
    display_name?: string;
  } | null;

  comments_count?: number;

  [key: string]: unknown;
};

export type FavoriteItem = {
  id: number;
  created_at: string;
  item: FavoriteSerializedItem | null;
};

export type FavoriteToggleResponse = {
  favorited: boolean;
  favorite: FavoriteItem | null;
};

export type FavoriteActionOptions = {
  revalidatePaths?: string[];
};

export type FavoriteActionResult =
  | {
      ok: true;
      favorited: boolean;
      favorite: FavoriteItem | null;
    }
  | {
      ok: false;
      msg: string;
    };

export type FavoriteDeleteActionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      msg: string;
    };

export type PaginatedFavoritesResponse = {
  total_items: number;
  total_pages: number;
  next: boolean;
  prev: boolean;
  results: FavoriteItem[];
};

export const favoriteTargets = {
  fragrance: (id: number): FavoriteTarget => ({
    content_type: FAVORITE_CONTENT_TYPES.fragrance,
    object_id: id,
  }),

  forumTopic: (id: number): FavoriteTarget => ({
    content_type: FAVORITE_CONTENT_TYPES.forumTopic,
    object_id: id,
  }),
} as const;
