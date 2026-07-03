

declare module '@dnd-kit/sortable' {
  import * as React from 'react';

  export type UniqueIdentifier = string | number;

  export interface UseSortableReturn {
    attributes: Record<string, any>;
    listeners: Record<string, any>;
    setNodeRef: (el: HTMLElement | null) => void;
    transform: any;
    transition?: string;
  }

  export const SortableContext: React.ComponentType<{
    items: UniqueIdentifier[];
    strategy?: any;
    children?: React.ReactNode;
  }>;

  export function useSortable(args: { id: UniqueIdentifier }): UseSortableReturn;

  export function arrayMove<T>(array: readonly T[], from: number, to: number): T[];

  export const verticalListSortingStrategy: any;
}
