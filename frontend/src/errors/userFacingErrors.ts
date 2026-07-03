import { isPlainRecord } from '@/app/utils/valueUtils';

export const USER_ERROR_MESSAGES = {
  generic: 'РЎС‚Р°Р»Р°СЃСЏ РїРѕРјРёР»РєР°. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·.',
  requestFailed: 'РќРµ РІРґР°Р»РѕСЃСЏ РІРёРєРѕРЅР°С‚Рё Р·Р°РїРёС‚. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·.',
  authRequired: 'РЈРІС–Р№РґС–С‚СЊ РІ Р°РєР°СѓРЅС‚, С‰РѕР± РІРёРєРѕРЅР°С‚Рё С†СЋ РґС–СЋ.',
  permissionDenied: 'РЈ РІР°СЃ РЅРµРјР°С” РїСЂР°РІ РґР»СЏ С†С–С”С— РґС–С—.',
  notFound: 'Р—Р°РїРёСЃ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.',
  validation: 'РџРµСЂРµРІС–СЂС‚Рµ РїРѕР»СЏ С„РѕСЂРјРё.',
  conflict: 'РўР°РєРёР№ Р·Р°РїРёСЃ СѓР¶Рµ С–СЃРЅСѓС”.',
  rateLimited: 'Р—Р°Р±Р°РіР°С‚Рѕ СЃРїСЂРѕР±. РЎРїСЂРѕР±СѓР№С‚Рµ РїС–Р·РЅС–С€Рµ.',
  serverUnavailable: 'РЎРµСЂРІРµСЂ С‚РёРјС‡Р°СЃРѕРІРѕ РЅРµРґРѕСЃС‚СѓРїРЅРёР№. РЎРїСЂРѕР±СѓР№С‚Рµ РїС–Р·РЅС–С€Рµ.',
} as const;

const MOJIBAKE_MARKERS = [
  'Р Сџ',
  'Р Р€',
  'Р Сњ',
  'Р вЂ”',
  'Р РЋ',
  'РЎвЂ“',
  'РЎРЉ',
  'РЎРЏ',
  'РЎвЂ°',
  'РЎвЂЎ',
  'РІР‚',
  'Гђ',
  'Г‘',
  'пїЅ',
];

const FIELD_LABELS: Record<string, string> = {
  detail: '',
  message: '',
  non_field_errors: '',
  email: 'Email',
  password: 'РџР°СЂРѕР»СЊ',
  old_password: 'РџРѕС‚РѕС‡РЅРёР№ РїР°СЂРѕР»СЊ',
  new_password: 'РќРѕРІРёР№ РїР°СЂРѕР»СЊ',
  new_password2: 'РџС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ РїР°СЂРѕР»СЏ',
  username: 'Р›РѕРіС–РЅ',
  display_name: 'РќС–РєРЅРµР№Рј',
  first_name: "Р†Рј'СЏ",
  last_name: 'РџСЂС–Р·РІРёС‰Рµ',
  name: 'РќР°Р·РІР°',
  title: 'РќР°Р·РІР°',
  text: 'РўРµРєСЃС‚',
  body: 'РўРµРєСЃС‚',
  comment: 'РљРѕРјРµРЅС‚Р°СЂ',
  brand_name: 'Р‘СЂРµРЅРґ',
  fragrance_name: 'РђСЂРѕРјР°С‚',
  release_year: 'Р С–Рє РІРёРїСѓСЃРєСѓ',
  note_id: 'РќРѕС‚Р°',
  fragrance_id: 'РђСЂРѕРјР°С‚',
  similar_fragrance_id: 'РЎС…РѕР¶РёР№ Р°СЂРѕРјР°С‚',
  value: 'Р—РЅР°С‡РµРЅРЅСЏ',
  status: 'РЎС‚Р°С‚СѓСЃ',
  full_name: "Р†Рј'СЏ С‚Р° РїСЂС–Р·РІРёС‰Рµ",
  phone: 'РўРµР»РµС„РѕРЅ',
  country: 'РљСЂР°С—РЅР°',
  region: 'РћР±Р»Р°СЃС‚СЊ',
  city: 'РњС–СЃС‚Рѕ',
  postal_code: 'РџРѕС€С‚РѕРІРёР№ С–РЅРґРµРєСЃ',
  address: 'РђРґСЂРµСЃР°',
  delivery_point: 'Р’С–РґРґС–Р»РµРЅРЅСЏ Р°Р±Рѕ РїРѕС€С‚РѕРјР°С‚',
  delivery_service: 'РЎР»СѓР¶Р±Р° РґРѕСЃС‚Р°РІРєРё',
  delivery_method: 'РЎРїРѕСЃС–Р± РѕС‚СЂРёРјР°РЅРЅСЏ',
  preferred_messenger: 'РњРµСЃРµРЅРґР¶РµСЂ',
  telegram_username: 'Telegram username',
  cart_item_ids: 'РўРѕРІР°СЂРё РґР»СЏ РѕС„РѕСЂРјР»РµРЅРЅСЏ',
  delivery_cost: 'Р’Р°СЂС‚С–СЃС‚СЊ РґРѕСЃС‚Р°РІРєРё',
  bottle_volume_ml: 'РћР±КјС”Рј С„Р»Р°РєРѕРЅР°',
  actual_volume_ml: 'Р—Р°Р»РёС€РѕРє',
  available_volume_ml: 'Р”РѕСЃС‚СѓРїРЅРёР№ РѕР±КјС”Рј',
  decant_volume_ml: 'РћР±КјС”Рј РІС–РґР»РёРІР°РЅС‚Р°',
  price_sale: 'Р¦С–РЅР°',
  discount_price: 'РђРєС†С–Р№РЅР° С†С–РЅР°',
  price_per_ml: 'Р¦С–РЅР° Р·Р° 1 РјР»',
  discount_price_per_ml: 'РђРєС†С–Р№РЅР° С†С–РЅР° Р·Р° 1 РјР»',
  price_from_quantity_ml: 'РљС–Р»СЊРєС–СЃС‚СЊ РґР»СЏ С–РЅС€РѕС— С†С–РЅРё',
  price_per_ml_from_quantity: 'Р¦С–РЅР° РІС–Рґ Р·Р°Р·РЅР°С‡РµРЅРѕС— РєС–Р»СЊРєРѕСЃС‚С–',
  min_order_amount: 'РњС–РЅС–РјР°Р»СЊРЅР° СЃСѓРјР° Р·Р°РјРѕРІР»РµРЅРЅСЏ',
};

const GENERIC_BACKEND_MESSAGES: Array<[RegExp, string]> = [
  [/^(no access token|unauthorized|401 unauthorized)$/i, USER_ERROR_MESSAGES.authRequired],
  [/authentication credentials were not provided|credentials were not provided|not authenticated|login required/i, USER_ERROR_MESSAGES.authRequired],
  [/permission denied|forbidden|you do not have permission|not allowed|403/i, USER_ERROR_MESSAGES.permissionDenied],
  [/not found|404/i, USER_ERROR_MESSAGES.notFound],
  [/Р·Р°РїРёСЃ РЅРµ Р·РЅР°Р№РґРµРЅРѕ|РѕР±['вЂ™]С”РєС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ/i, USER_ERROR_MESSAGES.notFound],
  [/too many requests|throttled|rate limit|429/i, USER_ERROR_MESSAGES.rateLimited],
  [/network error|fetch failed|failed to fetch|proxy failed|upstream error|upstream.*unavailable|econnrefused|timeout|timed out/i, USER_ERROR_MESSAGES.serverUnavailable],
  [/this field is required|required field|may not be blank|required\./i, USER_ERROR_MESSAGES.validation],
  [/enter a valid|invalid value|invalid pk|incorrect type|not a valid/i, USER_ERROR_MESSAGES.validation],
  [/already exists|already taken|duplicate|unique constraint|must be unique/i, USER_ERROR_MESSAGES.conflict],
  [/РІРё РЅРµ РјРѕР¶РµС‚Рµ РґРѕРґР°С‚Рё РІР»Р°СЃРЅРёР№ С‚РѕРІР°СЂ РґРѕ РєРѕС€РёРєР°/i, 'Р’Р»Р°СЃРЅРµ РѕРіРѕР»РѕС€РµРЅРЅСЏ РЅРµ РјРѕР¶РЅР° РґРѕРґР°С‚Рё РґРѕ РєРѕС€РёРєР°.'],
  [/РЅРµ РјРѕР¶РЅР° РїСЂРѕРїРѕРЅСѓРІР°С‚Рё РѕР±РјС–РЅ СЃР°РјРѕРјСѓ СЃРѕР±С–/i, 'РќРµ РјРѕР¶РЅР° Р·Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё РѕР±РјС–РЅ РґР»СЏ РІР»Р°СЃРЅРѕРіРѕ РѕРіРѕР»РѕС€РµРЅРЅСЏ.'],
  [/РїРѕР·РёС†С–СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ Р°Р±Рѕ РІРѕРЅР° РЅРµРґРѕСЃС‚СѓРїРЅР° РґР»СЏ РѕР±РјС–РЅСѓ/i, 'РћРіРѕР»РѕС€РµРЅРЅСЏ РЅРµРґРѕСЃС‚СѓРїРЅРµ РґР»СЏ РѕР±РјС–РЅСѓ.'],
  [/unable to log in|invalid credentials|invalid password|password incorrect/i, 'РќРµРІС–СЂРЅРёР№ email Р°Р±Рѕ РїР°СЂРѕР»СЊ.'],
  [/passwords? do not match|password mismatch/i, 'РџР°СЂРѕР»С– РЅРµ Р·Р±С–РіР°СЋС‚СЊСЃСЏ.'],
  [/password.*too short|at least \d+ characters/i, 'РџР°СЂРѕР»СЊ Р·Р°РЅР°РґС‚Рѕ РєРѕСЂРѕС‚РєРёР№.'],
  [/invalid token|token is invalid|token has expired/i, 'РџРѕСЃРёР»Р°РЅРЅСЏ РЅРµРґС–Р№СЃРЅРµ Р°Р±Рѕ Р·Р°СЃС‚Р°СЂС–Р»Рµ.'],
  [/file too large|image too large/i, 'Р¤Р°Р№Р» Р·Р°РІРµР»РёРєРёР№.'],
  [/unsupported file|invalid image|upload a valid image/i, 'Р—Р°РІР°РЅС‚Р°Р¶С‚Рµ РєРѕСЂРµРєС‚РЅРµ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ.'],
];

function isMojibake(value: string) {
  return MOJIBAKE_MARKERS.some((marker) => value.includes(marker));
}

function cleanMessage(value: string) {
  const message = value.replace(/\s+/g, ' ').trim();
  const djangoListMatch = message.match(/^\[['"](.+)['"]\]$/);

  return djangoListMatch?.[1]?.trim() || message;
}

function localizePlainMessage(value: string, fallback: string) {
  const message = cleanMessage(value);

  if (!message) {
    return fallback;
  }

  if (isMojibake(message)) {
    return fallback;
  }

  for (const [pattern, localized] of GENERIC_BACKEND_MESSAGES) {
    if (pattern.test(message)) {
      return localized;
    }
  }

  return message;
}

export function isAuthRequiredMessage(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  return (
    localizePlainMessage(value, USER_ERROR_MESSAGES.generic) ===
    USER_ERROR_MESSAGES.authRequired
  );
}

export function messageForStatus(
  status?: number,
  fallback: string = USER_ERROR_MESSAGES.requestFailed,
) {
  if (status === 401) return USER_ERROR_MESSAGES.authRequired;
  if (status === 403) return USER_ERROR_MESSAGES.permissionDenied;
  if (status === 404) return USER_ERROR_MESSAGES.notFound;
  if (status === 409) return USER_ERROR_MESSAGES.conflict;
  if (status === 422) return USER_ERROR_MESSAGES.validation;
  if (status === 429) return USER_ERROR_MESSAGES.rateLimited;
  if (status && status >= 500) return USER_ERROR_MESSAGES.serverUnavailable;

  return fallback;
}

export function collectErrorMessages(value: unknown): string[] {
  if (!value) return [];

  if (typeof value === 'string') {
    const message = cleanMessage(value);
    return message ? [message] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectErrorMessages);
  }

  if (!isPlainRecord(value)) {
    return [];
  }

  const preferred = [
    ...collectErrorMessages(value.detail),
    ...collectErrorMessages(value.message),
    ...collectErrorMessages(value.non_field_errors),
    ...collectErrorMessages(value.error),
    ...collectErrorMessages(value.errors),
  ];

  const rest = Object.entries(value)
    .filter(([key]) => {
      return !['detail', 'message', 'non_field_errors', 'error', 'errors'].includes(key);
    })
    .flatMap(([key, nested]) => {
      return collectErrorMessages(nested).map((message) => {
        const label = FIELD_LABELS[key] ?? key;
        return label ? `${label}: ${message}` : message;
      });
    });

  return [...preferred, ...rest];
}

export function toUserFacingMessage(
  value: unknown,
  fallback: string = USER_ERROR_MESSAGES.generic,
  status?: number,
): string {
  if (typeof value === 'string') {
    const localized = localizePlainMessage(value, fallback);

    if (localized !== fallback || !status) {
      return localized;
    }
  }

  const messages = collectErrorMessages(value)
    .map((message) => localizePlainMessage(message, fallback))
    .filter(Boolean);

  const meaningfulMessages = messages.filter((message) => message !== fallback);

  if (meaningfulMessages.length > 0) {
    return Array.from(new Set(meaningfulMessages)).join(' ');
  }

  return messageForStatus(status, fallback);
}
