import { buttonStyles } from '@/app/components/common/buttonStyles';

export const meDashboardStyles = {
  page:
    'mx-auto grid w-full max-w-[1136px] gap-6 px-0 py-2 sm:py-3',

  hero:
    'grid gap-6 overflow-hidden rounded-[24px] border border-[#eadfd3] bg-[#fffdf9] p-4 shadow-[0_24px_70px_rgba(94,72,54,0.11)] sm:rounded-[34px] sm:p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start',

  profile:
    'grid min-w-0 gap-4 sm:flex sm:flex-wrap sm:items-start sm:gap-5',

  avatar:
    'h-20 w-20 rounded-[24px] object-cover ring-1 ring-[#eadfd3] shadow-[0_18px_42px_rgba(94,72,54,0.13)] sm:h-24 sm:w-24 sm:rounded-[28px]',

  avatarFallback:
    'grid h-20 w-20 place-items-center rounded-[24px] bg-[#8b2f45] text-2xl font-black text-[#fff8f1] ring-1 ring-[#eadfd3] shadow-[0_18px_42px_rgba(94,72,54,0.13)] sm:h-24 sm:w-24 sm:rounded-[28px] sm:text-3xl',

  profileText:
    'grid min-w-0 flex-1 gap-2',

  eyebrow:
    'text-[11px] font-black uppercase tracking-[0.2em] text-[#9b6847]',

  title:
    'max-w-full break-words font-serif text-[34px] font-semibold leading-[1.04] tracking-[-0.045em] text-[#241b19] sm:text-[42px] md:text-[54px]',

  subtitle:
    'max-w-full text-sm font-medium leading-7 text-[#6f6259] sm:max-w-[720px]',

  statusRow:
    'flex flex-wrap gap-2 pt-2',

  badge:
    'inline-flex rounded-full border border-[#eadfd3] bg-[#f6efe8] px-3 py-1 text-xs font-bold text-[#5f4a3f]',

  dangerBadge:
    'inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700',

  actions:
    'grid w-full gap-2 sm:flex sm:flex-wrap sm:items-start sm:justify-start lg:w-auto lg:justify-end',

  primaryLink:
    buttonStyles.primary,

  secondaryLink:
    buttonStyles.secondary,

  statsGrid:
    'grid gap-3 sm:grid-cols-2 xl:grid-cols-4',

  statCard:
    'group rounded-[24px] border border-[#eadfd3] bg-white p-4 shadow-[0_14px_34px_rgba(94,72,54,0.07)] transition hover:-translate-y-0.5 hover:border-[#d9c5b4] hover:bg-[#fffdf9] hover:shadow-[0_22px_48px_rgba(94,72,54,0.10)]',

  statLabel:
    'text-xs font-black uppercase tracking-[0.14em] text-[#8a7668] transition group-hover:text-[#9b6847]',

  statValue:
    'mt-2 font-serif text-3xl font-semibold leading-none tracking-[-0.05em] text-[#241b19]',

  bodyGrid:
    'grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]',

  panel:
    'grid content-start gap-4 rounded-[30px] border border-[#eadfd3] bg-[#fffdf9] p-5 shadow-[0_18px_45px_rgba(86,62,43,0.08)]',

  panelTitle:
    'font-serif text-[30px] font-semibold leading-tight tracking-[-0.045em] text-[#2b211d]',

  panelText:
    'text-sm font-medium leading-7 text-[#6f6259]',

  panelHeader:
    'grid gap-2',

  compactList:
    'grid gap-3',

  compactLink:
    'flex items-center justify-between gap-3 rounded-[18px] border border-[#eadfd3] bg-white px-4 py-3 text-sm font-bold text-[#3c322d] shadow-[0_10px_24px_rgba(94,72,54,0.04)] transition hover:bg-[#f6efe8]',

  muted:
    'text-xs font-medium leading-5 text-[#8a7668]',

  dashboardCards:
    'grid gap-3 sm:grid-cols-2',

  dashboardCard:
    'group grid min-h-[150px] content-between gap-4 rounded-[24px] border border-[#eadfd3] bg-white p-4 shadow-[0_14px_34px_rgba(94,72,54,0.07)] transition hover:-translate-y-0.5 hover:border-[#d9c5b4] hover:shadow-[0_22px_48px_rgba(94,72,54,0.10)]',

  dashboardCardTop:
    'flex items-start justify-between gap-4',

  dashboardCardIcon:
    'grid size-10 shrink-0 place-items-center rounded-full bg-[#f1e4db] text-sm font-black text-[#641f32]',

  dashboardCardTitle:
    'block text-base font-black leading-snug text-[#241b19]',

  dashboardCardText:
    'mt-2 block text-sm font-medium leading-6 text-[#7a6d64]',

  dashboardCardContent: 'grid gap-2 pr-12',

  dashboardCardFooter:
    'inline-flex items-center gap-2 text-sm font-black text-[#9b6847] transition group-hover:text-[#641f32]',

  accountList:
    'grid gap-3',

  accountRow:
    'grid gap-1 rounded-[18px] border border-[#eadfd3] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(94,72,54,0.04)]',

  accountLabel:
    'text-[11px] font-black uppercase tracking-[0.14em] text-[#8a7668]',

  accountValue:
    'min-w-0 break-words text-sm font-bold text-[#241b19]',

  softNotice:
    'rounded-[20px] border border-[#eadfd3] bg-white px-4 py-3 text-sm font-medium leading-7 text-[#6f6259] shadow-[0_10px_24px_rgba(94,72,54,0.04)]',

  warningNotice:
    'rounded-[20px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium leading-7 text-red-700',

  profilePage:
    'mx-auto grid w-full max-w-[920px] gap-6 px-0 py-2 sm:py-3',

  profileHeader:
    'grid gap-5 overflow-hidden rounded-[24px] border border-[#eadfd3] bg-[#fffdf9] p-4 shadow-[0_24px_70px_rgba(94,72,54,0.11)] sm:rounded-[34px] sm:p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-8',

  profileHeaderContent:
    'grid max-w-[680px] gap-3',

  profileHeaderKicker:
    'text-[11px] font-black uppercase tracking-[0.2em] text-[#9b6847]',

  profileHeaderTitle:
    'font-serif text-[34px] font-semibold leading-[1.04] tracking-[-0.045em] text-[#2b211d] sm:text-[42px] md:text-[54px]',

  profileHeaderText:
    'text-[15px] font-medium leading-7 text-[#7f7167]',

  publicProfileLink:
    buttonStyles.secondary,

  formShell:
    'grid gap-5 rounded-[30px] border border-[#eadfd3] bg-[#fffdf9] p-5 shadow-[0_22px_58px_rgba(94,72,54,0.10)] md:p-6',

  formHeader:
    'grid gap-2 border-b border-[#eadfd3] pb-5',

  formTitle:
    'font-serif text-[30px] font-semibold leading-tight tracking-[-0.045em] text-[#2b211d]',

  formLead:
    'max-w-[680px] text-sm font-medium leading-6 text-[#7f7167]',

  formGrid:
    'grid gap-5 md:grid-cols-2',

  field:
    'grid content-start gap-2',

  fieldFull:
    'md:col-span-2',

  label:
    'text-sm font-bold text-[#3d312c]',

  input:
    'min-h-11 w-full rounded-[15px] border border-[#e0d2c5] bg-white px-4 py-2 text-[14px] font-medium text-[#241b19] shadow-[0_8px_22px_rgba(80,60,40,0.04)] outline-none transition placeholder:text-[#a89b91] focus:border-[#9b6847] focus:ring-4 focus:ring-[#9b6847]/10 disabled:cursor-not-allowed disabled:bg-[#f1ebe5]',

  textarea:
    'min-h-[138px] w-full resize-y rounded-[18px] border border-[#e0d2c5] bg-white px-4 py-3 text-[14px] font-medium leading-6 text-[#241b19] shadow-[0_8px_22px_rgba(80,60,40,0.04)] outline-none transition placeholder:text-[#a89b91] focus:border-[#9b6847] focus:ring-4 focus:ring-[#9b6847]/10 disabled:cursor-not-allowed disabled:bg-[#f1ebe5]',

  inputError:
    'border-red-300 focus:border-red-400 focus:ring-red-100',

  error:
    'text-sm font-medium text-red-600',

  hint:
    'text-xs font-medium leading-5 text-[#8a7668]',

  formFooter:
    'grid gap-4 border-t border-[#eadfd3] pt-5',

  submitButton:
    buttonStyles.primary,

  nullPanel:
    'rounded-[26px] border border-red-200 bg-red-50 p-5 text-sm font-medium leading-6 text-red-700 shadow-[0_14px_34px_rgba(127,29,29,0.06)]',

  dangerShell:
    'grid gap-5 rounded-[30px] border border-red-200 bg-[#fffdf9] p-5 shadow-[0_22px_58px_rgba(127,29,29,0.08)] md:p-6',

  dangerHeader:
    'grid gap-2 border-b border-red-100 pb-5',

  dangerTitle:
    'font-serif text-[30px] font-semibold leading-tight tracking-[-0.045em] text-red-800',

  dangerLead:
    'text-sm font-medium leading-6 text-[#7f7167]',

  dangerAlert:
    'rounded-[20px] border border-red-100 bg-red-50 p-4 text-sm font-medium leading-6 text-red-800',

  dangerButton:
    buttonStyles.danger,
} as const;
