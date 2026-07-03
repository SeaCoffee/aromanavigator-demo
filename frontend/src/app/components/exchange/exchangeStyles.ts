import { buttonStyles } from '@/app/components/common/buttonStyles';

export const exchangeStyles = {
  page: 'mx-auto grid max-w-5xl gap-6 px-4 py-6',

  header: 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
  title: 'text-2xl font-semibold text-gray-950',
  subtitle: 'mt-1 text-sm text-gray-500',

  tabs: 'flex flex-wrap gap-2',
  tab: `${buttonStyles.base} rounded-full px-4 py-2`,
  tabActive: `${buttonStyles.selectedPalette} !text-[#fff8f1]`,
  tabIdle: buttonStyles.secondaryPalette,

  list: 'grid gap-3',
  empty:
    'rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500',

  card: 'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
  cardTop: 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
  cardTitle: 'text-base font-semibold text-gray-950',
  cardMeta: 'mt-1 text-sm text-gray-500',
  cardBody: 'mt-4 grid gap-3 text-sm',
  cardActions: 'mt-4 flex flex-wrap gap-2',
  fieldBlock: 'grid gap-1.5',
  fieldLabel: 'text-xs font-black uppercase tracking-[0.1em] text-[#6f6259]',
  itemListCompact: 'grid gap-1.5',
  itemRow:
    'rounded-xl border border-[#eee3d9] bg-[#fbf7f1] px-3 py-2 text-sm font-medium text-[#3c322d]',
  itemLink:
    'font-semibold text-[#641f32] underline-offset-4 transition hover:text-[#9b6847] hover:underline',
  itemUnavailable: 'font-medium text-[#7a6d64]',

  badge: 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',

  form: 'grid gap-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm',
  formTitle: 'text-lg font-semibold text-gray-950',
  formHint: 'mt-1 text-sm text-gray-500',

  fieldset: 'grid gap-3',
  legend: 'text-sm font-medium text-gray-900',
  radioLabel: 'flex gap-3 rounded-xl border border-gray-200 p-3 text-sm',

  selectorSection: 'grid gap-3',
  selectorTitle: 'text-sm font-medium text-gray-900',
  selectorHint: 'mt-1 text-sm text-gray-500',
  selectedSummary: 'mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500',
  clearSelectionButton:
    'font-semibold text-gray-900 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50',

  selectorControls:
    'grid gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-3',
  searchInput:
    'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400',

  typeFilters: 'flex flex-wrap gap-2',
  typeFilterButton:
    'rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
  typeFilterButtonActive: 'border-gray-950 bg-gray-950 !text-white',
  typeFilterButtonIdle:
    'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-950',

  scrollList:
    'max-h-[420px] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2',
  itemList: 'grid gap-2',
  itemLabel:
    'flex items-center gap-3 rounded-xl border p-3 text-sm transition',
  itemLabelChecked: 'border-gray-950 bg-gray-50 text-gray-950',
  itemLabelIdle: 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
  itemLabelDisabled: 'cursor-not-allowed opacity-55',
  itemLabelEnabled: 'cursor-pointer',

  button: `${buttonStyles.base} ${buttonStyles.regular}`,
  buttonPrimary: `${buttonStyles.primaryPalette} !text-white`,
  buttonSecondary: buttonStyles.secondaryPalette,
  buttonDanger: buttonStyles.dangerPalette,

  textarea:
    'min-h-24 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-500',
  error:
    'rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700',
  success:
    'rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700',
} as const;
