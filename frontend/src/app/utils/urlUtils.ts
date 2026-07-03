import type { Query } from '@/app/types/http';

export const seg = (value: string | number) =>
  encodeURIComponent(String(value));

export const stripSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');

export const stripLeadingSlashes = (value: string) => value.replace(/^\/+/, '');

export const stripTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

export const q = (query?: Query) => {
  if (!query) return '';

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
    } else {
      params.set(key, String(value));
    }
  }

  const search = params.toString();

  return search ? `?${search}` : '';
};

export const build = (path: string, query?: Query) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedPath}${q(query)}`;
};

export function appendQuery(path: string, params: URLSearchParams) {
  const search = params.toString();

  return search ? `${path}?${search}` : path;
}

export function withRepeatedQuery(
  path: string,
  key: string,
  values: Array<string | number>,
) {
  const params = new URLSearchParams();

  values.forEach((value) => {
    params.append(key, String(value));
  });

  return appendQuery(path, params);
}
