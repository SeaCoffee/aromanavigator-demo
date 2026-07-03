// src/app/utils/datetime.ts
export function datetimeLocalToIso(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error('РќРµРєРѕСЂРµРєС‚РЅР° РґР°С‚Р° Р°Р±Рѕ С‡Р°СЃ.');
  return d.toISOString();
}

export function nowMinDatetimeLocal(): string {
  const d = new Date();
  // РћРєСЂСѓРіР»СЋС”РјРѕ РґРѕ С…РІРёР»РёРЅ, С‰РѕР± min Р·Р±С–РіР°РІСЃСЏ Р· С„РѕСЂРјР°С‚РѕРј input.
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
