import { buttonStyles } from '@/app/components/common/buttonStyles';

export const articleFormStyles = {
  form: 'grid gap-5',

  panel:
    'grid gap-5 rounded-[28px] border border-[#eadfd5] bg-[#fffdf9] p-5 shadow-[0_18px_50px_rgba(94,72,54,0.08)] sm:p-6',

  panelHeader: 'grid gap-1',

  panelTitle:
    'font-serif text-[26px] font-semibold leading-tight tracking-[-0.04em] text-[#2b211d]',

  panelText:
    'max-w-[680px] text-sm font-medium leading-6 text-[#7a6d64]',

  innerTitle:
    'text-sm font-black uppercase tracking-[0.08em] text-[#5b463b]',

  field: 'grid content-start gap-2',

  label: 'text-sm font-black text-[#2b211d]',

  input:
    'min-h-12 w-full rounded-[18px] border border-[#e0d2c5] bg-white px-4 py-2.5 text-sm font-medium text-[#241b19] outline-none transition placeholder:text-[#a89b91] focus:border-[#b98d6d] focus:ring-4 focus:ring-[#b98d6d]/10',

  fileInput: buttonStyles.fileInput,

  textarea:
    'min-h-[360px] w-full resize-y rounded-[20px] border border-[#e0d2c5] bg-white px-4 py-4 text-sm font-medium leading-7 text-[#241b19] outline-none transition placeholder:text-[#a89b91] focus:border-[#b98d6d] focus:ring-4 focus:ring-[#b98d6d]/10',

  tokenHint:
    'rounded-[16px] border border-[#eadfd5] bg-[#fbf7f2] px-3 py-2 text-xs font-medium leading-5 text-[#7a6d64]',

  code:
    'rounded-md border border-[#e0d2c5] bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#641f32]',

  hint: 'text-xs font-medium leading-5 text-[#7a6d64]',

  error: 'text-xs font-bold text-red-600',

  coverGrid:
    'grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-start',

  coverPreview:
    'overflow-hidden rounded-[22px] border border-[#eadfd5] bg-[#f6efe8] shadow-[0_10px_30px_rgba(94,72,54,0.06)]',

  coverImage: 'aspect-[4/3] w-full object-cover',

  coverFallback:
    'grid aspect-[4/3] place-items-center px-4 text-center text-xs font-bold uppercase tracking-[0.1em] text-[#9b897c]',

  coverTools: 'grid gap-3',

  innerPanel:
    'grid gap-4 rounded-[22px] border border-[#eadfd5] bg-[#fbf7f2] p-4',

  mediaGroup: 'grid gap-2',

  mediaGroupTitle:
    'text-xs font-black uppercase tracking-[0.1em] text-[#8a7668]',

  mediaList: 'grid gap-2',

  mediaItem:
    'grid min-w-0 gap-3 rounded-[18px] border border-[#eadfd5] bg-white p-3 shadow-[0_8px_22px_rgba(94,72,54,0.04)] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-center',

  mediaThumb: 'size-14 shrink-0 rounded-[14px] object-cover',

  mediaPlaceholder:
    'grid size-14 shrink-0 place-items-center rounded-[14px] border border-dashed border-[#d6c2b0] bg-[#f6efe8] text-[10px] font-black uppercase tracking-[0.1em] text-[#9b897c]',

  mediaName: 'min-w-0 truncate text-sm font-bold text-[#5f534c]',

  emptyMedia:
    'rounded-[16px] border border-dashed border-[#d6c2b0] bg-white/70 px-4 py-3 text-sm font-medium text-[#7a6d64]',

  smallButton: buttonStyles.compactSecondary,

  removeButton: buttonStyles.compactDanger,

  ghostButton: buttonStyles.secondary,

  previewPanel:
    'grid gap-4 rounded-[22px] border border-[#eadfd5] bg-white p-4 shadow-[0_8px_24px_rgba(94,72,54,0.04)]',

  previewContent:
    'grid gap-5 rounded-[18px] border border-[#eadfd5] bg-[#fffdf9] p-4 text-sm font-medium leading-7 text-[#5f534c]',

  previewTextBlock:
    'whitespace-pre-wrap break-words',

  previewFigure:
    'overflow-hidden rounded-[18px] border border-[#eadfd5] bg-[#f6efe8]',

  previewImage:
    'max-h-[520px] w-full object-contain',

  previewFallback:
    'grid min-h-40 place-items-center p-4 text-center text-sm font-medium text-[#8a7668]',

  twoColumns: 'grid items-start gap-4 md:grid-cols-2',

  actions:
    'flex flex-wrap items-center gap-3 rounded-[24px] border border-[#eadfd5] bg-[#fffdf9] p-4 shadow-[0_14px_40px_rgba(94,72,54,0.06)]',

  submit: buttonStyles.primary,

  link: buttonStyles.secondary,

  message:
    'rounded-[20px] border px-4 py-3 text-sm font-medium leading-6',

  success: 'border-green-200 bg-green-50 text-green-800',

  failure: 'border-red-200 bg-red-50 text-red-800',
} as const;
