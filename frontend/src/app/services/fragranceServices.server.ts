import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
import { fragranceDjangoApiUrlBuilder } from '@/app/urls/fragranceDjangoApiUrlBuilder';

import type {
  Brand,
  BrandCreateInput,
  DictionaryQuery,
  FragranceCreateInput,
  FragranceDetail,
  FragranceListItem,
  FragranceListQuery,
  FragranceUpdateInput,
  Note,
  NoteCreateInput,
  OfficialFamilyInput,
  OfficialNoteInput,
  OfficialNoteMetaInput,
  OfficialPerfumerInput,
  OlfactoryFamily,
  OlfactoryFamilyCreateInput,
  Perfumer,
  PerfumerCreateInput,
  FragranceAddRequestCreateFragranceApproveInput,
} from '@/app/types/fragranceTypes';
import type { ID, Paginated } from '@/app/types/http';

const fragranceApi = fragranceDjangoApiUrlBuilder;

export async function getBrandsServer(query?: DictionaryQuery) {
  return djangoJson<Paginated<Brand>>(
    fragranceApi.brands.list(query),
    { auth: 'auto' },
  );
}

export async function getBrandServer(slug: string) {
  return djangoJson<Brand>(fragranceApi.brands.detail(slug), {
    auth: 'auto',
  });
}

export async function createBrandServer(payload: BrandCreateInput) {
  return djangoJson<Brand>(fragranceApi.brands.create(), {
    auth: 'required',
    method: 'POST',
    json: payload,
  });
}

export async function getPerfumersServer(query?: DictionaryQuery) {
  return djangoJson<Paginated<Perfumer>>(
    fragranceApi.perfumers.list(query),
    { auth: 'auto' },
  );
}

export async function getPerfumerServer(id: ID) {
  return djangoJson<Perfumer>(
    fragranceApi.perfumers.detail(id),
    { auth: 'auto' },
  );
}

export async function createPerfumerServer(payload: PerfumerCreateInput) {
  return djangoJson<Perfumer>(fragranceApi.perfumers.create(), {
    auth: 'required',
    method: 'POST',
    json: payload,
  });
}

export async function getNotesServer(query?: DictionaryQuery) {
  return djangoJson<Paginated<Note>>(
    fragranceApi.notes.list(query),
    { auth: 'auto' },
  );
}

export async function getNoteServer(slug: string) {
  return djangoJson<Note>(fragranceApi.notes.detail(slug), {
    auth: 'auto',
  });
}

export async function createNoteServer(payload: NoteCreateInput) {
  return djangoJson<Note>(fragranceApi.notes.create(), {
    auth: 'required',
    method: 'POST',
    json: payload,
  });
}

export async function getFamiliesServer(query?: DictionaryQuery) {
  return djangoJson<Paginated<OlfactoryFamily>>(
    fragranceApi.families.list(query),
    { auth: 'auto' },
  );
}

export async function getFamilyServer(slug: string) {
  return djangoJson<OlfactoryFamily>(
    fragranceApi.families.detail(slug),
    { auth: 'auto' },
  );
}

export async function createFamilyServer(payload: OlfactoryFamilyCreateInput) {
  return djangoJson<OlfactoryFamily>(
    fragranceApi.families.create(),
    {
      auth: 'required',
      method: 'POST',
      json: payload,
    },
  );
}

export async function getFragrancesServer(query?: FragranceListQuery) {
  return djangoJson<Paginated<FragranceListItem>>(
    fragranceApi.fragrances.list(query),
    { auth: 'auto' },
  );
}

export async function getFragranceServer(id: ID) {
  return djangoJson<FragranceDetail>(
    fragranceApi.fragrances.detail(id),
    { auth: 'auto' },
  );
}

export async function getFragranceBySlugServer(slug: string) {
  return djangoJson<FragranceDetail>(
    fragranceApi.fragrances.detailBySlug(slug),
    { auth: 'auto' },
  );
}

export async function createFragranceServer(payload: FragranceCreateInput) {
  return djangoJson<FragranceDetail>(
    fragranceApi.fragrances.create(),
    {
      auth: 'required',
      method: 'POST',
      json: payload,
    },
  );
}

export async function updateFragranceServer(
  id: ID,
  payload: FragranceUpdateInput,
) {
  return djangoJson<FragranceDetail>(
    fragranceApi.fragrances.update(id),
    {
      auth: 'required',
      method: 'PATCH',
      json: payload,
    },
  );
}

export async function deleteFragranceServer(id: ID) {
  return djangoJson<void>(fragranceApi.fragrances.delete(id), {
    auth: 'required',
    method: 'DELETE',
  });
}

export async function addOfficialPerfumerServer(
  fragranceId: ID,
  payload: OfficialPerfumerInput,
) {
  return djangoJson<{ ok: true }>(
    fragranceApi.official.perfumers.add(fragranceId),
    {
      auth: 'required',
      method: 'POST',
      json: payload,
    },
  );
}

export async function removeOfficialPerfumerServer(
  fragranceId: ID,
  perfumerId: ID,
) {
  return djangoJson<void>(
    fragranceApi.official.perfumers.delete(
      fragranceId,
      perfumerId,
    ),
    {
      auth: 'required',
      method: 'DELETE',
    },
  );
}

export async function addOfficialFamilyServer(
  fragranceId: ID,
  payload: OfficialFamilyInput,
) {
  return djangoJson<{ ok: true }>(
    fragranceApi.official.families.add(fragranceId),
    {
      auth: 'required',
      method: 'POST',
      json: payload,
    },
  );
}

export async function removeOfficialFamilyServer(
  fragranceId: ID,
  familyId: ID,
) {
  return djangoJson<void>(
    fragranceApi.official.families.delete(
      fragranceId,
      familyId,
    ),
    {
      auth: 'required',
      method: 'DELETE',
    },
  );
}

export async function addOfficialNoteServer(
  fragranceId: ID,
  payload: OfficialNoteInput,
) {
  return djangoJson<{ ok: true }>(
    fragranceApi.official.notes.add(fragranceId),
    {
      auth: 'required',
      method: 'POST',
      json: payload,
    },
  );
}

export async function updateOfficialNoteServer(
  fragranceId: ID,
  noteId: ID,
  currentLevel: string,
  payload: OfficialNoteMetaInput,
) {
  return djangoJson<{ ok: true }>(
    fragranceApi.official.notes.update(
      fragranceId,
      noteId,
      currentLevel,
    ),
    {
      auth: 'required',
      method: 'PATCH',
      json: payload,
    },
  );
}

export async function removeOfficialNoteServer(
  fragranceId: ID,
  noteId: ID,
  level: string,
) {
  return djangoJson<void>(
    fragranceApi.official.notes.delete(
      fragranceId,
      noteId,
      level,
    ),
    {
      auth: 'required',
      method: 'DELETE',
    },
  );
}
