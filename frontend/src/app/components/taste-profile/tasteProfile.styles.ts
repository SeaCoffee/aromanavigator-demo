import { buttonStyles } from '@/app/components/common/buttonStyles';

export const tasteProfileStyles = {
  page:
    'mx-auto grid w-full max-w-[1136px] gap-7 px-6 py-8 sm:px-8',

  header:
    'grid gap-5 overflow-hidden rounded-[34px] border border-[#eadfd5] bg-[#fffdf9] p-6 shadow-[0_24px_70px_rgba(94,72,54,0.11)] md:p-8',

  title:
    'font-serif text-[42px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#2b211d] md:text-[54px]',

  subtitle:
    'max-w-[780px] text-[15px] font-medium leading-7 text-[#7f7167]',

  tabs:
    'flex flex-wrap gap-2',

  tabLink:
    buttonStyles.secondary,

  grid:
    'grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start',

  panel:
    'grid min-w-0 content-start gap-5 rounded-[30px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_22px_58px_rgba(94,72,54,0.10)]',

  panelHeader:
    'grid gap-2',

  panelTitle:
    'font-serif text-[28px] font-semibold leading-tight tracking-[-0.045em] text-[#2b211d]',

  groupTitle:
    'text-sm font-black uppercase tracking-[0.16em] text-[#9b6847]',

  muted:
    'text-sm font-medium leading-6 text-[#7a6d64]',

  smallMuted:
    'text-xs font-medium leading-5 text-[#8a7d74]',

    preferenceLanes:
    'grid gap-3 border-t border-[#eadfd5] bg-[#fffdf9] p-4',

  preferenceLane:
    'grid gap-2 rounded-[18px] border border-[#eadfd5] bg-white p-3 shadow-[0_8px_18px_rgba(94,72,54,0.045)]',

  preferenceLaneHeader:
    'flex items-center justify-between gap-3',

  preferenceLaneTitle:
    'text-xs font-black uppercase tracking-[0.14em] text-[#8a5b3b]',

  preferenceLaneCount:
    'rounded-full bg-[#f6efe8] px-2 py-0.5 text-[11px] font-black text-[#8a5b3b]',

  compactItems:
    'flex flex-wrap gap-2',

  compactItemsDense:
    'flex max-h-[280px] flex-wrap content-start gap-1.5 overflow-y-auto pr-1',

  preferenceChip:
    'group inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#eadfd5] bg-[#fffdf9] py-1 pl-1.5 pr-1 text-xs font-bold text-[#3c322d] shadow-[0_6px_14px_rgba(94,72,54,0.05)]',

  preferenceChipDense:
    'py-0.5 pl-1 pr-0.5 text-[11px]',

  preferenceChipIcon:
    'grid size-7 shrink-0 place-items-center rounded-full bg-[#f1e4db] text-[11px] font-black text-[#641f32]',

  preferenceChipIconDense:
    'size-6 text-[10px]',

  preferenceChipText:
    'min-w-0 max-w-[180px] truncate',

  preferenceChipTextDense:
    'max-w-[260px]',

  preferenceChipMeta:
    'shrink-0 rounded-full bg-[#f1e4db] px-2 py-0.5 text-[11px] font-black text-[#8a5b3b]',

  preferenceChipNote:
    'grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-black text-[#9b8d82] transition hover:bg-[#f6efe8] hover:text-[#641f32]',

  chipRemoveForm:
    'shrink-0',

  chipRemoveButton:
    buttonStyles.iconDanger,

  form:
    'grid gap-4',

  inlineForm:
    'grid gap-3 border-t border-[#eadfd5] px-4 pb-4 pt-3',

  label:
    'grid gap-2 text-sm font-bold text-[#3d312c]',

  input:
    'min-h-11 w-full rounded-[15px] border border-[#e0d2c5] bg-white px-4 py-2 text-[14px] font-medium text-[#241b19] shadow-[0_8px_22px_rgba(80,60,40,0.04)] outline-none transition placeholder:text-[#a89b91] focus:border-[#9b6847] focus:ring-4 focus:ring-[#9b6847]/10 disabled:cursor-not-allowed disabled:bg-[#f1ebe5]',

  textarea:
    'min-h-[126px] w-full resize-y rounded-[18px] border border-[#e0d2c5] bg-white px-4 py-3 text-[14px] font-medium leading-6 text-[#241b19] shadow-[0_8px_22px_rgba(80,60,40,0.04)] outline-none transition placeholder:text-[#a89b91] focus:border-[#9b6847] focus:ring-4 focus:ring-[#9b6847]/10 disabled:cursor-not-allowed disabled:bg-[#f1ebe5]',

  select:
    'min-h-11 w-full rounded-[15px] border border-[#e0d2c5] bg-white px-4 py-2 text-[14px] font-medium text-[#241b19] shadow-[0_8px_22px_rgba(80,60,40,0.04)] outline-none transition focus:border-[#9b6847] focus:ring-4 focus:ring-[#9b6847]/10 disabled:cursor-not-allowed disabled:bg-[#f1ebe5]',

  checkbox:
    'flex items-center gap-3 rounded-[18px] border border-[#eadfd5] bg-white px-4 py-3 text-sm font-bold text-[#3d312c] shadow-[0_10px_24px_rgba(94,72,54,0.04)]',

  primaryButton:
    buttonStyles.primary,

  secondaryButton:
    buttonStyles.secondary,

  sections:
    'grid gap-5',

  preferenceGroup:
    'grid gap-3',

  cards:
    'grid gap-3 md:grid-cols-2',

  card:
    'grid gap-2 rounded-[20px] border border-[#eadfd5] bg-white p-4 shadow-[0_12px_30px_rgba(94,72,54,0.06)]',

  success:
    'rounded-[16px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700',

  error:
    'rounded-[16px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700',

  wardrobePreview:
    'grid gap-3',

  summaryAbout:
    'rounded-[22px] border border-[#eadfd5] bg-white px-4 py-3 text-sm font-medium leading-7 text-[#6f6258] shadow-[0_10px_24px_rgba(94,72,54,0.04)]',

  empty:
    'rounded-[22px] border border-dashed border-[#d6c2b0] bg-white p-5 text-sm font-medium leading-6 text-[#7a6d64]',

  detailsGroup:
    'overflow-hidden rounded-[22px] border border-[#eadfd5] bg-white shadow-[0_12px_30px_rgba(94,72,54,0.055)]',

  detailsSummary:
    'flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 marker:hidden [&::-webkit-details-marker]:hidden',

  detailsSummaryLeft:
    'flex min-w-0 items-center gap-3',

  detailsIcon:
    'grid size-9 shrink-0 place-items-center rounded-full bg-[#f1e4db] text-sm font-black text-[#641f32]',

  detailsTitle:
    'text-sm font-black uppercase tracking-[0.14em] text-[#2b211d]',

  detailsCount:
    'rounded-full bg-[#f6efe8] px-2.5 py-1 text-xs font-black text-[#8a5b3b]',


  addGrid:
    'grid gap-3',

  addDetails:
    'overflow-hidden rounded-[20px] border border-[#eadfd5] bg-white shadow-[0_12px_30px_rgba(94,72,54,0.055)]',

  addSummary:
    'flex min-h-13 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-black text-[#2b211d] marker:hidden [&::-webkit-details-marker]:hidden',

  addSummaryMeta:
    'rounded-full bg-[#f6efe8] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#9b6847]',

  editorShell:
    'grid gap-5 rounded-[30px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_22px_58px_rgba(94,72,54,0.10)]',

  editorBlock:
    'grid gap-4 rounded-[24px] border border-[#eadfd5] bg-white p-4 shadow-[0_12px_30px_rgba(94,72,54,0.05)]',


} as const;
