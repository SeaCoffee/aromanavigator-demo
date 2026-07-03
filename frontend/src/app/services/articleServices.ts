import { anonApi, userApi } from '@/app/services/userApi';
import type {
  ArticleCreatePayload,
  ArticleDetail,
  ArticleListItem,
  ArticleListQuery,
  ArticleRejectPayload,
  ArticleTag,
  ArticleUpdatePayload,
} from '@/app/types/articleTypes';
import type { ID, Paginated } from '@/app/types/http';
import { articleApiUrlBuilder } from '@/app/urls/articleUrlBuilder';

export async function fetchPublicArticles(query?: ArticleListQuery) {
  return anonApi.get<Paginated<ArticleListItem>>(
    articleApiUrlBuilder.anon.public.list(query),
  );
}

export async function fetchPublicArticle(articleId: ID) {
  return anonApi.get<ArticleDetail>(
    articleApiUrlBuilder.anon.public.detail(articleId),
  );
}

export async function fetchMyArticles(query?: ArticleListQuery) {
  return userApi.get<Paginated<ArticleListItem>>(
    articleApiUrlBuilder.user.me.list(query),
  );
}

export async function fetchMyArticle(articleId: ID) {
  return userApi.get<ArticleDetail>(
    articleApiUrlBuilder.user.me.detail(articleId),
  );
}

export async function createArticle(payload: ArticleCreatePayload) {
  return userApi.post<ArticleDetail, ArticleCreatePayload>(
    articleApiUrlBuilder.user.me.create(),
    { json: payload },
  );
}

export async function updateArticle(
  articleId: ID,
  payload: ArticleUpdatePayload,
) {
  return userApi.patch<ArticleDetail, ArticleUpdatePayload>(
    articleApiUrlBuilder.user.me.update(articleId),
    { json: payload },
  );
}

export async function deleteArticle(articleId: ID) {
  return userApi.delete<void>(articleApiUrlBuilder.user.me.delete(articleId));
}

export async function submitArticle(articleId: ID) {
  return userApi.post<ArticleDetail>(
    articleApiUrlBuilder.user.me.submit(articleId),
  );
}

export async function fetchAdminArticleModeration(query?: ArticleListQuery) {
  return userApi.get<Paginated<ArticleListItem>>(
    articleApiUrlBuilder.user.admin.moderation(query),
  );
}

export async function publishArticle(articleId: ID) {
  return userApi.post<ArticleDetail>(
    articleApiUrlBuilder.user.admin.publish(articleId),
  );
}

export async function rejectArticle(
  articleId: ID,
  payload: ArticleRejectPayload,
) {
  return userApi.post<ArticleDetail, ArticleRejectPayload>(
    articleApiUrlBuilder.user.admin.reject(articleId),
    { json: payload },
  );
}

export async function fetchArticleTags() {
  return anonApi.get<ArticleTag[]>(articleApiUrlBuilder.anon.tags.list());
}

export async function createArticleTag(payload: Pick<ArticleTag, 'name'>) {
  return userApi.post<ArticleTag, Pick<ArticleTag, 'name'>>(
    articleApiUrlBuilder.user.tags.create(),
    { json: payload },
  );
}
