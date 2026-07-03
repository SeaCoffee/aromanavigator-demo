export const siteHeaderStyles = {
  root:
    'sticky top-0 z-50 border-b border-[#eadfd3] bg-[#fbf7f1]/95 text-[#241b19] backdrop-blur',

  inner:
    'mx-auto flex h-16 w-full max-w-[1136px] items-center justify-between gap-2 px-4 sm:gap-6 sm:px-6',

  brand:
    'min-w-0 shrink font-serif text-[18px] font-semibold tracking-tight text-[#241b19] sm:shrink-0 sm:text-2xl',

  nav:
    'hidden min-w-0 items-center justify-center gap-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3c322d] xl:flex',

  mobileNav: 'relative xl:hidden',
  mobileNavSummary:
    'grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-[#eadfd3] bg-[#fffdf9] marker:hidden [&::-webkit-details-marker]:hidden',
  mobileNavPanel:
    'fixed inset-x-4 top-[4.5rem] z-50 grid w-auto gap-1 rounded-2xl border border-[#eadfd3] bg-[#fffdf9] p-2 text-sm font-semibold shadow-[0_18px_45px_rgba(62,43,31,0.18)]',
  mobileNavLink: 'rounded-xl px-3 py-2.5 transition hover:bg-[#f4ebe3]',

  navLink:
    'transition hover:text-[#9b6847]',

  actions:
    'flex shrink-0 items-center gap-1 sm:gap-3',

  mobileHiddenAction: 'hidden sm:grid',

  actionLink:
    'relative grid size-9 place-items-center rounded-lg border border-[#eadfd3] bg-[#fffdf9] text-[#241b19] shadow-[0_10px_26px_rgba(94,72,54,0.06)] transition hover:bg-[#f6efe8] hover:text-[#9b6847] sm:size-10 sm:rounded-[14px]',

  actionIcon:
    'size-5',

  notificationBadge:
    'absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[#dc2626] px-1.5 text-[11px] font-bold leading-5 text-white shadow-sm',

 strip:
  'border-t border-[#eadfd3] bg-[#cdb294] px-4 py-3 text-center text-[14px] font-semibold leading-5 text-white',

stripInner:
  'mx-auto w-full max-w-[1136px]',

} as const;
