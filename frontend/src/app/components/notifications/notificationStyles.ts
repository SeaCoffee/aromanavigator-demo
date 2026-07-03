import { buttonStyles } from '@/app/components/common/buttonStyles';

// frontend/src/app/components/notifications/notificationStyles.ts

export const notificationStyles = {
  page: 'mx-auto grid w-full max-w-5xl gap-6 px-4 py-7',

  header: 'grid gap-1',
  title: 'text-2xl font-semibold',
  subtitle: 'text-sm text-gray-500',

  toolbar:
    'flex flex-wrap items-center justify-between gap-3 border-y border-[#eadfd5] py-3',
  toolbarActions: 'flex flex-wrap gap-2',
  toolbarMeta: 'flex flex-wrap items-center gap-2 text-sm text-[#6f6259]',
  counter:
    'inline-flex items-center gap-1 rounded-full bg-[#f6efe8] px-3 py-1.5 text-xs font-medium text-[#6f6259]',

  adminForm: 'grid gap-4',
  adminFormGrid: 'grid gap-4 md:grid-cols-3',
  field: 'grid gap-1.5',
  label: 'text-xs font-medium uppercase tracking-[0.12em] text-gray-500',
  input:
    'min-h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-900',
  textarea:
    'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-900',
  checkboxLabel: 'inline-flex items-center gap-2 text-sm text-gray-700',

  list: 'grid gap-3',
  emptyCard: 'rounded-2xl border bg-white p-4 text-sm text-gray-500 shadow-sm',
  section: 'grid gap-3',
  sectionTitle: 'text-lg font-semibold',

  card: 'grid gap-3 rounded-2xl border bg-white p-4 shadow-sm',
  cardUnread: 'grid gap-3 rounded-2xl border border-gray-900 bg-white p-4 shadow-sm',
  announcementCard:
    'grid gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm',
  announcementCardRead:
    'grid gap-3 rounded-2xl border bg-white p-4 shadow-sm',
  cardTop: 'flex flex-wrap items-start justify-between gap-3',
  cardTitle: 'font-medium',
  cardBody: 'whitespace-pre-line text-sm leading-6 text-gray-700',
  meta: 'text-xs text-gray-500',
  text: 'text-sm text-gray-700',
  payload: 'rounded-xl bg-gray-50 p-3 text-xs text-gray-600',

  badge:
    'inline-flex rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white',
  readBadge:
    'inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600',

  actions: 'flex flex-wrap gap-2',
  button:
    buttonStyles.compactSecondary,
  dangerButton:
    buttonStyles.danger,

  error: 'text-xs text-red-600',
  success: 'text-xs text-emerald-700',
};
