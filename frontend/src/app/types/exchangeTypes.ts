import type { Paginated } from '@/app/types/http';

export type ExchangeStatus = 'pending' | 'accepted' | 'rejected' | 'canceled';

export type ExchangeItemType = 'wardrobe';

export type ExchangeItemPayload = {
  type: ExchangeItemType;
  id: number;
  note?: string;
  brand?: string;
  name?: string;
  title?: string;
  subtitle?: string;
};

export type ExchangeCreateLimits = {
  max_pending_per_owner: number;
  pending_to_owner_count: number;
  remaining_pending_to_owner: number;
  max_offered_items: number;
};

export type ExchangeCreateFormResponse = {
  requested: ExchangeSimpleItem;
  items: ExchangeFormItemGroups;
  limits: ExchangeCreateLimits;
};

export type ExchangeRequestedShort = {
  type: ExchangeItemType;
  id: number;
  owner_id: number | null;
  brand?: string;
  name?: string;
  title?: string;
  subtitle?: string;
};

export type ExchangeUserShort = {
  id: number | null;
  display_name: string;
  avatar_url?: string | null;
};

export type ExchangeProposal = {
  id: number;

  proposer: ExchangeUserShort;
  owner: ExchangeUserShort;

  status: ExchangeStatus;
  message: string;

  requested: ExchangeRequestedShort;
  offer_all: boolean;
  offered_items: ExchangeItemPayload[];

  accepted_items: ExchangeItemPayload[];
  decision_note: string;

  created_at: string;
  updated_at: string;
};

export type ExchangeListResponse =
  | Paginated<ExchangeProposal>
  | {
      total_items: number;
      total_pages: number;
      prev: boolean;
      next: boolean;
      results: ExchangeProposal[];
    }
  | ExchangeProposal[];

export type ExchangeCreatePayload = {
  requested_type: ExchangeItemType;
  requested_id: number;
  owner_id: number;
  offer_all: boolean;
  offered_items?: ExchangeItemPayload[];
  message?: string;
};

export type ExchangeAcceptPayload = {
  accepted_items: ExchangeItemPayload[];
  decision_note?: string;
};

export type ExchangeRejectPayload = {
  decision_note?: string;
};

export type ExchangeCancelPayload = {
  decision_note?: string;
};

export const EXCHANGE_ITEM_TYPES: ExchangeItemType[] = [
  'wardrobe',
];

export type ExchangeSimpleItem = {
  id: number;
  type?: ExchangeItemType;
  fragrance_id?: number | null;
  brand: string;
  name: string;
  title?: string;
  subtitle?: string;
  is_exchange_possible?: boolean;
};

export type ExchangeFormItemGroups = {
  wardrobe: ExchangeSimpleItem[];
};
