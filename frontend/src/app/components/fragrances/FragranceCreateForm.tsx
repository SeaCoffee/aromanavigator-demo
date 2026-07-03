'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import {
  createBrandAction,
  createFragranceAction,
} from '@/app/actions/fragranceActions';
import {
  actionResultMessage,
  isSuccessMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import { fragranceAdminLabels as labels } from '@/app/components/fragrances/fragranceAdminLabels';
import {
  fragranceAdminStyles as styles,
  messageClassName,
} from '@/app/components/fragrances/fragranceAdmin.styles';

import type { Brand, FragranceDetail } from '@/app/types/fragranceTypes';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { validateFragranceReleaseYear } from '@/app/utils/fragranceYearUtils';

type FormValues = {
  brand_id: string;
  name: string;
  slug: string;
  release_year: string;
};

type FragranceCreateFormProps = {
  brands: Brand[];
  onCreated?: (fragrance: FragranceDetail) => void;
  initialData?: {
    brand_name?: string;
    fragrance_name?: string;
    release_year?: string;
  };
};

function sortBrands(brands: Brand[]) {
  return [...brands].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }),
  );
}

function buildBrandFormData(name: string, country: string) {
  const formData = new FormData();
  formData.set('name', name.trim());
  formData.set('country', country.trim());

  return formData;
}

function hasBrandData(
  result: Awaited<ReturnType<typeof createBrandAction>>,
): result is { ok: true; data: Brand; msg?: string } {
  return Boolean(result.ok && result.data);
}

export default function FragranceCreateForm({
  brands,
  onCreated,
  initialData,
}: FragranceCreateFormProps) {
  const router = useRouter();
  const [brandOptions, setBrandOptions] = useState(() => sortBrands(brands));
  const [message, setMessage] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState(initialData?.brand_name ?? '');
  const [newBrandCountry, setNewBrandCountry] = useState('');
  const [createdBrandId, setCreatedBrandId] = useState('');
  const [isPending, startTransition] = useTransition();

  const matchedBrandId = useMemo(() => {
    const requestBrandName = initialData?.brand_name?.trim().toLowerCase();

    if (!requestBrandName) return '';

    const matchedBrand = brandOptions.find(
      (brand) => brand.name.trim().toLowerCase() === requestBrandName,
    );

    return matchedBrand ? String(matchedBrand.id) : '';
  }, [brandOptions, initialData?.brand_name]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      brand_id: matchedBrandId,
      name: initialData?.fragrance_name ?? '',
      slug: '',
      release_year: initialData?.release_year ?? '',
    },
  });

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

  const onSubmit = (values: FormValues) => {
    setMessage(null);

    const formData = new FormData();
    formData.set('brand_id', values.brand_id);
    formData.set('name', values.name.trim());
    formData.set('slug', values.slug.trim());
    formData.set('release_year', values.release_year.trim());

    startTransition(() => {
      void (async () => {
        const result = await createFragranceAction(null, formData);

        setMessage(actionResultMessage(result));

        if (result.ok && result.data) {
          if (onCreated) {
            onCreated(result.data);
          } else {
            router.push(
              fragrancePageUrlBuilder.admin.editFragrance(result.data.id),
            );
          }
        }
      })();
    });
  };

  const createBrand = () => {
    setMessage(null);

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

        if (hasBrandData(result)) {
          setBrandOptions((items) => sortBrands([...items, result.data]));
          setCreatedBrandId(String(result.data.id));
          setNewBrandName('');
          setNewBrandCountry('');
        }
      })();
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={styles.form}
    >
      {initialData?.brand_name || initialData?.fragrance_name ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-3 text-sm text-neutral-700">
          <div className="mb-1 font-medium">{labels.sourceRequest}</div>
          {initialData.brand_name ? (
            <div>{labels.brand}: {initialData.brand_name}</div>
          ) : null}
          {initialData.fragrance_name ? (
            <div>{labels.name}: {initialData.fragrance_name}</div>
          ) : null}
          {initialData.release_year ? (
            <div>{labels.year}: {initialData.release_year}</div>
          ) : null}
        </div>
      ) : null}

      <label className={styles.field}>
        <span className={styles.label}>{labels.brand}</span>
        <select
          {...register('brand_id', { required: labels.chooseBrandError })}
          className={styles.input}
          disabled={isPending}
        >
          <option value="">{labels.chooseBrand}</option>
          {brandOptions.map((brand) => (
            <option key={brand.id} value={String(brand.id)}>
              {brand.name}
            </option>
          ))}
        </select>
        {errors.brand_id ? (
          <div className={styles.errorMessage}>{errors.brand_id.message}</div>
        ) : null}
      </label>

      <div className="grid gap-3 rounded-lg border border-neutral-200 p-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className={styles.field}>
          <span className={styles.label}>{labels.newBrand}</span>
          <input
            value={newBrandName}
            onChange={(event) => setNewBrandName(event.target.value)}
            className={styles.input}
            disabled={isPending}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>{labels.country}</span>
          <input
            value={newBrandCountry}
            onChange={(event) => setNewBrandCountry(event.target.value)}
            className={styles.input}
            disabled={isPending}
          />
        </label>

        <button
          type="button"
          onClick={createBrand}
          disabled={isPending}
          className={styles.button}
        >
          {labels.createBrand}
        </button>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>{labels.fragranceName}</span>
        <input
          {...register('name', {
            required: labels.enterFragranceName,
            validate: (value) =>
              value.trim().length > 0 || labels.enterFragranceName,
            maxLength: { value: 255, message: labels.max255 },
          })}
          className={styles.input}
          disabled={isPending}
        />
        {errors.name ? (
          <div className={styles.errorMessage}>{errors.name.message}</div>
        ) : null}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>{labels.slug}</span>
        <input
          {...register('slug')}
          className={styles.input}
          placeholder={labels.optional}
          disabled={isPending}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>{labels.releaseYear}</span>
        <input
          {...register('release_year', {
            validate: validateFragranceReleaseYear,
          })}
          inputMode="numeric"
          className={styles.input}
          disabled={isPending}
        />
        {errors.release_year ? (
          <div className={styles.errorMessage}>
            {errors.release_year.message}
          </div>
        ) : null}
      </label>

      <button
        type="submit"
        disabled={isPending}
        className={styles.button}
      >
        {isPending ? labels.creating : labels.createFragrance}
      </button>

      {message ? (
        <div className={messageClassName(isSuccessMessage(message))}>{message}</div>
      ) : null}
    </form>
  );
}
