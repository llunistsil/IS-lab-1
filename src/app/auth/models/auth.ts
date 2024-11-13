import { AccountType } from './user';

export type AuthResponse = {
  token: string;
  role: AccountType;
};

export type AuthRequest = {
  username: string;
  password: string;
};
