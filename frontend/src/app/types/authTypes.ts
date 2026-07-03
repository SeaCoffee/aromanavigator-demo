import type { UserMe } from "@/app/types/userTypes";

export interface Tokens {
  access: string;
  refresh: string;
}

export interface RefreshResponse {
  access: string;
  refresh?: string;
}

export interface ApiMessage {
  detail?: string;
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterProfilePayload {
  name: string;
  display_name: string;
  region?: string;
  about_me?: string | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  profile: RegisterProfilePayload;
  terms_accepted: boolean;
}

export interface GoogleLoginPayload {
  id_token: string;
}

export interface RecoveryRequestPayload {
  email: string;
}

export interface RecoveryResetPayload {
  password: string;
  password_repeat?: string;
}

export type ActivateAccountResponse = UserMe;

export type RecoveryTokenCheckResponse = ApiMessage;

export type RecoveryResetResponse = ApiMessage;

export interface AuthSuccessResponse extends ApiMessage {
  user?: UserMe | null;
  created?: boolean;
}

export type ActionMessage = string | string[] | Record<string, unknown>;

export type ActionState<TData = unknown> =
  | {
      ok: true;
      msg?: string;
      data?: TData;
    }
  | {
      ok: false;
      msg: ActionMessage;
    };
