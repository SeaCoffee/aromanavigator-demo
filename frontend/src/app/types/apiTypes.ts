// src/types/apiTypes.ts
export type Json = unknown;

/** РЎС‚Р°РЅРґР°СЂС‚РЅРёР№ payload РїРѕРјРёР»РѕРє РІС–Рґ API (detail/message + Р·Р°РїР°СЃ). */
export type ApiErrorPayload = {
  detail?: string;
  message?: string;
  [k: string]: unknown;
};

/** Р РѕР·С€РёСЂРµРЅРЅСЏ RequestInit: Р·СЂСѓС‡РЅРѕ РїРµСЂРµРґР°РІР°С‚Рё JSON Сѓ С‚С–Р»С– Р·Р°РїРёС‚Сѓ. */
export type RequestInitEx<TJson = Json> = RequestInit & {
  json?: TJson;
  cache?: RequestInit['cache'];
  auth?: 'required' | 'none';
};

/** Р—Р°РіРѕР»РѕРІРєРё, Сѓ СЏРєРёС… РЅР°Рј РїРѕС‚СЂС–Р±РµРЅ Р»РёС€Рµ РјРµС‚РѕРґ get(name). */
export type HeaderLike = Pick<Headers, 'get'>;
