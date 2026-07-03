import 'server-only';

import { requireUserOrRedirect } from '@/app/lib/session';
import { ApiError } from '@/errors/ApiError';

function isAuthError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export async function resolveProtectedPageData<T>(
  load: () => Promise<T>,
): Promise<T> {
  await requireUserOrRedirect();

  try {
    return await load();
  } catch (error) {
    if (isAuthError(error)) {
      await requireUserOrRedirect();
    }

    throw error;
  }
}
