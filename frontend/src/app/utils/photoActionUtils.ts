import { stringifyJson } from '@/app/utils/valueUtils';
import { getApiErrorMessage } from '@/errors/ApiError';
import { USER_ERROR_MESSAGES } from '@/errors/userFacingErrors';

export type PhotoActionResult<T = unknown> =
  | {
      ok: true;
      data: T;
      message?: string;
    }
  | {
      ok: false;
      error: string;
    };

export const PHOTO_INPUT_ACCEPT = 'image/jpeg,image/png,image/webp';
export const MAX_IMAGE_FILE_SIZE = 8 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_UPLOAD = 10;

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;
const MAX_REFRESH_PATHS = 10;
const REFRESH_PATHS_FIELD = '_refresh_paths';
const LEGACY_REVALIDATE_PATHS_FIELD = '_revalidate_paths';

function getFileExtension(file: File): string | null {
  const safeName = file.name.replaceAll('\\', '/').split('/').pop()?.trim();

  if (!safeName || !safeName.includes('.')) {
    return null;
  }

  return safeName.split('.').pop()?.toLowerCase() || null;
}

export function getActionErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, USER_ERROR_MESSAGES.generic);
}

export function isAllowedImageFile(file: File): boolean {
  if (!(file instanceof File) || file.size <= 0) {
    return false;
  }

  const ext = getFileExtension(file);

  return Boolean(
    ext &&
      ALLOWED_IMAGE_EXTENSIONS.includes(
        ext as (typeof ALLOWED_IMAGE_EXTENSIONS)[number],
      ),
  );
}

export function validateImageFile(file: File): string | null {
  if (!isAllowedImageFile(file)) {
    return 'РџС–РґС‚СЂРёРјСѓСЋС‚СЊСЃСЏ Р»РёС€Рµ JPG, PNG С‚Р° WebP.';
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return 'Р—РѕР±СЂР°Р¶РµРЅРЅСЏ РјР°С” Р±СѓС‚Рё РЅРµ Р±С–Р»СЊС€Рµ 8 РњР‘.';
  }

  return null;
}

export function normalizeRefreshPaths(paths: unknown): string[] {
  if (!Array.isArray(paths)) {
    return [];
  }

  return paths
    .filter((path): path is string => {
      return (
        typeof path === 'string' &&
        path.startsWith('/') &&
        !path.startsWith('//') &&
        !path.includes('\0')
      );
    })
    .slice(0, MAX_REFRESH_PATHS);
}

export function readRefreshPaths(formData: FormData): string[] {
  const raw =
    formData.get(REFRESH_PATHS_FIELD) ??
    formData.get(LEGACY_REVALIDATE_PATHS_FIELD);

  if (typeof raw !== 'string' || !raw.trim()) {
    return [];
  }

  try {
    return normalizeRefreshPaths(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function appendRefreshPaths(
  formData: FormData,
  paths?: string[] | null,
) {
  const cleanPaths = normalizeRefreshPaths(paths);

  if (cleanPaths.length > 0) {
    formData.set(REFRESH_PATHS_FIELD, stringifyJson(cleanPaths));
  }
}
