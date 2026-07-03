import { buttonStyles } from '@/app/components/common/buttonStyles';

export const featureSettingsStyles = {
  page: 'mx-auto grid max-w-4xl gap-6 px-4 py-6',
  header: 'grid gap-2',
  title: 'text-2xl font-semibold text-gray-950',
  lead: 'text-sm leading-6 text-gray-600',
  form: 'grid gap-5',
  grid: 'grid gap-4 md:grid-cols-2',
  card: 'grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm',
  cardHeader: 'grid gap-1',
  cardTitle: 'text-lg font-semibold text-gray-950',
  cardLead: 'text-sm leading-6 text-gray-600',
  switchRow:
    'flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3',
  switchText: 'grid gap-0.5',
  switchLabel: 'text-sm font-semibold text-gray-950',
  switchHint: 'text-xs leading-5 text-gray-500',
  checkbox: 'h-5 w-5 accent-[#641f32]',
  envWarning:
    'rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900',
  actions: 'flex flex-wrap items-center gap-3',
  button:
    buttonStyles.primary,
  success: 'text-sm font-medium text-emerald-700',
  error: 'text-sm font-medium text-red-700',
} as const;
