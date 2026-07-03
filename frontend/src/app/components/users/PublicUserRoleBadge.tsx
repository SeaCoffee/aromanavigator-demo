type PublicUserRoleBadgeProps = {
  roleLabel?: string | null;
  isStaff?: boolean | null;
  className?: string;
};

export function PublicUserRoleBadge({
  roleLabel,
  isStaff,
  className = '',
}: PublicUserRoleBadgeProps) {
  if (!roleLabel && !isStaff) {
    return null;
  }

  return (
    <span
      className={[
        'inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {roleLabel || 'РњРѕРґРµСЂР°С†С–СЏ'}
    </span>
  );
}
