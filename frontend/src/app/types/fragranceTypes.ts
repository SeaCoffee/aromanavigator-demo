import type { ID, Paginated, QueryOf } from '@/app/types/http';
import type { ObjectCover } from '@/app/types/photoTypes';

export type { ID, Paginated };

export type NoteLevel = 'top' | 'heart' | 'base';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export type FragranceOrdering =
  | 'created_at'
  | '-created_at'
  | 'updated_at'
  | '-updated_at'
  | 'likes'
  | '-likes'
  | 'name'
  | '-name'
  | 'brand'
  | '-brand'
  | 'year'
  | '-year';

export type SuggestionOrdering =
  | 'created_at'
  | '-created_at'
  | 'score'
  | '-score';

export type AddRequestOrdering =
  | 'created_at'
  | '-created_at'
  | 'updated_at'
  | '-updated_at'
  | 'brand'
  | '-brand'
  | 'name'
  | '-name';

export type Brand = {
  id: ID;
  name: string;
  slug: string;
  country: string;
  created_at: string;
  updated_at: string;
};

export type Perfumer = {
  id: ID;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: ID;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type OlfactoryFamily = {
  id: ID;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type CompactBrand = Pick<Brand, 'id' | 'name' | 'slug'>;

export type CompactFragrance = {
  id: ID;
  name: string;
  slug: string;
  release_year: number | null;
  brand: CompactBrand;
};

export type CompactNote = Pick<Note, 'id' | 'name' | 'slug'>;

export type OfficialNote = {
  id: ID;
  name: string;
  slug: string;
  position: number;
  level: NoteLevel;
};

export type FragranceListItem = {
  id: ID;
  brand: Brand;
  name: string;
  slug: string;
  release_year: number | null;
  cover_image: string | null;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
};

export type FragranceDetail = FragranceListItem & {
  cover: ObjectCover | null;
  perfumers: Perfumer[];
  families: OlfactoryFamily[];
  official_notes: OfficialNote[];
};

export type DictionaryQuery = QueryOf<{
  page: number;
  page_size: number;
  search: string;
  ordering: string;
}>;

export type FragranceListQuery = QueryOf<{
  page: number;
  page_size: number;

  fragrance_id: ID;
  name: string;

  brand: ID;
  note: ID;
  note_level: NoteLevel;
  family: ID;
  perfumer: ID;
  year_from: number;
  year_to: number;
  q: string;
  ordering: FragranceOrdering;
}>;

export type FragranceCreateInput = {
  brand_id: ID;
  name: string;
  slug?: string;
  release_year?: number | null;
};

export type FragranceUpdateInput = Partial<FragranceCreateInput>;

export type BrandCreateInput = {
  name: string;
  country?: string;
};

export type PerfumerCreateInput = {
  name: string;
};

export type NoteCreateInput = {
  name: string;
};

export type OlfactoryFamilyCreateInput = {
  name: string;
};

export type OfficialPerfumerInput = {
  perfumer_id: ID;
};

export type OfficialFamilyInput = {
  family_id: ID;
};

export type OfficialNoteInput = {
  note_id: ID;
  level?: NoteLevel;
  position?: number;
};

export type OfficialNoteMetaInput = {
  level?: NoteLevel;
  position?: number;
};

export type NoteSuggestionCreateInput = {
  note_id: ID;
  level?: NoteLevel;
};

export type NoteSuggestion = {
  id: ID;
  fragrance_id: ID;
  fragrance: CompactFragrance;
  note_id: ID;
  note: CompactNote;
  created_by_id: ID;
  level: NoteLevel;
  status: ModerationStatus;
  moderator_comment: string;
  score: number;
  created_at: string;
  updated_at: string;
};

export type SimilaritySuggestionCreateInput = {
  similar_fragrance_id: ID;
};

export type SimilaritySuggestion = {
  id: ID;
  fragrance_id: ID;
  fragrance: CompactFragrance;
  similar_fragrance_id: ID;
  similar_fragrance: CompactFragrance;
  created_by_id: ID;
  status: ModerationStatus;
  moderator_comment: string;
  score: number;
  created_at: string;
  updated_at: string;
};

export type VoteInput = {
  value: 1 | -1;
};

export type VoteResponse = {
  ok: true;
  vote_id: ID;
  value: 1 | -1;
};

export type NoteSuggestionQuery = QueryOf<{
  page: number;
  page_size: number;
  level: NoteLevel;
  status: ModerationStatus;
  ordering: SuggestionOrdering;
}>;

export type SimilaritySuggestionQuery = QueryOf<{
  page: number;
  page_size: number;
  status: ModerationStatus;
  ordering: SuggestionOrdering;
}>;

export type AdminSuggestionQuery = QueryOf<{
  page: number;
  page_size: number;
  level: NoteLevel;
  status: ModerationStatus;
  ordering: SuggestionOrdering;
}>;

export type FragranceAddRequestCreateInput = {
  brand_name: string;
  fragrance_name: string;
  release_year?: number | null;
  perfumers_text?: string;
  notes_text?: string;
  families_text?: string;
  links_text?: string;
};

export type FragranceAddRequest = {
  id: ID;
  created_by_id: ID;
  processed_by_id: ID | null;
  brand_name: string;
  fragrance_name: string;
  release_year: number | null;
  perfumers_text: string;
  notes_text: string;
  families_text: string;
  links_text: string;
  status: ModerationStatus;
  moderator_comment: string;
  created_fragrance_id: ID | null;
  created_fragrance: CompactFragrance | null;
  created_at: string;
  updated_at: string;
};

export type AddRequestQuery = QueryOf<{
  page: number;
  page_size: number;
  status: ModerationStatus;
  q: string;
  ordering: AddRequestOrdering;
}>;

export type ModerationStatusInput = {
  status: ModerationStatus;
  moderator_comment?: string;
};

export type AttachCreatedFragranceInput = {
  fragrance_id: ID;
  moderator_comment?: string;
};

export type FragranceAddRequestCreateFragranceApproveInput = {
  brand_id: ID;
  name: string;
  slug?: string;
  release_year?: number | null;
  perfumer_ids?: ID[];
  family_ids?: ID[];
  top_note_ids?: ID[];
  heart_note_ids?: ID[];
  base_note_ids?: ID[];
  moderator_comment?: string;
};

export type FragranceAddRequestStaffUpdateInput = Partial<{
  brand_name: string;
  fragrance_name: string;
  release_year: number | null;
  perfumers_text: string;
  notes_text: string;
  families_text: string;
  links_text: string;
  moderator_comment: string;
}>;


export type ActionErrorMessage = string | string[] | Record<string, unknown>;

export type ActionSuccess<T = void> = {
  ok: true;
  data?: T;
  msg?: string;
};

export type ActionFailure = {
  ok: false;
  msg: ActionErrorMessage;
};

export type ActionResult<T = void> = ActionSuccess<T> | ActionFailure;

export type FragranceListSearchParams = {
  page?: string;
  page_size?: string;

  fragrance_id?: string;
  name?: string;

  ordering?: string;
  brand?: string;
  note?: string | string[];
  note_level?: string;
  family?: string | string[];
  perfumer?: string | string[];
  year_from?: string;
  year_to?: string;
  q?: string;
};

export type DictionaryOption = {
  id: ID;
  label: string;
  name: string;
  slug?: string;
};

export type FragranceOption = {
  id: ID;
  label: string;
  name: string;
  slug: string;
  release_year: number | null;
  brand_id: ID;
  brand_name: string;
};

export type AddRequestFormValues = {
  brand_name: string;
  fragrance_name: string;
  release_year: string;
  perfumers_text: string;
  top_notes: string;
  heart_notes: string;
  base_notes: string;
  families_text: string;
  links_text: string;
};
