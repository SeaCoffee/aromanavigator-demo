// frontend/src/app/utils/targetReferenceUtils.ts

import type { TargetReference } from '@/app/types/http';


export function targetReferenceToString(target: TargetReference) {
  return `${target.app}.${target.model}:${target.id}`;
}
