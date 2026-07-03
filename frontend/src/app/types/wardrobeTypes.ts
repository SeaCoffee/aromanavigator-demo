import type { FragranceListItem } from '@/app/types/fragranceTypes';
import type { ID } from '@/app/types/http';

export type WardrobeStatus = 'own' | 'want' | 'had' | 'sample' | 'favorite';

export type WardrobeItem = {
  id: ID;
  fragrance: FragranceListItem;
  status: WardrobeStatus;
  status_label: string;
  rating: number | null;
  notes: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
};

export type WardrobeListQuery = {
  page?: number | string;
  page_size?: number | string;

  q?: string;
  search?: string;
  ordering?: string;

  status?: WardrobeStatus | string;
  status_in?: string;

  fragrance?: ID;
  fragrance_in?: string;

  brand?: ID;
  brand_in?: string;

  family?: ID;
  family_in?: string;

  note?: ID;
  note_in?: string;

  rating_min?: number | string;
  rating_max?: number | string;

  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
};

export type WardrobeCreatePayload = {
  fragrance_id: ID;
  status: WardrobeStatus;
  rating?: number | null;
  notes?: string | null;
  is_private?: boolean;
};

export type WardrobeUpdatePayload = Partial<WardrobeCreatePayload>;
