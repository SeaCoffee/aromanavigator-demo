'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useMemo, useState, useTransition } from 'react';

import {
  createNoteSuggestionAction,
  voteNoteSuggestionAction,
} from '@/app/actions/fragranceUgcActions';
import {
  actionResultMessage,
  isSuccessMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import UserNotePyramidColumn from '@/app/components/fragrances/ugc/UserNotePyramidColumn';
import {
  NOTE_LEVEL_OPTIONS,
} from '@/app/utils/fragranceUgcComponentUtils';

import type {
  ID,
  Note,
  NoteLevel,
  NoteSuggestion,
  VoteInput,
} from '@/app/types/fragranceTypes';

type NoteSuggestionsBlockProps = {
  fragranceId: ID;
  fragranceSlug: string;
  initialSuggestions: NoteSuggestion[];
  notes: Note[];
  canInteract?: boolean;
};

export default function NoteSuggestionsBlock({
  fragranceId,
  fragranceSlug,
  initialSuggestions,
  notes,
  canInteract = true,
}: NoteSuggestionsBlockProps) {
  const [suggestions, setSuggestions] =
    useState<NoteSuggestion[]>(initialSuggestions);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>(
    'all',
  );
  const [selectedLevel, setSelectedLevel] = useState<NoteLevel>('top');
  const [selectedNoteId, setSelectedNoteId] = useState<ID | ''>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, startSubmitting] = useTransition();
  const [isVoting, startVoting] = useTransition();

  const groupedSuggestions = useMemo(() => {
    const visibleSuggestions =
      statusFilter === 'all'
        ? suggestions
        : suggestions.filter((item) => item.status === statusFilter);

    return {
      top: visibleSuggestions.filter((item) => item.level === 'top'),
      heart: visibleSuggestions.filter((item) => item.level === 'heart'),
      base: visibleSuggestions.filter((item) => item.level === 'base'),
    } satisfies Record<NoteLevel, NoteSuggestion[]>;
  }, [statusFilter, suggestions]);

  const suggestedIdsForLevel = useMemo(() => {
    return new Set(
      suggestions
        .filter((item) => item.level === selectedLevel)
        .map((item) => String(item.note_id)),
    );
  }, [selectedLevel, suggestions]);

  const availableNotes = useMemo(() => {
    return notes.filter((note) => !suggestedIdsForLevel.has(String(note.id)));
  }, [notes, suggestedIdsForLevel]);

  const handleCreate = () => {
    setMessage('');

    if (!selectedNoteId) {
      setMessage('РћР±РµСЂС–С‚СЊ РЅРѕС‚Сѓ.');
      return;
    }

    const formData = new FormData();
    formData.set('fragrance_id', String(fragranceId));
    formData.set('fragrance_slug', fragranceSlug);
    formData.set('note_id', String(selectedNoteId));
    formData.set('level', selectedLevel);

    startSubmitting(() => {
      void (async () => {
        const result = await createNoteSuggestionAction(null, formData);
        setMessage(actionResultMessage(result));

        if (result.ok && result.data) {
          setSuggestions((current) => [result.data as NoteSuggestion, ...current]);
          setSelectedNoteId('');
        }
      })();
    });
  };

  const handleVote = (
    suggestionId: NoteSuggestion['id'],
    value: VoteInput['value'],
  ) => {
    const formData = new FormData();
    formData.set('suggestion_id', String(suggestionId));
    formData.set('fragrance_slug', fragranceSlug);
    formData.set('value', String(value));

    startVoting(() => {
      void (async () => {
        const result = await voteNoteSuggestionAction(null, formData);
        setMessage(actionResultMessage(result));

        if (result.ok) {
          setSuggestions((current) =>
            current.map((item) =>
              String(item.id) === String(suggestionId)
                ? { ...item, score: item.score + value }
                : item,
            ),
          );
        }
      })();
    });
  };

  return (
    <section className="rounded-lg border border-neutral-200 p-4 md:p-6">
      <header className="mb-5 grid gap-1">
        <h3 className="text-xl font-semibold">РџС–СЂР°РјС–РґР° РЅРѕС‚ РІС–Рґ СЃРїС–Р»СЊРЅРѕС‚Рё</h3>
        <p className="text-sm text-neutral-600">
        РљРѕСЂРёСЃС‚СѓРІР°С‡С– РјРѕР¶СѓС‚СЊ Р·Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё РЅРѕС‚Рё. РџС–СЃР»СЏ РјРѕРґРµСЂР°С†С–С— СЃС…РІР°Р»РµРЅС– РЅРѕС‚Рё
        РґРѕРґР°СЋС‚СЊСЃСЏ РґРѕ РѕС„С–С†С–Р№РЅРѕС— РїС–СЂР°РјС–РґРё Р°СЂРѕРјР°С‚Сѓ.
      </p>
      </header>

      {canInteract ? <div className="mb-6 rounded-lg border border-neutral-200 p-4">
        <div className="mb-3 text-sm font-medium">Р—Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё РЅРѕС‚Сѓ</div>

        <div className="grid gap-3 md:grid-cols-2">
          <select
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 outline-none"
            value={selectedLevel}
            onChange={(event) => setSelectedLevel(event.target.value as NoteLevel)}
            disabled={isSubmitting}
          >
            {NOTE_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 outline-none"
            value={selectedNoteId ? String(selectedNoteId) : ''}
            onChange={(event) =>
              setSelectedNoteId(event.target.value ? event.target.value : '')
            }
            disabled={isSubmitting}
          >
            <option value="">РћР±РµСЂС–С‚СЊ РЅРѕС‚Сѓ</option>
            {availableNotes.map((note) => (
              <option key={note.id} value={String(note.id)}>
                {note.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3">
          <button
            type="button"
            className={`${buttonStyles.primary}`}
            onClick={handleCreate}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'РќР°РґСЃРёР»Р°С”РјРѕ...' : 'Р”РѕРґР°С‚Рё РїСЂРѕРїРѕР·РёС†С–СЋ'}
          </button>
        </div>

        {message ? (
          <div
            className={`mt-3 text-sm ${
              isSuccessMessage(message) ? 'text-green-700' : 'text-red-600'
            }`}
          >
            {message}
          </div>
        ) : null}
      </div> : null}

      {canInteract ? <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-neutral-700">Р¤С–Р»СЊС‚СЂ:</span>
        {[
          ['all', 'РЈСЃС–'],
          ['pending', 'РћС‡С–РєСѓСЋС‚СЊ'],
          ['approved', 'РЎС…РІР°Р»РµРЅС–'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              setStatusFilter(value as 'all' | 'pending' | 'approved')
            }
            className={[
              'rounded-full border px-3 py-1.5',
              statusFilter === value
                ? 'border-[#641f32] bg-[#641f32] text-white'
                : 'border-neutral-300 bg-white text-neutral-700',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <UserNotePyramidColumn
          title="Р’РµСЂС…РЅС– РЅРѕС‚Рё"
          items={groupedSuggestions.top}
          onVote={handleVote}
          isVoting={isVoting}
          canInteract={canInteract}
        />
        <UserNotePyramidColumn
          title="РќРѕС‚Рё СЃРµСЂС†СЏ"
          items={groupedSuggestions.heart}
          onVote={handleVote}
          isVoting={isVoting}
          canInteract={canInteract}
        />
        <UserNotePyramidColumn
          title="Р‘Р°Р·РѕРІС– РЅРѕС‚Рё"
          items={groupedSuggestions.base}
          onVote={handleVote}
          isVoting={isVoting}
          canInteract={canInteract}
        />
      </div>
    </section>
  );
}
