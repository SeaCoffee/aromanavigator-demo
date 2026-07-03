import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { isApiError } from '@/errors/ApiError';
import { firstError } from '@/errors/normalize';
import { USER_ERROR_MESSAGES, toUserFacingMessage } from '@/errors/userFacingErrors';

type AnyObj = Record<string, unknown>;

function getData(error: unknown): unknown {
  if (isApiError(error)) return error.data;

  const withData = error as { data?: unknown; response?: { data?: unknown } };
  return withData?.data ?? withData?.response?.data ?? null;
}

function hasRootKey(obj: AnyObj | null): boolean {
  if (!obj) return false;

  return (
    typeof obj.detail === 'string' ||
    typeof obj.message === 'string' ||
    Array.isArray(obj.non_field_errors) ||
    typeof obj.non_field_errors === 'string'
  );
}

export function applyServerErrorsToForm<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap: Partial<Record<Path<T>, string[]>> = {},
  fallback: string = USER_ERROR_MESSAGES.requestFailed,
) {
  const data = getData(error);
  const obj: AnyObj | null =
    data && typeof data === 'object' ? (data as AnyObj) : null;

  let anyFieldSet = false;

  if (obj) {
    for (const [formField, serverPath] of Object.entries(fieldMap) as Array<
      [Path<T>, string[]]
    >) {
      const msg = pickByPathList(obj, serverPath);

      if (msg) {
        setError(formField, {
          type: 'server',
          message: toUserFacingMessage(msg, fallback),
        });
        anyFieldSet = true;
      }
    }
  }

  if (!anyFieldSet || hasRootKey(obj)) {
    const rootMsg = firstError(data as never, fallback);

    setError('root' as Path<T>, {
      type: 'server',
      message: toUserFacingMessage(rootMsg, fallback),
    });
  }
}

function pickByPathList(obj: AnyObj, paths: string[]): string | undefined {
  for (const path of paths) {
    const value = getByPath(obj, path);
    const msg = firstError(value as never, '');

    if (msg) return msg;
  }

  return undefined;
}

function getByPath(obj: AnyObj, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = obj;

  for (const key of parts) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }

  return cur;
}
