import type { ID } from '@/app/types/http';

const COMMENT_ANCHOR_PREFIX = 'comment';

function cleanAnchorId(value: ID): string {
  return String(value).trim();
}

export const commentAnchorUrlBuilder = {
  domId(commentId: ID): string {
    return `${COMMENT_ANCHOR_PREFIX}-${cleanAnchorId(commentId)}`;
  },

  hash(commentId: ID): string {
    return `#${this.domId(commentId)}`;
  },

  withAnchor(path: string, commentId: ID): string {
    return `${path}${this.hash(commentId)}`;
  },
} as const;
