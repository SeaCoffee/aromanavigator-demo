import { buttonStyles } from '@/app/components/common/buttonStyles';

export const meSecurityStyles = {
  page:
    'mx-auto grid w-full max-w-[920px] gap-6 px-6 py-8 sm:px-8',

  header:
    'grid gap-5 overflow-hidden rounded-[34px] border border-[#eadfd3] bg-[#fffdf9] p-6 shadow-[0_24px_70px_rgba(94,72,54,0.11)] md:p-8',

  headerKicker:
    'text-[11px] font-black uppercase tracking-[0.2em] text-[#9b6847]',

  title:
    'font-serif text-[42px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#2b211d] md:text-[54px]',

  subtitle:
    'max-w-[680px] text-[15px] font-medium leading-7 text-[#7f7167]',

  accountCard:
    'grid gap-5 rounded-[30px] border border-[#eadfd3] bg-[#fffdf9] p-5 shadow-[0_22px_58px_rgba(94,72,54,0.10)] md:p-6',

  cardHeader:
    'grid gap-2 border-b border-[#eadfd3] pb-5',

  cardTitle:
    'font-serif text-[30px] font-semibold leading-tight tracking-[-0.045em] text-[#2b211d]',

  cardLead:
    'text-sm font-medium leading-6 text-[#7f7167]',

  dataList:
    'grid gap-3',

  dataRow:
    'grid gap-1 rounded-[20px] border border-[#eadfd3] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(94,72,54,0.04)] sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center',

  dataLabel:
    'text-xs font-black uppercase tracking-[0.14em] text-[#8a7668]',

  dataValue:
    'min-w-0 break-words text-sm font-bold text-[#241b19]',

  statusGood:
    'inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700',

  statusWarn:
    'inline-flex w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700',

  formShell:
    'grid gap-5 rounded-[30px] border border-[#eadfd3] bg-[#fffdf9] p-5 shadow-[0_22px_58px_rgba(94,72,54,0.10)] md:p-6',

  formHeader:
    'grid gap-2 border-b border-[#eadfd3] pb-5',

  formTitle:
    'font-serif text-[30px] font-semibold leading-tight tracking-[-0.045em] text-[#2b211d]',

  formLead:
    'max-w-[680px] text-sm font-medium leading-6 text-[#7f7167]',

  formGrid:
    'grid gap-5',

  field:
    'grid content-start gap-2',

  label:
    'text-sm font-bold text-[#3d312c]',

  passwordWrap:
    'relative',

  input:
    'min-h-11 w-full rounded-[15px] border border-[#e0d2c5] bg-white px-4 py-2 pr-24 text-[14px] font-medium text-[#241b19] shadow-[0_8px_22px_rgba(80,60,40,0.04)] outline-none transition placeholder:text-[#a89b91] focus:border-[#9b6847] focus:ring-4 focus:ring-[#9b6847]/10 disabled:cursor-not-allowed disabled:bg-[#f1ebe5]',

  inputError:
    'border-red-300 focus:border-red-400 focus:ring-red-100',

  toggleButton:
    'absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-black text-[#8a7668] transition hover:bg-[#f6efe8] hover:text-[#2b211d]',

  error:
    'text-sm font-medium text-red-600',

  hint:
    'text-xs font-medium leading-5 text-[#8a7668]',

  formFooter:
    'grid gap-4 border-t border-[#eadfd3] pt-5',

  primaryButton:
    buttonStyles.primary,

  setupNotice:
    'rounded-[22px] border border-[#eadfd3] bg-white px-4 py-3 text-sm font-medium leading-7 text-[#6f6258] shadow-[0_10px_24px_rgba(94,72,54,0.04)]',
} as const;
