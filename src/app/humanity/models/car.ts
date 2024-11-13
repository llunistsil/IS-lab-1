import { Filters, PaginatedRequest } from './params';

export interface Car {
  id: number;
  name: string;
  cool?: boolean;
}

export type CarRequest = {
  substring?: string;
  sort?: Filters<Car>;
  pagination?: PaginatedRequest;
};