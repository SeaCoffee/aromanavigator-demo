import { buttonStyles } from '@/app/components/common/buttonStyles';

export const articleStyles = {
  page:
    'min-h-screen overflow-x-hidden bg-[#fbf7f2] text-[#241b19]',

  container:
    'mx-auto grid w-full max-w-[1136px] gap-7 px-4 py-7 sm:px-8 sm:py-8',

  detailContainer:
    'mx-auto grid w-full max-w-[820px] gap-6 px-4 py-7 sm:px-8 sm:py-8',

  header:
    'grid max-w-[720px] gap-2',

  title:
    'font-serif text-[36px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#2b211d] md:text-[48px]',

  lead:
    'max-w-[680px] text-[15px] font-medium leading-7 text-[#7a6d64]',

  backLink:
    'text-sm font-bold text-[#9b6847] underline underline-offset-4 transition hover:text-[#641f32]',

  article:
    'grid gap-5 rounded-[26px] border border-[#eadfd5] bg-[#fffdf9] p-6 shadow-[0_22px_60px_rgba(94,72,54,0.09)]',

  articleHeader:
    'grid gap-3',

  detailActions:
    'flex flex-wrap items-start justify-between gap-3',

  meta:
    'flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#8a7b70]',

  tagList:
    'flex flex-wrap gap-2',

  tag:
    'rounded-full border border-[#e0d2c5] bg-white px-3 py-1.5 text-xs font-bold text-[#6f6258]',

  content:
    'whitespace-pre-wrap text-sm font-medium leading-7 text-[#5f534c]',

  list:
    'grid gap-3',

  empty:
    'rounded-[22px] border border-dashed border-[#d6c2b0] bg-white/80 p-5 text-sm font-medium leading-6 text-[#7a6d64]',

  card:
    'grid gap-3 rounded-[24px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_16px_46px_rgba(94,72,54,0.08)]',

  cardTop:
    'grid gap-2',

  cardMeta:
    'flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#8a7b70]',

  status:
    'rounded-full border border-[#e0d2c5] bg-white px-3 py-1',

  cardLink:
    'font-serif text-[23px] font-semibold leading-tight tracking-[-0.04em] text-[#2b211d] transition hover:text-[#9b6847]',

  excerpt:
    'text-sm font-medium leading-6 text-[#6f6258]',

  actions:
    'flex flex-wrap gap-2 border-t border-[#eadfd5] pt-3',

  toolbar:
    'rounded-[24px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_16px_46px_rgba(94,72,54,0.08)]',

  toolbarForm:
    'grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto_auto]',

  input:
    'min-h-11 rounded-[14px] border border-[#e0d2c5] bg-white px-4 py-2 text-sm font-medium text-[#241b19] outline-none transition placeholder:text-[#a89b91] focus:border-[#b98d6d] focus:ring-4 focus:ring-[#b98d6d]/10',

  button:
    buttonStyles.primary,

  reset:
    buttonStyles.secondary,

  pagination:
    'flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#eadfd5] bg-[#fffdf9] p-4 text-sm shadow-[0_12px_34px_rgba(94,72,54,0.06)]',

  paginationText:
    'font-bold text-[#7a6d64]',

  paginationActions:
    'flex gap-2',

  paginationLink:
    buttonStyles.compactSecondary,
  coverFrame:
    'overflow-hidden rounded-[24px] border border-[#eadfd5] bg-[#f6efe8] shadow-[0_14px_34px_rgba(94,72,54,0.07)]',

  coverImage:
    'max-h-[520px] w-full object-cover',

  coverFallback:
    'grid min-h-[220px] place-items-center p-6 text-center text-sm font-medium text-[#8a7668]',

  cardMediaLink:
    'block overflow-hidden rounded-[20px] border border-[#eadfd5] bg-[#f6efe8] shadow-[0_10px_28px_rgba(94,72,54,0.06)]',

  cardMedia:
    'aspect-[16/9] w-full object-cover transition duration-300 hover:scale-[1.02]',

  cardMediaFallback:
    'grid aspect-[16/9] place-items-center p-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-[#9b897c]',

  } as const;
