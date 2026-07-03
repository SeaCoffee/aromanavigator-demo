'use server';

import { revalidatePath } from 'next/cache';

import {
  addOfficialFamilyServer,
  addOfficialNoteServer,
  addOfficialPerfumerServer,
  createBrandServer,
  createFamilyServer,
  createFragranceServer,
  createNoteServer,
  createPerfumerServer,
  deleteFragranceServer,
  removeOfficialFamilyServer,
  removeOfficialNoteServer,
  removeOfficialPerfumerServer,
  updateFragranceServer,
  updateOfficialNoteServer,
  getFragrancesServer,
} from '@/app/services/fragranceServices.server';
import {
  fail,
  normalizeActionError,
  ok,
  readId,
  readNullableReleaseYear,
  readNoteLevel,
  readNumber,
  readOptionalNoteLevel,
  readOptionalString,
  readRequiredNumber,
  readString,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';

import type {
  ActionResult,
  Brand,
  FragranceDetail,
  FragranceListItem,
  Note,
  OlfactoryFamily,
  Perfumer,
} from '@/app/types/fragranceTypes';

function revalidateFragrancePages(fragrance?: FragranceDetail | null) {
  revalidatePath(fragrancePageUrlBuilder.public.list());
  revalidatePath(fragrancePageUrlBuilder.admin.fragrances());

  if (fragrance?.slug) {
    revalidatePath(fragrancePageUrlBuilder.public.detail(fragrance.slug));
  }

  if (fragrance?.id) {
    revalidatePath(fragrancePageUrlBuilder.admin.editFragrance(fragrance.id));
  }
}

function revalidateFragranceEditPage(fragranceId: number | string) {
  revalidatePath(fragrancePageUrlBuilder.admin.editFragrance(fragranceId));
}

function revalidateDictionaries() {
  revalidatePath(fragrancePageUrlBuilder.public.brands());
  revalidatePath(fragrancePageUrlBuilder.public.notes());
  revalidatePath(fragrancePageUrlBuilder.public.families());
  revalidatePath(fragrancePageUrlBuilder.public.perfumers());
  revalidatePath(fragrancePageUrlBuilder.admin.fragrances());
}

export async function createBrandAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<Brand>> {
  try {
    const data = await createBrandServer({
      name: readString(formData, 'name'),
      country: readOptionalString(formData, 'country'),
    });

    revalidateDictionaries();

    return ok(data, 'Р‘СЂРµРЅРґ СЃС‚РІРѕСЂРµРЅРѕ.');
  } catch (error) {
    return fail<Brand>(normalizeActionError(error));
  }
}

export async function createPerfumerAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<Perfumer>> {
  try {
    const data = await createPerfumerServer({
      name: readString(formData, 'name'),
    });

    revalidateDictionaries();

    return ok(data, 'РџР°СЂС„СѓРјРµСЂР° СЃС‚РІРѕСЂРµРЅРѕ.');
  } catch (error) {
    return fail<Perfumer>(normalizeActionError(error));
  }
}

export async function createNoteAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<Note>> {
  try {
    const data = await createNoteServer({
      name: readString(formData, 'name'),
    });

    revalidateDictionaries();

    return ok(data, 'РќРѕС‚Сѓ СЃС‚РІРѕСЂРµРЅРѕ.');
  } catch (error) {
    return fail<Note>(normalizeActionError(error));
  }
}

export async function createFamilyAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<OlfactoryFamily>> {
  try {
    const data = await createFamilyServer({
      name: readString(formData, 'name'),
    });

    revalidateDictionaries();

    return ok(data, 'РЎС–РјРµР№СЃС‚РІРѕ СЃС‚РІРѕСЂРµРЅРѕ.');
  } catch (error) {
    return fail<OlfactoryFamily>(normalizeActionError(error));
  }
}

export async function createFragranceAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<FragranceDetail>> {
  try {
    const data = await createFragranceServer({
      brand_id: readRequiredNumber(formData, 'brand_id'),
      name: readString(formData, 'name'),
      slug: readOptionalString(formData, 'slug'),
      release_year: readNullableReleaseYear(formData, 'release_year'),
    });

    revalidateFragrancePages(data);

    return ok(data, 'РђСЂРѕРјР°С‚ СЃС‚РІРѕСЂРµРЅРѕ.');
  } catch (error) {
    return fail<FragranceDetail>(normalizeActionError(error));
  }
}

export async function updateFragranceAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<FragranceDetail>> {
  try {
    const id = readId(formData, 'id');

    const data = await updateFragranceServer(id, {
      brand_id: readNumber(formData, 'brand_id'),
      name: readOptionalString(formData, 'name'),
      slug: readOptionalString(formData, 'slug'),
      release_year: readNullableReleaseYear(formData, 'release_year'),
    });

    revalidateFragrancePages(data);

    return ok(data, 'РђСЂРѕРјР°С‚ РѕРЅРѕРІР»РµРЅРѕ.');
  } catch (error) {
    return fail<FragranceDetail>(normalizeActionError(error));
  }
}

export async function deleteFragranceAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const id = readId(formData, 'id');

    await deleteFragranceServer(id);

    revalidatePath(fragrancePageUrlBuilder.public.list());
    revalidatePath(fragrancePageUrlBuilder.admin.fragrances());

    return ok('РђСЂРѕРјР°С‚ РІРёРґР°Р»РµРЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function addOfficialPerfumerAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const fragranceId = readRequiredNumber(formData, 'fragrance_id');

    await addOfficialPerfumerServer(fragranceId, {
      perfumer_id: readRequiredNumber(formData, 'perfumer_id'),
    });

    revalidateFragranceEditPage(fragranceId);

    return ok('РџР°СЂС„СѓРјРµСЂР° РґРѕРґР°РЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function removeOfficialPerfumerAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const fragranceId = readRequiredNumber(formData, 'fragrance_id');

    await removeOfficialPerfumerServer(
      fragranceId,
      readRequiredNumber(formData, 'perfumer_id'),
    );

    revalidateFragranceEditPage(fragranceId);

    return ok('РџР°СЂС„СѓРјРµСЂР° РїСЂРёР±СЂР°РЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function addOfficialFamilyAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const fragranceId = readRequiredNumber(formData, 'fragrance_id');

    await addOfficialFamilyServer(fragranceId, {
      family_id: readRequiredNumber(formData, 'family_id'),
    });

    revalidateFragranceEditPage(fragranceId);

    return ok('РЎС–РјРµР№СЃС‚РІРѕ РґРѕРґР°РЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function removeOfficialFamilyAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const fragranceId = readRequiredNumber(formData, 'fragrance_id');

    await removeOfficialFamilyServer(
      fragranceId,
      readRequiredNumber(formData, 'family_id'),
    );

    revalidateFragranceEditPage(fragranceId);

    return ok('РЎС–РјРµР№СЃС‚РІРѕ РїСЂРёР±СЂР°РЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function addOfficialNoteAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const fragranceId = readRequiredNumber(formData, 'fragrance_id');

    await addOfficialNoteServer(fragranceId, {
      note_id: readRequiredNumber(formData, 'note_id'),
      level: readNoteLevel(formData),
      position: readNumber(formData, 'position') ?? 0,
    });

    revalidateFragranceEditPage(fragranceId);

    return ok('РќРѕС‚Сѓ РґРѕРґР°РЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function updateOfficialNoteAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const fragranceId = readRequiredNumber(formData, 'fragrance_id');
    const noteId = readRequiredNumber(formData, 'note_id');
    const currentLevel = readString(formData, 'current_level');

    await updateOfficialNoteServer(fragranceId, noteId, currentLevel, {
      level: readOptionalNoteLevel(formData, 'level'),
      position: readNumber(formData, 'position'),
    });

    revalidateFragranceEditPage(fragranceId);

    return ok('РќРѕС‚Сѓ РѕРЅРѕРІР»РµРЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function removeOfficialNoteAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const fragranceId = readRequiredNumber(formData, 'fragrance_id');

    await removeOfficialNoteServer(
      fragranceId,
      readRequiredNumber(formData, 'note_id'),
      readString(formData, 'level'),
    );

    revalidateFragranceEditPage(fragranceId);

    return ok('РќРѕС‚Сѓ РїСЂРёР±СЂР°РЅРѕ.');
  } catch (error) {
    return fail(normalizeActionError(error));
  }
}

export async function searchFragrancesAction(
  query: string,
): Promise<ActionResult<FragranceListItem[]>> {
  try {
    const data = await getFragrancesServer({
      q: query.trim() || undefined,
      ordering: 'brand',
      page_size: 20,
    });

    return ok(data.results);
  } catch (error) {
    return fail<FragranceListItem[]>(normalizeActionError(error));
  }
}
