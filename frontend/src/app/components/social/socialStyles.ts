import { buttonStyles } from '@/app/components/common/buttonStyles';

export const socialStyles = {
  page:
    'mx-auto grid w-full max-w-[1136px] gap-7 px-4 py-7 text-[#241b19] sm:px-8 sm:py-8',

  header:
    'grid gap-2',

  backLink:
    'text-sm font-medium text-[#7a6d64] transition hover:text-[#7c2f42] hover:underline',

  title:
    'font-serif text-[40px] font-semibold leading-tight tracking-[-0.055em] text-[#2b211d]',

  subtitle:
    'max-w-2xl text-[15px] font-medium leading-7 text-[#7a6d64]',

  summaryCard:
    'rounded-[22px] border border-[#eadfd5] bg-[#fffdf9] p-4 text-sm font-medium text-[#7a6d64] shadow-[0_12px_32px_rgba(94,72,54,0.06)]',

  summaryStrong:
    'font-bold text-[#2b211d]',

  profileCard:
    'rounded-[22px] border border-[#eadfd5] bg-[#fffdf9] p-4 shadow-[0_12px_32px_rgba(94,72,54,0.06)]',

  profileTitle:
    'font-serif text-[24px] font-semibold leading-tight tracking-[-0.04em] text-[#2b211d]',

  profileStats:
    'mt-2 flex flex-wrap gap-3 text-sm font-medium text-[#7a6d64]',

  profileStatLink:
    'transition hover:text-[#7c2f42] hover:underline',

  sections:
    'grid gap-7',

  section:
    'grid gap-3',

  sectionHeader:
    'flex items-center justify-between gap-4 border-b border-[#eadfd5] pb-3',

  sectionTitle:
    'font-serif text-[26px] font-semibold leading-tight tracking-[-0.045em] text-[#2b211d]',

  sectionCount:
    'inline-flex min-w-9 items-center justify-center rounded-full border border-[#eadfd5] bg-[#fffdf9] px-3 py-1 text-xs font-semibold text-[#7a6d64] shadow-[0_10px_26px_rgba(94,72,54,0.08)]',

  list:
    'grid gap-3',

  emptyCard:
    'rounded-[24px] border border-dashed border-[#d9c7b8] bg-[#fffdf9] p-6 text-sm font-medium text-[#7a6d64]',

  card:
    'rounded-[20px] border border-[#eadfd5] bg-[#fffdf9] p-4 shadow-[0_12px_32px_rgba(94,72,54,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(94,72,54,0.12)]',

  cardInner:
    'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',

  cardMain:
    'min-w-0',

  cardTitle:
    'truncate font-serif text-[19px] font-semibold leading-tight tracking-[-0.035em] text-[#2b211d]',

  cardTitleLink:
    'block truncate font-serif text-[19px] font-semibold leading-tight tracking-[-0.035em] text-[#2b211d] transition hover:text-[#7c2f42]',

  meta:
    'mt-1 text-sm font-medium text-[#7a6d64]',

  mutedMeta:
    'mt-2 text-xs font-medium text-[#a09187]',

  actions:
    'flex shrink-0 flex-wrap items-center gap-2',

  openLink:
    buttonStyles.compactSecondary,

  buttonRoot:
    'grid gap-1',

  button:
    buttonStyles.secondary,

  compactButton:
    buttonStyles.compactSecondary,

  compactDangerButton:
    buttonStyles.compactDanger,

  unsubscribeIconButton:
    'grid size-10 place-items-center rounded-full border border-[#eadfd5] bg-[#fffdf9] text-[22px] leading-none text-[#9a8174] shadow-[0_8px_20px_rgba(94,72,54,0.08)] transition hover:border-[#d8b8ad] hover:bg-[#fff5f2] hover:text-[#8b2635] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b98d6d]/20 disabled:cursor-not-allowed disabled:opacity-60',

  buttonMessage:
    'text-xs font-medium text-[#7a6d64]',
} as const;
