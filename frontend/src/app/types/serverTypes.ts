// src/types/serverTypes.ts
export type ServerError =
  | { detail?: string; message?: string; code?: string; messages?: any }
  | Record<string, unknown>
  | null
  | undefined;
