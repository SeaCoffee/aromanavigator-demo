export type RegisterPayload = {
  email: string;
  password: string;
  profile: { name?: string; display_name?: string };
  terms_accepted: boolean;
};

export type RegisterFormValues = {
  email: string;
  password: string;
  name: string;
  display_name: string;
  termsAccepted: boolean;
};

export type FormBottleCreateValues = {
  fragrance_id: number | string;
  brand?: string;
  name?: string;
  concentration: string;
  bottle_volume_ml?: number;
  year_or_decade?: number;
  actual_volume_ml?: number;
  price_sale?: number;
  discount_price?: number;
  is_vintage: boolean;
  is_tester: boolean;
  is_sample: boolean;
  is_miniature: boolean;
  is_exchange_possible: boolean;
  is_limited_edition: boolean;
  notes?: string;

  full?: FileList;
  bottom?: FileList;
  laser?: FileList;
  sprayer?: FileList;

  in_set: boolean;
  set_type?: string | null;
};

export type BottleEditValues = {
  fragrance_id: number | string;
  brand: string;
  name: string;
  concentration: string;
  bottle_volume_ml: number;
  year_or_decade?: number;
  actual_volume_ml: number;
  price_sale: number;
  discount_price?: number;
  is_vintage: boolean;
  is_tester: boolean;
  is_sample: boolean;
  is_miniature: boolean;
  is_exchange_possible: boolean;
  is_limited_edition: boolean;
  notes?: string;

  in_set: boolean;
  set_type?: string | null;
};

export type ProfileForm = {
  name: string;
  display_name: string;
  region: string;
  about_me: string;
};

export type UpdateProfilePayload = {
  profile: ProfileForm;
};

export type ChangePasswordFormValues = {
  old_password: string;
  new_password: string;
  confirm: string;
};

export type ResetFormValues = {
  password: string;
  password2: string;
};

export type ProfileInput = {
  name?: string;
  display_name?: string;
  region?: string;
};
