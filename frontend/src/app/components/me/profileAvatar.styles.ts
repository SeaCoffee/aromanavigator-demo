import { buttonStyles } from '@/app/components/common/buttonStyles';

export const profileAvatarStyles = {
  shell:
    'grid gap-6 overflow-hidden rounded-[30px] border border-[#eadfd3] bg-[#fffdf9] p-5 shadow-[0_22px_58px_rgba(94,72,54,0.10)] md:grid-cols-[190px_minmax(0,1fr)] md:items-start md:p-6',

  previewColumn:
    'grid justify-items-center gap-3',

  previewFrame:
    'relative grid size-[170px] shrink-0 place-items-center overflow-hidden rounded-[34px] border border-[#eadfd3] bg-[#f6efe8] shadow-[0_18px_42px_rgba(94,72,54,0.13)] [&>img]:h-full [&>img]:w-full [&>img]:object-cover',

  preview:
    'h-full w-full rounded-[34px] object-cover',

  fallback:
    'grid h-full w-full place-items-center rounded-[34px] bg-[#8b2f45] text-5xl font-black text-[#fff8f1]',

  previewHint:
    'max-w-[170px] text-center text-xs font-medium leading-5 text-[#8a7668]',

  content:
    'grid min-w-0 gap-4',

  heading:
    'grid gap-2',

  kicker:
    'text-[11px] font-black uppercase tracking-[0.18em] text-[#9b6847]',

  title:
    'font-serif text-[30px] font-semibold leading-tight tracking-[-0.045em] text-[#2b211d]',

  text:
    'max-w-[620px] text-sm font-medium leading-6 text-[#7f7167]',

  form:
    'grid gap-4',

  hiddenInput:
    'sr-only',

  uploadRow:
    'grid gap-2 rounded-[20px] border border-[#eadfd3] bg-white p-3 shadow-[0_10px_24px_rgba(94,72,54,0.04)] sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center',

  fileButton:
    buttonStyles.filePicker,

  fileName:
    'min-w-0 truncate text-sm font-medium text-[#7a6d64]',

  actions:
    'flex flex-wrap gap-2',

  primaryButton:
    buttonStyles.primary,

  removeButton:
    buttonStyles.danger,

  error:
    'rounded-[16px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700',

  success:
    'rounded-[16px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700',
} as const;
