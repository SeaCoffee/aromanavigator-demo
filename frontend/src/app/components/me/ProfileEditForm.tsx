'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

import { updateMeAction } from '@/app/actions/usersActions';
import FormMessage from '@/app/components/auth/FormMessage';
import { meDashboardStyles as styles } from '@/app/components/me/meDashboard.styles';
import {
  DEFAULT_REGION,
  REGION_OPTIONS,
  isRegion,
  type Region,
} from '@/app/constants/regionOptions';
import type { ActionMessage } from '@/app/types/authTypes';
import type { UpdateMePayload, UserMeProfile } from '@/app/types/userTypes';
import { firstStringMessage, recordMessage } from '@/app/utils/messageUtils';

type Props = {
  profile: UserMeProfile | null;
};

type FormValues = {
  name: string;
  display_name: string;
  region: Region | '';
  about_me: string;
};

function applyProfileFieldErrors(
  msg: ActionMessage,
  setError: UseFormSetError<FormValues>,
): boolean {
  const record = recordMessage(msg);

  if (!record) {
    return false;
  }

  const profile = record.profile;
  const profileRecord = recordMessage(profile) ?? record;

  let hasFieldError = false;

  const fields: Array<keyof FormValues> = [
    'name',
    'display_name',
    'region',
    'about_me',
  ];

  fields.forEach((field) => {
    const fieldError = firstStringMessage(profileRecord[field]);

    if (fieldError) {
      setError(field, {
        type: 'server',
        message: fieldError,
      });
      hasFieldError = true;
    }
  });

  return hasFieldError;
}

function getInitialRegion(region: string | null | undefined): Region | '' {
  return isRegion(region) ? region : '';
}

function toPayload(values: FormValues): UpdateMePayload {
  return {
    profile: {
      name: values.name.trim(),
      display_name: values.display_name.trim(),
      region: values.region || DEFAULT_REGION,
      about_me: values.about_me.trim() || null,
    },
  };
}

function getInputClassName(hasError: boolean) {
  return `${styles.input} ${hasError ? styles.inputError : ''}`;
}

function getTextareaClassName(hasError: boolean) {
  return `${styles.textarea} ${hasError ? styles.inputError : ''}`;
}

export default function ProfileEditForm({ profile }: Props) {
  const [message, setMessage] = useState<ActionMessage>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: profile?.name ?? '',
      display_name: profile?.display_name ?? '',
      region: getInitialRegion(profile?.region),
      about_me: profile?.about_me ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: profile?.name ?? '',
      display_name: profile?.display_name ?? '',
      region: getInitialRegion(profile?.region),
      about_me: profile?.about_me ?? '',
    });
  }, [profile, reset]);

  function onSubmit(values: FormValues) {
    setMessage('');
    setIsSuccess(false);

    startTransition(async () => {
      const result = await updateMeAction(toPayload(values));

      setIsSuccess(result.ok);

      if (result.ok) {
        setMessage(result.msg ?? 'РџСЂРѕС„С–Р»СЊ РѕРЅРѕРІР»РµРЅРѕ.');

        const updatedProfile = result.data?.profile;

        reset({
          name: updatedProfile?.name ?? values.name,
          display_name: updatedProfile?.display_name ?? values.display_name,
          region: getInitialRegion(updatedProfile?.region ?? values.region),
          about_me: updatedProfile?.about_me ?? values.about_me,
        });

        return;
      }

      const wasFieldError = applyProfileFieldErrors(result.msg, setError);

      if (!wasFieldError) {
        setMessage(result.msg);
      }
    });
  }

  if (!profile) {
    return (
      <section className={styles.nullPanel}>
        РџСЂРѕС„С–Р»СЊ РЅРµ Р·РЅР°Р№РґРµРЅРѕ. РЎРїСЂРѕР±СѓР№С‚Рµ РѕРЅРѕРІРёС‚Рё СЃС‚РѕСЂС–РЅРєСѓ Р°Р±Рѕ СѓРІС–Р№С‚Рё Р·РЅРѕРІСѓ.
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.formShell}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Р”Р°РЅС– РїСЂРѕС„С–Р»СЋ</h2>

        <p className={styles.formLead}>
          РќС–РєРЅРµР№Рј РІРёРєРѕСЂРёСЃС‚РѕРІСѓС”С‚СЊСЃСЏ Сѓ РїСѓР±Р»С–С‡РЅРѕРјСѓ РїСЂРѕС„С–Р»С– С‚Р° РїРѕСЃРёР»Р°РЅРЅСЏС…. Р†РјКјСЏ,
          СЂРµРіС–РѕРЅ С– РѕРїРёСЃ РґРѕРїРѕРјР°РіР°СЋС‚СЊ С–РЅС€РёРј РєРѕСЂРёСЃС‚СѓРІР°С‡Р°Рј Р·СЂРѕР·СѓРјС–С‚Рё, Р·РІС–РґРєРё РІРё
          Р·Р°Р·РІРёС‡Р°Р№ РІС–РґРїСЂР°РІР»СЏС”С‚Рµ С‚РѕРІР°СЂРё Р°Р±Рѕ СЏРєРёР№ СЂРµРіС–РѕРЅ С…РѕС‡РµС‚Рµ РїРѕРєР°Р·СѓРІР°С‚Рё Сѓ
          РїСЂРѕС„С–Р»С–.
        </p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="profile-name" className={styles.label}>
            Р†РјКјСЏ
          </label>

          <input
            id="profile-name"
            {...register('name', {
              required: 'Р’РІРµРґС–С‚СЊ С–РјКјСЏ.',
              maxLength: {
                value: 25,
                message: 'Р†РјКјСЏ РјР°С” Р±СѓС‚Рё РЅРµ РґРѕРІС€Рµ 25 СЃРёРјРІРѕР»С–РІ.',
              },
            })}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            className={getInputClassName(Boolean(errors.name))}
          />

          {errors.name?.message ? (
            <span className={styles.error}>{errors.name.message}</span>
          ) : (
            <span className={styles.hint}>Р”Рѕ 25 СЃРёРјРІРѕР»С–РІ.</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="profile-display-name" className={styles.label}>
            РќС–РєРЅРµР№Рј
          </label>

          <input
            id="profile-display-name"
            {...register('display_name', {
              required: 'Р’РІРµРґС–С‚СЊ РЅС–РєРЅРµР№Рј.',
              minLength: {
                value: 3,
                message: 'РќС–РєРЅРµР№Рј РјР°С” Р±СѓС‚Рё РЅРµ РєРѕСЂРѕС‚С€Рµ 3 СЃРёРјРІРѕР»С–РІ.',
              },
              maxLength: {
                value: 30,
                message: 'РќС–РєРЅРµР№Рј РјР°С” Р±СѓС‚Рё РЅРµ РґРѕРІС€Рµ 30 СЃРёРјРІРѕР»С–РІ.',
              },
            })}
            autoComplete="username"
            aria-invalid={Boolean(errors.display_name)}
            className={getInputClassName(Boolean(errors.display_name))}
          />

          {errors.display_name?.message ? (
            <span className={styles.error}>
              {errors.display_name.message}
            </span>
          ) : (
            <span className={styles.hint}>
              3вЂ“30 СЃРёРјРІРѕР»С–РІ. Р‘СѓРґРµ С‡Р°СЃС‚РёРЅРѕСЋ РїСѓР±Р»С–С‡РЅРѕРіРѕ РїСЂРѕС„С–Р»СЋ.
            </span>
          )}
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label htmlFor="profile-region" className={styles.label}>
            Р РµРіС–РѕРЅ
          </label>

          <select
            id="profile-region"
            {...register('region', {
              required: 'РћР±РµСЂС–С‚СЊ СЂРµРіС–РѕРЅ.',
            })}
            aria-invalid={Boolean(errors.region)}
            className={getInputClassName(Boolean(errors.region))}
          >
            <option value="" disabled>
              РћР±РµСЂС–С‚СЊ СЂРµРіС–РѕРЅ
            </option>

            {REGION_OPTIONS.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>

          {errors.region?.message ? (
            <span className={styles.error}>{errors.region.message}</span>
          ) : (
            <span className={styles.hint}>
              РћР±РµСЂС–С‚СЊ РѕР±Р»Р°СЃС‚СЊ, СЏРєСѓ С…РѕС‡РµС‚Рµ РїРѕРєР°Р·СѓРІР°С‚Рё РІ РїСЂРѕС„С–Р»С– Р°Р±Рѕ Р· СЏРєРѕС—
              Р·Р°Р·РІРёС‡Р°Р№ РІС–РґРїСЂР°РІР»СЏС”С‚Рµ.
            </span>
          )}
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label htmlFor="profile-about-me" className={styles.label}>
            РџСЂРѕ СЃРµР±Рµ
          </label>

          <textarea
            id="profile-about-me"
            {...register('about_me', {
              maxLength: {
                value: 355,
                message: 'РћРїРёСЃ РјР°С” Р±СѓС‚Рё РЅРµ РґРѕРІС€Рµ 355 СЃРёРјРІРѕР»С–РІ.',
              },
            })}
            rows={5}
            aria-invalid={Boolean(errors.about_me)}
            className={getTextareaClassName(Boolean(errors.about_me))}
          />

          {errors.about_me?.message ? (
            <span className={styles.error}>{errors.about_me.message}</span>
          ) : (
            <span className={styles.hint}>
              Р”Рѕ 355 СЃРёРјРІРѕР»С–РІ: СѓР»СЋР±Р»РµРЅС– РЅР°РїСЂСЏРјРё, СЃС‚РёР»СЊ, С‰Рѕ С€СѓРєР°С”С‚Рµ Р°Р±Рѕ С‡РёРј
              С†С–РєР°РІРёС‚РµСЃСЊ.
            </span>
          )}
        </div>
      </div>

      <div className={styles.formFooter}>
        <FormMessage message={message} ok={isSuccess} />

        <button
          type="submit"
          disabled={isPending || !isDirty || !isValid}
          className={styles.submitButton}
        >
          {isPending ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏ...' : 'Р—Р±РµСЂРµРіС‚Рё РїСЂРѕС„С–Р»СЊ'}
        </button>
      </div>
    </form>
  );
}
