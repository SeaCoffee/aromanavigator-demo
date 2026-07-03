'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { ID, NoteLevel, OfficialNote } from '@/app/types/fragranceTypes';

type OfficialNotesSortableListProps = {
  notes: OfficialNote[];
  level: NoteLevel;
  isPending?: boolean;
  onRemove: (noteId: ID, level: NoteLevel) => void;
  onReorder: (orderedIds: ID[], level: NoteLevel) => void;
};

function sortableId(id: ID) {
  return String(id);
}

type SortableRowProps = {
  note: OfficialNote;
  isPending?: boolean;
  onRemove: (noteId: ID, level: NoteLevel) => void;
};

function SortableRow({ note, isPending, onRemove }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: sortableId(note.id) });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={isPending}
          className={`${buttonStyles.compactSecondary} cursor-grab active:cursor-grabbing`}
          title="Drag"
          aria-label={`Change order for ${note.name}`}
        >
          Move
        </button>

        <div className="truncate text-sm text-neutral-900">{note.name}</div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(note.id, note.level)}
        disabled={isPending}
        className={buttonStyles.compactDanger}
      >
        Remove
      </button>
    </div>
  );
}

export default function OfficialNotesSortableList({
  notes,
  level,
  isPending,
  onRemove,
  onReorder,
}: OfficialNotesSortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const orderedNotes = useMemo(
    () => [...notes].sort((a, b) => a.position - b.position),
    [notes],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (isPending) return;

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = orderedNotes.findIndex(
      (note) => sortableId(note.id) === active.id,
    );
    const newIndex = orderedNotes.findIndex(
      (note) => sortableId(note.id) === over.id,
    );

    if (oldIndex < 0 || newIndex < 0) return;

    const movedNotes = arrayMove(orderedNotes, oldIndex, newIndex);

    onReorder(
      movedNotes.map((note) => note.id),
      level,
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={orderedNotes.map((note) => sortableId(note.id))}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid gap-2">
          {orderedNotes.map((note) => (
            <SortableRow
              key={`${note.level}-${note.id}`}
              note={note}
              isPending={isPending}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
