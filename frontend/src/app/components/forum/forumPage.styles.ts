import { buttonStyles } from '@/app/components/common/buttonStyles';

export const forumPageStyles = {
  page: 'min-h-screen overflow-x-hidden bg-[#fbf7f2] text-[#241b19]',

  container:
    'mx-auto grid w-full max-w-[1180px] gap-7 px-4 py-7 sm:px-8 sm:py-10',

  header:
    'flex flex-col gap-4 border-b border-[#eadfd5] pb-6 md:flex-row md:items-end md:justify-between',

  headerText: 'grid max-w-[680px] gap-1.5',

  title:
    'font-serif text-4xl font-semibold leading-tight text-[#2b211d]',

  lead:
    'text-sm font-medium leading-6 text-[#7a6d64]',

  actionLink:
    buttonStyles.primary,

  searchForm:
    'grid gap-3 border-b border-[#eadfd5] pb-7 md:grid-cols-[1fr_220px_auto]',

  input:
    'min-h-11 rounded-lg border border-[#e0d2c5] bg-white px-4 py-2 text-sm font-medium text-[#241b19] outline-none transition placeholder:text-[#a89b91] focus:border-[#b98d6d] focus:ring-4 focus:ring-[#b98d6d]/10',

  button:
    buttonStyles.primary,

  sectionGrid:
    'grid items-start gap-7 lg:grid-cols-[minmax(0,3fr)_minmax(240px,1fr)]',

  sectionColumn:
    'grid min-w-0 gap-3',

  tagsColumn:
    'grid min-w-0 gap-3',

  sectionTitle:
    'font-serif text-2xl font-semibold leading-tight text-[#2b211d]',

  empty:
    'rounded-lg border border-dashed border-[#d6c2b0] bg-white/80 p-5 text-sm font-medium leading-6 text-[#7a6d64]',

  cardGrid:
    'grid gap-3',

  sectionCard:
    'group grid min-w-0 grid-cols-[88px_minmax(0,1fr)] overflow-hidden rounded-lg border border-[#eadfd5] bg-[#fffdf9] transition hover:border-[#d6c2b0] hover:shadow-[0_10px_26px_rgba(94,72,54,0.08)] sm:grid-cols-[112px_minmax(0,1fr)]',

  cover:
    'aspect-square overflow-hidden bg-[#f1e7dc]',

  coverImage:
    'h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]',

  coverFallback:
    'grid h-full w-full place-items-center px-2 text-center text-[10px] font-bold uppercase text-[#a18875]',

  cardBody:
    'grid min-w-0 content-center gap-1.5 p-3 sm:p-4',

  cardTop:
    'flex min-w-0 items-start justify-between gap-3',

  cardTitle:
    'truncate text-lg font-semibold leading-tight text-[#2b211d]',

  muted:
    'line-clamp-2 text-sm font-medium leading-5 text-[#7a6d64]',

  stats:
    'flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#8a7b70]',

  badge:
    'shrink-0 rounded-full border border-[#eadfd5] bg-[#f6efe8] px-2 py-1 text-[10px] font-bold uppercase text-[#7a6d64]',

  tagsPanel:
    'h-fit rounded-lg border border-[#eadfd5] bg-[#fffdf9] p-4',

  tagList:
    'flex flex-wrap gap-2',

  tag:
    'rounded-full border border-[#e0d2c5] bg-white px-3 py-1.5 text-xs font-bold text-[#6f6258] transition hover:border-[#641f32] hover:text-[#641f32]',

  topicList:
    'grid gap-2',

  topicCard:
    'grid gap-1.5 rounded-lg border border-[#eadfd5] bg-[#fffdf9] px-4 py-3 transition hover:border-[#d6c2b0] hover:bg-white',

  topicMeta:
    'flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8a7b70]',
} as const;
