// src/errors/serverI18nUa.ts
import { USER_ERROR_MESSAGES, toUserFacingMessage } from '@/errors/userFacingErrors';

export function localizeServerMessageUa(input: string): string {
  return toUserFacingMessage(input, USER_ERROR_MESSAGES.generic);
}
