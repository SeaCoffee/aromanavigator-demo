import { buttonStyles } from '@/app/components/common/buttonStyles';

export const authStyles = {
  page:
    'min-h-screen overflow-x-hidden bg-[#fbf7f2] text-[#241b19]',

  cardPage:
    'mx-auto grid min-h-[70vh] w-full max-w-[460px] content-center gap-6 px-4 py-8 sm:px-6 sm:py-10',

  header:
    'grid gap-2',

  title:
    'font-serif text-[34px] font-semibold leading-tight tracking-[-0.05em] text-[#2b211d]',

  description:
    'text-sm font-medium leading-6 text-[#7a6d64]',

  form:
    'grid gap-4 rounded-[24px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_18px_50px_rgba(94,72,54,0.08)]',

  field:
    'grid gap-2',

  label:
    'text-sm font-bold text-[#3d312c]',

  input:
    'min-h-11 w-full rounded-[14px] border border-[#e0d2c5] bg-white px-4 py-2 text-sm font-medium text-[#241b19] outline-none transition placeholder:text-[#a89b91] focus:border-[#b98d6d] focus:ring-4 focus:ring-[#b98d6d]/10',

  passwordWrap:
    'relative',

  passwordInput:
    'min-h-11 w-full rounded-[14px] border border-[#e0d2c5] bg-white px-4 py-2 pr-24 text-sm font-medium text-[#241b19] outline-none transition placeholder:text-[#a89b91] focus:border-[#b98d6d] focus:ring-4 focus:ring-[#b98d6d]/10',

  passwordToggle:
    'absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8a7b70] transition hover:text-[#9b6847]',

  error:
    'text-sm font-medium text-[#b42335]',

  submit:
    buttonStyles.primary,

  secondary:
    'grid min-h-11 place-items-center rounded-[16px] border border-[#e0d2c5] bg-white px-4 py-2 text-center text-sm font-bold text-[#3c322d] transition hover:bg-[#f6efe8]',

  divider:
    'flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#a18875]',

  dividerLine:
    'h-px flex-1 bg-[#eadfd5]',

  text:
    'text-sm font-medium leading-6 text-[#7a6d64]',

  link:
    'font-bold text-[#9b6847] underline underline-offset-4 transition hover:text-[#641f32]',

  messageSuccess:
    'rounded-[16px] border border-[#cfe8d8] bg-[#f0fbf4] px-4 py-3 text-sm font-medium text-[#187143]',

  messageError:
    'rounded-[16px] border border-[#f0c6cd] bg-[#fff3f5] px-4 py-3 text-sm font-medium text-[#b42335]',

  statusCard:
    'grid gap-4 rounded-[24px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_18px_50px_rgba(94,72,54,0.08)]',
} as const;
