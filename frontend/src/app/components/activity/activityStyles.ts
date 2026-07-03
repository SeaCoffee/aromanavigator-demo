export const activityStyles = {
  page:
    'mx-auto grid max-w-5xl gap-6 px-4 py-6 text-[#241b19]',

  header: 'grid gap-1',
  title:
    'font-serif text-3xl font-semibold tracking-[-0.03em] text-[#241b19]',
  subtitle: 'text-sm leading-6 text-[#7a6b61]',

  list: 'grid gap-3',
  emptyCard:
    'rounded-[24px] border border-[#eadfd3] bg-[#fffdf9] p-4 text-sm text-[#7a6b61] shadow-[0_14px_34px_rgba(94,72,54,0.06)]',

  card:
    'grid gap-3 rounded-[24px] border border-[#eadfd3] bg-[#fffdf9] p-4 shadow-[0_14px_34px_rgba(94,72,54,0.06)]',
  cardTop: 'flex flex-wrap items-start justify-between gap-3',

  actor: 'font-semibold text-[#241b19]',
  inlineLink:
    'font-semibold text-[#241b19] underline-offset-4 transition hover:text-[#9b6847] hover:underline',

  meta: 'mt-1 text-xs text-[#8b7b70]',
  text: 'text-sm font-medium leading-6 text-[#241b19]',

  target: 'rounded-xl bg-[#fbf7f1] px-3 py-2 text-xs text-[#7a6b61]',
  payload:
    'rounded-[18px] border border-[#eadfd3] bg-[#fbf7f1] px-3 py-2 text-sm leading-6 text-[#6f5f55]',
} as const;
