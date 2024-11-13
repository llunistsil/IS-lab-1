export type Filters<TEntity> = Partial<keyof TEntity>;

export type PaginatedRequest = {
  page: number;
  size: number;
};

export type PaginatedResponse<T> = {
  content: T[];
  totalElements: number;
};