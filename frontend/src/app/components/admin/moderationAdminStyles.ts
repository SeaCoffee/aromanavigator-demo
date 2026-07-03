import { buttonStyles } from '@/app/components/common/buttonStyles';

export const moderationAdminStyles = {
  page: 'mx-auto grid max-w-6xl gap-6 px-4 py-6',
  header: 'grid gap-2',
  title: 'text-2xl font-semibold',
  subtitle: 'text-sm text-gray-500',
  panel: 'grid gap-4 rounded-2xl border bg-white p-4 shadow-sm',
  formGrid: 'grid gap-3 md:grid-cols-[160px_1fr_160px_1fr_180px_auto]',
  input: 'rounded-xl border px-3 py-2 text-sm',
  select: 'rounded-xl border px-3 py-2 text-sm',
  button:
    buttonStyles.secondary,
  primaryButton:
    buttonStyles.primary,
  dangerButton:
    buttonStyles.danger,
  tableWrap: 'overflow-x-auto rounded-2xl border bg-white',
  table: 'min-w-full text-sm',
  thead: 'bg-gray-50 text-left text-xs text-gray-500',
  th: 'px-3 py-2',
  td: 'px-3 py-3 align-top',
  row: 'border-t',
  badge: 'inline-flex rounded-full border px-2 py-0.5 text-xs text-gray-600',
  muted: 'text-sm text-gray-500',
  smallMuted: 'text-xs text-gray-500',
  tabs: 'flex flex-wrap gap-2',
  tab: 'rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50',
  tabActive: 'rounded-full bg-[#641f32] px-3 py-1.5 text-sm text-white',
};
