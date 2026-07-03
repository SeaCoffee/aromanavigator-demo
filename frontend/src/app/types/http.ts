export type QVal = string | number | boolean;

export type Query = Record<string, QVal | QVal[] | null | undefined>;

export type QueryOf<T extends object> = Partial<
  Record<keyof T, QVal | QVal[] | null | undefined>
>;

export type ID = number | string;

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ResultsOnly<T> = {
  results: T[];
};

export type TargetReference = {
  app: string;
  model: string;
  id: ID;
};
