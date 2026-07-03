export const adminMenuStyles = {
  desktop:
    'sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto border-r border-[#dfe4e7] pr-3 md:block',
  mobile:
    'group rounded-lg border border-[#dfe4e7] bg-white shadow-[0_8px_24px_rgba(34,48,58,0.06)] md:hidden',
  mobileSummary:
    'flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold text-[#182128] [&::-webkit-details-marker]:hidden',
  mobileSummaryIcon:
    'size-4 text-[#687983] transition group-open:rotate-180',
  mobileBody:
    'max-h-[70vh] overflow-y-auto border-t border-[#dfe4e7] px-2 py-3',
  header: 'mb-3 px-2',
  title: 'text-sm font-semibold text-[#182128] transition hover:text-[#356a70]',
  description: 'mt-0.5 text-xs text-[#687983]',
  nav: 'grid gap-3',
  group:
    'grid gap-0.5 border-t border-[#e8ecee] pt-3 first:border-t-0 first:pt-0',
  groupTitle:
    'mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7d8c94]',
  link:
    'flex min-h-9 items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition',
  linkIcon: 'size-4 shrink-0',
  linkActive: 'bg-[#20343b] !text-white [&_*]:!text-white',
  linkIdle: 'text-[#34434a] hover:bg-[#edf3f3] hover:text-[#356a70]',
  footer: 'mt-3 border-t border-[#e8ecee] pt-3',
  cabinetLink:
    'flex min-h-9 items-center gap-2.5 rounded-md px-2 py-1.5 text-xs font-medium text-[#687983] transition hover:bg-[#edf3f3] hover:text-[#182128]',
} as const;
