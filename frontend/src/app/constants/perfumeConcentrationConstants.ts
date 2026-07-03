export const PERFUME_CONCENTRATION_OPTIONS = [
  {
    value: 'parfum',
    label: 'Parfum / Extrait de Parfum',
  },
  {
    value: 'esprit',
    label: 'Esprit de Parfum',
  },
  {
    value: 'edp',
    label: 'Eau de Parfum',
  },
  {
    value: 'edt',
    label: 'Eau de Toilette',
  },
  {
    value: 'edc',
    label: 'Eau de Cologne',
  },
  {
    value: 'eau_fraiche',
    label: 'Eau FraГ®che',
  },
  {
    value: 'mist',
    label: 'РњС–СЃС‚ РґР»СЏ С‚С–Р»Р°',
  },
  {
    value: 'hair',
    label: 'РњС–СЃС‚ РґР»СЏ РІРѕР»РѕСЃСЃСЏ',
  },
  {
    value: 'oil',
    label: 'РџР°СЂС„СѓРјРѕРІР°РЅР° РѕР»С–СЏ',
  },
  {
    value: 'solid',
    label: 'РўРІРµСЂРґС– РїР°СЂС„СѓРјРё',
  },
  {
    value: 'aftershave',
    label: 'Р—Р°СЃС–Р± РїС–СЃР»СЏ РіРѕР»С–РЅРЅСЏ',
  },
  {
    value: 'other',
    label: 'Р†РЅС€Р° Р°Р±Рѕ РЅРµРІС–РґРѕРјР°',
  },
] as const;

export type PerfumeConcentrationValue =
  (typeof PERFUME_CONCENTRATION_OPTIONS)[number]['value'];

export function getPerfumeConcentrationLabel(value: string): string {
  return (
    PERFUME_CONCENTRATION_OPTIONS.find((option) => option.value === value)
      ?.label ?? value
  );
}

export function hasPerfumeConcentrationOption(value: string): boolean {
  return PERFUME_CONCENTRATION_OPTIONS.some((option) => option.value === value);
}
