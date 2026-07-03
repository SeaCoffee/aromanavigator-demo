export const MIN_PERFUME_RELEASE_YEAR = 1920;

export function getMaxPerfumeReleaseYear() {
  return new Date().getFullYear();
}

export function validatePerfumeYearOrDecade(value: unknown): true | string {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    (typeof value === 'number' && Number.isNaN(value))
  ) {
    return true;
  }

  const year = Number(value);

  if (!Number.isInteger(year)) {
    return 'Р С–Рє Р°Р±Рѕ РґРµСЃСЏС‚РёР»С–С‚С‚СЏ РјР°С” Р±СѓС‚Рё С†С–Р»РёРј С‡РёСЃР»РѕРј.';
  }

  if (year < MIN_PERFUME_RELEASE_YEAR) {
    return `Р С–Рє Р°Р±Рѕ РґРµСЃСЏС‚РёР»С–С‚С‚СЏ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё СЂР°РЅС–С€Рµ ${MIN_PERFUME_RELEASE_YEAR} СЂРѕРєСѓ.`;
  }

  const maxYear = getMaxPerfumeReleaseYear();

  if (year > maxYear) {
    return `Р С–Рє Р°Р±Рѕ РґРµСЃСЏС‚РёР»С–С‚С‚СЏ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РїС–Р·РЅС–С€Рµ ${maxYear} СЂРѕРєСѓ.`;
  }

  return true;
}
