import { buttonStyles } from '@/app/components/common/buttonStyles';

export const fragranceEncyclopediaStyles = {
  page:
    'min-h-screen overflow-x-hidden bg-[#fbf7f2] text-[#241b19]',

  container:
    'mx-auto grid w-full max-w-[1136px] gap-7 px-4 pb-10 sm:px-8 sm:pb-12',

  intro:
    'grid w-full gap-7 py-8 lg:grid-cols-[minmax(0,1fr)_338px] lg:items-end',

  header:
    'grid max-w-[720px] gap-3',

  title:
    'font-serif text-[40px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#2b211d] md:text-[54px]',

  lead:
    'max-w-[680px] text-[16px] font-medium leading-8 text-[#7f7167]',

  addRequestDetails:
    'group w-full overflow-hidden rounded-[24px] border border-[#eadfd5] bg-[#fffdf9] shadow-[0_18px_50px_rgba(94,72,54,0.10)]',

  addRequestSummary:
    'flex min-h-[70px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-[#2b211d] marker:hidden [&::-webkit-details-marker]:hidden',

  addRequestSummaryIcon:
    'grid size-12 shrink-0 place-items-center rounded-full bg-[#efe3d9] text-[#3c322d]',

  addRequestSummaryText:
    'min-w-0 flex-1 text-[14px] font-bold leading-5',

  addRequestSummaryChevron:
    'size-5 shrink-0 text-[#241b19] transition duration-200 group-open:rotate-90',

  addRequestBody:
    'border-t border-[#eadfd5] bg-white/70 p-5',

  catalogLayout:
    'grid w-full gap-5 pb-8 lg:grid-cols-[326px_minmax(0,1fr)] lg:items-start',

  sidebar:
    'min-w-0 lg:sticky lg:top-28',

  resultsPanel:
    'grid min-w-0 gap-5 overflow-hidden rounded-[26px] border border-[#eadfd5] bg-[#fffdf9] p-6 shadow-[0_22px_60px_rgba(94,72,54,0.09)]',

  resultsToolbar:
    'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',

  resultsTitle:
    'font-serif text-[30px] font-semibold leading-tight tracking-[-0.045em] text-[#2b211d]',

  resultsMeta:
    'text-sm font-medium leading-6 text-[#7a6d64]',

  empty:
    'rounded-[24px] border border-[#eadfd5] bg-white p-6 text-sm text-[#7a6d64] shadow-[0_14px_36px_rgba(94,72,54,0.06)]',

  grid:
    'grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-3',

  results:
    'min-h-[520px]',

  resultsHeader:
    'flex flex-wrap items-center justify-between gap-3 text-sm text-[#7a6d64]',

  emptyState:
    'grid min-h-[360px] place-items-center rounded-[26px] border border-dashed border-[#d6c2b0] bg-white p-6 text-center text-sm text-[#7a6d64]',

    topIcons:
  'absolute right-8 top-8 z-10 flex items-center gap-5 text-[#2c2520]',

topIcon:
  'size-[15px] stroke-[1.7]',

} as const;


export const fragranceFilterStyles = {
  shell:
    'grid min-w-0 gap-5 overflow-hidden rounded-[22px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_22px_58px_rgba(94,72,54,0.10)]',

  form:
    'grid gap-5 border-b border-[#eadfd5] pb-5 last:border-b-0 last:pb-0',

  formHeader:
    'grid gap-1.5',

  sectionTitle:
    'font-serif text-[21px] font-semibold tracking-[-0.04em] text-[#2b211d]',

  sectionLead:
    'text-sm font-medium leading-6 text-[#7a6d64]',

  searchGrid:
    'grid gap-5',

  field:
    'grid content-start gap-2',

  label:
    'text-sm font-bold text-[#3d312c]',

  input:
    'min-h-11 w-full rounded-[14px] border border-[#e0d2c5] bg-white px-4 py-2 text-[14px] font-medium text-[#241b19] shadow-[0_8px_22px_rgba(80,60,40,0.04)] outline-none transition placeholder:text-[#a89b91] focus:border-[#b98d6d] focus:ring-4 focus:ring-[#b98d6d]/10 disabled:cursor-not-allowed disabled:bg-[#f1ebe5]',

  builder:
    'grid gap-5',

  builderHeader:
    'grid gap-1.5',

  builderTitle:
    'font-serif text-[21px] font-semibold tracking-[-0.04em] text-[#2b211d]',

  builderLead:
    'text-sm font-medium leading-6 text-[#7a6d64]',

  builderGrid:
    'grid gap-5',

  actions:
    'grid grid-cols-2 gap-3',

  submit:
    buttonStyles.primary,

  reset:
    buttonStyles.secondary,

  resetStrong:
    'text-sm font-bold text-[#9b6847] transition hover:text-[#641f32]',

  filterFooter:
    'grid gap-4',

  sortBar:
    'grid gap-2 border-b border-[#eadfd5] pb-5',

  sortField:
    'grid gap-2',

  sortLabel:
    'text-sm font-bold text-[#3d312c]',

  remoteSelect:
    'grid content-start gap-2',

  remoteSelectTop:
    'flex min-h-6 flex-wrap items-center justify-between gap-2',

  remoteSelectTitle:
    'text-sm font-bold text-[#3d312c]',

  applied:
    'grid gap-3 border-b border-[#eadfd5] pb-5',

  appliedTop:
    'flex items-center justify-between gap-3',

  appliedTitle:
    'text-[15px] font-bold text-[#211b18]',

  chips:
    'flex flex-wrap gap-2',

  chip:
    'rounded-full border border-[#e0d2c5] bg-white px-3 py-1.5 text-xs font-bold text-[#6f6258] shadow-sm transition hover:border-[#9b6847] hover:text-[#9b6847]',

  optionList:
    'grid max-h-64 gap-1 overflow-y-auto rounded-[18px] border border-[#eadfd5] bg-white p-2 shadow-inner',

  optionButton:
    'flex w-full items-center justify-between gap-2 rounded-[12px] px-3 py-2 text-left text-sm font-medium text-[#3c322d] transition hover:bg-[#f6efe8]',

  optionButtonActive:
    'flex w-full items-center justify-between gap-2 rounded-[12px] bg-[#ead7c5] px-3 py-2 text-left text-sm font-bold text-[#9b6847] shadow-sm transition',

  optionEmpty:
    'rounded-[12px] bg-white px-3 py-3 text-sm font-medium text-[#7a6d64]',
} as const;



export const fragranceCardStyles = {
  root:
    'group relative overflow-visible rounded-[26px] border border-[#e6d8cb] bg-[#fffdf9] p-[10px] shadow-[0_22px_60px_rgba(94,72,54,0.11)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(94,72,54,0.15)]',

  top:
    'flex min-h-[54px] items-center gap-3 px-3 pb-3 pt-1',

  logo:
    'flex size-9 shrink-0 items-center justify-center rounded-full bg-[#8b2f45] text-[11px] font-black text-[#fff8f1] shadow-[0_10px_24px_rgba(83,27,43,0.24)]',

  account: 'grid min-w-0 gap-0.5',

  accountName:
    'line-clamp-1 text-[12px] font-black uppercase tracking-[0.13em] text-[#211b18]',

  accountMeta:
    'line-clamp-1 text-[11px] font-medium text-[#7a6d64]',

  media:
    'relative block aspect-[4/5] overflow-hidden rounded-[20px] bg-gradient-to-br from-[#203526] via-[#6b2f3d] to-[#201412]',

  image:
    'h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]',

  imageOverlay:
    'absolute inset-0 bg-gradient-to-t from-black/54 via-black/10 to-black/8',

  imagePlaceholder:
    'grid h-full w-full place-items-center bg-gradient-to-br from-[#203526] via-[#6b2f3d] to-[#201412] px-7 text-center text-[28px] font-black leading-[0.95] tracking-[-0.055em] text-[#fff8f1]',

  content:
    'absolute inset-0 z-10 flex flex-col justify-between px-4 py-5',

  contentTop: 'max-w-[94%] overflow-visible',

  contentBottom: 'max-w-[94%] overflow-visible pb-1',

  brand:
    'line-clamp-3 break-words font-serif text-[27px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#fff8f1] drop-shadow-[0_3px_10px_rgba(0,0,0,0.30)]',

  year:
    'mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#ead5c3] drop-shadow-[0_2px_8px_rgba(0,0,0,0.28)]',

  name:
    'line-clamp-2 break-words font-serif text-[26px] font-semibold leading-[0.96] tracking-[-0.055em] text-[#fff8f1] drop-shadow-[0_3px_10px_rgba(0,0,0,0.30)]',

  notes:
    'mt-3 text-[9px] font-black uppercase leading-none tracking-[0.18em] text-[#ead5c3] drop-shadow-[0_2px_8px_rgba(0,0,0,0.28)]',

  footer:
    'flex min-h-[36px] items-center justify-between px-4 pb-1 pt-3 text-[#6f6258]',

  footerIcons: 'flex items-center gap-4',

  counterItem:
    'inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6f6258]',

  icon:
    'size-[17px] stroke-[1.9] text-[#6f6258] transition group-hover:text-[#3c322d]',

  likeButton:
    'min-h-0 px-0 py-0 text-[#6f6258]',
} as const;


export const fragrancePaginationStyles = {
  shell:
    'mt-1 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center',

  nav:
    'flex items-center justify-center gap-1.5 md:col-start-2',

  pageLink:
    'grid size-9 place-items-center rounded-[12px] border border-transparent text-sm font-semibold text-[#6f6258] transition hover:border-[#eadfd5] hover:bg-white hover:text-[#2b211d]',

  pageLinkActive:
    'grid size-9 place-items-center rounded-[12px] bg-[#f1e4db] text-sm font-bold text-[#2b211d] shadow-[0_8px_18px_rgba(94,72,54,0.10)]',

  pageArrow:
    'grid size-9 place-items-center rounded-[12px] border border-[#eadfd5] bg-white text-[#2b211d] shadow-[0_10px_24px_rgba(94,72,54,0.06)] transition hover:bg-[#f7efe8]',

  pageArrowDisabled:
    'grid size-9 place-items-center rounded-[12px] border border-[#eadfd5] bg-white/60 text-[#b6aaa1]',

  ellipsis:
    'grid size-9 place-items-center text-sm font-bold text-[#8b7d73]',

  sizeWrap:
    'flex items-center justify-center gap-3 text-sm font-medium text-[#6f6258] md:justify-end',

  sizeMenu:
    'relative',

  sizeSummary:
    'flex min-h-9 min-w-[76px] cursor-pointer list-none items-center justify-between gap-3 rounded-[12px] border border-[#eadfd5] bg-white px-3 text-sm font-semibold text-[#3c322d] shadow-[0_10px_24px_rgba(94,72,54,0.06)] marker:hidden [&::-webkit-details-marker]:hidden',

  sizeDropdown:
    'absolute bottom-full right-0 z-20 mb-2 grid min-w-[76px] overflow-hidden rounded-[14px] border border-[#eadfd5] bg-white p-1 shadow-[0_18px_42px_rgba(94,72,54,0.16)]',

  sizeOption:
    'rounded-[10px] px-3 py-2 text-sm font-semibold text-[#6f6258] transition hover:bg-[#f6efe8] hover:text-[#2b211d]',

  sizeOptionActive:
    'rounded-[10px] bg-[#f1e4db] px-3 py-2 text-sm font-bold text-[#2b211d]',
} as const;

export const fragranceDetailStyles = {
  page: 'mx-auto grid w-full max-w-6xl min-w-0 gap-7 overflow-x-hidden px-4 py-8',
  hero: 'grid min-w-0 gap-6 rounded-[32px] border border-[#e3d4c6] bg-[#fffdf9] p-4 shadow-[0_24px_60px_rgba(86,62,43,0.09)] md:grid-cols-[300px_minmax(0,1fr)] md:p-6',
  media:
    'aspect-[4/5] overflow-hidden rounded-[28px] border border-[#e3d4c6] bg-[#fffaf5] shadow-[0_18px_45px_rgba(86,62,43,0.08)]',
  image: 'h-full w-full object-cover',
  imagePlaceholder: 'grid h-full place-items-center text-sm text-[#8a7d74]',
  content: 'grid min-w-0 content-start gap-5',
  header: 'grid gap-2',
  brand: 'text-sm font-bold uppercase tracking-[0.16em] text-[#8a7d74]',
  title: 'break-words font-serif text-4xl font-semibold tracking-[-0.045em] text-[#211b18] md:text-5xl',
  meta: 'flex flex-wrap gap-2 text-sm text-[#6f6258]',
  section: 'grid min-w-0 gap-3 rounded-[20px] border border-[#eadfd5] bg-white p-4',
  sectionTitle: 'text-lg font-bold text-[#211b18]',
  chips: 'flex flex-wrap gap-2',
  chip: 'rounded-full bg-[#fffaf5] px-3 py-1 text-sm font-medium text-[#3c322d]',
  muted: 'text-sm text-[#7a6d64]',
  anchorNav: 'sticky top-20 z-20 flex max-w-full gap-2 overflow-x-auto rounded-[20px] border border-[#eadfd5] bg-[#fffdf9]/95 p-2 shadow-[0_12px_30px_rgba(86,62,43,0.08)] backdrop-blur',
  anchorLink: 'whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold text-[#6f4a38] transition hover:bg-[#f1e4db]',
  notesSection: 'grid min-w-0 scroll-mt-28 gap-4',
  notesTitle: 'text-2xl font-bold tracking-[-0.03em] text-[#211b18]',
  notesGrid: 'grid items-stretch gap-4 md:grid-cols-3',
  notesCard:
    'h-full min-w-0 overflow-hidden rounded-[24px] border border-[#e3d4c6] bg-[#fffaf5] p-4 shadow-[0_14px_35px_rgba(86,62,43,0.06)]',
  notesCardTitle: 'mb-3 text-sm font-bold text-[#3d312c]',
  commentsSection:
    'grid gap-5 rounded-[28px] border border-[#e3d4c6] bg-[#fffaf5] p-5 shadow-[0_18px_45px_rgba(86,62,43,0.08)]',
  commentsHeader: 'grid gap-1',
  commentsTitle:
    'text-2xl font-bold tracking-[-0.03em] text-[#211b18]',
  commentsLead: 'text-sm leading-6 text-[#6f6258]',
  commentsForm: 'grid gap-3',
  commentsTextarea:
    'min-h-28 w-full resize-y rounded-[20px] border border-[#e0d2c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9b6847] focus:ring-4 focus:ring-[#9b6847]/10 disabled:cursor-not-allowed disabled:bg-[#f1ebe5]',
  commentsFormFooter: 'flex flex-wrap items-center justify-between gap-3',
  commentsSubmit:
    buttonStyles.primary,
  commentsMessage: 'text-sm text-[#6f6258]',
  commentsError: 'text-sm text-red-600',
  commentsTree: 'grid gap-4',
  commentsEmpty:
    'rounded-[24px] border border-dashed border-[#d6c2b0] bg-white p-4 text-sm text-[#7a6d64]',
  commentCard:
    'grid gap-2 rounded-[24px] border border-[#eadfd5] bg-white p-4',
  commentMeta: 'flex flex-wrap items-center gap-2 text-xs text-[#7a6d64]',
  commentAuthor: 'font-bold text-[#211b18]',
  commentBody: 'whitespace-pre-wrap text-sm leading-6 text-[#3c322d]',
  commentDeleted: 'text-sm italic text-[#7a6d64]',
  commentReplies: 'ml-4 grid gap-3 border-l border-[#eadfd5] pl-4',
  communityDetails: 'group min-w-0 scroll-mt-28 overflow-hidden rounded-[28px] border border-[#e3d4c6] bg-[#fffaf5] shadow-[0_18px_45px_rgba(86,62,43,0.08)]',
  communitySummary: 'flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:hidden [&::-webkit-details-marker]:hidden',
  communityBody: 'min-w-0 border-t border-[#eadfd5] p-5',
} as const;
