import { buttonStyles } from '@/app/components/common/buttonStyles';

export const homePageStyles = {
  page:
    'min-h-screen overflow-x-hidden bg-[#fbf7f2] text-[#241b19]',

  container:
    'mx-auto grid w-full max-w-[1136px] gap-8 px-4 pb-12 pt-7 sm:px-8 sm:pb-14 sm:pt-8',

  hero:
    'grid gap-7 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end',

  heroText:
    'grid max-w-[760px] gap-4',

  eyebrow:
    'text-[11px] font-black uppercase tracking-[0.24em] text-[#9b6847]',

  title:
    'font-serif text-[38px] font-semibold leading-[1.04] tracking-[-0.045em] text-[#2b211d] sm:text-[42px] md:text-[64px]',

  lead:
    'max-w-[720px] text-[16px] font-medium leading-8 text-[#7f7167]',

  heroActions:
    'flex flex-wrap gap-3 pt-2',

  primaryLink:
    buttonStyles.primary,

  secondaryLink:
    buttonStyles.secondary,

  heroPanel:
    'grid gap-4 rounded-[26px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_22px_60px_rgba(94,72,54,0.09)]',

  panelTitle:
    'font-serif text-[25px] font-semibold tracking-[-0.04em] text-[#2b211d]',

  panelLead:
    'text-sm font-medium leading-6 text-[#7a6d64]',

  quickGrid:
    'grid gap-3',

  quickLink:
    'flex min-h-12 items-center justify-between gap-3 rounded-[16px] border border-[#eadfd5] bg-white px-4 text-sm font-bold text-[#3c322d] transition hover:border-[#9b6847] hover:text-[#9b6847]',

  section:
    'grid gap-5 rounded-[22px] border border-[#eadfd5] bg-[#fffdf9] p-4 shadow-[0_22px_60px_rgba(94,72,54,0.08)] sm:rounded-[26px] sm:p-6',

  sectionFlat:
    'grid gap-5',

  sectionHeader:
    'flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between',

  sectionTitle:
    'font-serif text-[30px] font-semibold leading-tight tracking-[-0.045em] text-[#2b211d]',

  sectionLead:
    'max-w-[640px] text-sm font-medium leading-6 text-[#7a6d64]',

  sectionLink:
    'text-sm font-bold text-[#9b6847] transition hover:text-[#641f32]',

  cardsGrid:
    'grid gap-4 md:grid-cols-2 lg:grid-cols-3',

  dictionaryGrid:
    'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',

  card:
    'grid min-h-[150px] content-between gap-5 rounded-[22px] border border-[#eadfd5] bg-white p-5 shadow-[0_14px_36px_rgba(94,72,54,0.06)] transition hover:-translate-y-0.5 hover:border-[#d6c2b0]',

  cardKicker:
    'text-[11px] font-black uppercase tracking-[0.18em] text-[#9b6847]',

  cardTitle:
    'font-serif text-[23px] font-semibold leading-tight tracking-[-0.04em] text-[#2b211d]',

  cardMeta:
    'text-sm font-medium leading-6 text-[#7a6d64]',

  chipList:
    'flex flex-wrap gap-2',

  chip:
    'rounded-full border border-[#e0d2c5] bg-white px-3 py-1.5 text-xs font-bold text-[#6f6258] shadow-sm transition hover:border-[#9b6847] hover:text-[#9b6847]',

  empty:
    'rounded-[22px] border border-dashed border-[#d6c2b0] bg-white p-5 text-sm text-[#7a6d64]',
} as const;
