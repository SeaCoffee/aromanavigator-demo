import type { ForumComment } from '@/app/types/forumTypes';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';

function targetKey(comment: ForumComment) {
  return `${comment.target.app}.${comment.target.model}`;
}

export function adminCommentTargetHref(comment: ForumComment) {
  const key = targetKey(comment);

  if (key === 'forum.forumtopicmodel') {
    return forumPageUrlBuilder.topics.detail(comment.target.id);
  }

  if (key === 'forum.forumsectionmodel') {
    return forumPageUrlBuilder.sections.detail(comment.target.id);
  }

  if (key === 'fragrance.fragrancemodel' && comment.target.slug) {
    return fragrancePageUrlBuilder.public.detail(comment.target.slug);
  }

  if (key === 'articles.article') {
    return articlesPageUrlBuilder.public.detail(comment.target.id);
  }

  return null;
}

export function adminCommentTargetLabel(comment: ForumComment) {
  const title = comment.target.title?.trim();

  if (title) return title;

  const labels: Record<string, string> = {
    'forum.forumtopicmodel': 'РўРµРјР° С„РѕСЂСѓРјСѓ',
    'forum.forumsectionmodel': 'Р РѕР·РґС–Р» С„РѕСЂСѓРјСѓ',
    'fragrance.fragrancemodel': 'РђСЂРѕРјР°С‚',
    'articles.article': 'РЎС‚Р°С‚С‚СЏ',
  };

  return `${labels[targetKey(comment)] ?? 'РћР±КјС”РєС‚'} #${comment.target.id}`;
}
