'use server';

import { revalidatePath } from 'next/cache';

import {
  addOfficialFamilyServer,
  addOfficialNoteServer,
  addOfficialPerfumerServer,
  createFragranceServer,
} from '@/app/services/fragranceServices.server';
import {
  approveAddRequestWithFragranceServer,
  attachFragranceToAddRequestServer,
  createFragranceAddRequestServer,
  createFragranceFromAddRequestAndApproveServer,
  createNoteSuggestionServer,
  createSimilaritySuggestionServer,
  setFragranceAddRequestStatusServer,
  setNoteSuggestionStatusServer,
  setSimilaritySuggestionStatusServer,
  updateFragranceAddRequestStaffServer,
  voteNoteSuggestionServer,
  voteSimilaritySuggestionServer,
} from '@/app/services/fragranceUgcService.server';
import {
  fail,
  normalizeActionError,
  ok,
  readId,
  readIds,
  readModerationStatus,
  readNoteLevel,
  readNullableReleaseYear,
  readOptionalString,
  readPresentString,
  readRequiredNumber,
  readString,
  readVoteValue,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { fragranceUgcPageUrlBuilder } from '@/app/urls/pageUrls/fragranceUgcPageUrlBuilder';

import type {
  ActionResult,
  FragranceAddRequest,
  NoteSuggestion,
  SimilaritySuggestion,
} from '@/app/types/fragranceTypes';

function revalidatePublicFragranceFromForm(formData: FormData) {
  const fragranceSlug = readOptionalString(formData, 'fragrance_slug');

  if (fragranceSlug) {
    revalidatePath(fragrancePageUrlBuilder.public.detail(fragranceSlug));
  }
}

function revalidateSuggestionAdminPages() {
  revalidatePath(fragranceUgcPageUrlBuilder.admin.noteSuggestions());
  revalidatePath(fragranceUgcPageUrlBuilder.admin.similaritySuggestions());
}

function revalidateAddRequestPages(id?: string | number) {
  revalidatePath(fragranceUgcPageUrlBuilder.me.addRequests());
  revalidatePath(fragranceUgcPageUrlBuilder.admin.addRequests());

  if (id !== undefined) {
    revalidatePath(fragranceUgcPageUrlBuilder.admin.addRequestDetail(id));
  }
}

export async function createNoteSuggestionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<NoteSuggestion>> {
  try {
    const fragranceId = readRequiredNumber(formData, 'fragrance_id');

    const data = await createNoteSuggestionServer(fragranceId, {
      note_id: readRequiredNumber(formData, 'note_id'),
      level: readNoteLevel(formData),
    });

    revalidateSuggestionAdminPages();
    revalidatePublicFragranceFromForm(formData);

    return ok(data, 'РџСЂРѕРїРѕР·РёС†С–СЋ РЅРѕС‚Рё РґРѕРґР°РЅРѕ.');
  } catch (error) {
    return fail<NoteSuggestion>(normalizeActionError(error));
  }
}

export async function voteNoteSuggestionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const suggestionId = readId(formData, 'suggestion_id');

    await voteNoteSuggestionServer(suggestionId, {
      value: readVoteValue(formData),
    });

    revalidatePath(fragranceUgcPageUrlBuilder.admin.noteSuggestions());
    revalidatePublicFragranceFromForm(formData);

    return ok('Р“РѕР»РѕСЃ РІСЂР°С…РѕРІР°РЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function createSimilaritySuggestionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<SimilaritySuggestion>> {
  try {
    const fragranceId = readRequiredNumber(formData, 'fragrance_id');

    const data = await createSimilaritySuggestionServer(fragranceId, {
      similar_fragrance_id: readRequiredNumber(formData, 'similar_fragrance_id'),
    });

    revalidateSuggestionAdminPages();
    revalidatePublicFragranceFromForm(formData);

    return ok(data, 'РџСЂРѕРїРѕР·РёС†С–СЋ СЃС…РѕР¶РѕРіРѕ Р°СЂРѕРјР°С‚Сѓ РґРѕРґР°РЅРѕ.');
  } catch (error) {
    return fail<SimilaritySuggestion>(normalizeActionError(error));
  }
}

export async function voteSimilaritySuggestionAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const suggestionId = readId(formData, 'suggestion_id');

    await voteSimilaritySuggestionServer(suggestionId, {
      value: readVoteValue(formData),
    });

    revalidatePath(fragranceUgcPageUrlBuilder.admin.similaritySuggestions());
    revalidatePublicFragranceFromForm(formData);

    return ok('Р“РѕР»РѕСЃ РІСЂР°С…РѕРІР°РЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function createFragranceAddRequestAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<FragranceAddRequest>> {
  try {
    const brandName = readString(formData, 'brand_name');
    const fragranceName = readString(formData, 'fragrance_name');

    if (!brandName || !fragranceName) {
      return fail<FragranceAddRequest>({
        brand_name: brandName ? undefined : 'Р’РєР°Р¶С–С‚СЊ Р±СЂРµРЅРґ.',
        fragrance_name: fragranceName ? undefined : 'Р’РєР°Р¶С–С‚СЊ РЅР°Р·РІСѓ Р°СЂРѕРјР°С‚Сѓ.',
      });
    }

    const data = await createFragranceAddRequestServer({
      brand_name: brandName,
      fragrance_name: fragranceName,
      release_year: readNullableReleaseYear(formData, 'release_year'),
      perfumers_text: readOptionalString(formData, 'perfumers_text'),
      notes_text: readOptionalString(formData, 'notes_text'),
      families_text: readOptionalString(formData, 'families_text'),
      links_text: readOptionalString(formData, 'links_text'),
    });

    revalidateAddRequestPages();

    return ok(data, 'Р—Р°СЏРІРєСѓ РЅР° РґРѕРґР°РІР°РЅРЅСЏ Р°СЂРѕРјР°С‚Сѓ РЅР°РґС–СЃР»Р°РЅРѕ.');
  } catch (error) {
    return fail<FragranceAddRequest>(normalizeActionError(error));
  }
}

export async function setNoteSuggestionStatusAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const id = readId(formData, 'id');

    await setNoteSuggestionStatusServer(id, {
      status: readModerationStatus(formData),
      moderator_comment: readOptionalString(formData, 'moderator_comment'),
    });

    revalidatePath(fragranceUgcPageUrlBuilder.admin.noteSuggestions());

    return ok('РЎС‚Р°С‚СѓСЃ РїСЂРѕРїРѕР·РёС†С–С— РѕРЅРѕРІР»РµРЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function setSimilaritySuggestionStatusAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const id = readId(formData, 'id');

    await setSimilaritySuggestionStatusServer(id, {
      status: readModerationStatus(formData),
      moderator_comment: readOptionalString(formData, 'moderator_comment'),
    });

    revalidatePath(fragranceUgcPageUrlBuilder.admin.similaritySuggestions());

    return ok('РЎС‚Р°С‚СѓСЃ РїСЂРѕРїРѕР·РёС†С–С— РѕРЅРѕРІР»РµРЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function updateFragranceAddRequestStaffAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<FragranceAddRequest>> {
  try {
    const id = readId(formData, 'id');

    const data = await updateFragranceAddRequestStaffServer(id, {
    brand_name: readPresentString(formData, 'brand_name'),
    fragrance_name: readPresentString(formData, 'fragrance_name'),
    release_year: readNullableReleaseYear(formData, 'release_year'),
    perfumers_text: readPresentString(formData, 'perfumers_text'),
    notes_text: readPresentString(formData, 'notes_text'),
    families_text: readPresentString(formData, 'families_text'),
    links_text: readPresentString(formData, 'links_text'),
    moderator_comment: readPresentString(formData, 'moderator_comment'),
  });

    revalidateAddRequestPages(id);

    return ok(data, 'Р—Р°СЏРІРєСѓ РѕРЅРѕРІР»РµРЅРѕ.');
  } catch (error) {
    return fail<FragranceAddRequest>(normalizeActionError(error));
  }
}

export async function setFragranceAddRequestStatusAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const id = readId(formData, 'id');

    await setFragranceAddRequestStatusServer(id, {
      status: readModerationStatus(formData),
      moderator_comment: readOptionalString(formData, 'moderator_comment'),
    });

    revalidateAddRequestPages(id);

    return ok('РЎС‚Р°С‚СѓСЃ Р·Р°СЏРІРєРё РѕРЅРѕРІР»РµРЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function attachFragranceToAddRequestAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<FragranceAddRequest>> {
  try {
    const id = readId(formData, 'id');

    const data = await attachFragranceToAddRequestServer(id, {
      fragrance_id: readRequiredNumber(formData, 'fragrance_id'),
      moderator_comment: readOptionalString(formData, 'moderator_comment'),
    });

    revalidateAddRequestPages(id);
    revalidatePath(fragrancePageUrlBuilder.admin.fragrances());

    return ok(data, 'РђСЂРѕРјР°С‚ РїСЂРёРІвЂ™СЏР·Р°РЅРѕ РґРѕ Р·Р°СЏРІРєРё.');
  } catch (error) {
    return fail<FragranceAddRequest>(normalizeActionError(error));
  }
}

export async function approveAddRequestWithFragranceAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<FragranceAddRequest>> {
  try {
    const id = readId(formData, 'id');

    const data = await approveAddRequestWithFragranceServer(id, {
      fragrance_id: readRequiredNumber(formData, 'fragrance_id'),
      moderator_comment: readOptionalString(formData, 'moderator_comment'),
    });

    revalidateAddRequestPages(id);
    revalidatePath(fragrancePageUrlBuilder.public.list());
    revalidatePath(fragrancePageUrlBuilder.admin.fragrances());

    return ok(data, 'Р—Р°СЏРІРєСѓ СЃС…РІР°Р»РµРЅРѕ.');
  } catch (error) {
    return fail<FragranceAddRequest>(normalizeActionError(error));
  }
}

export async function createFragranceFromAddRequestAndApproveAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<FragranceAddRequest>> {
  try {
    const addRequestId = readId(formData, 'id');

    const data = await createFragranceFromAddRequestAndApproveServer(
      addRequestId,
      {
        brand_id: readRequiredNumber(formData, 'brand_id'),
        name: readString(formData, 'name'),
        slug: readOptionalString(formData, 'slug'),
        release_year: readNullableReleaseYear(formData, 'release_year'),
        perfumer_ids: readIds(formData, 'perfumer_ids'),
        family_ids: readIds(formData, 'family_ids'),
        top_note_ids: readIds(formData, 'top_note_ids'),
        heart_note_ids: readIds(formData, 'heart_note_ids'),
        base_note_ids: readIds(formData, 'base_note_ids'),
        moderator_comment: readOptionalString(formData, 'moderator_comment'),
      },
    );

    revalidateAddRequestPages(addRequestId);
    revalidatePath(fragrancePageUrlBuilder.public.list());
    revalidatePath(fragrancePageUrlBuilder.admin.fragrances());

    if (data.created_fragrance_id) {
      revalidatePath(
        fragrancePageUrlBuilder.admin.editFragrance(data.created_fragrance_id),
      );
    }

    return ok(data, 'РђСЂРѕРјР°С‚ СЃС‚РІРѕСЂРµРЅРѕ С– Р·Р°СЏРІРєСѓ СЃС…РІР°Р»РµРЅРѕ.');
  } catch (error) {
    return fail<FragranceAddRequest>(normalizeActionError(error));
  }
}
