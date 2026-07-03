import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
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


export async function getPublicArticlesServer(query?: ArticleListQuery) {
  return djangoJson<Paginated<ArticleListItem>>(
    articleApiUrlBuilder.server.public.list(query),
    {
      auth: 'auto',
    },
  );
}

export async function getPublicArticleServer(articleId: ID) {
  return djangoJson<ArticleDetail>(
    articleApiUrlBuilder.server.public.detail(articleId),
    {
      auth: 'auto',
    },
  );
}

export async function getMyArticlesServer(query?: ArticleListQuery) {
  return djangoJson<Paginated<ArticleListItem>>(
    articleApiUrlBuilder.server.me.list(query),
    {
      auth: 'required',
    },
  );
}

export async function getMyArticleServer(articleId: ID) {
  return djangoJson<ArticleDetail>(
    articleApiUrlBuilder.server.me.detail(articleId),
    {
      auth: 'required',
    },
  );
}

export async function createArticleServer(payload: ArticleCreatePayload) {
  return djangoJson<ArticleDetail, ArticleCreatePayload>(
    articleApiUrlBuilder.server.me.create(),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
    },
  );
}

export async function updateArticleServer(
  articleId: ID,
  payload: ArticleUpdatePayload,
) {
  return djangoJson<ArticleDetail, ArticleUpdatePayload>(
    articleApiUrlBuilder.server.me.update(articleId),
    {
      method: 'PATCH',
      auth: 'required',
      json: payload,
    },
  );
}

export async function deleteArticleServer(articleId: ID) {
  return djangoJson<void>(articleApiUrlBuilder.server.me.delete(articleId), {
    method: 'DELETE',
    auth: 'required',
  });
}

export async function submitArticleServer(articleId: ID) {
  return djangoJson<ArticleDetail>(
    articleApiUrlBuilder.server.me.submit(articleId),
    {
      method: 'POST',
      auth: 'required',
    },
  );
}

export async function getAdminArticleModerationServer(
  query?: ArticleListQuery,
) {
  return djangoJson<Paginated<ArticleListItem>>(
    articleApiUrlBuilder.server.admin.moderation(query),
    {
      auth: 'required',
    },
  );
}

export async function publishArticleServer(articleId: ID) {
  return djangoJson<ArticleDetail>(
    articleApiUrlBuilder.server.admin.publish(articleId),
    {
      method: 'POST',
      auth: 'required',
    },
  );
}

export async function rejectArticleServer(
  articleId: ID,
  payload: ArticleRejectPayload,
) {
  return djangoJson<ArticleDetail, ArticleRejectPayload>(
    articleApiUrlBuilder.server.admin.reject(articleId),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
    },
  );
}

export async function getArticleTagsServer() {
  return djangoJson<ArticleTag[]>(articleApiUrlBuilder.server.tags.list(), {
    auth: 'auto',
  });
}

export async function createArticleTagServer(payload: Pick<ArticleTag, 'name'>) {
  return djangoJson<ArticleTag, Pick<ArticleTag, 'name'>>(
    articleApiUrlBuilder.server.tags.create(),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
    },
  );
}
