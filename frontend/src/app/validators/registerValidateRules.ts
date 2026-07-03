import type { RegisterOptions } from "react-hook-form";

import type { RegisterFormValues } from "@/app/types/formTypes";

type RegisterRules = {
  [Name in keyof RegisterFormValues]: RegisterOptions<RegisterFormValues, Name>;
};

const EMAIL_MAX = 120;
const EMAIL_BASIC_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DISPLAY_NAME_RE = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/;
const DISPLAY_NAME_RESERVED_RE =
  /(admin|administrator|administration|moderator|moderation|support)/i;
const DISPLAY_NAME_MIN = 3;
const DISPLAY_NAME_MAX = 30;

const NAME_LENGTH_RE = /^.{2,25}$/;
const NAME_ALLOWED_RE = /^\p{L}+(?:[ \-'\u2019\u02BC]\p{L}+)*$/u;

const PASS_LEN_NO_SPACE = /^(?=.{8,16}$)\S+$/;
const PASS_HAS_LOWER = /[a-z]/;
const PASS_HAS_UPPER = /[A-Z]/;
const PASS_HAS_DIGIT = /\d/;
const PASS_HAS_SPECIAL = /[^A-Za-z0-9]/;

export const PASSWORD_REQUIREMENTS_TEXT =
  "8-16 symbols, no spaces: lowercase and uppercase Latin letters, digit and special symbol.";

function hasDoubleSpaces(value: string) {
  return value.includes("  ");
}

export function validateEmailInput(raw: string): true | string {
  const value = (raw ?? "").trim();

  if (!value) return "Р’РєР°Р¶С–С‚СЊ email.";
  if (value.length > EMAIL_MAX)
    return `Email Р·Р°РЅР°РґС‚Рѕ РґРѕРІРіРёР№. РњР°РєСЃРёРјСѓРј ${EMAIL_MAX} СЃРёРјРІРѕР»С–РІ.`;
  if (!EMAIL_BASIC_RE.test(value)) return "РќРµРІС–СЂРЅРёР№ С„РѕСЂРјР°С‚ email.";

  const at = value.lastIndexOf("@");
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);

  if (local.length > 64) return "Р§Р°СЃС‚РёРЅР° email РґРѕ @ Р·Р°РЅР°РґС‚Рѕ РґРѕРІРіР°.";
  if (domain.length > 253) return "Р”РѕРјРµРЅ email Р·Р°РЅР°РґС‚Рѕ РґРѕРІРіРёР№.";

  const labels = domain.split(".");

  if (labels.some((label) => !label || label.length > 63)) {
    return "Р”РѕРјРµРЅ email РјР°С” РЅРµРєРѕСЂРµРєС‚РЅСѓ СЃС‚СЂСѓРєС‚СѓСЂСѓ.";
  }

  if (labels.some((label) => label.startsWith("-") || label.endsWith("-"))) {
    return "Р”РѕРјРµРЅ email РјР°С” РЅРµРєРѕСЂРµРєС‚РЅСѓ СЃС‚СЂСѓРєС‚СѓСЂСѓ.";
  }

  return true;
}

function validateName(raw: string): true | string {
  const value = (raw ?? "").trim();

  if (!value) return "Р’РєР°Р¶С–С‚СЊ С–Рј'СЏ.";
  if (hasDoubleSpaces(value)) return "РџРѕРґРІС–Р№РЅС– РїСЂРѕР±С–Р»Рё Р·Р°Р±РѕСЂРѕРЅРµРЅС–.";
  if (!NAME_LENGTH_RE.test(value)) return "Р†Рј'СЏ РјР°С” Р±СѓС‚Рё РІС–Рґ 2 РґРѕ 25 СЃРёРјРІРѕР»С–РІ.";
  if (!NAME_ALLOWED_RE.test(value)) {
    return "Р†Рј'СЏ РјРѕР¶Рµ РјС–СЃС‚РёС‚Рё Р»С–С‚РµСЂРё, РїСЂРѕР±С–Р»Рё, РґРµС„С–СЃРё С‚Р° Р°РїРѕСЃС‚СЂРѕС„Рё.";
  }

  return true;
}

function validateDisplayName(raw: string): true | string {
  const value = (raw ?? "").trim().replace(/\s+/g, "");

  if (!value) return "Р’РєР°Р¶С–С‚СЊ РЅС–РєРЅРµР№Рј.";
  if (value.length < DISPLAY_NAME_MIN || value.length > DISPLAY_NAME_MAX) {
    return `РќС–РєРЅРµР№Рј РјР°С” Р±СѓС‚Рё РІС–Рґ ${DISPLAY_NAME_MIN} РґРѕ ${DISPLAY_NAME_MAX} СЃРёРјРІРѕР»С–РІ.`;
  }

  if (!DISPLAY_NAME_RE.test(value)) {
    return "РќС–РєРЅРµР№Рј РјРѕР¶Рµ РјС–СЃС‚РёС‚Рё Р»Р°С‚РёРЅСЃСЊРєС– Р»С–С‚РµСЂРё, С†РёС„СЂРё, РєСЂР°РїРєСѓ, РїС–РґРєСЂРµСЃР»РµРЅРЅСЏ Р°Р±Рѕ РґРµС„С–СЃ С– РјР°С” РїРѕС‡РёРЅР°С‚РёСЃСЏ С‚Р° Р·Р°РєС–РЅС‡СѓРІР°С‚РёСЃСЏ Р»С–С‚РµСЂРѕСЋ Р°Р±Рѕ С†РёС„СЂРѕСЋ.";
  }

  if (DISPLAY_NAME_RESERVED_RE.test(value)) {
    return "РќС–РєРЅРµР№Рј РјС–СЃС‚РёС‚СЊ Р·Р°СЂРµР·РµСЂРІРѕРІР°РЅРµ СЃР»СѓР¶Р±РѕРІРµ СЃР»РѕРІРѕ.";
  }

  return true;
}

export function validatePasswordInput(raw: string): true | string {
  const value = raw ?? "";

  if (!value) return "Р’РєР°Р¶С–С‚СЊ РїР°СЂРѕР»СЊ.";
  if (!PASS_LEN_NO_SPACE.test(value)) {
    return "Password must be 8-16 characters long and contain no spaces.";
  }
  if (!PASS_HAS_LOWER.test(value))
    return "Password must contain at least one lowercase letter (a-z).";
  if (!PASS_HAS_UPPER.test(value))
    return "Password must contain at least one uppercase letter (A-Z).";
  if (!PASS_HAS_DIGIT.test(value))
    return "Password must contain at least one digit (0-9).";
  if (!PASS_HAS_SPECIAL.test(value))
    return "Password must contain at least one special character.";

  return true;
}

const termsMessage =
  "РџРѕС‚СЂС–Р±РЅРѕ РїРѕРіРѕРґРёС‚РёСЃСЏ Р· РїСЂР°РІРёР»Р°РјРё СЃР°Р№С‚Сѓ С‚Р° РїРѕР»С–С‚РёРєРѕСЋ РєРѕРЅС„С–РґРµРЅС†С–Р№РЅРѕСЃС‚С–.";

export const registerValidateRules: RegisterRules = {
  email: { required: "Р’РєР°Р¶С–С‚СЊ email.", validate: validateEmailInput },
  password: { required: "Р’РєР°Р¶С–С‚СЊ РїР°СЂРѕР»СЊ.", validate: validatePasswordInput },
  name: { required: "Р’РєР°Р¶С–С‚СЊ С–Рј'СЏ.", validate: validateName },
  display_name: { required: "Р’РєР°Р¶С–С‚СЊ РЅС–РєРЅРµР№Рј.", validate: validateDisplayName },
  termsAccepted: {
    required: termsMessage,
    validate: (value) => value === true || termsMessage,
  },
};
