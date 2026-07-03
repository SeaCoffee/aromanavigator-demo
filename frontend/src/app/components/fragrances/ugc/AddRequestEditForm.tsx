'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import {
  actionResultMessage,
  isSuccessMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import {
  createBrandAction,
  createFamilyAction,
  createNoteAction,
  createPerfumerAction,
} from '@/app/actions/fragranceActions';
import {
  fragranceAdminLabels as labels,
  moderationStatusLabels,
  noteLevelLabels,
} from '@/app/components/fragrances/fragranceAdminLabels';
import {
  fragranceAdminStyles as styles,
  messageClassName,
} from '@/app/components/fragrances/fragranceAdmin.styles';
import {
  approveAddRequestWithFragranceAction,
  createFragranceFromAddRequestAndApproveAction,
} from '@/app/actions/fragranceUgcActions';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';

import type {
  ActionResult,
  Brand,
  FragranceAddRequest,
  FragranceListItem,
  Note,
  NoteLevel,
  OlfactoryFamily,
  Perfumer,
} from '@/app/types/fragranceTypes';

type AddRequestEditFormProps = {
  item: FragranceAddRequest;
  brands: Brand[];
  fragrances: FragranceListItem[];
  perfumers: Perfumer[];
  families: OlfactoryFamily[];
  notes: Note[];
};

type FormValues = {
  brand_id: string;
  name: string;
  slug: string;
  release_year: string;
  moderator_comment: string;
  existing_fragrance_id: string;
  perfumer_ids: string[];
  family_ids: string[];
  top_note_ids: string[];
  heart_note_ids: string[];
  base_note_ids: string[];
};

const NOTE_LEVEL_LABELS: Record<NoteLevel, string> = {
  top: noteLevelLabels.top,
  heart: noteLevelLabels.heart,
  base: noteLevelLabels.base,
};

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }),
  );
}

function toSelectedIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function appendIds(formData: FormData, key: string, ids: string[]) {
  ids.forEach((id) => {
    formData.append(key, id);
  });
}

function getFragranceOptionLabel(fragrance: FragranceListItem) {
  const year = fragrance.release_year ? `, ${fragrance.release_year}` : '';

  return `${fragrance.brand.name} - ${fragrance.name}${year}`;
}

function getAttachedFragranceLabel(item: FragranceAddRequest) {
  if (item.created_fragrance) {
    const year = item.created_fragrance.release_year
      ? `, ${item.created_fragrance.release_year}`
      : '';

    return `${item.created_fragrance.brand.name} - ${item.created_fragrance.name}${year}`;
  }

  return labels.fragranceIsAttached;
}

function findInitialBrandId(item: FragranceAddRequest, brands: Brand[]) {
  const brandName = item.brand_name.trim().toLowerCase();

  if (!brandName) {
    return '';
  }

  const match = brands.find(
    (brand) => brand.name.trim().toLowerCase() === brandName,
  );

  return match ? String(match.id) : '';
}

function findInitialExistingFragranceId(
  item: FragranceAddRequest,
  fragrances: FragranceListItem[],
) {
  if (item.created_fragrance_id) {
    return String(item.created_fragrance_id);
  }

  const brandName = item.brand_name.trim().toLowerCase();
  const fragranceName = item.fragrance_name.trim().toLowerCase();

  if (!brandName || !fragranceName) {
    return '';
  }

  const match = fragrances.find(
    (fragrance) =>
      fragrance.brand.name.trim().toLowerCase() === brandName &&
      fragrance.name.trim().toLowerCase() === fragranceName,
  );

  return match ? String(match.id) : '';
}

function buildNameFormData(name: string) {
  const formData = new FormData();
  formData.set('name', name.trim());

  return formData;
}

function buildBrandFormData(name: string, country: string) {
  const formData = buildNameFormData(name);
  formData.set('country', country.trim());

  return formData;
}

function hasActionData<T>(
  result: ActionResult<T>,
): result is { ok: true; data: T; msg?: string } {
  return Boolean(result.ok && result.data);
}

export default function AddRequestEditForm({
  item,
  brands,
  fragrances,
  perfumers,
  families,
  notes,
}: AddRequestEditFormProps) {
  const [brandOptions, setBrandOptions] = useState(() => sortByName(brands));
  const [perfumerOptions, setPerfumerOptions] = useState(() =>
    sortByName(perfumers),
  );
  const [familyOptions, setFamilyOptions] = useState(() =>
    sortByName(families),
  );
  const [noteOptions, setNoteOptions] = useState(() => sortByName(notes));

  const [currentItem, setCurrentItem] = useState(item);
  const [message, setMessage] = useState<string | null>(null);

  const [newBrandName, setNewBrandName] = useState(item.brand_name);
  const [newBrandCountry, setNewBrandCountry] = useState('');
  const [createdBrandId, setCreatedBrandId] = useState('');
  const [newPerfumerName, setNewPerfumerName] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newNoteName, setNewNoteName] = useState('');
  const [newNoteLevel, setNewNoteLevel] = useState<NoteLevel>('top');

  const [isPending, startTransition] = useTransition();

  const initialBrandId = useMemo(
    () => findInitialBrandId(item, brandOptions),
    [brandOptions, item],
  );

  const initialExistingFragranceId = useMemo(
    () => findInitialExistingFragranceId(item, fragrances),
    [fragrances, item],
  );

  const { register, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      brand_id: initialBrandId,
      name: item.fragrance_name,
      slug: '',
      release_year: item.release_year === null ? '' : String(item.release_year),
      moderator_comment: item.moderator_comment || '',
      existing_fragrance_id: initialExistingFragranceId,
      perfumer_ids: [],
      family_ids: [],
      top_note_ids: [],
      heart_note_ids: [],
      base_note_ids: [],
    },
  });

  const brandId = watch('brand_id');
  const fragranceName = watch('name');

  useEffect(() => {
    if (!createdBrandId) {
      return;
    }

    if (!brandOptions.some((brand) => String(brand.id) === createdBrandId)) {
      return;
    }

    setValue('brand_id', createdBrandId);
    setCreatedBrandId('');
  }, [brandOptions, createdBrandId, setValue]);
  const slug = watch('slug');
  const releaseYear = watch('release_year');
  const moderatorComment = watch('moderator_comment');
  const existingFragranceId = watch('existing_fragrance_id');

  const perfumerIds = toSelectedIds(watch('perfumer_ids'));
  const familyIds = toSelectedIds(watch('family_ids'));
  const topNoteIds = toSelectedIds(watch('top_note_ids'));
  const heartNoteIds = toSelectedIds(watch('heart_note_ids'));
  const baseNoteIds = toSelectedIds(watch('base_note_ids'));

  const isApproved = currentItem.status === 'approved';
  const controlsDisabled = isPending || isApproved;

  const selectedBrand = useMemo(
    () =>
      brandOptions.find((brand) => String(brand.id) === String(brandId)) ??
      null,
    [brandId, brandOptions],
  );

  const selectedExistingFragrance = useMemo(
    () =>
      fragrances.find(
        (fragrance) => String(fragrance.id) === String(existingFragranceId),
      ) ?? null,
    [existingFragranceId, fragrances],
  );

  const createBrand = () => {
    setMessage(null);

    if (isApproved) {
      setMessage(labels.requestAlreadyApproved);
      return;
    }

    if (!newBrandName.trim()) {
      setMessage(labels.enterBrandName);
      return;
    }

    startTransition(() => {
      void (async () => {
        const result = await createBrandAction(
          null,
          buildBrandFormData(newBrandName, newBrandCountry),
        );

        setMessage(actionResultMessage(result));

        if (hasActionData(result)) {
          setBrandOptions((items) => sortByName([...items, result.data]));
          setCreatedBrandId(String(result.data.id));
          setNewBrandName('');
          setNewBrandCountry('');
        }
      })();
    });
  };

  const createPerfumer = () => {
    setMessage(null);

    if (isApproved) {
      setMessage(labels.requestAlreadyApproved);
      return;
    }

    if (!newPerfumerName.trim()) {
      setMessage(labels.enterPerfumerName);
      return;
    }

    startTransition(() => {
      void (async () => {
        const result = await createPerfumerAction(
          null,
          buildNameFormData(newPerfumerName),
        );

        setMessage(actionResultMessage(result));

        if (hasActionData(result)) {
          setPerfumerOptions((items) => sortByName([...items, result.data]));
          setValue('perfumer_ids', [...perfumerIds, String(result.data.id)]);
          setNewPerfumerName('');
        }
      })();
    });
  };

  const createFamily = () => {
    setMessage(null);

    if (isApproved) {
      setMessage(labels.requestAlreadyApproved);
      return;
    }

    if (!newFamilyName.trim()) {
      setMessage(labels.enterFamilyName);
      return;
    }

    startTransition(() => {
      void (async () => {
        const result = await createFamilyAction(
          null,
          buildNameFormData(newFamilyName),
        );

        setMessage(actionResultMessage(result));

        if (hasActionData(result)) {
          setFamilyOptions((items) => sortByName([...items, result.data]));
          setValue('family_ids', [...familyIds, String(result.data.id)]);
          setNewFamilyName('');
        }
      })();
    });
  };

  const createNote = () => {
    setMessage(null);

    if (isApproved) {
      setMessage(labels.requestAlreadyApproved);
      return;
    }

    if (!newNoteName.trim()) {
      setMessage(labels.enterNoteName);
      return;
    }

    startTransition(() => {
      void (async () => {
        const result = await createNoteAction(
          null,
          buildNameFormData(newNoteName),
        );

        setMessage(actionResultMessage(result));

        if (hasActionData(result)) {
          const id = String(result.data.id);

          setNoteOptions((items) => sortByName([...items, result.data]));

          if (newNoteLevel === 'heart') {
            setValue('heart_note_ids', [...heartNoteIds, id]);
          } else if (newNoteLevel === 'base') {
            setValue('base_note_ids', [...baseNoteIds, id]);
          } else {
            setValue('top_note_ids', [...topNoteIds, id]);
          }

          setNewNoteName('');
        }
      })();
    });
  };

  const createAndApprove = () => {
    setMessage(null);

    if (isApproved) {
      setMessage(labels.requestAlreadyApproved);
      return;
    }

    if (!selectedBrand) {
      setMessage(labels.selectCatalogBrandFirst);
      return;
    }

    if (!fragranceName.trim()) {
      setMessage(labels.fragranceNameEmpty);
      return;
    }

    const formData = new FormData();
    formData.set('id', String(currentItem.id));
    formData.set('brand_id', String(selectedBrand.id));
    formData.set('name', fragranceName.trim());
    formData.set('slug', slug.trim());
    formData.set('release_year', releaseYear.trim());
    formData.set('moderator_comment', moderatorComment.trim());

    appendIds(formData, 'perfumer_ids', perfumerIds);
    appendIds(formData, 'family_ids', familyIds);
    appendIds(formData, 'top_note_ids', topNoteIds);
    appendIds(formData, 'heart_note_ids', heartNoteIds);
    appendIds(formData, 'base_note_ids', baseNoteIds);

    startTransition(() => {
      void (async () => {
        const result = await createFragranceFromAddRequestAndApproveAction(
          null,
          formData,
        );

        setMessage(actionResultMessage(result));

        if (hasActionData(result)) {
          setCurrentItem(result.data);

          if (result.data.created_fragrance_id) {
            setValue(
              'existing_fragrance_id',
              String(result.data.created_fragrance_id),
            );
          }
        }
      })();
    });
  };

  const approveWithExistingFragrance = (
    fragranceId: FragranceAddRequest['created_fragrance_id'],
  ) => {
    setMessage(null);

    if (isApproved) {
      setMessage(labels.requestAlreadyApproved);
      return;
    }

    if (!fragranceId) {
      setMessage(labels.selectCatalogFragrance);
      return;
    }

    const formData = new FormData();
    formData.set('id', String(currentItem.id));
    formData.set('fragrance_id', String(fragranceId));
    formData.set('moderator_comment', moderatorComment.trim());

    startTransition(() => {
      void (async () => {
        const result = await approveAddRequestWithFragranceAction(
          null,
          formData,
        );

        setMessage(actionResultMessage(result));

        if (hasActionData(result)) {
          setCurrentItem(result.data);

          if (result.data.created_fragrance_id) {
            setValue(
              'existing_fragrance_id',
              String(result.data.created_fragrance_id),
            );
          }
        }
      })();
    });
  };

  return (
    <section className={styles.cardLarge}>
      <header className={styles.header}>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">
            {labels.moderateAddRequest(currentItem.id)}
          </h1>

          <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm">
            {labels.status}: <b>{moderationStatusLabels[currentItem.status]}</b>
          </span>
        </div>

        <p className="text-sm text-neutral-500">{labels.sourceRequestReadonly}</p>
      </header>

      <form
        onSubmit={(event) => event.preventDefault()}
        className={styles.formGrid}
      >
        <section className={styles.stickyPanel}>
          <h2 className="text-lg font-semibold">{labels.sourceRequest}</h2>

          <div className={styles.dashedCard}>
            <div className="grid gap-1">
              <span className="font-medium text-neutral-700">{labels.requestBrand}</span>
              <span>{currentItem.brand_name || '-'}</span>
            </div>

            <div className="grid gap-1">
              <span className="font-medium text-neutral-700">
                {labels.requestName}
              </span>
              <span>{currentItem.fragrance_name || '-'}</span>
            </div>

            <div className="grid gap-1">
              <span className="font-medium text-neutral-700">
                {labels.requestYear}
              </span>
              <span>{currentItem.release_year ?? '-'}</span>
            </div>

            <div className="grid gap-1">
              <span className="font-medium text-neutral-700">
                {labels.requestPerfumer}
              </span>
              <span className="whitespace-pre-wrap">
                {currentItem.perfumers_text || '-'}
              </span>
            </div>

            <div className="grid gap-1">
              <span className="font-medium text-neutral-700">{labels.requestNotes}</span>
              <pre className={styles.preWhite}>
                {currentItem.notes_text || '-'}
              </pre>
            </div>

            <div className="grid gap-1">
              <span className="font-medium text-neutral-700">{labels.requestFamilies}</span>
              <span className="whitespace-pre-wrap">
                {currentItem.families_text || '-'}
              </span>
            </div>

            <div className="grid gap-1">
              <span className="font-medium text-neutral-700">{labels.requestLinks}</span>
              <pre className={styles.preWhite}>
                {currentItem.links_text || '-'}
              </pre>
            </div>
          </div>
        </section>

        <div className="grid gap-6">
        <section className="grid gap-4 border-t border-neutral-200 pt-6">
          <h2 className="text-lg font-semibold">{labels.catalogFragranceData}</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm font-medium">
                {labels.catalogFragranceName}
              </span>
              <input
                {...register('name')}
                className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2"
                disabled={controlsDisabled}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium">{labels.releaseYear}</span>
              <input
                {...register('release_year')}
                inputMode="numeric"
                className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2"
                disabled={controlsDisabled}
              />
            </label>

            <label className="grid gap-1 md:col-span-3">
              <span className="text-sm font-medium">{labels.slug}</span>
              <input
                {...register('slug')}
                className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2"
                placeholder={labels.optional}
                disabled={controlsDisabled}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="grid gap-1">
              <span className="text-sm font-medium">{labels.brand}</span>
              <select
                {...register('brand_id')}
                className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2"
                disabled={controlsDisabled}
              >
                <option value="">{labels.selectBrand}</option>
                {brandOptions.map((brand) => (
                  <option key={brand.id} value={String(brand.id)}>
                    {brand.name}
                    {brand.country ? `, ${brand.country}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium">{labels.newBrand}</span>
              <input
                value={newBrandName}
                onChange={(event) => setNewBrandName(event.target.value)}
                className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2"
                disabled={controlsDisabled}
              />
            </label>

            <button
              type="button"
              onClick={createBrand}
              disabled={controlsDisabled}
              className={`${buttonStyles.secondary}`}
            >
              {labels.createBrand}
            </button>

            <label className="grid gap-1 md:col-span-3">
              <span className="text-sm font-medium">{labels.brandCountry}</span>
              <input
                value={newBrandCountry}
                onChange={(event) => setNewBrandCountry(event.target.value)}
                className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2"
                disabled={controlsDisabled}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="grid gap-1">
              <span className="text-sm font-medium">{labels.perfumers}</span>
              <select
                {...register('perfumer_ids')}
                multiple
                className="min-h-36 rounded-lg border border-neutral-300 px-3 py-2"
                disabled={controlsDisabled}
              >
                {perfumerOptions.map((perfumer) => (
                  <option key={perfumer.id} value={String(perfumer.id)}>
                    {perfumer.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium">{labels.newPerfumer}</span>
              <input
                value={newPerfumerName}
                onChange={(event) => setNewPerfumerName(event.target.value)}
                className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2"
                disabled={controlsDisabled}
              />
            </label>

            <button
              type="button"
              onClick={createPerfumer}
              disabled={controlsDisabled}
              className={`${buttonStyles.secondary}`}
            >
              {labels.createPerfumer}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="grid gap-1">
              <span className="text-sm font-medium">{labels.families}</span>
              <select
                {...register('family_ids')}
                multiple
                className="min-h-36 rounded-lg border border-neutral-300 px-3 py-2"
                disabled={controlsDisabled}
              >
                {familyOptions.map((family) => (
                  <option key={family.id} value={String(family.id)}>
                    {family.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium">{labels.newFamily}</span>
              <input
                value={newFamilyName}
                onChange={(event) => setNewFamilyName(event.target.value)}
                className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2"
                disabled={controlsDisabled}
              />
            </label>

            <button
              type="button"
              onClick={createFamily}
              disabled={controlsDisabled}
              className={`${buttonStyles.secondary}`}
            >
              {labels.createFamily}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {(['top', 'heart', 'base'] as NoteLevel[]).map((level) => (
              <label key={level} className="grid gap-1">
                <span className="text-sm font-medium">
                  {NOTE_LEVEL_LABELS[level]}
                </span>
                <select
                  {...register(`${level}_note_ids`)}
                  multiple
                  className="min-h-44 rounded-lg border border-neutral-300 px-3 py-2"
                  disabled={controlsDisabled}
                >
                  {noteOptions.map((note) => (
                    <option key={note.id} value={String(note.id)}>
                      {note.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
            <label className="grid gap-1">
              <span className="text-sm font-medium">{labels.newNote}</span>
              <input
                value={newNoteName}
                onChange={(event) => setNewNoteName(event.target.value)}
                className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2"
                disabled={controlsDisabled}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium">{labels.addToLevel}</span>
              <select
                value={newNoteLevel}
                onChange={(event) =>
                  setNewNoteLevel(event.target.value as NoteLevel)
                }
                className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2"
                disabled={controlsDisabled}
              >
                <option value="top">{noteLevelLabels.top}</option>
                <option value="heart">{noteLevelLabels.heart}</option>
                <option value="base">{noteLevelLabels.base}</option>
              </select>
            </label>

            <button
              type="button"
              onClick={createNote}
              disabled={controlsDisabled}
              className={`${buttonStyles.secondary}`}
            >
              {labels.createNote}
            </button>
          </div>
        </section>

        <section className="grid gap-4 border-t border-neutral-200 pt-6">
          <h2 className="text-lg font-semibold">{labels.createAndApprove}</h2>

          <div
            className={`text-sm ${
              selectedBrand ? 'text-green-700' : 'text-amber-700'
            }`}
          >
            {selectedBrand
              ? labels.selectedBrand(selectedBrand.name)
              : labels.selectBrandBeforeCreate}
          </div>

          <label className="grid gap-1">
            <span className="text-sm font-medium">{labels.moderatorComment}</span>
            <textarea
              {...register('moderator_comment')}
              className="min-h-24 rounded-lg border border-neutral-300 px-3 py-2"
              disabled={controlsDisabled}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={createAndApprove}
              disabled={controlsDisabled}
              className={`${buttonStyles.secondary}`}
            >
              {isPending ? labels.creating : labels.createFragranceAndApprove}
            </button>

            <span className="text-sm text-neutral-600">
              {labels.currentStatus}: <b>{moderationStatusLabels[currentItem.status]}</b>
            </span>
          </div>
        </section>
        </div>
      </form>

      <section className="grid gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <div className="text-sm font-medium">{labels.approveWithExisting}</div>

        {currentItem.created_fragrance_id ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">
              {getAttachedFragranceLabel(currentItem)}
            </span>

            <Link
              href={fragrancePageUrlBuilder.admin.editFragrance(
                currentItem.created_fragrance_id,
              )}
              className={`${buttonStyles.secondary}`}
            >
              {labels.edit}
            </Link>

            <button
              type="button"
              className={`${buttonStyles.secondary}`}
              onClick={() =>
                approveWithExistingFragrance(currentItem.created_fragrance_id)
              }
              disabled={controlsDisabled}
            >
              {labels.approveWithFragrance}
            </button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <label className="grid gap-1">
              <span className="text-sm font-medium">{labels.existingFragrance}</span>
              <select
                {...register('existing_fragrance_id')}
                className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2"
                disabled={controlsDisabled}
              >
                <option value="">{labels.selectFragrance}</option>
                {fragrances.map((fragrance) => (
                  <option key={fragrance.id} value={String(fragrance.id)}>
                    {getFragranceOptionLabel(fragrance)}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className={`${buttonStyles.secondary}`}
              onClick={() =>
                approveWithExistingFragrance(selectedExistingFragrance?.id ?? null)
              }
              disabled={controlsDisabled}
            >
              {labels.approveWithFragrance}
            </button>

            {selectedExistingFragrance ? (
              <div className="text-sm text-neutral-600 md:col-span-2">
                {labels.selected}: {getFragranceOptionLabel(selectedExistingFragrance)}
              </div>
            ) : null}
          </div>
        )}
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
