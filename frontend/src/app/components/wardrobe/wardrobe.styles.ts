import { buttonStyles } from '@/app/components/common/buttonStyles';

export const wardrobeStyles = {
  page:
    'mx-auto grid w-full max-w-[1136px] gap-7 px-0 py-2 sm:py-3',

  header:
    'grid gap-5 overflow-hidden rounded-[24px] border border-[#eadfd5] bg-[#fffdf9] p-4 shadow-[0_24px_70px_rgba(94,72,54,0.11)] sm:rounded-[34px] sm:p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-8',

  headerContent:
    'grid max-w-[760px] gap-3',

  title:
    'font-serif text-[34px] font-semibold leading-[1.04] tracking-[-0.045em] text-[#2b211d] sm:text-[42px] md:text-[54px]',

  subtitle:
    'text-[15px] font-medium leading-7 text-[#7f7167]',

  backLink:
    'inline-flex w-fit items-center text-sm font-bold text-[#8a7d74] transition hover:text-[#2b211d]',

  primaryLink:
    buttonStyles.primary,

  secondaryLink:
    buttonStyles.secondary,

  toolbar:
    'rounded-[28px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_18px_45px_rgba(86,62,43,0.08)]',

  toolbarForm:
    'grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto_auto]',

  input:
    'min-h-11 w-full rounded-[15px] border border-[#e0d2c5] bg-white px-4 py-2 text-[14px] font-medium text-[#241b19] shadow-[0_8px_22px_rgba(80,60,40,0.04)] outline-none transition placeholder:text-[#a89b91] focus:border-[#9b6847] focus:ring-4 focus:ring-[#9b6847]/10 disabled:cursor-not-allowed disabled:bg-[#f1ebe5]',

  select:
    'min-h-11 w-full rounded-[15px] border border-[#e0d2c5] bg-white px-4 py-2 text-[14px] font-medium text-[#241b19] shadow-[0_8px_22px_rgba(80,60,40,0.04)] outline-none transition focus:border-[#9b6847] focus:ring-4 focus:ring-[#9b6847]/10',

  toolbarButton:
    buttonStyles.primary,

  resetLink:
    buttonStyles.secondary,

  listShell:
    'grid gap-4 rounded-[30px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_22px_58px_rgba(94,72,54,0.10)]',

  empty:
    'rounded-[24px] border border-dashed border-[#d6c2b0] bg-white p-6 text-sm font-medium leading-6 text-[#7a6d64]',

  statusGroup:
    'overflow-hidden rounded-[24px] border border-[#eadfd5] bg-white shadow-[0_12px_30px_rgba(94,72,54,0.055)]',

  statusSummary:
    'flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 marker:hidden [&::-webkit-details-marker]:hidden',

  statusSummaryLeft:
    'flex min-w-0 items-center gap-3',

  statusIcon:
    'grid size-9 shrink-0 place-items-center rounded-full bg-[#f1e4db] text-sm font-black text-[#641f32]',

  statusTitle:
    'text-sm font-black uppercase tracking-[0.14em] text-[#2b211d]',

  statusCount:
    'rounded-full bg-[#f6efe8] px-2.5 py-1 text-xs font-black text-[#8a5b3b]',

  compactItems:
    'flex max-h-[310px] flex-wrap content-start gap-2 overflow-y-auto border-t border-[#eadfd5] bg-[#fffdf9] p-4 pr-2',

  itemChip:
    'group inline-flex max-w-full items-center gap-2 rounded-full border border-[#eadfd5] bg-white py-1.5 pl-2 pr-1 text-xs font-bold text-[#3c322d] shadow-[0_8px_18px_rgba(94,72,54,0.06)]',

  itemImage:
    'size-8 shrink-0 rounded-full border border-[#eadfd5] object-cover bg-[#f6efe8]',

  itemFallback:
    'grid size-8 shrink-0 place-items-center rounded-full border border-[#eadfd5] bg-[#f6efe8] text-[10px] font-black text-[#641f32]',

  itemTitle:
    'min-w-0 max-w-[260px] truncate',

  itemTitleLink:
    'min-w-0 max-w-[260px] truncate transition hover:text-[#641f32] hover:underline',

  itemBadge:
    'shrink-0 rounded-full bg-[#f1e4db] px-2 py-0.5 text-[11px] font-black text-[#8a5b3b]',

  itemFlag:
    'grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-black text-[#9b8d82] transition hover:bg-[#f6efe8] hover:text-[#641f32]',

  deleteWrap:
    'shrink-0',

  deleteIconButton:
    buttonStyles.iconDanger,

  deleteMessage:
    'text-xs font-medium text-red-600',

  pagination:
    'flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#eadfd5] bg-[#fffdf9] p-4 text-sm shadow-[0_12px_30px_rgba(94,72,54,0.055)]',

  paginationMeta:
    'font-medium text-[#7a6d64]',

  paginationActions:
    'flex gap-2',

  pageLink:
    buttonStyles.secondary,

  formShell:
    'grid gap-5 rounded-[30px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_22px_58px_rgba(94,72,54,0.10)]',

  formGrid:
    'grid gap-5',

  field:
    'grid gap-2',

  label:
    'text-sm font-bold text-[#3d312c]',

  textarea:
    'min-h-[126px] w-full resize-y rounded-[18px] border border-[#e0d2c5] bg-white px-4 py-3 text-[14px] font-medium leading-6 text-[#241b19] shadow-[0_8px_22px_rgba(80,60,40,0.04)] outline-none transition placeholder:text-[#a89b91] focus:border-[#9b6847] focus:ring-4 focus:ring-[#9b6847]/10',

  checkbox:
    'flex items-start gap-3 rounded-[18px] border border-[#eadfd5] bg-white px-4 py-3 text-sm font-medium text-[#6f6258] shadow-[0_10px_24px_rgba(94,72,54,0.04)]',

  checkboxTitle:
    'block font-bold text-[#2b211d]',

  checkboxText:
    'block leading-6 text-[#7a6d64]',

  messageSuccess:
    'rounded-[16px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700',

  messageError:
    'rounded-[16px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700',

  formActions:
    'flex flex-wrap gap-2',

  submitButton:
    buttonStyles.primary,

  picker:
    'grid gap-2',

  pickerSelected:
    'rounded-[18px] border border-[#eadfd5] bg-white px-4 py-3 text-sm font-medium text-[#2b211d] shadow-[0_10px_24px_rgba(94,72,54,0.04)]',

  pickerOptions:
    'grid max-h-72 gap-1 overflow-auto rounded-[18px] border border-[#eadfd5] bg-white p-2 shadow-inner',

  pickerOption:
    'rounded-[14px] px-3 py-2 text-left text-sm font-medium transition hover:bg-[#f6efe8]',

  pickerOptionActive:
    'bg-[#f1e4db] font-bold text-[#2b211d]',

  pickerOptionTitle:
    'block text-[#2b211d]',

  pickerOptionMeta:
    'block text-xs text-[#8a7d74]',

  errorText:
    'text-xs font-medium text-red-600',

  muted:
    'text-sm font-medium leading-6 text-[#7a6d64]',

    brandLanes:
    'grid max-h-[420px] gap-3 overflow-y-auto border-t border-[#eadfd5] bg-[#fffdf9] p-4 pr-2',

  brandLane:
    'grid gap-2 rounded-[18px] border border-[#eadfd5] bg-white p-3 shadow-[0_8px_18px_rgba(94,72,54,0.045)]',

  brandLaneHeader:
    'flex items-center justify-between gap-3',

  brandLaneTitle:
    'min-w-0 truncate text-xs font-black uppercase tracking-[0.14em] text-[#8a5b3b]',

  brandLaneCount:
    'shrink-0 rounded-full bg-[#f6efe8] px-2 py-0.5 text-[11px] font-black text-[#8a5b3b]',

  brandItems:
    'flex flex-wrap gap-2',
} as const;
