'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { updateFragranceAction } from '@/app/actions/fragranceActions';
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
import { validateFragranceReleaseYear } from '@/app/utils/fragranceYearUtils';

type FormValues = {
  brand_id: string;
  name: string;
  slug: string;
  release_year: string;
};

type FragranceEditFormProps = {
  fragrance: FragranceDetail;
  brands: Brand[];
  onUpdated?: (fragrance: FragranceDetail) => void;
};

export default function FragranceEditForm({
  fragrance,
  brands,
  onUpdated,
}: FragranceEditFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      brand_id: String(fragrance.brand.id),
      name: fragrance.name,
      slug: fragrance.slug,
      release_year:
        fragrance.release_year === null ? '' : String(fragrance.release_year),
    },
  });

  const onSubmit = (values: FormValues) => {
    setMessage(null);

    const formData = new FormData();
    formData.set('id', String(fragrance.id));
    formData.set('brand_id', values.brand_id);
    formData.set('name', values.name.trim());
    formData.set('slug', values.slug.trim());
    formData.set('release_year', values.release_year.trim());

    startTransition(() => {
      void (async () => {
        const result = await updateFragranceAction(null, formData);

        setMessage(actionResultMessage(result));

        if (result.ok && result.data) {
          onUpdated?.(result.data);
        }
      })();
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={styles.form}
    >
      <label className={styles.field}>
        <span className={styles.label}>{labels.brand}</span>
        <select
          {...register('brand_id', { required: labels.chooseBrandError })}
          className={styles.input}
          disabled={isPending}
        >
          <option value="">{labels.chooseBrand}</option>
          {brands.map((brand) => (
            <option key={brand.id} value={String(brand.id)}>
              {brand.name}
            </option>
          ))}
        </select>
        {errors.brand_id ? (
          <div className={styles.errorMessage}>{errors.brand_id.message}</div>
        ) : null}
      </label>

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
        {isPending ? labels.saving : labels.saveFragrance}
      </button>

      {message ? (
        <div className={messageClassName(isSuccessMessage(message))}>{message}</div>
      ) : null}
    </form>
  );
}
