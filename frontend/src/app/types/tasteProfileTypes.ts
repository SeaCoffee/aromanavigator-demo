import type {
  Brand,
  CompactFragrance,
  ID,
  Note,
  OlfactoryFamily,
  Perfumer,
} from '@/app/types/fragranceTypes';

export type TasteAttitude = 'like' | 'dislike';
export type TasteSeason =
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'winter'
  | 'all_season';
export type TasteConcentration =
  | 'edc'
  | 'edt'
  | 'edp'
  | 'parfum'
  | 'extrait'
  | 'oil'
  | 'mist';
export type TasteFragranceMark = 'looking_for' | 'do_not_offer';
export type TastePriority = 'low' | 'normal' | 'high';

export type TasteShortBrand = Pick<Brand, 'id' | 'name' | 'slug' | 'country'>;
export type TasteShortNote = Pick<Note, 'id' | 'name' | 'slug'>;
export type TasteShortFamily = Pick<OlfactoryFamily, 'id' | 'name' | 'slug'>;
export type TasteShortPerfumer = Pick<Perfumer, 'id' | 'name'>;
export type TasteShortFragrance = CompactFragrance & {
  display_name: string;
};

export type TastePreferenceBase = {
  id: ID;
  attitude: TasteAttitude;
  attitude_label: string;
  comment: string;
  created_at: string;
  updated_at: string;
};

export type TasteFamilyPreference = TastePreferenceBase & {
  family: TasteShortFamily;
};

export type TasteNotePreference = TastePreferenceBase & {
  note: TasteShortNote;
};

export type TastePerfumerPreference = TastePreferenceBase & {
  perfumer: TasteShortPerfumer;
};

export type TasteBrandPreference = TastePreferenceBase & {
  brand: TasteShortBrand;
};

export type TasteSeasonPreference = TastePreferenceBase & {
  season: TasteSeason;
  season_label: string;
};

export type TasteConcentrationPreference = TastePreferenceBase & {
  concentration: TasteConcentration;
  concentration_label: string;
};

export type TasteFragrancePreference = {
  id: ID;
  fragrance: TasteShortFragrance;
  mark: TasteFragranceMark;
  mark_label: string;
  priority: TastePriority;
  priority_label: string;
  comment: string;
  created_at: string;
  updated_at: string;
};

export type TasteProfile = {
  id: ID;
  user_id: ID;
  display_name: string;
  is_public: boolean;
  about: string;
  family_preferences: TasteFamilyPreference[];
  note_preferences: TasteNotePreference[];
  perfumer_preferences: TastePerfumerPreference[];
  brand_preferences: TasteBrandPreference[];
  season_preferences: TasteSeasonPreference[];
  concentration_preferences: TasteConcentrationPreference[];
  fragrance_marks: TasteFragrancePreference[];
  created_at: string;
  updated_at: string;
};

export type TasteProfileUpdateInput = Partial<{
  is_public: boolean;
  about: string;
}>;

export type TastePreferenceKind =
  | 'families'
  | 'notes'
  | 'perfumers'
  | 'brands'
  | 'seasons'
  | 'concentrations'
  | 'fragrances';

export type TastePreferenceCreateInput =
  | {
      kind: 'families';
      family_id: ID;
      attitude: TasteAttitude;
      comment?: string;
    }
  | {
      kind: 'notes';
      note_id: ID;
      attitude: TasteAttitude;
      comment?: string;
    }
  | {
      kind: 'perfumers';
      perfumer_id: ID;
      attitude: TasteAttitude;
      comment?: string;
    }
  | {
      kind: 'brands';
      brand_id: ID;
      attitude: TasteAttitude;
      comment?: string;
    }
  | {
      kind: 'seasons';
      season: TasteSeason;
      attitude: TasteAttitude;
      comment?: string;
    }
  | {
      kind: 'concentrations';
      concentration: TasteConcentration;
      attitude: TasteAttitude;
      comment?: string;
    }
  | {
      kind: 'fragrances';
      fragrance_id: ID;
      mark: TasteFragranceMark;
      priority?: TastePriority;
      comment?: string;
    };

export type TastePreferenceUpdateInput = Partial<{
  family_id: ID;
  note_id: ID;
  perfumer_id: ID;
  brand_id: ID;
  season: TasteSeason;
  concentration: TasteConcentration;
  fragrance_id: ID;
  attitude: TasteAttitude;
  mark: TasteFragranceMark;
  priority: TastePriority;
  comment: string;
}>;

export type TasteProfileFormOptions = {
  brands: TasteShortBrand[];
  notes: TasteShortNote[];
  families: TasteShortFamily[];
  perfumers: TasteShortPerfumer[];
  fragrances: TasteShortFragrance[];
};
