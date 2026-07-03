import { getNoteChipStyle } from '@/app/components/fragrances/noteChipConfig';

type NoteChipProps = {
  name: string;
  slug?: string | null;
};

export default function NoteChip({ name, slug }: NoteChipProps) {
  const style = getNoteChipStyle(slug ?? name);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${style.chipClass}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${style.dotClass}`} />
      <span>{name}</span>
    </span>
  );
}
