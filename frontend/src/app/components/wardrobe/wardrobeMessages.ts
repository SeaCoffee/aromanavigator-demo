import { formatKeyedMessage } from '@/app/utils/messageUtils';

export function messageToText(message: unknown): string {
  return formatKeyedMessage(message, 'РџРѕРјРёР»РєР°.');
}
