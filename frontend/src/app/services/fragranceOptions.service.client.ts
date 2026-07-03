'use client';

import { anonApi } from '@/app/services/userApi';
import { fragranceAnonApiUrlBuilder } from '@/app/urls/fragranceAnonApiUrlBuilder';

import type {
  DictionaryOption,
  FragranceOption,
} from '@/app/types/fragranceTypes';
import type { ID, Paginated, Query } from '@/app/types/http';

type OptionSearchQuery = Query & {
  search?: string;
  ids?: string;
  page?: number;
  page_size?: number;
};

type FragranceOptionSearchQuery = OptionSearchQuery & {
  brand?: ID | string;
};

function emptyOptionsPage<T>(): Paginated<T> {
  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
}

function hasCleanValue(value: unknown) {
  return String(value ?? '').trim().length > 0;
}

function shouldRequestOptions(query?: OptionSearchQuery) {
  if (!query) {
    return false;
  }

  return (
    hasCleanValue(query.search) ||
    hasCleanValue(query.ids) ||
    hasCleanValue(query.page) ||
    hasCleanValue(query.page_size)
  );
}

function shouldRequestFragranceOptions(query?: FragranceOptionSearchQuery) {
  if (!query) {
    return false;
  }

  return shouldRequestOptions(query) || hasCleanValue(query.brand);
}

export function getBrandOptionsClient(query?: OptionSearchQuery) {
  if (!shouldRequestOptions(query)) {
    return Promise.resolve(emptyOptionsPage<DictionaryOption>());
  }

  return anonApi.get<Paginated<DictionaryOption>>(
    fragranceAnonApiUrlBuilder.options.brands(query),
  );
}

export function getNoteOptionsClient(query?: OptionSearchQuery) {
  if (!shouldRequestOptions(query)) {
    return Promise.resolve(emptyOptionsPage<DictionaryOption>());
  }

  return anonApi.get<Paginated<DictionaryOption>>(
    fragranceAnonApiUrlBuilder.options.notes(query),
  );
}

export function getFamilyOptionsClient(query?: OptionSearchQuery) {
  if (!shouldRequestOptions(query)) {
    return Promise.resolve(emptyOptionsPage<DictionaryOption>());
  }

  return anonApi.get<Paginated<DictionaryOption>>(
    fragranceAnonApiUrlBuilder.options.families(query),
  );
}

export function getPerfumerOptionsClient(query?: OptionSearchQuery) {
  if (!shouldRequestOptions(query)) {
    return Promise.resolve(emptyOptionsPage<DictionaryOption>());
  }

  return anonApi.get<Paginated<DictionaryOption>>(
    fragranceAnonApiUrlBuilder.options.perfumers(query),
  );
}

export function getFragranceOptionsClient(query?: FragranceOptionSearchQuery) {
  if (!shouldRequestFragranceOptions(query)) {
    return Promise.resolve(emptyOptionsPage<FragranceOption>());
  }

  return anonApi.get<Paginated<FragranceOption>>(
    fragranceAnonApiUrlBuilder.options.fragrances(query),
  );
}
