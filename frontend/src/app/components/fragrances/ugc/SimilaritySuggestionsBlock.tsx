'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useMemo, useState, useTransition } from 'react';

import {
  createSimilaritySuggestionAction,
  voteSimilaritySuggestionAction,
} from '@/app/actions/fragranceUgcActions';

import { getFragranceTitle } from '@/app/selectors/fragranceSelectors';
import { getOtherSimilarityFragrance } from '@/app/selectors/fragranceUgcSelectors';
import {
  actionResultMessage,
  isSuccessMessage,
  toFriendlyActionMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';

import type {
  FragranceListItem,
  ID,
  SimilaritySuggestion,
  VoteInput,
} from '@/app/types/fragranceTypes';

type SimilaritySuggestionsBlockProps = {
  fragranceId: ID;
  fragranceSlug: string;
  initialSuggestions: SimilaritySuggestion[];
  fragrances: FragranceListItem[];
  canInteract?: boolean;
};

export default function SimilaritySuggestionsBlock({
  fragranceId,
  fragranceSlug,
  initialSuggestions,
  fragrances,
  canInteract = true,
}: SimilaritySuggestionsBlockProps) {
  const [suggestions, setSuggestions] =
    useState<SimilaritySuggestion[]>(initialSuggestions);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>(
    'all',
  );
  const [selectedFragranceId, setSelectedFragranceId] = useState<ID | ''>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, startSubmitting] = useTransition();
  const [isVoting, startVoting] = useTransition();

  const suggestedIds = useMemo(() => {
    return new Set(
      suggestions.flatMap((item) => [
        String(item.fragrance_id),
        String(item.similar_fragrance_id),
      ]),
    );
  }, [suggestions]);

  const availableFragrances = useMemo(() => {
    return fragrances.filter((fragrance) => {
      if (String(fragrance.id) === String(fragranceId)) return false;
      if (suggestedIds.has(String(fragrance.id))) return false;

      return true;
    });
  }, [fragranceId, fragrances, suggestedIds]);

  const visibleSuggestions = useMemo(() => {
    return statusFilter === 'all'
      ? suggestions
      : suggestions.filter((item) => item.status === statusFilter);
  }, [statusFilter, suggestions]);

  const handleCreate = () => {
    setMessage('');

    if (!selectedFragranceId) {
      setMessage('РћР±РµСЂС–С‚СЊ Р°СЂРѕРјР°С‚.');
      return;
    }

    const formData = new FormData();
    formData.set('fragrance_id', String(fragranceId));
    formData.set('fragrance_slug', fragranceSlug);
    formData.set('similar_fragrance_id', String(selectedFragranceId));

    startSubmitting(() => {
      void (async () => {
        const result = await createSimilaritySuggestionAction(null, formData);
        setMessage(toFriendlyActionMessage(actionResultMessage(result)));

        if (result.ok && result.data) {
          setSuggestions((current) => [
            result.data as SimilaritySuggestion,
            ...current,
          ]);
          setSelectedFragranceId('');
        }
      })();
    });
  };

  const handleVote = (
    suggestionId: SimilaritySuggestion['id'],
    value: VoteInput['value'],
  ) => {
    const formData = new FormData();
    formData.set('suggestion_id', String(suggestionId));
    formData.set('fragrance_slug', fragranceSlug);
    formData.set('value', String(value));

    startVoting(() => {
      void (async () => {
        const result = await voteSimilaritySuggestionAction(null, formData);
        setMessage(toFriendlyActionMessage(actionResultMessage(result)));

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
        <h3 className="text-xl font-semibold">РЎС…РѕР¶С– Р°СЂРѕРјР°С‚Рё</h3>
        <p className="text-sm text-neutral-600">
          РџСЂРѕРїРѕР·РёС†С–С— СЃРїС–Р»СЊРЅРѕС‚Рё РґР»СЏ Р°СЂРѕРјР°С‚С–РІ Р·С– СЃС…РѕР¶РёРј РїСЂРѕС„С–Р»РµРј.
        </p>
      </header>

      {canInteract ? <div className="mb-6 rounded-lg border border-neutral-200 p-4">
        <div className="mb-3 text-sm font-medium">Р—Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё СЃС…РѕР¶РёР№ Р°СЂРѕРјР°С‚</div>

        <div className="flex flex-col gap-3 md:flex-row">
          <select
            className="min-h-11 flex-1 rounded-lg border border-neutral-300 px-3 py-2 outline-none"
            value={selectedFragranceId ? String(selectedFragranceId) : ''}
            onChange={(event) =>
              setSelectedFragranceId(event.target.value ? event.target.value : '')
            }
            disabled={isSubmitting}
          >
            <option value="">РћР±РµСЂС–С‚СЊ Р°СЂРѕРјР°С‚</option>
            {availableFragrances.map((fragrance) => (
              <option key={fragrance.id} value={String(fragrance.id)}>
                {getFragranceTitle(fragrance)}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={`${buttonStyles.primary}`}
            onClick={handleCreate}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'РќР°РґСЃРёР»Р°С”РјРѕ...' : 'Р—Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё'}
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

      {visibleSuggestions.length === 0 ? (
        <div className="text-sm text-neutral-600">
          РџСЂРѕРїРѕР·РёС†С–Р№ СЃС…РѕР¶РёС… Р°СЂРѕРјР°С‚С–РІ С‰Рµ РЅРµРјР°С”.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleSuggestions.map((item) => {
            const other = getOtherSimilarityFragrance(item, fragranceId);

            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="font-medium">{getFragranceTitle(other)}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-500">
                    <span>РћС†С–РЅРєР°: {item.score}</span>
                    {item.status === 'pending' ? <span>РћС‡С–РєСѓС” РјРѕРґРµСЂР°С†С–С—</span> : null}
                  </div>
                  {item.moderator_comment ? (
                    <div className="mt-2 text-sm text-neutral-700">
                      РњРѕРґРµСЂР°С‚РѕСЂ: {item.moderator_comment}
                    </div>
                  ) : null}
                </div>

                {canInteract ? <div className="flex gap-2">
                  <button
                    type="button"
                    className={`${buttonStyles.compactSecondary}`}
                    onClick={() => handleVote(item.id, 1)}
                    disabled={isVoting}
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    className={`${buttonStyles.compactSecondary}`}
                    onClick={() => handleVote(item.id, -1)}
                    disabled={isVoting}
                  >
                    -1
                  </button>
                </div> : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
