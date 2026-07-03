export const meMenuStyles = {
  desktop: 'sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto border-r border-[#eadfd3] pr-3 lg:block',
  mobile:
    'group rounded-lg border border-[#eadfd3] bg-[#fffdf9] shadow-[0_8px_24px_rgba(94,72,54,0.06)] lg:hidden',
  mobileSummary:
    'flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold text-[#241b19] [&::-webkit-details-marker]:hidden',
  mobileSummaryIcon:
    'size-4 text-[#8a7668] transition group-open:rotate-180',
  mobileBody: 'max-h-[70vh] overflow-y-auto border-t border-[#eadfd3] px-2 py-3',
  header: 'mb-3 px-2',
  title: 'text-sm font-semibold text-[#241b19]',
  description: 'mt-0.5 text-xs text-[#8a7668]',
  nav: 'grid gap-3',
  group: 'grid gap-0.5 border-t border-[#eee5dc] pt-3 first:border-t-0 first:pt-0',
  groupTitle:
    'mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b897c]',
  link:
    'flex min-h-9 items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition',
  linkIcon: 'size-4 shrink-0',
  linkActive:
    'bg-[#f5e8ec] font-semibold text-[#641f32] shadow-[inset_3px_0_0_#641f32]',
  linkIdle:
    'text-[#3c322d] hover:bg-[#f6efe8] hover:text-[#9b6847]',
  footer: 'mt-3 grid gap-1 border-t border-[#eee5dc] pt-3',
  logout:
    'w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-[#6f6259] transition hover:bg-[#f6efe8] hover:text-[#241b19] disabled:opacity-60',
  deleteLink:
    'rounded-md px-2 py-1.5 text-xs text-[#9b897c] transition hover:bg-red-50 hover:text-red-700',
} as const;
