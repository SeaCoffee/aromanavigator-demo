export type NoteChipStyle = {
  dotClass: string;
  chipClass: string;
};

export const NOTE_CHIP_MAP: Record<string, NoteChipStyle> = {
  amber: {
    dotClass: 'bg-amber-500',
    chipClass: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  bergamot: {
    dotClass: 'bg-lime-500',
    chipClass: 'bg-lime-50 border-lime-200 text-lime-900',
  },
  citrus: {
    dotClass: 'bg-yellow-400',
    chipClass: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  },
  lavender: {
    dotClass: 'bg-violet-400',
    chipClass: 'bg-violet-50 border-violet-200 text-violet-900',
  },
  musk: {
    dotClass: 'bg-zinc-400',
    chipClass: 'bg-zinc-50 border-zinc-200 text-zinc-900',
  },
  patchouli: {
    dotClass: 'bg-emerald-700',
    chipClass: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  },
  rose: {
    dotClass: 'bg-rose-400',
    chipClass: 'bg-rose-50 border-rose-200 text-rose-900',
  },
  sandalwood: {
    dotClass: 'bg-orange-700',
    chipClass: 'bg-orange-50 border-orange-200 text-orange-900',
  },
  vanilla: {
    dotClass: 'bg-yellow-200',
    chipClass: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  },
};

export function getNoteChipStyle(slugOrName: string): NoteChipStyle {
  const key = slugOrName.trim().toLowerCase();
  return NOTE_CHIP_MAP[key] ?? {
    dotClass: 'bg-gray-400',
    chipClass: 'bg-gray-50 border-gray-200 text-gray-800',
  };
}
