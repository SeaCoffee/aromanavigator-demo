// frontend/src/app/services/authServices.ts

import { anonApi } from '@/app/services/userApi';
import { authAnonApiUrlBuilder } from '@/app/urls/authAnonApiUrlBuilder';
import type {
  ActivateAccountResponse,
  ApiMessage,
  RecoveryRequestPayload,
  RecoveryResetPayload,
  RecoveryResetResponse,
  RecoveryTokenCheckResponse,
  RegisterPayload,
} from '@/app/types/authTypes';
import type { UserMe } from '@/app/types/userTypes';

export function register(payload: RegisterPayload) {
  return anonApi.post<UserMe, RegisterPayload>(
    authAnonApiUrlBuilder.register(),
    {
      json: payload,
    },
  );
}

export function activateAccount(token: string) {
  return anonApi.get<ActivateAccountResponse>(
    authAnonApiUrlBuilder.activate(token),
  );
}

export function recoveryRequest(payload: RecoveryRequestPayload) {
  return anonApi.post<ApiMessage, RecoveryRequestPayload>(
    authAnonApiUrlBuilder.recovery.request(),
    {
      json: payload,
    },
  );
}

export function recoveryTokenCheck(token: string) {
  return anonApi.get<RecoveryTokenCheckResponse>(
    authAnonApiUrlBuilder.recovery.withToken(token),
  );
}

export function recoveryReset(token: string, payload: RecoveryResetPayload) {
  return anonApi.post<RecoveryResetResponse, RecoveryResetPayload>(
    authAnonApiUrlBuilder.recovery.withToken(token),
    {
      json: payload,
    },
  );
}
