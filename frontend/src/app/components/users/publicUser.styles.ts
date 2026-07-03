import { buttonStyles } from '@/app/components/common/buttonStyles';

export const publicUserStyles = {
  profilePage: 'mx-auto grid w-full max-w-[1136px] gap-0 px-4 py-7 sm:px-6',
  profileShell:
    'overflow-hidden rounded-lg border border-[#eadfd5] bg-[#fffdf9] shadow-[0_18px_50px_rgba(94,72,54,0.08)]',
  profileHeader:
    'grid gap-5 p-5 md:grid-cols-[auto_minmax(0,1fr)] md:p-6 lg:grid-cols-[auto_minmax(0,1fr)_auto]',
  avatar:
    'size-24 rounded-full border border-[#eadfd5] object-cover shadow-[0_10px_26px_rgba(94,72,54,0.10)] sm:size-28',
  avatarFallback:
    'grid size-24 place-items-center rounded-full border border-[#eadfd5] bg-[#efe3d9] text-3xl font-bold text-[#641f32] sm:size-28',
  profileInfo: 'min-w-0 self-center',
  nameRow: 'flex min-w-0 flex-wrap items-center gap-2',
  title:
    'truncate font-serif text-[30px] font-semibold leading-tight text-[#2b211d] sm:text-[34px]',
  selfBadge:
    'rounded-full bg-[#f6efe8] px-2.5 py-1 text-[11px] font-bold text-[#7a6d64]',
  name: 'mt-1 text-sm font-semibold text-[#6f6258]',
  region: 'mt-1 text-sm text-[#8a7b70]',
  statList: 'mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#6f6258]',
  stat: 'font-semibold transition hover:text-[#641f32]',
  statStatic: 'font-semibold',
  statValue: 'font-bold text-[#2b211d]',
  profileActions: 'flex flex-wrap items-start gap-2 lg:max-w-[340px] lg:justify-end',
  actionPrimary:
    buttonStyles.primary,
  actionSecondary:
    buttonStyles.secondary,
  actionQuiet:
    'inline-flex min-h-10 items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-[#7a6d64] transition hover:bg-[#f6efe8] hover:text-[#641f32]',
  actionMessage: 'basis-full text-xs text-[#8a7b70] lg:text-right',
  moreActions: 'relative',
  moreActionsSummary:
    'cursor-pointer list-none rounded-md px-3 py-2 text-sm font-semibold text-[#7a6d64] transition hover:bg-[#f6efe8] hover:text-[#641f32]',
  moreActionsBody:
    'absolute right-0 z-10 mt-1 min-w-56 rounded-md border border-[#eadfd5] bg-white p-2 shadow-[0_14px_34px_rgba(94,72,54,0.14)]',
  profileBody:
    'grid border-t border-[#eadfd5] lg:grid-cols-[minmax(0,1fr)_300px]',
  about: 'grid content-start gap-2 p-5 md:p-6',
  reputation:
    'grid content-start gap-4 border-t border-[#eadfd5] bg-[#fcf8f4] p-5 md:p-6 lg:border-l lg:border-t-0',
  sectionTitle: 'text-base font-bold text-[#2b211d]',
  aboutText: 'max-w-3xl whitespace-pre-wrap text-sm font-medium leading-7 text-[#6f6258]',
  empty: 'text-sm font-medium leading-6 text-[#8a7b70]',
  reputationTop: 'flex items-end justify-between gap-4',
  pointsValue: 'text-3xl font-bold text-[#2b211d]',
  pointsLabel: 'text-xs font-semibold uppercase text-[#8a7b70]',
  badgeList: 'flex flex-wrap gap-2',
  badge:
    'rounded-full border border-[#e0d2c5] bg-white px-3 py-1 text-xs font-semibold text-[#6f6258]',
  nav:
    'flex gap-1 overflow-x-auto border-x border-b border-[#eadfd5] bg-[#fffdf9] p-2',
  navLink:
    'shrink-0 rounded-md px-3 py-2 text-sm font-semibold text-[#6f6258] transition hover:bg-[#f6efe8] hover:text-[#641f32]',
  navLinkActive: 'bg-[#f1e6df] text-[#641f32]',

  list:
    'grid gap-4 rounded-lg border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_18px_50px_rgba(94,72,54,0.08)]',
  listTop: 'flex flex-wrap items-center justify-between gap-3',
  muted: 'text-sm font-medium leading-6 text-[#7a6d64]',
  pager: 'flex gap-2',
  pagerLink:
    buttonStyles.compactSecondary,
  rows: 'grid gap-3',
  row:
    'flex items-center justify-between gap-4 rounded-lg border border-[#eadfd5] bg-white/80 p-4',
  rowUser: 'flex min-w-0 items-center gap-3',
  smallAvatar: 'size-12 rounded-full border border-[#eadfd5] object-cover',
  smallAvatarFallback:
    'grid size-12 place-items-center rounded-full border border-[#eadfd5] bg-[#efe3d9] text-sm font-bold text-[#641f32]',
  rowInfo: 'min-w-0',
  rowTitle: 'truncate font-bold text-[#2b211d]',
  rowMeta: 'truncate text-sm font-medium text-[#7a6d64]',
  rowSubMeta: 'truncate text-xs font-medium text-[#a18875]',
  form:
    'grid gap-4 rounded-lg border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_16px_46px_rgba(94,72,54,0.08)]',
  field: 'grid gap-2',
  label: 'text-sm font-bold text-[#3d312c]',
  input:
    'min-h-11 rounded-md border border-[#e0d2c5] bg-white px-4 py-2 text-sm font-medium text-[#241b19] outline-none transition placeholder:text-[#a89b91] focus:border-[#b98d6d] focus:ring-4 focus:ring-[#b98d6d]/10',
  actions: 'flex flex-wrap gap-3',
  submit:
    buttonStyles.primary,
  reset:
    buttonStyles.secondary,
} as const;
