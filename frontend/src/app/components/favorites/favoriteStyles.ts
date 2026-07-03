import { buttonStyles } from '@/app/components/common/buttonStyles';

export const favoriteStyles = {
  page:
    'mx-auto grid w-full max-w-[1136px] gap-7 px-6 py-8 text-[#241b19]',

  header:
    'grid gap-2',

  title:
    'font-serif text-[40px] font-semibold leading-tight tracking-[-0.055em] text-[#2b211d]',

  subtitle:
    'max-w-2xl text-[15px] font-medium leading-7 text-[#7a6d64]',

  sections:
    'grid gap-8',

  section:
    'grid gap-4',

  sectionHeader:
    'flex items-center justify-between gap-4 border-b border-[#eadfd5] pb-3',

  sectionTitle:
    'font-serif text-[26px] font-semibold leading-tight tracking-[-0.045em] text-[#2b211d]',

  sectionCount:
    'inline-flex min-w-9 items-center justify-center rounded-full border border-[#eadfd5] bg-[#fffdf9] px-3 py-1 text-xs font-semibold text-[#7a6d64] shadow-[0_10px_26px_rgba(94,72,54,0.08)]',

  grid:
    'grid gap-3 md:grid-cols-2 xl:grid-cols-3',

  emptyCard:
    'rounded-[26px] border border-[#eadfd5] bg-[#fffdf9] p-6 text-sm font-medium leading-6 text-[#7a6d64] shadow-[0_18px_50px_rgba(94,72,54,0.08)]',

  card:
  'relative grid grid-cols-[86px_minmax(0,1fr)] overflow-hidden rounded-[20px] border border-[#eadfd5] bg-[#fffdf9] shadow-[0_12px_32px_rgba(94,72,54,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(94,72,54,0.12)]',
  cardUnavailable:
    'opacity-70',

  imageWrap:
  'h-full min-h-[112px] overflow-hidden bg-[#f6efe8]',

  imageLink:
    'block h-full w-full',

  image:
    'h-full w-full object-cover transition duration-500 hover:scale-[1.04]',

  imagePlaceholder:
    'flex h-full min-h-[112px] w-full items-center justify-center bg-[#f6efe8] text-2xl font-semibold text-[#b8a79a]',

  body:
  'grid min-w-0 content-between gap-3 p-4 pr-11',


  textBlock:
    'grid min-w-0 gap-1',

  cardTitle:
    'truncate font-serif text-[18px] font-semibold leading-tight tracking-[-0.035em] text-[#2b211d]',

  cardTitleLink:
    'truncate font-serif text-[18px] font-semibold leading-tight tracking-[-0.035em] text-[#2b211d] transition hover:text-[#7c2f42]',

  meta:
    'truncate text-xs font-medium leading-5 text-[#7a6d64]',

  cardActions:
    'flex flex-wrap items-center gap-2',

  removeButton:
  'absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-full border border-[#eadfd5] bg-[#fffdf9]/95 text-[20px] leading-none text-[#9a8174] shadow-[0_8px_20px_rgba(94,72,54,0.10)] transition hover:border-[#d8b8ad] hover:bg-[#fff5f2] hover:text-[#8b2635] disabled:pointer-events-none',

 openLink:
  'inline-flex min-h-9 items-center justify-center rounded-full border border-[#eadfd5] bg-[#fdf8f2] px-4 text-xs font-semibold text-[#5f5249] transition hover:border-[#d9c7b8] hover:bg-[#f8efe7]',

  button:
    buttonStyles.secondary,

  dangerButton:
    'inline-flex min-h-9 items-center justify-center rounded-full border border-[#f4b6b6] bg-[#fffafa] px-4 text-xs font-semibold text-[#d00000] transition hover:border-[#ef8f8f] hover:bg-[#fff1f1] disabled:pointer-events-none',

  favoriteButtonOn:
    buttonStyles.selected,

  favoriteButtonOff:
    buttonStyles.secondary,

  favoriteIconButtonOn:
    buttonStyles.iconSelected,

  favoriteIconButtonOff:
    buttonStyles.icon,

  favoriteIcon:
    'size-[18px] stroke-[1.9]',

  error:
    'text-xs font-medium leading-5 text-[#b42318]',

  inlineRoot:
    'inline-grid gap-1',

  disabled:
    'cursor-not-allowed opacity-60',
} as const;
