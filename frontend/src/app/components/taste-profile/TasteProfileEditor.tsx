'use client';

import { useActionState } from 'react';

import {
  createTastePreferenceAction,
  updateTasteProfileAction,
} from '@/app/actions/tasteProfileActions';
import {
  TASTE_ATTITUDE_OPTIONS,
  TASTE_CONCENTRATION_OPTIONS,
  TASTE_FRAGRANCE_MARK_OPTIONS,
  TASTE_PRIORITY_OPTIONS,
  TASTE_SEASON_OPTIONS,
} from '@/app/constants/tasteProfileOptions';
import { tasteProfileStyles as s } from '@/app/components/taste-profile/tasteProfile.styles';
import { tasteActionMessage } from '@/app/components/taste-profile/tasteProfileFormatters';
import type { ActionResult } from '@/app/types/fragranceTypes';
import type {
  TastePreferenceKind,
  TasteProfile,
  TasteProfileFormOptions,
} from '@/app/types/tasteProfileTypes';

type Option = {
  value: string | number;
  label: string;
};

type AddPreferenceConfig = {
  kind: TastePreferenceKind;
  title: string;
  entityLabel: string;
  options: Option[];
  mode: 'attitude' | 'fragrance';
};

type Props = {
  profile: TasteProfile;
  options: TasteProfileFormOptions;
};

function Message({ state }: { state: ActionResult | null }) {
  const message = tasteActionMessage(state);

  if (!message) return null;

  return <p className={state?.ok ? s.success : s.error}>{message}</p>;
}

function optionFromLabel(value: string, label: string): Option {
  return { value, label };
}

function AddPreferenceForm({ config }: { config: AddPreferenceConfig }) {
  const [state, formAction, pending] = useActionState(
    createTastePreferenceAction,
    null,
  );

  return (
    <details className={s.addDetails}>
      <summary className={s.addSummary}>
        <span>{config.title}</span>
        <span className={s.addSummaryMeta}>РґРѕРґР°С‚Рё</span>
      </summary>

      <form action={formAction} className={s.inlineForm}>
        <input name="kind" type="hidden" value={config.kind} />

        <label className={s.label}>
          {config.entityLabel}
          <select className={s.select} name="entity_id" required>
            <option value="">РћР±РµСЂС–С‚СЊ Р·РЅР°С‡РµРЅРЅСЏ</option>
            {config.options.map((option) => (
              <option key={String(option.value)} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {config.mode === 'attitude' ? (
          <label className={s.label}>
            РЎС‚Р°РІР»РµРЅРЅСЏ
            <select className={s.select} name="attitude" required>
              {TASTE_ATTITUDE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label className={s.label}>
              РџРѕР·РЅР°С‡РєР°
              <select className={s.select} name="mark" required>
                {TASTE_FRAGRANCE_MARK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={s.label}>
              РџСЂС–РѕСЂРёС‚РµС‚
              <select className={s.select} name="priority" defaultValue="normal">
                {TASTE_PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        <label className={s.label}>
          РљРѕРјРµРЅС‚Р°СЂ
          <input
            className={s.input}
            maxLength={255}
            name="comment"
            placeholder="РќРµРѕР±РѕРІКјСЏР·РєРѕРІРѕ"
            type="text"
          />
        </label>

        <Message state={state} />

        <button className={s.primaryButton} disabled={pending} type="submit">
          {pending ? 'Р”РѕРґР°РІР°РЅРЅСЏ...' : 'Р”РѕРґР°С‚Рё'}
        </button>
      </form>
    </details>
  );
}

export default function TasteProfileEditor({ profile, options }: Props) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateTasteProfileAction,
    null,
  );

  const addConfigs: AddPreferenceConfig[] = [
    {
      kind: 'families',
      title: 'РЎС–РјРµР№СЃС‚РІРѕ',
      entityLabel: 'РЎС–РјРµР№СЃС‚РІРѕ',
      mode: 'attitude',
      options: options.families.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    },
    {
      kind: 'notes',
      title: 'РќРѕС‚Р°',
      entityLabel: 'РќРѕС‚Р°',
      mode: 'attitude',
      options: options.notes.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    },
    {
      kind: 'brands',
      title: 'Р‘СЂРµРЅРґ',
      entityLabel: 'Р‘СЂРµРЅРґ',
      mode: 'attitude',
      options: options.brands.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    },
    {
      kind: 'perfumers',
      title: 'РџР°СЂС„СѓРјРµСЂ',
      entityLabel: 'РџР°СЂС„СѓРјРµСЂ',
      mode: 'attitude',
      options: options.perfumers.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    },
    {
      kind: 'seasons',
      title: 'РЎРµР·РѕРЅ',
      entityLabel: 'РЎРµР·РѕРЅ',
      mode: 'attitude',
      options: TASTE_SEASON_OPTIONS.map((item) =>
        optionFromLabel(item.value, item.label),
      ),
    },
    {
      kind: 'concentrations',
      title: 'РљРѕРЅС†РµРЅС‚СЂР°С†С–СЏ',
      entityLabel: 'РљРѕРЅС†РµРЅС‚СЂР°С†С–СЏ',
      mode: 'attitude',
      options: TASTE_CONCENTRATION_OPTIONS.map((item) =>
        optionFromLabel(item.value, item.label),
      ),
    },
    {
      kind: 'fragrances',
      title: 'РћРєСЂРµРјРёР№ Р°СЂРѕРјР°С‚',
      entityLabel: 'РђСЂРѕРјР°С‚',
      mode: 'fragrance',
      options: options.fragrances.map((item) => ({
        value: item.id,
        label: item.display_name,
      })),
    },
  ];

  return (
    <section className={s.editorShell}>
      <div className={s.panelHeader}>
        <h2 className={s.panelTitle}>РќР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ РїСЂРѕС„С–Р»СЋ</h2>

        <p className={s.muted}>
          РўСѓС‚ Р·РјС–РЅСЋС”С‚СЊСЃСЏ РѕРїРёСЃ СЃРјР°РєС–РІ С– РґРѕРґР°СЋС‚СЊСЃСЏ РЅРѕРІС– РїРѕР·РЅР°С‡РєРё. РЈР¶Рµ РґРѕРґР°РЅС–
          РµР»РµРјРµРЅС‚Рё РїРѕРєР°Р·Р°РЅС– РІРёС‰Рµ РєРѕРјРїР°РєС‚РЅРёРјРё С‡РёРїР°РјРё, С—С… РјРѕР¶РЅР° РІРёРґР°Р»СЏС‚Рё РїСЂСЏРјРѕ
          С‚Р°Рј.
        </p>
      </div>

      <form action={profileAction} className={s.editorBlock}>
        <label className={s.checkbox}>
          <input
            defaultChecked={profile.is_public}
            name="is_public"
            type="checkbox"
            value="1"
          />
          РџРѕРєР°Р·СѓРІР°С‚Рё РїСЂРѕС„С–Р»СЊ РїСѓР±Р»С–С‡РЅРѕ
        </label>

        <label className={s.label}>
          РџСЂРѕ РјРѕС— СЃРјР°РєРё
          <textarea
            className={s.textarea}
            defaultValue={profile.about ?? ''}
            maxLength={700}
            name="about"
            placeholder="РќР°РїСЂРёРєР»Р°Рґ: Р»СЋР±Р»СЋ Р·РµР»РµРЅС–, С‡Р°Р№РЅС– Р№ РґРµСЂРµРІРЅС– Р°СЂРѕРјР°С‚Рё; РЅРµ РґСѓР¶Рµ Р»СЋР±Р»СЋ РІР°Р¶РєСѓ РіСѓСЂРјР°РЅС–РєСѓ..."
          />
        </label>

        <Message state={profileState} />

        <button className={s.primaryButton} disabled={profilePending} type="submit">
          {profilePending ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏ...' : 'Р—Р±РµСЂРµРіС‚Рё РѕРїРёСЃ'}
        </button>
      </form>

      <div className={s.preferenceGroup}>
        <div className={s.panelHeader}>
          <h3 className={s.groupTitle}>Р”РѕРґР°С‚Рё РґРѕ РїСЂРѕС„С–Р»СЋ</h3>
          <p className={s.smallMuted}>
            Р РѕР·РєСЂРёР№С‚Рµ РїРѕС‚СЂС–Р±РЅРёР№ С‚РёРї С– РґРѕРґР°Р№С‚Рµ СЃС–РјРµР№СЃС‚РІРѕ, РЅРѕС‚Сѓ, Р±СЂРµРЅРґ,
            РїР°СЂС„СѓРјРµСЂР°, СЃРµР·РѕРЅ, РєРѕРЅС†РµРЅС‚СЂР°С†С–СЋ Р°Р±Рѕ РѕРєСЂРµРјРёР№ Р°СЂРѕРјР°С‚.
          </p>
        </div>

        <div className={s.addGrid}>
          {addConfigs.map((config) => (
            <AddPreferenceForm config={config} key={config.kind} />
          ))}
        </div>
      </div>
    </section>
  );
}
