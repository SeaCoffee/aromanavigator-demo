import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
import { fragranceUgcDjangoApiUrlBuilder } from '@/app/urls/fragranceUgcDjangoApiUrlBuilder';

import type {
  AddRequestQuery,
  AdminSuggestionQuery,
  AttachCreatedFragranceInput,
  FragranceAddRequest,
  FragranceAddRequestCreateInput,
  FragranceAddRequestStaffUpdateInput,
  ModerationStatusInput,
  NoteSuggestion,
  NoteSuggestionCreateInput,
  NoteSuggestionQuery,
  SimilaritySuggestion,
  SimilaritySuggestionCreateInput,
  SimilaritySuggestionQuery,
  VoteInput,
  VoteResponse,
  FragranceAddRequestCreateFragranceApproveInput,
} from '@/app/types/fragranceTypes';
import type { ID, Paginated } from '@/app/types/http';

export async function getNoteSuggestionsByFragranceServer(
  fragranceId: ID,
  query?: NoteSuggestionQuery,
) {
  return djangoJson<Paginated<NoteSuggestion>>(
    fragranceUgcDjangoApiUrlBuilder.noteSuggestions.listByFragrance(
      fragranceId,
      query,
    ),
    { auth: 'auto' },
  );
}

export async function createNoteSuggestionServer(
  fragranceId: ID,
  payload: NoteSuggestionCreateInput,
) {
  return djangoJson<NoteSuggestion>(
    fragranceUgcDjangoApiUrlBuilder.noteSuggestions.create(fragranceId),
    {
      auth: 'required',
      method: 'POST',
      json: payload,
    },
  );
}

export async function voteNoteSuggestionServer(
  suggestionId: ID,
  payload: VoteInput,
) {
  return djangoJson<VoteResponse>(
    fragranceUgcDjangoApiUrlBuilder.noteSuggestions.vote(suggestionId),
    {
      auth: 'required',
      method: 'POST',
      json: payload,
    },
  );
}

export async function getAdminNoteSuggestionsServer(
  query?: AdminSuggestionQuery,
) {
  return djangoJson<Paginated<NoteSuggestion>>(
    fragranceUgcDjangoApiUrlBuilder.noteSuggestions.modList(query),
    { auth: 'required' },
  );
}

export async function setNoteSuggestionStatusServer(
  suggestionId: ID,
  payload: ModerationStatusInput,
) {
  return djangoJson<{ ok: true; id: ID; status: string }>(
    fragranceUgcDjangoApiUrlBuilder.noteSuggestions.modStatus(suggestionId),
    {
      auth: 'required',
      method: 'PATCH',
      json: payload,
    },
  );
}

export async function getSimilaritySuggestionsByFragranceServer(
  fragranceId: ID,
  query?: SimilaritySuggestionQuery,
) {
  return djangoJson<Paginated<SimilaritySuggestion>>(
    fragranceUgcDjangoApiUrlBuilder.similaritySuggestions.listByFragrance(
      fragranceId,
      query,
    ),
    { auth: 'auto' },
  );
}

export async function createSimilaritySuggestionServer(
  fragranceId: ID,
  payload: SimilaritySuggestionCreateInput,
) {
  return djangoJson<SimilaritySuggestion>(
    fragranceUgcDjangoApiUrlBuilder.similaritySuggestions.create(fragranceId),
    {
      auth: 'required',
      method: 'POST',
      json: payload,
    },
  );
}

export async function voteSimilaritySuggestionServer(
  suggestionId: ID,
  payload: VoteInput,
) {
  return djangoJson<VoteResponse>(
    fragranceUgcDjangoApiUrlBuilder.similaritySuggestions.vote(suggestionId),
    {
      auth: 'required',
      method: 'POST',
      json: payload,
    },
  );
}

export async function getAdminSimilaritySuggestionsServer(
  query?: AdminSuggestionQuery,
) {
  return djangoJson<Paginated<SimilaritySuggestion>>(
    fragranceUgcDjangoApiUrlBuilder.similaritySuggestions.modList(query),
    { auth: 'required' },
  );
}

export async function setSimilaritySuggestionStatusServer(
  suggestionId: ID,
  payload: ModerationStatusInput,
) {
  return djangoJson<{ ok: true; id: ID; status: string }>(
    fragranceUgcDjangoApiUrlBuilder.similaritySuggestions.modStatus(
      suggestionId,
    ),
    {
      auth: 'required',
      method: 'PATCH',
      json: payload,
    },
  );
}

export async function createFragranceAddRequestServer(
  payload: FragranceAddRequestCreateInput,
) {
  return djangoJson<FragranceAddRequest>(
    fragranceUgcDjangoApiUrlBuilder.addRequests.create(),
    {
      auth: 'required',
      method: 'POST',
      json: payload,
    },
  );
}

export async function getMyFragranceAddRequestsServer(query?: AddRequestQuery) {
  return djangoJson<Paginated<FragranceAddRequest>>(
    fragranceUgcDjangoApiUrlBuilder.addRequests.my(query),
    { auth: 'required' },
  );
}

export async function getAdminFragranceAddRequestsServer(
  query?: AddRequestQuery,
) {
  return djangoJson<Paginated<FragranceAddRequest>>(
    fragranceUgcDjangoApiUrlBuilder.addRequests.modList(query),
    { auth: 'required' },
  );
}

export async function getAdminFragranceAddRequestServer(id: ID) {
  return djangoJson<FragranceAddRequest>(
    fragranceUgcDjangoApiUrlBuilder.addRequests.detail(id),
    { auth: 'required' },
  );
}

export async function updateFragranceAddRequestStaffServer(
  id: ID,
  payload: FragranceAddRequestStaffUpdateInput,
) {
  return djangoJson<FragranceAddRequest>(
    fragranceUgcDjangoApiUrlBuilder.addRequests.modUpdate(id),
    {
      auth: 'required',
      method: 'PATCH',
      json: payload,
    },
  );
}

export async function setFragranceAddRequestStatusServer(
  id: ID,
  payload: ModerationStatusInput,
) {
  return djangoJson<{ ok: true; id: ID; status: string }>(
    fragranceUgcDjangoApiUrlBuilder.addRequests.modStatus(id),
    {
      auth: 'required',
      method: 'PATCH',
      json: payload,
    },
  );
}

export async function attachFragranceToAddRequestServer(
  id: ID,
  payload: AttachCreatedFragranceInput,
) {
  return djangoJson<FragranceAddRequest>(
    fragranceUgcDjangoApiUrlBuilder.addRequests.attachFragrance(id),
    {
      auth: 'required',
      method: 'PATCH',
      json: payload,
    },
  );
}

export async function approveAddRequestWithFragranceServer(
  id: ID,
  payload: AttachCreatedFragranceInput,
) {
  return djangoJson<FragranceAddRequest>(
    fragranceUgcDjangoApiUrlBuilder.addRequests.approveWithFragrance(id),
    {
      auth: 'required',
      method: 'PATCH',
      json: payload,
    },
  );
}

export async function createFragranceFromAddRequestAndApproveServer(
  id: ID,
  payload: FragranceAddRequestCreateFragranceApproveInput,
) {
  return djangoJson<FragranceAddRequest>(
    fragranceUgcDjangoApiUrlBuilder.addRequests.createFragranceAndApprove(id),
    {
      auth: 'required',
      method: 'POST',
      json: payload,
    },
  );
}
