import { buttonStyles } from '@/app/components/common/buttonStyles';

export const publicPageStyles = {
  page:
    'min-h-screen overflow-x-hidden bg-[#fbf7f2] text-[#241b19]',

  container:
    'mx-auto grid w-full max-w-[1136px] gap-7 px-4 py-7 sm:px-8 sm:py-8',

  narrowContainer:
    'mx-auto grid w-full max-w-[760px] gap-6 px-4 py-7 sm:px-8 sm:py-8',

  header:
    'grid gap-4',

  headerRow:
    'flex flex-col gap-4 md:flex-row md:items-start md:justify-between',

  headerText:
    'grid max-w-[720px] gap-2',

  stack:
    'grid gap-3',

  title:
    'font-serif text-[34px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#2b211d] md:text-[44px]',

  sectionTitle:
    'font-serif text-[25px] font-semibold leading-tight tracking-[-0.04em] text-[#2b211d]',

  cardTitle:
    'font-serif text-[20px] font-semibold leading-tight tracking-[-0.035em] text-[#2b211d]',

  lead:
    'max-w-[680px] text-[15px] font-medium leading-7 text-[#7a6d64]',

  meta:
    'text-sm font-medium leading-6 text-[#7a6d64]',

  shell:
    'grid gap-6 rounded-[26px] border border-[#eadfd5] bg-[#fffdf9] p-6 shadow-[0_22px_60px_rgba(94,72,54,0.09)]',

  panel:
    'rounded-[24px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_16px_46px_rgba(94,72,54,0.08)]',

  empty:
    'rounded-[22px] border border-dashed border-[#d6c2b0] bg-white/80 p-5 text-sm font-medium leading-6 text-[#7a6d64]',

  grid:
    'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',

  fragranceGrid:
    'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',

  actionLink:
    buttonStyles.secondary,

  textLink:
    'text-sm font-bold text-[#9b6847] underline underline-offset-4 transition hover:text-[#641f32]',

  input:
    'min-h-11 w-full rounded-[14px] border border-[#e0d2c5] bg-white px-4 py-2 text-[14px] font-medium text-[#241b19] shadow-[0_8px_22px_rgba(80,60,40,0.04)] outline-none transition placeholder:text-[#a89b91] focus:border-[#b98d6d] focus:ring-4 focus:ring-[#b98d6d]/10',

  button:
    buttonStyles.primary,

  badge:
    'shrink-0 rounded-full border border-[#eadfd5] bg-[#f6efe8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7a6d64]',
} as const;
