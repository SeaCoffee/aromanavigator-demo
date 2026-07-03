export const paginationStyles = {
  root:
    'flex flex-wrap items-center justify-between gap-3 pt-4',

  text:
    'text-sm font-bold text-[#7a6d64]',

  actions:
    'flex gap-2',

  link:
    'rounded-[14px] border border-[#e0d2c5] bg-white px-4 py-2 text-sm font-bold text-[#3c322d] transition hover:border-[#9b6847] hover:text-[#9b6847]',

  disabled:
    'rounded-[14px] border border-[#eadfd5] bg-[#f7f0e9] px-4 py-2 text-sm font-bold text-[#b6a79a]',
} as const;
