'use server';

import { revalidatePath } from 'next/cache';

import {
  fail,
  ok,
  readId,
  readNumber,
  readString,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import {
  createAdminFaqServer,
  createFeedbackServer,
  deleteAdminFaqServer,
  updateAdminFaqServer,
  updateAdminFeedbackServer,
  updateAdminSiteContentServer,
  updateAdminSitePageServer,
} from '@/app/services/siteContentServices.server';
import type { ActionResult } from '@/app/types/fragranceTypes';
import type {
  FeedbackStatus,
  SitePageSlug,
} from '@/app/types/siteContentTypes';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import { getApiErrorMessage } from '@/errors/ApiError';

const siteContentPath = adminPageUrlBuilder.settings.siteContent();

function checked(formData: FormData, key: string) {
  return formData.get(key) === 'on';
}

function sitePagePath(slug: SitePageSlug) {
  if (slug === 'about' || slug === 'terms' || slug === 'privacy' || slug === 'contacts') {
    return `/${slug}`;
  }

  return `/info/${slug}`;
}

export async function submitFeedbackAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await createFeedbackServer({
      name: readString(formData, 'name'),
      email: readString(formData, 'email'),
      subject: readString(formData, 'subject'),
      message: readString(formData, 'message'),
      source_path: readString(formData, 'source_path'),
      website: readString(formData, 'website'),
    });
    return ok('РџРѕРІС–РґРѕРјР»РµРЅРЅСЏ РЅР°РґС–СЃР»Р°РЅРѕ. РњРё РІС–РґРїРѕРІС–РјРѕ РЅР° РІРєР°Р·Р°РЅСѓ РїРѕС€С‚Сѓ.');
  } catch (error) {
    return fail(getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РЅР°РґС–СЃР»Р°С‚Рё РїРѕРІС–РґРѕРјР»РµРЅРЅСЏ.'));
  }
}

export async function updateSiteContactsAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await updateAdminSiteContentServer({
      contact_email: readString(formData, 'contact_email'),
      contact_phone: readString(formData, 'contact_phone'),
      contact_address: readString(formData, 'contact_address'),
      support_hours: readString(formData, 'support_hours'),
      footer_text: readString(formData, 'footer_text'),
      instagram_url: readString(formData, 'instagram_url'),
      facebook_url: readString(formData, 'facebook_url'),
      telegram_url: readString(formData, 'telegram_url'),
    });
    revalidatePath('/', 'layout');
    revalidatePath(siteContentPath);
    return ok('РљРѕРЅС‚Р°РєС‚Рё С‚Р° С„СѓС‚РµСЂ РѕРЅРѕРІР»РµРЅРѕ.');
  } catch (error) {
    return fail(getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р±РµСЂРµРіС‚Рё РєРѕРЅС‚Р°РєС‚Рё.'));
  }
}

export async function updateSitePageAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const slug = readString(formData, 'slug') as SitePageSlug;
    await updateAdminSitePageServer(slug, {
      title: readString(formData, 'title'),
      body: readString(formData, 'body'),
      is_published: checked(formData, 'is_published'),
    });
    revalidatePath(sitePagePath(slug));
    revalidatePath(siteContentPath);
    return ok('РЎС‚РѕСЂС–РЅРєСѓ РѕРЅРѕРІР»РµРЅРѕ.');
  } catch (error) {
    return fail(getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё СЃС‚РѕСЂС–РЅРєСѓ.'));
  }
}

export async function createFaqAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await createAdminFaqServer({
      question: readString(formData, 'question'),
      answer: readString(formData, 'answer'),
      position: readNumber(formData, 'position') ?? 0,
      is_active: checked(formData, 'is_active'),
    });
    revalidatePath('/faq');
    revalidatePath(siteContentPath);
    return ok('РџРёС‚Р°РЅРЅСЏ РґРѕРґР°РЅРѕ.');
  } catch (error) {
    return fail(getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РґРѕРґР°С‚Рё РїРёС‚Р°РЅРЅСЏ.'));
  }
}

export async function updateFaqAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await updateAdminFaqServer(readId(formData), {
      question: readString(formData, 'question'),
      answer: readString(formData, 'answer'),
      position: readNumber(formData, 'position') ?? 0,
      is_active: checked(formData, 'is_active'),
    });
    revalidatePath('/faq');
    revalidatePath(siteContentPath);
    return ok('РџРёС‚Р°РЅРЅСЏ РѕРЅРѕРІР»РµРЅРѕ.');
  } catch (error) {
    return fail(getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё РїРёС‚Р°РЅРЅСЏ.'));
  }
}

export async function deleteFaqAction(formData: FormData) {
  await deleteAdminFaqServer(readId(formData));
  revalidatePath('/faq');
  revalidatePath(siteContentPath);
}

export async function updateFeedbackAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const id = readId(formData);
    await updateAdminFeedbackServer(id, {
      status: readString(formData, 'status') as FeedbackStatus,
      admin_note: readString(formData, 'admin_note'),
    });
    revalidatePath(adminPageUrlBuilder.feedback.list());
    revalidatePath(adminPageUrlBuilder.feedback.detail(id));
    return ok('Р—РІРµСЂРЅРµРЅРЅСЏ РѕРЅРѕРІР»РµРЅРѕ.');
  } catch (error) {
    return fail(getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё Р·РІРµСЂРЅРµРЅРЅСЏ.'));
  }
}
