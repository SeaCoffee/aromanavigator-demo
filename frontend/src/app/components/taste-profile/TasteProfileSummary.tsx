import { deleteTastePreferenceFormAction } from '@/app/actions/tasteProfileActions';
import { tasteProfileStyles as s } from '@/app/components/taste-profile/tasteProfile.styles';
import {
  tasteAttitudeLabel,
  tasteConcentrationLabel,
  tasteFragranceMarkLabel,
  tastePriorityLabel,
  tasteSeasonLabel,
} from '@/app/components/taste-profile/tasteProfileFormatters';
import type {
  TastePreferenceKind,
  TasteProfile,
} from '@/app/types/tasteProfileTypes';

type Props = {
  profile: TasteProfile;
  editable?: boolean;
};

type CompactPreferenceItem = {
  id: string | number;
  title: string;
  laneLabel: string;
  badges: string[];
  comment?: string | null;
  kind: TastePreferenceKind;
};

type PreferenceLane = {
  label: string;
  items: CompactPreferenceItem[];
};

function kindIcon(kind: TastePreferenceKind) {
  const icons: Partial<Record<TastePreferenceKind, string>> = {
    families: 'в—‡',
    notes: 'вњ¦',
    brands: 'B',
    perfumers: 'P',
    seasons: 'вј',
    concentrations: '%',
    fragrances: 'в—Ћ',
  };

  return icons[kind] ?? 'вЂў';
}

function groupByLane(items: CompactPreferenceItem[]): PreferenceLane[] {
  const map = new Map<string, CompactPreferenceItem[]>();

  items.forEach((item) => {
    const key = item.laneLabel || 'Р†РЅС€Рµ';
    const current = map.get(key) ?? [];

    current.push(item);
    map.set(key, current);
  });

  return Array.from(map.entries()).map(([label, laneItems]) => ({
    label,
    items: laneItems,
  }));
}

function getChipClassName(dense: boolean) {
  return dense ? `${s.preferenceChip} ${s.preferenceChipDense}` : s.preferenceChip;
}

function getChipIconClassName(dense: boolean) {
  return dense
    ? `${s.preferenceChipIcon} ${s.preferenceChipIconDense}`
    : s.preferenceChipIcon;
}

function getChipTextClassName(dense: boolean) {
  return dense
    ? `${s.preferenceChipText} ${s.preferenceChipTextDense}`
    : s.preferenceChipText;
}

function PreferenceChip({
  item,
  editable,
  dense,
}: {
  item: CompactPreferenceItem;
  editable: boolean;
  dense: boolean;
}) {
  return (
    <div className={getChipClassName(dense)}>
      <span className={getChipIconClassName(dense)}>{kindIcon(item.kind)}</span>

      <span className={getChipTextClassName(dense)} title={item.title}>
        {item.title}
      </span>

      {item.badges.map((badge) => (
        <span className={s.preferenceChipMeta} key={`${item.id}-${badge}`}>
          {badge}
        </span>
      ))}

      {item.comment ? (
        <span className={s.preferenceChipNote} title={item.comment}>
          вњЋ
        </span>
      ) : null}

      {editable ? (
        <form action={deleteTastePreferenceFormAction} className={s.chipRemoveForm}>
          <input name="kind" type="hidden" value={item.kind} />
          <input name="item_id" type="hidden" value={item.id} />

          <button
            aria-label={`Р’РёРґР°Р»РёС‚Рё ${item.title}`}
            className={s.chipRemoveButton}
            title="Р’РёРґР°Р»РёС‚Рё"
            type="submit"
          >
            Г—
          </button>
        </form>
      ) : null}
    </div>
  );
}

function PreferenceGroup({
  title,
  icon,
  items,
  editable,
  dense = false,
  defaultOpen,
}: {
  title: string;
  icon: string;
  items: CompactPreferenceItem[];
  editable: boolean;
  dense?: boolean;
  defaultOpen?: boolean;
}) {
  if (!items.length) return null;

  const lanes = groupByLane(items);
  const shouldOpen = defaultOpen ?? items.length <= 24;

  return (
    <details className={s.detailsGroup} open={shouldOpen}>
      <summary className={s.detailsSummary}>
        <span className={s.detailsSummaryLeft}>
          <span className={s.detailsIcon}>{icon}</span>
          <span className={s.detailsTitle}>{title}</span>
        </span>

        <span className={s.detailsCount}>{items.length}</span>
      </summary>

      <div className={s.preferenceLanes}>
        {lanes.map((lane) => (
          <section className={s.preferenceLane} key={`${title}-${lane.label}`}>
            <div className={s.preferenceLaneHeader}>
              <h4 className={s.preferenceLaneTitle}>{lane.label}</h4>
              <span className={s.preferenceLaneCount}>{lane.items.length}</span>
            </div>

            <div className={dense ? s.compactItemsDense : s.compactItems}>
              {lane.items.map((item) => (
                <PreferenceChip
                  dense={dense}
                  editable={editable}
                  item={item}
                  key={`${item.kind}-${item.id}`}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </details>
  );
}

export default function TasteProfileSummary({ profile, editable = false }: Props) {
  const familyItems: CompactPreferenceItem[] = profile.family_preferences.map(
    (item) => ({
      id: item.id,
      title: item.family.name,
      laneLabel: tasteAttitudeLabel(item.attitude),
      badges: [],
      comment: item.comment,
      kind: 'families',
    }),
  );

  const noteItems: CompactPreferenceItem[] = profile.note_preferences.map(
    (item) => ({
      id: item.id,
      title: item.note.name,
      laneLabel: tasteAttitudeLabel(item.attitude),
      badges: [],
      comment: item.comment,
      kind: 'notes',
    }),
  );

  const brandItems: CompactPreferenceItem[] = profile.brand_preferences.map(
    (item) => ({
      id: item.id,
      title: item.brand.name,
      laneLabel: tasteAttitudeLabel(item.attitude),
      badges: [],
      comment: item.comment,
      kind: 'brands',
    }),
  );

  const perfumerItems: CompactPreferenceItem[] = profile.perfumer_preferences.map(
    (item) => ({
      id: item.id,
      title: item.perfumer.name,
      laneLabel: tasteAttitudeLabel(item.attitude),
      badges: [],
      comment: item.comment,
      kind: 'perfumers',
    }),
  );

  const seasonItems: CompactPreferenceItem[] = profile.season_preferences.map(
    (item) => ({
      id: item.id,
      title: tasteSeasonLabel(item.season),
      laneLabel: tasteAttitudeLabel(item.attitude),
      badges: [],
      comment: item.comment,
      kind: 'seasons',
    }),
  );

  const concentrationItems: CompactPreferenceItem[] =
    profile.concentration_preferences.map((item) => ({
      id: item.id,
      title: tasteConcentrationLabel(item.concentration),
      laneLabel: tasteAttitudeLabel(item.attitude),
      badges: [],
      comment: item.comment,
      kind: 'concentrations',
    }));

  const fragranceItems: CompactPreferenceItem[] = profile.fragrance_marks.map(
    (item) => ({
      id: item.id,
      title: item.fragrance.display_name,
      laneLabel: tasteFragranceMarkLabel(item.mark),
      badges: [tastePriorityLabel(item.priority)],
      comment: item.comment,
      kind: 'fragrances',
    }),
  );

  const empty =
    familyItems.length +
      noteItems.length +
      brandItems.length +
      perfumerItems.length +
      seasonItems.length +
      concentrationItems.length +
      fragranceItems.length ===
    0;

  return (
    <section className={s.panel}>
      <div className={s.panelHeader}>
        <h2 className={s.panelTitle}>РЎРјР°РєРѕРІРёР№ РїРѕСЂС‚СЂРµС‚</h2>

        <p className={s.summaryAbout}>
          {profile.about ||
            (editable
              ? 'РћРїРёС€С–С‚СЊ, СЏРєС– Р°СЂРѕРјР°С‚Рё РІР°Рј Р±Р»РёР·СЊРєС–, С‰Рѕ С€СѓРєР°С”С‚Рµ С– С‡РѕРіРѕ РєСЂР°С‰Рµ РЅРµ РїСЂРѕРїРѕРЅСѓРІР°С‚Рё.'
              : 'РљРѕСЂРёСЃС‚СѓРІР°С‡ РїРѕРєРё РЅРµ РґРѕРґР°РІ РѕРїРёСЃ СЃРјР°РєС–РІ.')}
        </p>
      </div>

      <div className={s.sections}>
        <PreferenceGroup
          editable={editable}
          icon="в—‡"
          items={familyItems}
          title="РћР»СЊС„Р°РєС‚РѕСЂРЅС– СЃС–РјРµР№СЃС‚РІР°"
        />

        <PreferenceGroup
          editable={editable}
          icon="вњ¦"
          items={noteItems}
          title="РќРѕС‚Рё"
        />

        <PreferenceGroup
          editable={editable}
          icon="B"
          items={brandItems}
          title="Р‘СЂРµРЅРґРё"
        />

        <PreferenceGroup
          editable={editable}
          icon="P"
          items={perfumerItems}
          title="РџР°СЂС„СѓРјРµСЂРё"
        />

        <PreferenceGroup
          editable={editable}
          icon="вј"
          items={seasonItems}
          title="РЎРµР·РѕРЅРё"
        />

        <PreferenceGroup
          editable={editable}
          icon="%"
          items={concentrationItems}
          title="РљРѕРЅС†РµРЅС‚СЂР°С†С–С—"
        />

        <PreferenceGroup
          dense
          defaultOpen={fragranceItems.length <= 12}
          editable={editable}
          icon="в—Ћ"
          items={fragranceItems}
          title="РћРєСЂРµРјС– Р°СЂРѕРјР°С‚Рё"
        />

        {empty ? (
          <div className={s.empty}>
            {editable
              ? 'РџРѕРєРё РЅРµРјР°С” Р¶РѕРґРЅРѕРіРѕ РµР»РµРјРµРЅС‚Р°. Р”РѕРґР°Р№С‚Рµ СЃС–РјРµР№СЃС‚РІР°, РЅРѕС‚Рё, Р±СЂРµРЅРґРё, РїР°СЂС„СѓРјРµСЂС–РІ Р°Р±Рѕ РѕРєСЂРµРјС– Р°СЂРѕРјР°С‚Рё РЅРёР¶С‡Рµ.'
              : 'РџСѓР±Р»С–С‡РЅРёС… СЃРјР°РєРѕРІРёС… РїРѕР·РЅР°С‡РѕРє РїРѕРєРё РЅРµРјР°С”.'}
          </div>
        ) : null}
      </div>
    </section>
  );
}
