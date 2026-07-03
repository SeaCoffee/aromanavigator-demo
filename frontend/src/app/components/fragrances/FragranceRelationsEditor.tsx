'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useMemo, useState, useTransition } from 'react';

import {
  addOfficialFamilyAction,
  addOfficialNoteAction,
  addOfficialPerfumerAction,
  createFamilyAction,
  createNoteAction,
  createPerfumerAction,
  removeOfficialFamilyAction,
  removeOfficialNoteAction,
  removeOfficialPerfumerAction,
  updateOfficialNoteAction,
} from '@/app/actions/fragranceActions';
import {
  actionResultMessage,
  isSuccessMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import OfficialNotesSortableList from '@/app/components/fragrances/OfficialNotesSortableList';
import SearchablePicker from '@/app/components/fragrances/SearchablePicker';
import {
  fragranceAdminLabels as labels,
  noteLevelLabels,
} from '@/app/components/fragrances/fragranceAdminLabels';
import { messageClassName } from '@/app/components/fragrances/fragranceAdmin.styles';

import type {
  ActionResult,
  FragranceDetail,
  ID,
  Note,
  NoteLevel,
  OfficialNote,
  OlfactoryFamily,
  Perfumer,
} from '@/app/types/fragranceTypes';

type FragranceRelationsEditorProps = {
  fragrance: FragranceDetail;
  allPerfumers: Perfumer[];
  allFamilies: OlfactoryFamily[];
  allNotes: Note[];
};

type RelationFormValue = string | number | null | undefined;

const NOTE_LEVELS: NoteLevel[] = ['top', 'heart', 'base'];

function makeRelationFormData(
  fragranceId: ID,
  values: Record<string, RelationFormValue>,
) {
  const formData = new FormData();
  formData.set('fragrance_id', String(fragranceId));

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.set(key, String(value));
  });

  return formData;
}

function sortOfficialNotes(notes: OfficialNote[]) {
  return [...notes].sort((a, b) => a.position - b.position);
}

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }),
  );
}

function buildNameFormData(name: string) {
  const formData = new FormData();
  formData.set('name', name.trim());

  return formData;
}

function hasActionData<T>(
  result: ActionResult<T>,
): result is { ok: true; data: T; msg?: string } {
  return Boolean(result.ok && result.data);
}

function normalizePositions(notes: OfficialNote[], level: NoteLevel) {
  const sameLevel = sortOfficialNotes(notes.filter((note) => note.level === level));
  const rest = notes.filter((note) => note.level !== level);

  return [
    ...rest,
    ...sameLevel.map((note, index) => ({
      ...note,
      position: index,
    })),
  ];
}

export default function FragranceRelationsEditor({
  fragrance,
  allPerfumers,
  allFamilies,
  allNotes,
}: FragranceRelationsEditorProps) {
  const [perfumerOptions, setPerfumerOptions] = useState(() =>
    sortByName(allPerfumers),
  );
  const [familyOptions, setFamilyOptions] = useState(() =>
    sortByName(allFamilies),
  );
  const [noteOptions, setNoteOptions] = useState(() => sortByName(allNotes));
  const [perfumers, setPerfumers] = useState<Perfumer[]>(fragrance.perfumers);
  const [families, setFamilies] = useState<OlfactoryFamily[]>(fragrance.families);
  const [officialNotes, setOfficialNotes] = useState<OfficialNote[]>(
    fragrance.official_notes,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [newPerfumerName, setNewPerfumerName] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newNoteName, setNewNoteName] = useState('');
  const [newNoteLevel, setNewNoteLevel] = useState<NoteLevel>('top');
  const [isPending, startTransition] = useTransition();

  const availablePerfumers = useMemo(() => {
    const usedIds = new Set(perfumers.map((perfumer) => String(perfumer.id)));
    return perfumerOptions.filter(
      (perfumer) => !usedIds.has(String(perfumer.id)),
    );
  }, [perfumerOptions, perfumers]);

  const availableFamilies = useMemo(() => {
    const usedIds = new Set(families.map((family) => String(family.id)));
    return familyOptions.filter((family) => !usedIds.has(String(family.id)));
  }, [familyOptions, families]);

  const availableNotes = useMemo(() => {
    const usedIds = new Set(officialNotes.map((note) => String(note.id)));
    return noteOptions.filter((note) => !usedIds.has(String(note.id)));
  }, [noteOptions, officialNotes]);

  const notesByLevel = useMemo(() => {
    return {
      top: sortOfficialNotes(officialNotes.filter((note) => note.level === 'top')),
      heart: sortOfficialNotes(
        officialNotes.filter((note) => note.level === 'heart'),
      ),
      base: sortOfficialNotes(
        officialNotes.filter((note) => note.level === 'base'),
      ),
    } satisfies Record<NoteLevel, OfficialNote[]>;
  }, [officialNotes]);

  const runAction = (
    runner: () => Promise<ActionResult<unknown>>,
    onSuccess: () => void,
  ) => {
    setMessage(null);

    startTransition(() => {
      void (async () => {
        const result = await runner();
        setMessage(actionResultMessage(result));

        if (result.ok) {
          onSuccess();
        }
      })();
    });
  };

  const addPerfumer = (perfumerId: ID) => {
    const perfumer = perfumerOptions.find(
      (item) => String(item.id) === String(perfumerId),
    );
    if (!perfumer) return;

    runAction(
      () =>
        addOfficialPerfumerAction(
          null,
          makeRelationFormData(fragrance.id, { perfumer_id: perfumerId }),
        ),
      () => setPerfumers((current) => [...current, perfumer]),
    );
  };

  const removePerfumer = (perfumerId: ID) => {
    runAction(
      () =>
        removeOfficialPerfumerAction(
          null,
          makeRelationFormData(fragrance.id, { perfumer_id: perfumerId }),
        ),
      () =>
        setPerfumers((current) =>
          current.filter((perfumer) => String(perfumer.id) !== String(perfumerId)),
        ),
    );
  };

  const addFamily = (familyId: ID) => {
    const family = familyOptions.find((item) => String(item.id) === String(familyId));
    if (!family) return;

    runAction(
      () =>
        addOfficialFamilyAction(
          null,
          makeRelationFormData(fragrance.id, { family_id: familyId }),
        ),
      () => setFamilies((current) => [...current, family]),
    );
  };

  const removeFamily = (familyId: ID) => {
    runAction(
      () =>
        removeOfficialFamilyAction(
          null,
          makeRelationFormData(fragrance.id, { family_id: familyId }),
        ),
      () =>
        setFamilies((current) =>
          current.filter((family) => String(family.id) !== String(familyId)),
        ),
    );
  };

  const addNote = (noteId: ID, level: NoteLevel) => {
    const note = noteOptions.find((item) => String(item.id) === String(noteId));
    if (!note) return;

    const notesOfLevel = notesByLevel[level];
    const nextPosition =
      notesOfLevel.length > 0
        ? Math.max(...notesOfLevel.map((item) => item.position)) + 1
        : 0;

    runAction(
      () =>
        addOfficialNoteAction(
          null,
          makeRelationFormData(fragrance.id, {
            note_id: noteId,
            level,
            position: nextPosition,
          }),
        ),
      () =>
        setOfficialNotes((current) => [
          ...current,
          {
            id: note.id,
            name: note.name,
            slug: note.slug,
            level,
            position: nextPosition,
          },
        ]),
    );
  };

  const createAndAddPerfumer = () => {
    setMessage(null);

    if (!newPerfumerName.trim()) {
      setMessage(labels.enterPerfumerName);
      return;
    }

    startTransition(() => {
      void (async () => {
        const created = await createPerfumerAction(
          null,
          buildNameFormData(newPerfumerName),
        );

        if (!hasActionData(created)) {
          setMessage(actionResultMessage(created));
          return;
        }

        const linked = await addOfficialPerfumerAction(
          null,
          makeRelationFormData(fragrance.id, {
            perfumer_id: created.data.id,
          }),
        );

        setMessage(actionResultMessage(linked));

        if (linked.ok) {
          setPerfumerOptions((current) => sortByName([...current, created.data]));
          setPerfumers((current) => [...current, created.data]);
          setNewPerfumerName('');
        }
      })();
    });
  };

  const createAndAddFamily = () => {
    setMessage(null);

    if (!newFamilyName.trim()) {
      setMessage(labels.enterFamilyName);
      return;
    }

    startTransition(() => {
      void (async () => {
        const created = await createFamilyAction(
          null,
          buildNameFormData(newFamilyName),
        );

        if (!hasActionData(created)) {
          setMessage(actionResultMessage(created));
          return;
        }

        const linked = await addOfficialFamilyAction(
          null,
          makeRelationFormData(fragrance.id, {
            family_id: created.data.id,
          }),
        );

        setMessage(actionResultMessage(linked));

        if (linked.ok) {
          setFamilyOptions((current) => sortByName([...current, created.data]));
          setFamilies((current) => [...current, created.data]);
          setNewFamilyName('');
        }
      })();
    });
  };

  const createAndAddNote = () => {
    setMessage(null);

    if (!newNoteName.trim()) {
      setMessage(labels.enterNoteName);
      return;
    }

    startTransition(() => {
      void (async () => {
        const created = await createNoteAction(
          null,
          buildNameFormData(newNoteName),
        );

        if (!hasActionData(created)) {
          setMessage(actionResultMessage(created));
          return;
        }

        const notesOfLevel = notesByLevel[newNoteLevel];
        const nextPosition =
          notesOfLevel.length > 0
            ? Math.max(...notesOfLevel.map((item) => item.position)) + 1
            : 0;

        const linked = await addOfficialNoteAction(
          null,
          makeRelationFormData(fragrance.id, {
            note_id: created.data.id,
            level: newNoteLevel,
            position: nextPosition,
          }),
        );

        setMessage(actionResultMessage(linked));

        if (linked.ok) {
          setNoteOptions((current) => sortByName([...current, created.data]));
          setOfficialNotes((current) => [
            ...current,
            {
              id: created.data.id,
              name: created.data.name,
              slug: created.data.slug,
              level: newNoteLevel,
              position: nextPosition,
            },
          ]);
          setNewNoteName('');
        }
      })();
    });
  };

  const removeNote = (noteId: ID, level: NoteLevel) => {
    runAction(
      () =>
        removeOfficialNoteAction(
          null,
          makeRelationFormData(fragrance.id, { note_id: noteId, level }),
        ),
      () =>
        setOfficialNotes((current) =>
          normalizePositions(
            current.filter(
              (note) =>
                !(String(note.id) === String(noteId) && note.level === level),
            ),
            level,
          ),
        ),
    );
  };

  const reorderNotes = (orderedIds: ID[], level: NoteLevel) => {
    setMessage(null);

    startTransition(() => {
      void (async () => {
        for (const [index, noteId] of orderedIds.entries()) {
          const result = await updateOfficialNoteAction(
            null,
            makeRelationFormData(fragrance.id, {
              note_id: noteId,
              current_level: level,
              position: index,
            }),
          );

          if (!result.ok) {
            setMessage(actionResultMessage(result));
            return;
          }
        }

        setOfficialNotes((current) => {
          const nextPositions = new Map(
            orderedIds.map((noteId, index) => [String(noteId), index]),
          );

          return current.map((note) => {
            if (note.level !== level) return note;

            const nextPosition = nextPositions.get(String(note.id));

            return nextPosition === undefined
              ? note
              : {
                  ...note,
                  position: nextPosition,
                };
          });
        });

        setMessage(`Р“РѕС‚РѕРІРѕ: ${labels.noteOrderSaved}`);
      })();
    });
  };

  return (
    <section className="grid gap-6 rounded-lg border border-neutral-200 bg-white p-4">
      <header className="grid gap-1">
        <h2 className="text-xl font-semibold text-neutral-950">
          {labels.relations}
        </h2>
        <p className="text-sm text-neutral-500">
          {labels.relationsDescription}
        </p>
      </header>

      <section className="grid gap-3">
        <h3 className="font-medium text-neutral-950">{labels.perfumers}</h3>
        <SearchablePicker
          label={labels.addPerfumer}
          placeholder={labels.searchPerfumer}
          emptyText={labels.noPerfumersFound}
          items={availablePerfumers.map((perfumer) => ({
            id: perfumer.id,
            name: perfumer.name,
          }))}
          disabled={isPending}
          onPick={addPerfumer}
        />

        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-neutral-700">
              {labels.newPerfumer}
            </span>
            <input
              value={newPerfumerName}
              onChange={(event) => setNewPerfumerName(event.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-[#641f32]"
              disabled={isPending}
            />
          </label>
          <button
            type="button"
            onClick={createAndAddPerfumer}
            disabled={isPending}
            className={`${buttonStyles.secondary}`}
          >
            {labels.createAndAddPerfumer}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {perfumers.length === 0 ? (
            <div className="text-sm text-neutral-500">{labels.nothingAdded}</div>
          ) : (
            perfumers.map((perfumer) => (
              <button
                key={perfumer.id}
                type="button"
                onClick={() => removePerfumer(perfumer.id)}
                disabled={isPending}
                className="rounded-full bg-neutral-100 px-3 py-1 text-sm transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {perfumer.name} {labels.removeSuffix}
              </button>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="font-medium text-neutral-950">{labels.families}</h3>
        <SearchablePicker
          label={labels.addFamily}
          placeholder={labels.searchFamily}
          emptyText={labels.noFamiliesFound}
          items={availableFamilies.map((family) => ({
            id: family.id,
            name: family.name,
          }))}
          disabled={isPending}
          onPick={addFamily}
        />

        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-neutral-700">
              {labels.newFamily}
            </span>
            <input
              value={newFamilyName}
              onChange={(event) => setNewFamilyName(event.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-[#641f32]"
              disabled={isPending}
            />
          </label>
          <button
            type="button"
            onClick={createAndAddFamily}
            disabled={isPending}
            className={`${buttonStyles.secondary}`}
          >
            {labels.createAndAddFamily}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {families.length === 0 ? (
            <div className="text-sm text-neutral-500">{labels.nothingAdded}</div>
          ) : (
            families.map((family) => (
              <button
                key={family.id}
                type="button"
                onClick={() => removeFamily(family.id)}
                disabled={isPending}
                className="rounded-full bg-neutral-100 px-3 py-1 text-sm transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {family.name} {labels.removeSuffix}
              </button>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-4">
        <h3 className="font-medium text-neutral-950">{labels.officialNotes}</h3>

        <div className="grid gap-3 rounded-lg border border-neutral-200 p-3 md:grid-cols-[1fr_180px_auto] md:items-end">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-neutral-700">
              {labels.newNote}
            </span>
            <input
              value={newNoteName}
              onChange={(event) => setNewNoteName(event.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-[#641f32]"
              disabled={isPending}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium text-neutral-700">
              {labels.level}
            </span>
            <select
              value={newNoteLevel}
              onChange={(event) =>
                setNewNoteLevel(event.target.value as NoteLevel)
              }
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-[#641f32]"
              disabled={isPending}
            >
              <option value="top">{noteLevelLabels.top}</option>
              <option value="heart">{noteLevelLabels.heart}</option>
              <option value="base">{noteLevelLabels.base}</option>
            </select>
          </label>
          <button
            type="button"
            onClick={createAndAddNote}
            disabled={isPending}
            className={`${buttonStyles.secondary}`}
          >
            {labels.createAndAddNote}
          </button>
        </div>

        {NOTE_LEVELS.map((level) => {
          const notes = notesByLevel[level];

          return (
            <section key={level} className="grid gap-3 rounded-lg border border-neutral-200 p-3">
              <h4 className="text-sm font-medium text-neutral-950">
                {noteLevelLabels[level]}
              </h4>

              <SearchablePicker
                label={labels.addNoteLevel(noteLevelLabels[level])}
                placeholder={labels.searchNote}
                emptyText={labels.noNotesFound}
                items={availableNotes.map((note) => ({
                  id: note.id,
                  name: note.name,
                }))}
                disabled={isPending}
                onPick={(noteId) => addNote(noteId, level)}
              />

              {notes.length === 0 ? (
                <div className="text-sm text-neutral-500">{labels.nothingAdded}</div>
              ) : (
                <OfficialNotesSortableList
                  notes={notes}
                  level={level}
                  isPending={isPending}
                  onRemove={removeNote}
                  onReorder={reorderNotes}
                />
              )}
            </section>
          );
        })}
      </section>

      {message ? (
        <div
          className={messageClassName(isSuccessMessage(message))}
        >
          {message}
        </div>
      ) : null}
    </section>
  );
}
