export const socialUserListStyles = {
  page: 'mx-auto grid w-full max-w-5xl gap-6 px-4 py-7',
  header: 'grid gap-1',
  title: 'text-2xl font-semibold text-[#241b19]',
  subtitle: 'text-sm text-[#7a6d64]',
  summary:
    'w-fit rounded-full bg-[#f6efe8] px-3 py-1.5 text-xs font-semibold text-[#6f6259]',
  list: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
  empty:
    'rounded-lg border border-dashed border-[#d6c2b0] bg-white/80 p-5 text-sm font-medium text-[#7a6d64]',
  card:
    'group grid min-w-0 gap-3 rounded-lg border border-[#eadfd5] bg-[#fffdf9] p-4 transition hover:border-[#d6c2b0] hover:shadow-[0_10px_26px_rgba(94,72,54,0.08)]',
  user: 'flex min-w-0 items-center gap-3',
  avatarWrap: 'relative shrink-0',
  avatar: 'size-12 rounded-full border border-[#eadfd5] object-cover',
  avatarFallback:
    'grid size-12 place-items-center rounded-full border border-[#eadfd5] bg-[#efe3d9] text-sm font-bold text-[#641f32]',
  info: 'min-w-0 flex-1',
  name: 'truncate text-sm font-bold text-[#2b211d] group-hover:text-[#641f32]',
  realName: 'truncate text-xs font-medium text-[#8a7b70]',
  stats: 'flex flex-wrap gap-1.5',
  stat:
    'rounded-full bg-[#f6efe8] px-2.5 py-1 text-[11px] font-semibold text-[#6f6259]',
} as const;
