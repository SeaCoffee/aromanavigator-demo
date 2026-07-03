import { buttonStyles } from '@/app/components/common/buttonStyles';

export const fragranceAdminStyles = {
  page: 'mx-auto grid w-full max-w-7xl gap-6 px-4 py-8',
  narrowPage: 'mx-auto grid w-full max-w-3xl gap-6 px-4 py-8',
  editPage: 'mx-auto grid w-full max-w-5xl gap-8 px-4 py-8',
  header: 'grid gap-2',
  headerWithAction:
    'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
  title: 'text-3xl font-semibold text-neutral-950',
  subtitle: 'text-sm text-neutral-600',
  section: 'grid gap-4',
  card: 'grid gap-4 rounded-lg border border-neutral-200 bg-white p-4',
  cardLarge:
    'grid gap-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm md:p-6',
  dashedCard:
    'grid gap-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm',
  form: 'grid gap-4 rounded-lg border border-neutral-200 bg-white p-4',
  formGrid: 'grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)] xl:items-start',
  stickyPanel: 'grid gap-4 xl:sticky xl:top-4',
  formRow: 'flex flex-wrap items-end gap-3',
  field: 'grid gap-1',
  label: 'text-sm font-medium text-neutral-700',
  labelPlain: 'text-sm font-medium',
  input:
    'rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-[#641f32]',
  tallInput: 'min-h-11 rounded-lg border border-neutral-300 px-3 py-2',
  textarea: 'min-h-24 rounded-lg border border-neutral-300 px-3 py-2',
  multiSelect: 'min-h-36 rounded-lg border border-neutral-300 px-3 py-2',
  noteSelect: 'min-h-44 rounded-lg border border-neutral-300 px-3 py-2',
  button:
    buttonStyles.secondary,
  buttonTall:
    buttonStyles.secondary,
  primaryButton:
    buttonStyles.primary,
  linkButton:
    buttonStyles.secondary,
  smallLinkButton:
    buttonStyles.compactSecondary,
  tableWrap: 'overflow-hidden rounded-lg border border-neutral-200 bg-white',
  table: 'w-full text-sm',
  tableHead: 'bg-neutral-50 text-left text-neutral-700',
  tableCell: 'px-4 py-3',
  tableRow: 'border-t border-neutral-200 transition hover:bg-neutral-50',
  emptyCell: 'px-4 py-6 text-center text-neutral-500',
  emptyState: 'rounded-lg border border-neutral-200 p-4 text-sm text-neutral-500',
  badge: 'rounded-full px-3 py-1 text-xs font-medium',
  neutralBadge: 'rounded-full bg-neutral-100 px-3 py-1 text-xs',
  successMessage: 'text-sm text-green-700',
  errorMessage: 'text-sm text-red-600',
  muted: 'text-sm text-neutral-600',
  mutedTiny: 'text-xs text-neutral-500',
  pre: 'overflow-x-auto whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 font-sans text-sm',
  preWhite: 'whitespace-pre-wrap rounded-lg bg-white p-3 font-sans',
} as const;

export function messageClassName(isSuccess: boolean) {
  return isSuccess
    ? fragranceAdminStyles.successMessage
    : fragranceAdminStyles.errorMessage;
}
