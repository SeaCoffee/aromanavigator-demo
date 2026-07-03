import { buttonStyles } from '@/app/components/common/buttonStyles';

export const contentModerationStyles = {
  page: 'grid gap-8',
  header: 'grid gap-1',
  title: 'text-2xl font-semibold text-[#182128]',
  subtitle: 'max-w-3xl text-sm text-[#687983]',
  section: 'grid gap-4',
  sectionHeader: 'grid gap-1',
  sectionTitle: 'text-lg font-semibold text-[#182128]',
  sectionText: 'text-sm text-[#687983]',
  form:
    'grid gap-2 rounded-lg border border-[#dfe4e7] bg-white p-3 md:grid-cols-[1fr_1fr_150px_150px_auto]',
  input: 'min-h-10 rounded-md border border-[#dfe4e7] px-3 text-sm',
  select: 'min-h-10 rounded-md border border-[#dfe4e7] bg-white px-3 text-sm',
  primaryButton:
    buttonStyles.compactPrimary,
  tableWrap: 'overflow-x-auto rounded-lg border border-[#dfe4e7] bg-white',
  table: 'min-w-full text-left text-sm',
  th: 'bg-[#f5f8f8] px-3 py-2 text-xs font-semibold text-[#687983]',
  td: 'border-t border-[#e8ecee] px-3 py-3 align-top text-[#34434a]',
  badge: 'inline-flex rounded-full border border-[#dfe4e7] px-2 py-0.5 text-xs',
  actions: 'flex flex-wrap gap-2',
  button:
    buttonStyles.compactSecondary,
  danger:
    buttonStyles.compactDanger,
  threadLink: 'font-medium text-[#356a70] hover:underline',
  message: 'max-w-xl whitespace-pre-wrap text-sm text-[#34434a]',
  empty: 'rounded-lg border border-dashed border-[#dfe4e7] p-4 text-sm text-[#687983]',
} as const;
