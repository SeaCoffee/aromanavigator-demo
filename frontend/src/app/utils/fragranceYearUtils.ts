export const MIN_FRAGRANCE_RELEASE_YEAR = 1500;
export const MAX_FRAGRANCE_RELEASE_YEAR = new Date().getFullYear() + 1;

export function validateFragranceReleaseYear(value: string) {
  const clean = value.trim();

  if (!clean) {
    return true;
  }

  if (!/^\d{4}$/.test(clean)) {
    return 'Р С–Рє РІРёРїСѓСЃРєСѓ РјР°С” РјС–СЃС‚РёС‚Рё СЂС–РІРЅРѕ 4 С†РёС„СЂРё.';
  }

  const year = Number(clean);

  return (
    (year >= MIN_FRAGRANCE_RELEASE_YEAR &&
      year <= MAX_FRAGRANCE_RELEASE_YEAR) ||
    `Р С–Рє РІРёРїСѓСЃРєСѓ РјР°С” Р±СѓС‚Рё РІ РјРµР¶Р°С… ${MIN_FRAGRANCE_RELEASE_YEAR}-${MAX_FRAGRANCE_RELEASE_YEAR}.`
  );
}
