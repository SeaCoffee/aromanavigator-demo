import type { ID, QueryOf } from '@/app/types/http';

export type ReviewRole = 'seller' | 'buyer';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type ReviewCreatePayload = {
  order_id: ID;
  rating: number;
  title?: string;
  body?: string;
};

export type Review = {
  id: ID;
  order_id: ID;
  order_number: string;
  author_id: ID;
  subject_id: ID;
  role: ReviewRole;
  rating: number;
  title: string;
  body: string;
  is_public: boolean;
  status: ReviewStatus;
  reject_reason: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RatingBucket = {
  avg: string;
  count: number;
};

export type UserRatingSummary = {
  seller: RatingBucket;
  buyer: RatingBucket;
  overall: RatingBucket;
};

export type ReviewListQuery = QueryOf<{
  page: number;
  page_size: number;
  search: string;
  ordering: 'created_at' | '-created_at' | 'rating' | '-rating' | string;
  role: ReviewRole;
  status: ReviewStatus;
  rating: number;
  min_rating: number;
  max_rating: number;
  order: ID;
  author: ID;
  subject: ID;
  created_from: string;
  created_to: string;
}>;
