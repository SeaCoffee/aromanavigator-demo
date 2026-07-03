import { buttonStyles } from '@/app/components/common/buttonStyles';

const topicActionBase =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] px-4 py-2 font-sans text-sm font-bold leading-none transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b98d6d]/20 disabled:cursor-not-allowed disabled:opacity-60';

const topicActionNeutral =
  'border border-[#e0d2c5] bg-white text-[#3c322d] shadow-[0_10px_24px_rgba(94,72,54,0.05)] hover:border-[#b98d6d] hover:bg-[#f6efe8] hover:text-[#7a4f35]';

const topicActionSelected =
  'border border-[#641f32] bg-[#641f32] text-[#fff8f1] shadow-[0_14px_30px_rgba(100,31,50,0.18)] hover:bg-[#7a2940]';

const topicActionDanger =
  'border border-red-200 bg-white text-red-700 shadow-[0_10px_24px_rgba(127,29,29,0.04)] hover:border-red-300 hover:bg-red-50';

export const forumCommentStyles = {
  form: 'grid gap-2 rounded-2xl border border-gray-200 bg-white p-3',
  formCompact: 'grid gap-2 rounded-2xl border border-gray-200 p-3',

  loginPrompt:
    'flex flex-col gap-3 rounded-2xl border border-[#eadfd5] bg-[#fffdf9] p-4 sm:flex-row sm:items-center sm:justify-between',
  loginText:
    'text-sm font-medium leading-6 text-[#7a6d64]',
  loginButton:
    buttonStyles.compactPrimary,

  textarea:
    'resize-y rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400',
  textareaDefault: 'min-h-28',
  textareaCompact: 'min-h-20',
  photoField: 'grid gap-2 text-xs font-medium text-gray-600',
  fileInput: buttonStyles.fileInput,
  metaRow: 'flex items-center justify-between gap-2',
  counter: 'text-xs text-gray-500',
  submitButton: buttonStyles.primary,
  error: 'text-sm text-red-600',
  success: 'text-sm text-green-700',

  tree: 'grid gap-3',
  empty: 'rounded-2xl border border-gray-200 p-4 text-sm text-gray-500',
  node: 'grid gap-2',
  card: 'rounded-2xl border border-gray-200 bg-white p-3',
  deletedCard: 'rounded-2xl border border-gray-200 bg-gray-50 p-3',
  avatar: 'h-8 w-8 shrink-0 rounded-full object-cover',
  avatarFallback: 'h-8 w-8 shrink-0 rounded-full bg-gray-200',
  contentWrap: 'min-w-0 flex-1',
  header: 'flex flex-wrap items-center gap-x-2 gap-y-1 text-sm',
  author: 'font-medium text-gray-900',
  ownerBadge: 'rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700',
  date: 'text-xs text-gray-500',
  body: 'mt-2 whitespace-pre-wrap break-words text-sm text-gray-800',
  deletedText: 'italic text-gray-500',
  actions: 'mt-3 flex flex-wrap items-center gap-2',
  smallButton: buttonStyles.compactSecondary,
  dangerButton: buttonStyles.compactDanger,
  confirmBox:
    'mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-2 text-xs text-red-800',
  replies: 'ml-4 grid gap-2 border-l border-gray-200 pl-3 md:ml-8',
} as const;

export const forumLikeButtonStyles = {
  wrap: 'inline-grid gap-1',
  base: topicActionBase,
  sm: '',
  md: '',
  active: topicActionSelected,
  inactive: topicActionNeutral,
  error: 'text-[11px] font-medium text-red-600',
} as const;

export const forumTopicStyles = {
  form: 'grid max-w-3xl gap-4 rounded-2xl border border-gray-200 bg-white p-4',
  title: 'text-lg font-semibold',
  label: 'grid gap-1',
  labelText: 'text-sm',
  input:
    'rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 disabled:opacity-60',
  select:
    'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 disabled:opacity-60',
  textarea:
    'min-h-40 resize-y rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 disabled:opacity-60',
  counter: 'text-xs text-gray-500',
  hint: 'text-xs text-gray-500',
  error: 'text-sm text-red-600',
  success: 'text-sm text-green-700',

  actions: 'flex flex-wrap items-center gap-3',
  submitButton: buttonStyles.primary,
  linkButton: buttonStyles.secondary,
  dangerButton: buttonStyles.danger,

  actionBar: 'mb-4 flex flex-wrap items-start gap-2',
  actionButton: `${topicActionBase} ${topicActionNeutral}`,
  actionSelectedButton: `${topicActionBase} ${topicActionSelected}`,
  actionDangerButton: `${topicActionBase} ${topicActionDanger}`,

  ownerActions: 'contents',
  ownerEditButton: `${topicActionBase} ${topicActionNeutral}`,

  deleteWrap: 'relative inline-grid gap-2',
  deleteConfirmBox:
    'absolute left-0 top-[calc(100%+0.55rem)] z-30 grid w-[min(360px,calc(100vw-2rem))] gap-3 rounded-2xl border border-red-100 bg-white p-3 text-sm text-red-800 shadow-[0_18px_44px_rgba(127,29,29,0.14)]',
  deleteConfirmActions: 'flex flex-wrap items-center gap-2',

  confirmBox:
    'grid gap-2 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-800',
  mediaPanel:
    'grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2',
} as const;
