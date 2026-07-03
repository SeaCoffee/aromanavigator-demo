import type { PhotoTarget } from '@/app/types/photoTypes';

const TARGET_RE = /^[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*:\d+$/;

export function photoTargetToFormValue(target: PhotoTarget): string {
  return `${target.app}.${target.model}:${target.id}`;
}

export function isPhotoTargetFormValue(value: unknown): value is string {
  return typeof value === 'string' && TARGET_RE.test(value);
}

export function appendPhotoTarget(formData: FormData, target: PhotoTarget) {
  formData.set('target', photoTargetToFormValue(target));
}
