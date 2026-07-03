import type { MetadataRoute } from 'next';

import { siteUrl } from '@/app/constants/siteConstants';
import { getPublicArticlesServer } from '@/app/services/articleServices.server';
import {
  getBrandsServer,
  getFamiliesServer,
  getFragrancesServer,
  getNotesServer,
  getPerfumersServer,
} from '@/app/services/fragranceServices.server';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';

function absoluteUrl(path: string) {
  return siteUrl(path);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    brands,
    fragrances,
    families,
    notes,
    perfumers,
    articles,
  ] = await Promise.all([
    getBrandsServer({ page_size: 1000 }).catch(() => ({ results: [] })),
    getFragrancesServer({ page_size: 1000 }).catch(() => ({ results: [] })),
    getFamiliesServer({ page_size: 1000 }).catch(() => ({ results: [] })),
    getNotesServer({ page_size: 1000 }).catch(() => ({ results: [] })),
    getPerfumersServer({ page_size: 1000 }).catch(() => ({ results: [] })),
    getPublicArticlesServer({ page_size: 1000 }).catch(() => ({ results: [] })),
  ]);

  const staticUrls: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), priority: 1 },
    { url: absoluteUrl(fragrancePageUrlBuilder.public.list()), priority: 0.95 },
    { url: absoluteUrl(fragrancePageUrlBuilder.public.brands()), priority: 0.75 },
    { url: absoluteUrl(fragrancePageUrlBuilder.public.families()), priority: 0.75 },
    { url: absoluteUrl(fragrancePageUrlBuilder.public.notes()), priority: 0.75 },
    { url: absoluteUrl(fragrancePageUrlBuilder.public.perfumers()), priority: 0.75 },
    { url: absoluteUrl('/forum'), priority: 0.65 },
    { url: absoluteUrl(articlesPageUrlBuilder.public.list()), priority: 0.7 },
    { url: absoluteUrl(userPageUrlBuilder.search()), priority: 0.55 },
  ];

  const brandUrls: MetadataRoute.Sitemap = brands.results.map((brand) => ({
    url: absoluteUrl(fragrancePageUrlBuilder.public.brandDetail(brand.slug)),
    lastModified: brand.updated_at,
  }));

  const fragranceUrls: MetadataRoute.Sitemap = fragrances.results.map((fragrance) => ({
    url: absoluteUrl(fragrancePageUrlBuilder.public.detail(fragrance.slug)),
    lastModified: fragrance.updated_at,
    priority: 0.9,
  }));

  const familyUrls: MetadataRoute.Sitemap = families.results.map((family) => ({
    url: absoluteUrl(fragrancePageUrlBuilder.public.familyDetail(family.slug)),
    lastModified: family.updated_at,
  }));

  const noteUrls: MetadataRoute.Sitemap = notes.results.map((note) => ({
    url: absoluteUrl(fragrancePageUrlBuilder.public.noteDetail(note.slug)),
    lastModified: note.updated_at,
  }));

  const perfumerUrls: MetadataRoute.Sitemap = perfumers.results.map((perfumer) => ({
    url: absoluteUrl(fragrancePageUrlBuilder.public.perfumerDetail(perfumer.id)),
    lastModified: perfumer.updated_at,
  }));

  const articleUrls: MetadataRoute.Sitemap = articles.results.map((article) => ({
    url: absoluteUrl(articlesPageUrlBuilder.public.detail(article.id)),
    lastModified: article.updated_at,
    priority: 0.65,
  }));

  return [
    ...staticUrls,
    ...brandUrls,
    ...fragranceUrls,
    ...familyUrls,
    ...noteUrls,
    ...perfumerUrls,
    ...articleUrls,
  ];
}
